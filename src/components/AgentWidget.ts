import * as webllm from '@mlc-ai/web-llm';
import { knowledgeBase } from '../data/knowledgeBase';
import { performanceMonitor } from '../utils/performanceMonitor';

// Type definitions
interface ActionButton {
  type: 'link' | 'email';
  url: string;
  label: string;
}

interface SearchResult {
  results: unknown[];
  intent?: {
    suggestedActions?: ActionButton[];
  };
}

interface ToolTrace {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
  timestamp: number;
  html: string;
}

// Global flag to prevent multiple instances
let globalListenersSetup = false;

export class AgentWidget {
  private engine!: webllm.MLCEngine;
  private isInitialized = false;
  private listenersSetup = false;
  private processingMessage = false;
  private initializationPromise: Promise<void> | null = null;
  // Align conversation history structure with AgentDemo ChatMessage interface
  private conversationHistory: Array<{role: 'user' | 'assistant', content: string, timestamp: number, id: string}> = [];
  private toolTraces: ToolTrace[] = [];
  // Handler storage for proper cleanup
  private _sendHandler?: () => void;
  private _keyHandler?: (e: KeyboardEvent) => void;
  private _previousSendHandler?: () => void;
  private _previousKeyHandler?: (e: KeyboardEvent) => void;

  // Check if the widget is already initialized
  public get initialized(): boolean {
    return this.isInitialized;
  }

  // Quick setup for session restoration (without full engine initialization)
  public quickSetup(): void {
    if (!this.isInitialized) {
      console.log('⚡ Quick setup for session restoration');
      this.setupEventListeners();
      // Load history for session restoration (but don't auto-send)
      console.log('💾 Loading history for session restoration');
      this.loadHistoryFromStorage();
      this.restoreChatUI();
    }
  }

  // Restore chat UI from conversation history
  public restoreChatUI(): void {
    if (this.conversationHistory.length > 0) {
      console.log(`🔄 Restoring ${this.conversationHistory.length} messages to chat UI`);
      
      const container = document.getElementById('chat-messages');
      if (!container) {
        console.warn('Chat container not found during restoration');
        return;
      }
      
      // Check if messages are already displayed to prevent duplicates
      const existingMessages = container.querySelectorAll('.chat-message');
      if (existingMessages.length === this.conversationHistory.length) {
        console.log('💭 Messages already displayed, skipping restoration');
        return;
      }
      
      // Clear existing messages first
      container.innerHTML = '';
      
      // Display all messages from history
      for (const msg of this.conversationHistory) {
        this.displayMessage(msg.role, msg.content);
      }
      
      console.log('✅ Chat UI restoration completed');
    } else {
      console.log('📝 No conversation history to restore');
    }
  }

  // Clear conversation history for a fresh start
  public clearHistory(): void {
    this.conversationHistory = [];
    this.saveHistoryToStorage();
    console.log('🧹 Conversation history cleared');
  }

  // Save conversation history to sessionStorage (aligned with AgentDemo)
  private saveHistoryToStorage(): void {
    try {
      sessionStorage.setItem('ai_chat_history', JSON.stringify(this.conversationHistory));
      console.log('💾 Saved conversation to sessionStorage:', this.conversationHistory.length, 'messages');
    } catch (error) {
      console.warn('Failed to save conversation history to sessionStorage:', error);
    }
  }

