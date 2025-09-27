import * as webllm from '@mlc-ai/web-llm';
import { knowledgeBase } from '../data/knowledgeBase';
import { performanceMonitor } from '../utils/performanceMonitor';

// Global flag to prevent multiple instances
let globalListenersSetup = false;

export class AgentWidget {
  private engine!: webllm.MLCEngine;
  private isInitialized = false;
  private listenersSetup = false;
  private processingMessage = false;
  private initializationPromise: Promise<void> | null = null;
  private conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [];

  // Check if the widget is already initialized
  public get initialized(): boolean {
    return this.isInitialized;
  }

  // Quick setup for session restoration (without full engine initialization)
  public quickSetup(): void {
    if (!this.isInitialized) {
      console.log('⚡ Quick setup for session restoration');
      this.setupEventListeners();
      // Load and display previous conversation history
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

  // Save conversation history to localStorage
  private saveHistoryToStorage(): void {
    try {
      localStorage.setItem('agentConversationHistory', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.warn('Failed to save conversation history to storage:', error);
    }
  }

  // Load conversation history from localStorage
  private loadHistoryFromStorage(): void {
    try {
      const saved = localStorage.getItem('agentConversationHistory');
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
        console.log(`💾 Restored ${this.conversationHistory.length} messages from storage`);
      }
    } catch (error) {
      console.warn('Failed to load conversation history from storage:', error);
      this.conversationHistory = [];
    }
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
        // Load conversation history from storage for session persistence
        this.loadHistoryFromStorage();
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
      let searchResult: any;
      let actionButtons: Array<{type: 'link' | 'email', url: string, label: string}> | undefined;
      
      try {
        // Use JSON-enhanced smart search for better results
        searchResult = await knowledgeBase.smartSearchWithJson(message);
        actionButtons = searchResult.intent.suggestedActions;
        
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
      
      const context = searchResult.records.map((r: any) => `${r.title}: ${r.text}`).join('\n\n');
      
      // Generate intent-specific system prompt for better, consistent responses
      const systemPrompt = this.generateSystemPrompt(searchResult.intent, context);
      
      // Create chat completion with enhanced error handling
      try {
        // Build messages array with conversation history for session memory
        const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory,
          { role: 'user', content: message }
        ];
        
        // Limit conversation history to prevent token overflow (keep last 10 exchanges)
        if (messages.length > 21) { // system + 10 pairs + current message
          messages.splice(1, messages.length - 21); // Remove old messages but keep system prompt
        }
        
        // Also trim the stored conversation history to prevent unlimited growth
        if (this.conversationHistory.length > 20) { // Keep last 10 exchanges (20 messages)
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
        
        const response = await this.engine.chat.completions.create({
          messages,
          max_tokens: 800,
          temperature: 0.3,
          top_p: 0.9,
          stream: false // Disable streaming to prevent binding issues
        });
        
        this.hideTypingIndicator();
        
        const assistantMessage = response.choices[0]?.message?.content || 
          "I'm here to help you learn about Duc Nguyen's background and experience. Please feel free to ask any questions!";
        
        // Add both user and assistant messages to conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
        
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
        if (error instanceof Error) {
          if (error.message.includes('initialization')) {
            errorMessage += "The AI system is still starting up. Please wait a moment and try again.";
          } else if (error.message.includes('binding') || error.message.includes('tokenizer')) {
            errorMessage += "There was a processing error. Please try rephrasing your question.";
          } else {
            errorMessage += "Please try again, or contact Duc directly at duc.tri.nguyen0186@gmail.com for immediate assistance.";
          }
        } else {
          errorMessage += "Please contact Duc directly at duc.tri.nguyen0186@gmail.com";
        }
        
        this.displayMessage('assistant', errorMessage);
      }
    } finally {
      // Always reset processing flag
      this.processingMessage = false;
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

  private generateSystemPrompt(intent: any, context: string): string {
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

  private updateToolTrace(toolName: string, args: any, result: any) {
    const traceContainer = document.getElementById('tool-trace');
    if (!traceContainer) return;

    // Clear placeholder messages
    if (traceContainer.innerHTML.includes('Tool calls appear here') || 
        traceContainer.innerHTML.includes('Knowledge base searches appear here')) {
      traceContainer.innerHTML = '';
    }

    const traceDiv = document.createElement('div');
    traceDiv.className = 'mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200';
    
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
    
    traceDiv.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span class="font-semibold text-blue-700 text-sm">${toolName.replace('_', ' ')}</span>
        </div>
        <span class="text-xs text-gray-500 font-mono">${new Date().toLocaleTimeString()}</span>
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
    `;
    
    traceContainer.appendChild(traceDiv);
    traceContainer.scrollTop = traceContainer.scrollHeight;
    
    // Add smooth entrance animation
    requestAnimationFrame(() => {
      traceDiv.style.opacity = '0';
      traceDiv.style.transform = 'translateY(10px)';
      traceDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      requestAnimationFrame(() => {
        traceDiv.style.opacity = '1';
        traceDiv.style.transform = 'translateY(0)';
      });
    });
  }



  setupEventListeners() {
    // Prevent setting up listeners multiple times globally
    if (globalListenersSetup || this.listenersSetup) {
      return;
    }
    this.listenersSetup = true;
    globalListenersSetup = true;

    const button = document.getElementById('send-message');
    const input = document.getElementById('message-input') as HTMLInputElement;
    const suggestedQuestions = document.querySelectorAll('.suggested-question');
    
    // Create bound methods to avoid duplicate listeners
    const sendHandler = () => {
      if (input?.value.trim()) {
        this.sendMessage(input.value.trim());
        input.value = '';
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && input?.value.trim()) {
        this.sendMessage(input.value.trim());
        input.value = '';
      }
    };

    // Remove existing listeners first to prevent duplicates
    button?.removeEventListener('click', sendHandler);
    input?.removeEventListener('keypress', keyHandler);
    
    // Add listeners
    button?.addEventListener('click', sendHandler);
    input?.addEventListener('keypress', keyHandler);

    // Handle suggested questions with proper cleanup
    suggestedQuestions.forEach(questionButton => {
      // Remove any existing data attribute that marks it as having a listener
      if (questionButton.hasAttribute('data-listener-attached')) {
        return; // Skip if already has listener
      }
      
      const clickHandler = (e: Event) => {
        const question = (e.target as HTMLElement).textContent;
        if (question && input) {
          // Clear input first to avoid any conflicts
          input.value = '';
          // Send the question directly
          this.sendMessage(question.trim());
        }
      };
      
      // Mark this button as having a listener attached
      questionButton.setAttribute('data-listener-attached', 'true');
      // Add new listener
      questionButton.addEventListener('click', clickHandler);
    });
  }
}