  // Load conversation history from sessionStorage (aligned with AgentDemo)
  private loadHistoryFromStorage(): void {
    try {
      const saved = sessionStorage.getItem('ai_chat_history');
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
        console.log(`💾 Restored ${this.conversationHistory.length} messages from sessionStorage`);
      }
    } catch (error) {
      console.warn('Failed to load conversation history from sessionStorage:', error);
      this.conversationHistory = [];
    }
  }

  // Save tool traces to sessionStorage
  public saveToolTracesToStorage(): void {
    try {
      sessionStorage.setItem('ai_tool_traces', JSON.stringify(this.toolTraces));
      console.log('💾 Saved tool traces to sessionStorage:', this.toolTraces.length, 'traces');
    } catch (error) {
      console.warn('Failed to save tool traces to sessionStorage:', error);
    }
  }

  // Load tool traces from sessionStorage
  private loadToolTracesFromStorage(): void {
    try {
      const saved = sessionStorage.getItem('ai_tool_traces');
      if (saved) {
        this.toolTraces = JSON.parse(saved);
        console.log(`💾 Restored ${this.toolTraces.length} tool traces from sessionStorage`);
        // Restore to UI with a delay to ensure DOM is ready
        setTimeout(() => this.restoreToolTracesToUI(), 500);
      }
    } catch (error) {
      console.warn('Failed to load tool traces from sessionStorage:', error);
      this.toolTraces = [];
    }
  }

  // Restore tool traces to UI
  public restoreToolTracesToUI(): void {
    const traceContainer = document.getElementById('tool-trace');
    if (!traceContainer) {
      console.log('🔍 Tool trace container not found during restoration');
      return;
    }
    
    if (this.toolTraces.length === 0) {
      console.log('🔍 No tool traces to restore');
      return;
    }

    // Clear placeholder content
    if (traceContainer.innerHTML.includes('Tool calls appear here') || 
        traceContainer.innerHTML.includes('Knowledge base searches appear here')) {
      traceContainer.innerHTML = '';
      console.log('🧹 Cleared placeholder content for tool trace restoration');
    }

    // Restore each trace
    this.toolTraces.forEach((trace, index) => {
      try {
        // Generate HTML if it doesn't exist
        if (!trace.html) {
          trace.html = this.generateTraceHTML(trace);
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = trace.html;
        const traceElement = tempDiv.firstElementChild;
        if (traceElement) {
          traceContainer.appendChild(traceElement);
          console.log(`✅ Restored tool trace ${index + 1}/${this.toolTraces.length}: ${trace.toolName}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to restore tool trace ${index + 1}:`, error);
      }
    });

    traceContainer.scrollTop = traceContainer.scrollHeight;
    console.log(`🎉 Successfully restored ${this.toolTraces.length} tool traces to UI`);
  }

  async initialize() {
    // Prevent multiple concurrent initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    if (this.isInitialized) return;
    
    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize() {
    
    try {
      console.log('🚀 Initializing WebLLM engine...');
      
      // Comprehensive console suppression for all PDF and WebGL related errors
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalLog = console.log;
      
      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('powerPreference') && 
            !message.includes('requestAdapter') && 
            !message.includes('content-length') &&
            !message.includes('Unable to determine') &&
            !message.includes('Setting up fake worker') &&
            !message.includes('pdf.worker') &&
            !message.includes('WebGL') &&
            !message.includes('GPU') &&
            !message.includes('currently ignored') &&
            !message.includes('fake worker') &&
            !message.includes('cdnjs.cloudflare')) {
          originalWarn(...args);
        }
      };
      
      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('pdf.worker') &&
            !message.includes('Setting up fake worker') &&
            !message.includes('Failed to fetch dynamically imported module') &&
            !message.includes('cdnjs.cloudflare.com') &&
            !message.includes('ERR_ABORTED 404') &&
            !message.includes('fake worker failed') &&
            !message.includes('.worker.min.js')) {
          originalError(...args);
        }
      };

      console.log = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('Warning: Setting up fake worker') &&
            !message.includes('pdf.worker')) {
          originalLog(...args);
        }
      };
      
      // Create engine with retry mechanism for binding errors
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          this.engine = await webllm.CreateMLCEngine('Phi-3.5-mini-instruct-q4f16_1-MLC', {
            initProgressCallback: (progress) => {
              // Suppress verbose progress logs but keep important ones
              if (progress.text && !progress.text.includes('Loading') && !progress.text.includes('Downloading')) {
                console.log(`🤖 ${progress.text}`);
              }
            }
          });
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.log(`🔄 Engine creation attempt ${retryCount}/${maxRetries} failed, retrying...`);
          if (retryCount >= maxRetries) {
            throw error;
          }
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      // Wait for engine to fully stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialize chat state safely with error handling
      try {
        await this.engine.resetChat();
        // Load conversation history for session persistence (but don't auto-send)
        console.log('💾 Loading conversation history for session persistence');
        this.loadHistoryFromStorage();
        
        // Load tool traces for session persistence
        console.log('💾 Loading tool traces for session persistence');
        this.loadToolTracesFromStorage();
        
        console.log('✅ WebLLM AI engine ready');
      } catch (resetError) {
        console.log('⚠️ Chat reset failed, continuing anyway:', resetError);
        // Still load history even if reset fails
        this.loadHistoryFromStorage();
      }
      
      // Restore original console methods after a delay
      setTimeout(() => {
        console.warn = originalWarn;
        console.error = originalError;
        console.log = originalLog;
      }, 5000); // Keep suppression for 5 seconds after init
      
      // Skip PDF processing entirely to prevent all CDN errors
      console.log('📄 PDF processing disabled (prevents all CDN worker errors)');
      
      this.isInitialized = true;
      
      // Update UI to show ready state
      this.updateChatUI('ready');
      
      console.log('🎉 AI Agent initialization completed successfully');
    } catch (error) {
      console.error('❌ AI Agent initialization failed:', error);
      this.updateChatUI('error');
      throw error; // Re-throw to handle in caller
    }
  }

  private updateChatUI(state: 'ready' | 'error' | 'loading') {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const uiStates = {
      ready: {
        icon: '✓',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        title: 'AI Agent Ready!',
        subtitle: 'Ask me about Duc Nguyen'
      },
      error: {
        icon: '⚠',
        bgColor: 'bg-red-100', 
        textColor: 'text-red-600',
        title: 'AI Agent Unavailable',
        subtitle: 'Please try refreshing the page'
      },
      loading: {
        icon: '⏳',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600', 
        title: 'AI Agent Loading...',
        subtitle: 'Please wait a moment'
      }
    };
    
    const config = uiStates[state];
    chatContainer.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-2">
            <span class="${config.textColor} text-lg">${config.icon}</span>
          </div>
          <p class="text-gray-700 font-medium">${config.title}</p>
          <p class="text-gray-500 text-sm">${config.subtitle}</p>
        </div>
      </div>
    `;
  }



  async sendMessage(message: string) {
    // Prevent duplicate processing and ensure initialization
    if (this.processingMessage) {
      console.log('Message already being processed, skipping...');
      return;
    }
    
    this.processingMessage = true;
    
    // Add timeout to prevent permanent lock
    const processingTimeout = setTimeout(() => {
      console.warn('⚠️ Processing timeout reached, resetting flag');
      this.processingMessage = false;
    }, 30000); // 30 second timeout
    
    try {
      // Ensure engine is initialized
      if (!this.isInitialized) {
        this.updateChatUI('loading');
        await this.initialize();
      }
      
      // Double-check engine is available
      if (!this.engine) {
        throw new Error('AI engine not available after initialization');
      }
      
      this.displayMessage('user', message);
      this.showTypingIndicator();
      
      // Add delay to prevent tokenizer binding race conditions
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Enhanced RAG search with smart intent detection
      const startTime = performance.now();
      let searchResult: SearchResult;
      let actionButtons: ActionButton[] | undefined;
      
      try {
        // Use JSON-enhanced smart search for better results
        searchResult = await knowledgeBase.smartSearchWithJson(message) as SearchResult;
        actionButtons = searchResult.intent?.suggestedActions;
        
        console.log(`🎯 JSON-Enhanced Search Results:`, {
          intent: searchResult.intent.type,
          confidence: searchResult.confidence,
          resultsCount: searchResult.records.length,
          actionable: searchResult.intent.actionable,
          strategy: searchResult.searchStrategy,
          hasActionButtons: !!actionButtons
        });
        
      } catch (error) {
        console.log('Smart search failed, using fallback:', error);
        // Fallback to regular search
        const fallbackResults = knowledgeBase.search(message);
        searchResult = {
          records: fallbackResults,
          intent: { type: 'general', confidence: 0.5, actionable: false },
          searchStrategy: 'fallback',
          confidence: 0.3
        };
      }
      
      // If no results from search, provide key information anyway
      if (searchResult.records.length === 0) {
        searchResult.records = knowledgeBase.getAll().slice(0, 2);
        searchResult.searchStrategy = 'emergency-fallback';
      }
      
      // Record performance metrics
      const searchTime = Math.round((performance.now() - startTime) * 100) / 100;
      performanceMonitor.recordSearch(
        message, 
        searchResult.records.length, 
        searchTime, 
        false, // No cache hit detection for now
        searchResult.searchStrategy,
        knowledgeBase.isSemanticReady()
      );
      
      // Log performance stats periodically
      const stats = performanceMonitor.getStats();
      if (stats.totalSearches % 5 === 0 && stats.totalSearches > 0) {
        console.log('Search Performance Stats:', stats);
      }
      
      this.updateToolTrace('smart_kb_search', { 
        query: message, 
        intent: searchResult.intent.type,
        strategy: searchResult.searchStrategy,
        confidence: searchResult.confidence,
        actionable: searchResult.intent.actionable,
        semanticReady: knowledgeBase.isSemanticReady() 
      }, searchResult.records);
      
      const context = searchResult.records.map((r: { title: string; text: string }) => `${r.title}: ${r.text}`).join('\n\n');
      
      // Generate intent-specific system prompt for better, consistent responses
      const systemPrompt = this.generateSystemPrompt(searchResult.intent, context);
      
      // Create chat completion with enhanced error handling
      try {
        // Build messages array with conversation history for session memory
        const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: message }
        ];
        
        // Limit conversation history to prevent token overflow (keep last 8 exchanges)
        if (messages.length > 17) { // system + 8 pairs + current message
          messages.splice(1, messages.length - 17); // Remove old messages but keep system prompt
        }
        
        // Also trim the stored conversation history to prevent unlimited growth
        if (this.conversationHistory.length > 16) { // Keep last 8 exchanges (16 messages)
          this.conversationHistory = this.conversationHistory.slice(-16);
        }

        console.log('🤖 Sending chat completion request with', messages.length, 'messages');
        
        const response = await this.engine.chat.completions.create({
          messages,
          max_tokens: 600, // Reduced to prevent tokenizer issues
          temperature: 0.3,
          top_p: 0.9,
          stream: false // Disable streaming to prevent binding issues
        });
        
        this.hideTypingIndicator();
        
        const assistantMessage = response.choices[0]?.message?.content || 
          "I'm here to help you learn about Duc Nguyen's background and experience. Please feel free to ask any questions!";
        
        // Add both user and assistant messages to conversation history with proper structure (aligned with AgentDemo)
        const timestamp = Date.now();
        this.conversationHistory.push({ 
          role: 'user', 
          content: message, 
          timestamp, 
          id: `user_${timestamp}_${Math.random().toString(36).substr(2, 9)}` 
        });
        this.conversationHistory.push({ 
          role: 'assistant', 
          content: assistantMessage, 
          timestamp: timestamp + 1, 
          id: `assistant_${timestamp + 1}_${Math.random().toString(36).substr(2, 9)}` 
        });
        
        // Save updated history to storage for session persistence
        this.saveHistoryToStorage();
        
        // Log conversation history length for debugging
        console.log(`💬 Conversation history now has ${this.conversationHistory.length} messages`);
        
        // Display message with action buttons if available
        this.displayMessage('assistant', assistantMessage, actionButtons);
        
      } catch (error) {
        console.error('Chat completion error:', error);
        this.hideTypingIndicator();
        
        let errorMessage = "I apologize for the technical difficulty. ";
        let shouldResetEngine = false;
        
        if (error instanceof Error) {
          if (error.message.includes('initialization')) {
            errorMessage += "The AI system is still starting up. Please wait a moment and try again.";
          } else if (error.message.includes('binding') || error.message.includes('tokenizer') || error.message.includes('VectorInt')) {
            errorMessage += "There was a processing error. Let me reset and try again.";
            shouldResetEngine = true;
          } else if (error.message.includes('memory') || error.message.includes('allocation')) {
            errorMessage += "Memory issue detected. Clearing conversation history to free up resources.";
            shouldResetEngine = true;
          } else {
            errorMessage += "Please try again, or contact Duc directly at duc.tri.nguyen0186@gmail.com for immediate assistance.";
          }
        } else {
          errorMessage += "Please contact Duc directly at duc.tri.nguyen0186@gmail.com";
        }
        
        this.displayMessage('assistant', errorMessage);
        
        // Reset engine if needed for binding/tokenizer errors
        if (shouldResetEngine) {
          console.log('🔄 Resetting engine due to tokenizer/binding error');
          try {
            await this.engine.resetChat();
            // Clear some conversation history to prevent repeat errors
            if (this.conversationHistory.length > 10) {
              this.conversationHistory = this.conversationHistory.slice(-6); // Keep only last 3 exchanges
              this.saveHistoryToStorage();
              console.log('🧹 Trimmed conversation history after reset');
            }
          } catch (resetError) {
            console.warn('⚠️ Engine reset failed:', resetError);
          }
        }
      }
    } finally {
      // Clear timeout and always reset processing flag
      clearTimeout(processingTimeout);
      this.processingMessage = false;
      console.log('✅ Processing completed, flag reset');
    }
  }

  private displayMessage(role: string, content: string, actionButtons?: Array<{type: 'link' | 'email', url: string, label: string}>) {
    const container = document.getElementById('chat-messages');
    if (!container) {
      console.warn('Chat container not found, message not displayed');
      return;
    }
    
    // Clear initial state messages
    if (container.innerHTML && (
        container.innerHTML.includes('AI Agent Ready!') || 
        container.innerHTML.includes('AI Agent Loading...') ||
        container.innerHTML.includes('AI Agent Unavailable'))) {
      container.innerHTML = '';
    }
    
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex mb-3 ${role === 'user' ? 'justify-end' : 'justify-start'} chat-message`;
    
    if (role === 'user') {
      messageWrapper.innerHTML = `
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-xs shadow-sm">
          <div class="text-sm font-medium">${this.escapeHtml(content)}</div>
        </div>
      `;
    } else {
      const actionButtonsHtml = actionButtons ? this.renderActionButtons(actionButtons) : '';
      
      messageWrapper.innerHTML = `
        <div class="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md max-w-sm shadow-sm border border-gray-200">
          <div class="flex items-start space-x-2">
            <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              AI
            </div>
            <div class="flex-1">
              <div class="text-sm leading-relaxed mb-2">${this.escapeHtml(content)}</div>
              ${actionButtonsHtml}
            </div>
          </div>
        </div>
      `;
    }
    
    container.appendChild(messageWrapper);
    
    // Setup action button click handlers if this is an assistant message with buttons
    if (role === 'assistant' && actionButtons) {
      this.setupActionButtonHandlers(messageWrapper);
    }
    
    container.scrollTop = container.scrollHeight;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private renderActionButtons(actions: Array<{type: 'link' | 'email', url: string, label: string}>): string {
    return `
      <div class="flex flex-wrap gap-2 mt-2">
        ${actions.map((action, index) => `
          <button 
            class="action-btn inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
              action.type === 'link' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300' 
                : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300'
            }"
            data-url="${action.url}"
            data-index="${index}"
            title="${action.type === 'email' ? 'Open email client' : 'Open in new tab'}"
          >
            <span class="mr-1.5">${action.type === 'email' ? '📧' : '🔗'}</span>
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  private setupActionButtonHandlers(container: HTMLElement) {
    const actionButtons = container.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const url = (button as HTMLElement).dataset.url;
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
          console.log(`🔗 Action button clicked: ${url}`);
        }
      });
    });
  }

  private generateSystemPrompt(intent: { type: string; confidence?: number }, context: string): string {
    const basePrompt = `You are Duc Nguyen's professional AI assistant. You help recruiters and tech professionals quickly understand Duc's career highlights, technical skills, and professional impact.

CORE PRINCIPLES:
- You represent DUC NGUYEN only - never claim to be a generic AI
- Provide direct, actionable information about Duc's professional background
- Never say "I don't have access to" or mention AI limitations
- Focus on what would interest recruiters and hiring managers

CURRENT INFORMATION:
${context}`;

    const intentSpecificGuidelines = {
      'linkedin': `
LINKEDIN RESPONSE FOCUS:
- Provide Duc's LinkedIn profile link: https://www.linkedin.com/in/duc-nguyen-33716b1b6/
- Highlight his current role at Triton Digital and key achievements
- Mention professional network and connection opportunities
- Keep response concise and action-oriented`,

      'github': `
GITHUB/PROJECTS RESPONSE FOCUS:
- Provide GitHub profile: https://github.com/ductringuyen0186
- Highlight key repositories: Salon Hub, AI Tech News Assistant, Portfolio Website
- Emphasize technical skills demonstrated in projects
- Mention deployment and CI/CD experience`,

      'contact': `
CONTACT RESPONSE FOCUS:
- Primary email: duc.tri.nguyen0186@gmail.com
- Location: Seattle, WA
- Phone: (206) 791-8173
- LinkedIn for professional networking
- Emphasize availability for opportunities`,

      'experience': `
EXPERIENCE RESPONSE FOCUS:
- Lead with current role: Software Engineer at Triton Digital (Jul 2022-Present)
- Quantify achievements: ~50k daily transactions, ~20% performance improvement
- Highlight technologies: Spring Boot, Kubernetes, Kotlin, microservices
- Mention AWS Bedrock and AI integration work`,

      'skills': `
SKILLS RESPONSE FOCUS:
- Core languages: Kotlin, Java, Python, JavaScript/TypeScript
- Frameworks: Spring Boot, Ktor, React, Node.js
- Cloud/DevOps: Kubernetes, OpenShift, AWS, Docker, CI/CD
- Databases: MySQL, Kafka
- Focus on backend and full-stack capabilities`,

      'general': `
GENERAL RESPONSE FOCUS:
- Start with current role and location
- Highlight most impressive achievements first
- Use bullet points for clarity
- End with call-to-action for further contact`
    };

    const specificGuideline = intentSpecificGuidelines[intent.type as keyof typeof intentSpecificGuidelines] || intentSpecificGuidelines.general;

    return `${basePrompt}

${specificGuideline}

RESPONSE STYLE:
- Be concise and impactful (2-4 sentences or bullet points)
- Lead with most impressive/relevant information
- Use professional but approachable tone
- Include quantifiable achievements when available
- End with clear next steps for the recruiter/contact`;
  }

  private showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    // Remove existing typing indicator
    this.hideTypingIndicator();
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'flex justify-start mb-3 chat-message';
    
    typingDiv.innerHTML = `
      <div class="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  private hideTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
      typingDiv.remove();
    }
  }

  private updateToolTrace(toolName: string, args: Record<string, unknown>, result: unknown) {
    console.log('🔧 updateToolTrace called:', { toolName, args, result });
    
    // Store trace data in memory first (always works)
    const traceData: ToolTrace = {
      toolName,
      args,
      result,
      timestamp: Date.now(),
      html: '' // Will be populated when DOM is available
    };
    
    // Try to find container with retries
    const findContainer = (retries = 3) => {
      const traceContainer = document.getElementById('tool-trace');
      if (traceContainer) {
        console.log('✅ Tool trace container found, updating...');
        this.renderTraceToContainer(traceContainer, traceData);
      } else if (retries > 0) {
        console.log(`⚠️ Tool trace container not found, retrying in 100ms (${retries} retries left)`);
        setTimeout(() => findContainer(retries - 1), 100);
      } else {
        console.warn('❌ Tool trace container not found after retries - storing data for later');
        // Store without HTML for now, will render when container becomes available
        traceData.html = this.generateTraceHTML(traceData);
      }
    };
    
    // Store in memory and session storage immediately
    this.toolTraces.push(traceData);
    this.saveToolTracesToStorage();
    
    // Try to render to DOM
    findContainer();
    
    console.log('✅ Tool trace data saved to memory and storage');
  }
  // Generate HTML for a trace (can be used when DOM is not available)
  private generateTraceHTML(traceData: ToolTrace): string {
    const { toolName, args, result, timestamp } = traceData;
    
    const resultText = Array.isArray(result) 
      ? `Found ${result.length} results` 
      : typeof result === 'string' 
        ? result.substring(0, 60) + (result.length > 60 ? '...' : '')
        : JSON.stringify(result).substring(0, 60) + '...';

    const strategyBadge = args.strategy ? 
      `<div class="inline-flex items-center px-2 py-1 bg-white/60 rounded-full text-xs font-medium ${
        args.strategy === 'hybrid' ? 'text-green-700' : 
        args.strategy === 'keyword-only' ? 'text-blue-700' : 'text-orange-700'
      }">${args.strategy}</div>` : '';

    const semanticBadge = args.semanticReady !== undefined ? 
      `<div class="inline-flex items-center px-2 py-1 bg-white/60 rounded-full text-xs ${
        args.semanticReady ? 'text-green-600' : 'text-gray-600'
      }">
        <div class="w-1.5 h-1.5 ${args.semanticReady ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1"></div>
        ${args.semanticReady ? 'Semantic' : 'Keyword'}
      </div>` : '';
    
    const timeStr = new Date(timestamp).toLocaleTimeString();
    
    return `
      <div class="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span class="font-semibold text-blue-700 text-sm">${toolName.replace('_', ' ')}</span>
          </div>
          <span class="text-xs text-gray-500 font-mono">${timeStr}</span>
        </div>
        
        <div class="text-xs text-gray-700 mb-2 font-medium">
          "${this.escapeHtml(typeof args === 'object' ? args.query || JSON.stringify(args) : args)}"
        </div>
        
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-600">${this.escapeHtml(resultText)}</div>
          <div class="flex space-x-1">
            ${strategyBadge}
            ${semanticBadge}
          </div>
        </div>
      </div>
    `;
  }

  // Render trace to container (handles DOM manipulation)
  private renderTraceToContainer(traceContainer: HTMLElement, traceData: ToolTrace) {
    // Clear placeholder messages
    if (traceContainer.innerHTML.includes('Tool calls appear here') || 
        traceContainer.innerHTML.includes('Knowledge base searches appear here')) {
      traceContainer.innerHTML = '';
      console.log('🧹 Cleared placeholder content');
    }

    // Generate HTML if not already generated
    if (!traceData.html) {
      traceData.html = this.generateTraceHTML(traceData);
    }

    // Create and append element
    const traceDiv = document.createElement('div');
    traceDiv.innerHTML = traceData.html;
    const traceElement = traceDiv.firstElementChild as HTMLElement;
    
    if (traceElement) {
      traceContainer.appendChild(traceElement);
      traceContainer.scrollTop = traceContainer.scrollHeight;
      
      // Add smooth entrance animation
      requestAnimationFrame(() => {
        traceElement.style.opacity = '0';
        traceElement.style.transform = 'translateY(10px)';
        traceElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        requestAnimationFrame(() => {
          traceElement.style.opacity = '1';
          traceElement.style.transform = 'translateY(0)';
        });
      });
      
      console.log('✅ Tool trace rendered to container successfully');
    }
  }



  setupEventListeners() {
    // Prevent setting up listeners multiple times globally
    if (globalListenersSetup || this.listenersSetup) {
      console.log('⚠️ Event listeners already setup, skipping');
      return;
    }
    this.listenersSetup = true;
    globalListenersSetup = true;

    const button = document.getElementById('send-message');
    const input = document.getElementById('message-input') as HTMLInputElement;
    
    // Don't interfere with React-managed suggestion buttons - they have their own onClick handlers
    console.log('✅ Setting up only send/input event listeners (suggestion buttons managed by React)');
    
    // Create bound methods that can be properly removed
    const sendHandler = () => {
      console.log('🔘 Send button clicked');
      if (input?.value.trim()) {
        console.log('📤 Sending message:', input.value.trim());
        this.sendMessage(input.value.trim());
        input.value = '';
      } else {
        console.log('⚠️ No message to send');
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && input?.value.trim()) {
        console.log('⌨️ Enter key pressed, sending message');
        e.preventDefault(); // Prevent form submission or page refresh
        this.sendMessage(input.value.trim());
        input.value = '';
      }
    };

    // Store handlers for proper cleanup
    this._sendHandler = sendHandler;
    this._keyHandler = keyHandler;

    // Remove any existing listeners
    if (this._previousSendHandler) {
      button?.removeEventListener('click', this._previousSendHandler);
    }
    if (this._previousKeyHandler) {
      input?.removeEventListener('keypress', this._previousKeyHandler);
    }
    
    // Add listeners with proper cleanup tracking
    if (button) {
      button.addEventListener('click', sendHandler);
      console.log('📤 Send button listener attached');
      this._previousSendHandler = sendHandler;
    }
    
    if (input) {
      input.addEventListener('keypress', keyHandler);
      console.log('⌨️ Input keypress listener attached');
      this._previousKeyHandler = keyHandler;
    }

    // Skip suggestion button handling - React manages those with onClick props
    console.log('✅ Event listeners setup complete - suggestion buttons handled by React');
  }

  // Force re-enable inputs and verify they're working
  public verifyAndEnableInputs(): void {
    const sendButton = document.getElementById('send-message') as HTMLButtonElement;
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    
    if (sendButton && messageInput) {
      sendButton.disabled = false;
      messageInput.disabled = false;
      messageInput.readOnly = false;
      
      // Test if click handler is working
      const hasClickListener = sendButton.onclick !== null || sendButton.addEventListener !== undefined;
      
      console.log('🔧 Input verification:', {
        sendButtonEnabled: !sendButton.disabled,
        inputEnabled: !messageInput.disabled,
        inputReadOnly: messageInput.readOnly,
        hasClickHandler: hasClickListener,
        inputValue: messageInput.value
      });
      
      console.log('✅ Inputs verified and enabled');
    } else {
      console.error('❌ Could not find send button or input element');
    }
  }
}