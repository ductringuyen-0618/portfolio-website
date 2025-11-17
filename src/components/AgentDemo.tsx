import { useEffect, useRef, useState } from 'react';
import { AgentWidget } from './AgentWidget';
import { MessageCircle, Cpu, Minimize2, Maximize2, Maximize, X } from 'lucide-react';

// Session storage keys
const SESSION_KEYS = {
  CHAT_HISTORY: 'ai_chat_history',
  CHAT_INITIALIZED: 'ai_chat_initialized',
  CHAT_STATE: 'ai_chat_state',
  LAST_ACTIVITY: 'ai_last_activity'
};

// Event listener reset delay - wait for DOM to fully render after minimized state change
const EVENT_LISTENER_RESET_DELAY_MS = 150;

// Chat message interface
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  id: string;
}

// Session state interface
interface ChatSessionState {
  isInitialized: boolean;
  lastActivity: number;
  messageCount: number;
  sessionId: string;
}

function AgentSidebar() {
  const widgetRef = useRef<AgentWidget | null>(null);
  const initializedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'trace'>('chat');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionState, setSessionState] = useState<ChatSessionState | null>(null);





  // Manual session restoration function
  const restoreSessionManually = () => {
    try {
      console.log('🔄 Manual session restoration triggered');
      
      // Clean up duplicates first
      const cleanHistory = conversationManager.deduplicateMessages();
      console.log('💾 Clean chat history length:', cleanHistory.length);
      console.log('💬 Current chatHistory state length:', chatHistory.length);
      
      if (cleanHistory.length > 0) {
        console.log('📋 Clean messages:', cleanHistory);
        setChatHistory(cleanHistory); // Force update React state
        const restored = conversationManager.restoreConversation();
        if (restored) {
          conversationManager.updateLastActivity();
          console.log('✅ Conversation messages restored to UI successfully');
        }
      } else {
        console.log('⚠️ No stored history found');
      }
    } catch (error) {
      console.error('❌ Manual restoration failed:', error);
    }
  };

  // Define suggestion buttons with prompts
  const suggestionButtons = [
    { 
      label: 'LinkedIn?', 
      message: "What's Duc's LinkedIn profile and professional network information?", 
      color: 'blue' 
    },
    { 
      label: 'Experience?', 
      message: "Tell me about Duc's professional experience and work history at companies like Triton Digital", 
      color: 'purple' 
    },
    { 
      label: 'Skills?', 
      message: "What are Duc's technical skills and programming languages expertise?", 
      color: 'green' 
    },
    { 
      label: 'Projects?', 
      message: "Show me Duc's portfolio projects and technical achievements", 
      color: 'orange' 
    },
    { 
      label: 'Contact?', 
      message: "How can I contact Duc Nguyen for opportunities or collaborations?", 
      color: 'blue' 
    }
  ];

  // Conversation Management Utilities
  const conversationManager = {
    // Save chat message to session storage
    saveChatMessage: (message: ChatMessage) => {
      try {
        const existingHistory = conversationManager.getChatHistory();
        const updatedHistory = [...existingHistory, message];
        // Keep only last 50 messages to prevent storage bloat
        const trimmedHistory = updatedHistory.slice(-50);
        sessionStorage.setItem(SESSION_KEYS.CHAT_HISTORY, JSON.stringify(trimmedHistory));
        setChatHistory(trimmedHistory);
        conversationManager.updateLastActivity();
      } catch (error) {
        console.warn('Failed to save chat message:', error);
      }
    },

    // Get chat history from session storage
    getChatHistory: (): ChatMessage[] => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEYS.CHAT_HISTORY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.warn('Failed to load chat history:', error);
        return [];
      }
    },

    // Save session state
    saveSessionState: (state: ChatSessionState) => {
      try {
        sessionStorage.setItem(SESSION_KEYS.CHAT_STATE, JSON.stringify(state));
        setSessionState(state);
      } catch (error) {
        console.warn('Failed to save session state:', error);
      }
    },

    // Get session state
    getSessionState: (): ChatSessionState | null => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEYS.CHAT_STATE);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.warn('Failed to load session state:', error);
        return null;
      }
    },

    // Check if chat was recently active (within 30 minutes for better persistence)
    isRecentSession: (): boolean => {
      const state = conversationManager.getSessionState();
      if (!state) return false;
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // Extended to 30 minutes
      const isRecent = (now - state.lastActivity) < thirtyMinutes;
      console.log('🕐 Session age check:', { 
        ageMinutes: Math.round((now - state.lastActivity) / 60000),
        isRecent,
        lastActivity: new Date(state.lastActivity).toLocaleTimeString()
      });
      return isRecent;
    },

    // Update last activity timestamp
    updateLastActivity: () => {
      const now = Date.now();
      sessionStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, now.toString());
      const currentState = conversationManager.getSessionState();
      if (currentState) {
        conversationManager.saveSessionState({
          ...currentState,
          lastActivity: now
        });
      }
    },

    // Check if initialization is needed
    needsInitialization: (): boolean => {
      const state = conversationManager.getSessionState();
      const history = conversationManager.getChatHistory();
      
      // If no state or history, need initialization
      if (!state || !state.isInitialized) return true;
      
      // If session is old, need re-initialization
      if (!conversationManager.isRecentSession()) return true;
      
      // If we have recent session and history, don't need full init
      return !(history.length > 0 && conversationManager.isRecentSession());
    },

    // Mark as initialized
    markInitialized: () => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newState: ChatSessionState = {
        isInitialized: true,
        lastActivity: Date.now(),
        messageCount: 0,
        sessionId
      };
      conversationManager.saveSessionState(newState);
      sessionStorage.setItem(SESSION_KEYS.CHAT_INITIALIZED, 'true');
    },

    // Restore conversation to chat container
    restoreConversation: () => {
      try {
        const history = conversationManager.getChatHistory();
        const chatContainer = document.getElementById('chat-messages');
        
        if (!chatContainer) {
          console.log('Chat container not found, deferring restoration');
          return false;
        }

        if (history.length === 0) {
          console.log('No chat history to restore');
          return false;
        }

        // Clear container and rebuild conversation with error handling
        chatContainer.innerHTML = '';
        
        let restoredCount = 0;
        history.forEach((message, index) => {
          try {
            conversationManager.displayRestoredMessage(message.role, message.content);
            restoredCount++;
          } catch (error) {
            console.warn(`Failed to restore message ${index}:`, error);
          }
        });

        if (restoredCount > 0) {
          console.log(`✅ Restored ${restoredCount}/${history.length} messages from session`);
          return true;
        }

        return false;
      } catch (error) {
        console.warn('Conversation restoration failed:', error);
        return false;
      }
    },

    // Display a restored message (simplified version for restoration)
    displayRestoredMessage: (role: string, content: string) => {
      const container = document.getElementById('chat-messages');
      if (!container) return;

      // Check fullscreen state from React component
      const chatSidebar = document.querySelector('.chat-sidebar');
      const currentIsFullscreen = chatSidebar && (chatSidebar.classList.contains('inset-2') || chatSidebar.classList.contains('inset-4'));

      const messageWrapper = document.createElement('div');
      messageWrapper.className = `flex mb-4 ${role === 'user' ? 'justify-end' : 'justify-start'} chat-message restored-message animate-fade-in`;
      messageWrapper.setAttribute('data-restored', 'true');
      
      if (role === 'user') {
        messageWrapper.innerHTML = `
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 rounded-2xl rounded-br-md ${currentIsFullscreen ? 'max-w-2xl text-base' : 'max-w-xs text-sm'} shadow-lg transform hover:scale-105 transition-all duration-200">
            <div class="font-medium leading-relaxed">${conversationManager.formatMessageContent(content)}</div>
          </div>
        `;
      } else {
        messageWrapper.innerHTML = `
          <div class="bg-white text-gray-800 px-5 py-4 rounded-2xl rounded-bl-md ${currentIsFullscreen ? 'max-w-3xl' : 'max-w-sm'} shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-200">
            <div class="flex items-start space-x-3">
              <div class="${currentIsFullscreen ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">
                AI
              </div>
              <div class="flex-1">
                <div class="${currentIsFullscreen ? 'text-base' : 'text-sm'} leading-relaxed">${conversationManager.formatMessageContent(content)}</div>
              </div>
            </div>
          </div>
        `;
      }
      
      container.appendChild(messageWrapper);
      container.scrollTop = container.scrollHeight;
    },

    // HTML escape utility
    escapeHtml: (text: string): string => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Enhanced text formatting with URL detection and better readability
    formatMessageContent: (text: string): string => {
      // First escape HTML to prevent XSS
      let formattedText = conversationManager.escapeHtml(text);
      
      // URL detection regex patterns
      const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
      const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
      
      // Convert URLs to clickable buttons
      formattedText = formattedText.replace(urlPattern, (url) => {
        const cleanUrl = url.replace(/[.,;:!?]$/, ''); // Remove trailing punctuation
        const displayText = conversationManager.shortenUrl(cleanUrl);
        return `<button class="url-btn inline-flex items-center px-2 py-1 mx-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-all duration-200 cursor-pointer" data-url="${cleanUrl}" onclick="window.open('${cleanUrl}', '_blank', 'noopener,noreferrer')" title="Open ${cleanUrl} in new tab">
          🔗 ${displayText}
        </button>`;
      });
      
      // Convert email addresses to clickable buttons
      formattedText = formattedText.replace(emailPattern, (email) => {
        return `<button class="email-btn inline-flex items-center px-2 py-1 mx-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100 transition-all duration-200 cursor-pointer" data-email="${email}" onclick="window.open('mailto:${email}', '_self')" title="Send email to ${email}">
          📧 ${email}
        </button>`;
      });
      
      // Improve text formatting for readability
      formattedText = conversationManager.enhanceTextReadability(formattedText);
      
      return formattedText;
    },

    // Shorten long URLs for display
    shortenUrl: (url: string): string => {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace('www.', '');
        
        if (domain.length > 20) {
          return domain.substring(0, 17) + '...';
        }
        
        return domain;
      } catch {
        // Fallback for invalid URLs
        return url.length > 25 ? url.substring(0, 22) + '...' : url;
      }
    },

    // Enhance text readability with better formatting
    enhanceTextReadability: (text: string): string => {
      // Add proper spacing around punctuation
      text = text.replace(/([.!?])([A-Z])/g, '$1 $2');
      
      // Format bullet points and lists
      text = text.replace(/^[-•*]\s+/gm, '<span class="list-marker text-blue-600 font-semibold">• </span>');
      text = text.replace(/\n[-•*]\s+/g, '<br><span class="list-marker text-blue-600 font-semibold">• </span>');
      
      // Format numbered lists
      text = text.replace(/^(\d+)\.\s+/gm, '<span class="number-marker text-blue-600 font-semibold">$1. </span>');
      text = text.replace(/\n(\d+)\.\s+/g, '<br><span class="number-marker text-blue-600 font-semibold">$1. </span>');
      
      // Convert line breaks to proper HTML breaks
      text = text.replace(/\n\n/g, '</p><p class="mt-2">');
      text = text.replace(/\n/g, '<br>');
      
      // Wrap in paragraph if it contains breaks
      if (text.includes('<br>') || text.includes('</p>')) {
        text = '<p>' + text + '</p>';
      }
      
      // Bold important keywords (case-insensitive)
      const keywords = ['Triton Digital', 'LinkedIn', 'GitHub', 'React', 'TypeScript', 'Node.js', 'Python', 'JavaScript', 'AI', 'Machine Learning', 'Software Engineer', 'Senior Developer'];
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        text = text.replace(regex, '<strong class="font-semibold text-gray-900">$1</strong>');
      });
      
      return text;
    },

    // Remove duplicate messages based on content and timestamp proximity
    deduplicateMessages: () => {
      try {
        const history = conversationManager.getChatHistory();
        const deduplicated: ChatMessage[] = [];
        
        history.forEach((message) => {
          // Check if this message is a duplicate of a recent message
          const isDuplicate = deduplicated.some(existing => 
            existing.content === message.content && 
            existing.role === message.role &&
            Math.abs(existing.timestamp - message.timestamp) < 5000 // Within 5 seconds
          );
          
          if (!isDuplicate) {
            deduplicated.push(message);
          }
        });
        
        if (deduplicated.length !== history.length) {
          sessionStorage.setItem(SESSION_KEYS.CHAT_HISTORY, JSON.stringify(deduplicated));
          console.log(`🧹 Cleaned up ${history.length - deduplicated.length} duplicate messages`);
          setChatHistory(deduplicated);
        }
        
        return deduplicated;
      } catch (error) {
        console.warn('Failed to deduplicate messages:', error);
        return conversationManager.getChatHistory();
      }
    },

    // Clear session data
    clearSession: () => {
      Object.values(SESSION_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
      setChatHistory([]);
      setSessionState(null);
      console.log('🗑️ Chat session cleared');
    },

    // Get session statistics
    getSessionStats: () => {
      const history = conversationManager.getChatHistory();
      const state = conversationManager.getSessionState();
      return {
        messageCount: history.length,
        sessionAge: state ? Date.now() - state.lastActivity : 0,
        isActive: conversationManager.isRecentSession(),
        sessionId: state?.sessionId || 'none'
      };
    }
  };

  // Handle suggestion button clicks
  const handleSuggestionClick = (message: string) => {
    try {
      const messageInput = document.getElementById('message-input') as HTMLInputElement;
      if (messageInput) {
        messageInput.value = message;
        messageInput.focus();
        // Don't auto-send - let user review and manually send
        console.log('💡 Suggestion filled:', message.substring(0, 30) + '...');
      }
    } catch (error) {
      console.error('Error handling suggestion click:', error);
    }
  };

  // Intercept and track messages with error handling
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    let lastSavedMessage: { content: string; timestamp: number } | null = null;

    const setupMessageTracking = () => {
      try {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(setupMessageTracking, 1000);
          }
          return;
        }

        observer = new MutationObserver((mutations) => {
          try {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  if (element.classList?.contains('chat-message')) {
                    // Check if this element was already processed or is being processed
                    if (element.hasAttribute('data-processed') || element.hasAttribute('data-processing')) {
                      return; // Skip already processed/processing elements
                    }
                    
                    // Mark as being processed immediately to prevent race conditions
                    element.setAttribute('data-processing', 'true');
                    
                    // Small delay to ensure content is fully rendered
                    setTimeout(() => {
                      try {
                        const isUser = element.classList.contains('justify-end');
                        const role = isUser ? 'user' : 'assistant';
                        const contentEl = element.querySelector('.text-sm, .leading-relaxed');
                        const content = contentEl?.textContent || '';
                        
                        if (content.trim() && content.length > 0) {
                          // Check if this is a restored message to avoid duplicates
                          const isRestored = element.hasAttribute('data-restored') || element.classList.contains('restored-message');
                          
                          if (!isRestored) {
                            // Check if we already have this exact message in recent history to prevent immediate duplicates
                            const existingHistory = conversationManager.getChatHistory();
                            const isDuplicate = existingHistory.some(existing => 
                              existing.content === content.trim() && 
                              existing.role === role &&
                              (Date.now() - existing.timestamp) < 2000 // Within last 2 seconds
                            );
                            
                            // Additional throttling check
                            const isThrottled = lastSavedMessage && 
                              lastSavedMessage.content === content.trim() &&
                              (Date.now() - lastSavedMessage.timestamp) < 1000;
                            
                            if (!isDuplicate && !isThrottled) {
                              // Mark this element as fully processed
                              element.removeAttribute('data-processing');
                              element.setAttribute('data-processed', 'true');
                              
                              const message: ChatMessage = {
                                role: role as 'user' | 'assistant',
                                content: content.trim(),
                                timestamp: Date.now(),
                                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                              };
                              
                              // Update throttling tracker
                              lastSavedMessage = { content: content.trim(), timestamp: Date.now() };
                              
                              conversationManager.saveChatMessage(message);
                              console.log('💾 Saved NEW message:', { role, preview: content.substring(0, 30) + '...' });
                            } else {
                              // Mark as processed even if skipped to prevent retry
                              element.removeAttribute('data-processing');
                              element.setAttribute('data-processed', 'true');
                              const reason = isDuplicate ? 'DUPLICATE in history' : 'THROTTLED (too recent)';
                              console.log(`🚫 Skipped ${reason}:`, { role, preview: content.substring(0, 30) + '...' });
                            }
                          } else {
                            // Mark restored messages as processed
                            element.removeAttribute('data-processing');
                            element.setAttribute('data-processed', 'true');
                            console.log('🔄 Skipped RESTORED message:', { role, preview: content.substring(0, 30) + '...' });
                          }
                        }
                      } catch (innerError) {
                        // Clean up processing state on error
                        element.removeAttribute('data-processing');
                        element.setAttribute('data-processed', 'true');
                        console.warn('Message content extraction failed:', innerError);
                      }
                    }, 100);
                  }
                }
              });
            });
          } catch (error) {
            console.warn('Message tracking error:', error);
          }
        });

        observer.observe(chatContainer, {
          childList: true,
          subtree: true
        });

        console.log('✅ Message tracking initialized');
      } catch (error) {
        console.warn('Failed to setup message tracking:', error);
      }
    };

    // Delay setup to ensure DOM is ready
    setTimeout(setupMessageTracking, 500);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Update activity on user interactions
  // Note: conversationManager is a stable singleton and doesn't need to be in dependencies
  useEffect(() => {
    const handleActivity = () => {
      conversationManager.updateLastActivity();
    };

    // Track various user interactions
    const events = ['click', 'keypress', 'focus'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Load session data on component mount
  // Note: conversationManager is a stable singleton and doesn't need to be in dependencies
  useEffect(() => {
    try {
      console.log('🚀 Component Mount - Balanced initialization');
      
      // Only clear conflicting localStorage, preserve sessionStorage for normal operation
      localStorage.removeItem('agentConversationHistory');
      
      // Set flag briefly to prevent auto-triggers during initialization
      sessionStorage.setItem('initialization-in-progress', 'true');
      
      // Load existing session data normally
      const loadedHistory = conversationManager.deduplicateMessages();
      const loadedState = conversationManager.getSessionState();
      
      console.log('  📝 History length:', loadedHistory.length);
      console.log('  📊 Session state exists:', !!loadedState);
      console.log('  ⏰ Is recent session:', conversationManager.isRecentSession());
      
      // Update React state with loaded data
      setChatHistory(loadedHistory);
      setSessionState(loadedState);
      
      // Clear initialization flag quickly to allow normal operation
      setTimeout(() => {
        sessionStorage.removeItem('initialization-in-progress');
        console.log('✅ Initialization complete - normal operation enabled');
        
        // Enable inputs for user interaction
        const sendButton = document.getElementById('send-message') as HTMLButtonElement;
        const messageInput = document.getElementById('message-input') as HTMLInputElement;
        
        if (sendButton && messageInput) {
          sendButton.disabled = false;
          messageInput.disabled = false;
          console.log('✅ Inputs enabled and ready for user interaction');
        }
      }, 1000); // Shorter delay for better UX
    } catch (error) {
      console.error('Failed to initialize session:', error);
      sessionStorage.removeItem('initialization-in-progress');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) {
      return;
    }
    
    const initializeAgent = async () => {
      try {
        initializedRef.current = true;
        
        // Check session state and history
        const hasRecentSession = conversationManager.isRecentSession();
        const hasHistory = conversationManager.getChatHistory().length > 0;
        const needsInit = conversationManager.needsInitialization();
        
        console.log('🔍 Session Check:', { hasRecentSession, hasHistory, needsInit });
        
        // Skip session restoration to prevent auto-triggers
        console.log('� Session restoration skipped to prevent auto-message triggers');
        
        if (hasRecentSession && hasHistory && !needsInit) {
          console.log('⚠️ Skipping session restoration - preventing auto-triggers');
          // Don't restore - start fresh to avoid auto-sending stored messages
        }
        
        // Full initialization needed
        console.log('🚀 Full AI Agent initialization starting...');
        const widget = new AgentWidget();
        widgetRef.current = widget;
        
        await widget.initialize();
        widget.setupEventListeners();
        
        // Verify event listeners are working after initialization
        setTimeout(() => {
          const sendButton = document.getElementById('send-message') as HTMLButtonElement;
          const messageInput = document.getElementById('message-input') as HTMLInputElement;
          
          if (sendButton && messageInput) {
            console.log('🔧 Verifying input elements after initialization:', {
              sendButtonExists: !!sendButton,
              inputExists: !!messageInput,
              sendButtonDisabled: sendButton.disabled,
              inputDisabled: messageInput.disabled
            });
            
            // Ensure elements are enabled
            sendButton.disabled = false;
            messageInput.disabled = false;
            messageInput.placeholder = "Ask about Duc's experience, skills, or contact info...";
            
            // Use widget's verification method
            if (widgetRef.current) {
              widgetRef.current.verifyAndEnableInputs();
            }
            
            console.log('✅ Input elements verified and enabled');
          } else {
            console.error('❌ Send button or input not found after initialization');
          }
        }, 500);
        
        console.log('✅ AgentWidget fully initialized with verified event listeners');
        
        // Mark as initialized in session
        conversationManager.markInitialized();
        
        // Restore conversation if available after a delay
        setTimeout(() => {
          const storedHistory = conversationManager.getChatHistory();
          if (storedHistory.length > 0) {
            console.log('🔄 Restoring conversation after full initialization');
            conversationManager.restoreConversation();
            // Ensure UI shows the restored messages
            if (widgetRef.current) {
              widgetRef.current.restoreChatUI();
            }
          }
        }, 1000);
        
        console.log('🤖 AI Agent fully initialized and ready!');
      } catch (error) {
        console.error('Failed to initialize AI Agent:', error);
        initializedRef.current = false;
        widgetRef.current = null;
      }
    };

    initializeAgent();
    
    // Cleanup function
    return () => {
      // Update activity before cleanup but don't clear session
      conversationManager.updateLastActivity();
      // Reset initialization flag but preserve session data
      initializedRef.current = false;
      console.log('🔄 Component cleanup - session preserved');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      // F11 or Ctrl+Shift+F to toggle fullscreen
      if ((e.key === 'F11') || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  // Handle tab changes - ensure conversation and tool traces are preserved
  useEffect(() => {
    console.log('🔄 Tab changed to:', activeTab);
    
    if (activeTab === 'chat') {
      console.log('📑 Chat tab activated - ensuring conversation is visible');
      // Small delay to ensure DOM is updated after tab switch
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          const existingMessages = chatContainer.querySelectorAll('.chat-message[data-processed="true"]');
          const storedHistory = conversationManager.getChatHistory();
          
          console.log('🔍 Chat tab check:', {
            domMessages: existingMessages.length,
            storedMessages: storedHistory.length,
            containerContent: chatContainer.innerHTML.includes('AI Agent')
          });
          
          // If DOM doesn't show messages but we have stored history, restore it
          if (existingMessages.length === 0 && storedHistory.length > 0) {
            console.log('🔄 Restoring conversation after tab switch');
            conversationManager.restoreConversation();
          } else if (existingMessages.length < storedHistory.length) {
            console.log('📋 Partial restoration needed after tab switch');
            conversationManager.restoreConversation();
          }
          
          // Ensure input functionality is working after tab switch
          const messageInput = document.getElementById('message-input') as HTMLInputElement;
          const sendButton = document.getElementById('send-message') as HTMLButtonElement;
          
          if (messageInput && sendButton) {
            messageInput.disabled = false;
            sendButton.disabled = false;
            console.log('✅ Chat input re-enabled after tab switch');
            
            // Re-focus input to ensure it's ready
            messageInput.focus();
            
            // Ensure the widget's event listeners are still active
            if (widgetRef.current) {
              // Force re-check of widget functionality
              setTimeout(() => {
                console.log('🔄 Verifying widget functionality after tab switch');
                if (widgetRef.current && typeof widgetRef.current.initialized !== 'undefined') {
                  console.log('Widget status:', { initialized: widgetRef.current.initialized });
                  // Use widget's verification method
                  widgetRef.current.verifyAndEnableInputs();
                }
              }, 100);
            }
          }
        }
      }, 150);
    } else if (activeTab === 'trace') {
      console.log('🛠️ Tools tab activated - checking tool traces');
      setTimeout(() => {
        const traceContainer = document.getElementById('tool-trace');
        if (traceContainer) {
          // Check if AgentWidget has traces in memory first
          if (widgetRef.current && typeof widgetRef.current.restoreToolTracesToUI !== 'undefined') {
            // Use AgentWidget's restoration method for better consistency
            console.log('🔄 Using AgentWidget to restore tool traces');
            widgetRef.current.restoreToolTracesToUI();
          } else {
            // Fallback to session storage (legacy)
            const storedTraces = sessionStorage.getItem('ai_tool_traces');
            if (storedTraces && (traceContainer.innerHTML.includes('Knowledge base searches appear here') || 
                traceContainer.innerHTML.includes('Tool calls appear here'))) {
              try {
                const traces = JSON.parse(storedTraces) as Array<{html: string; timestamp: number}>;
                if (traces.length > 0) {
                  traceContainer.innerHTML = '';
                  traces.forEach((trace) => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = trace.html;
                    const traceElement = tempDiv.firstElementChild;
                    if (traceElement) {
                      traceContainer.appendChild(traceElement);
                    }
                  });
                  console.log('🔄 Restored tool traces from legacy storage');
                }
              } catch (error) {
                console.warn('Failed to restore tool traces:', error);
              }
            }
          }
          
          console.log('🔍 Tools tab state:', {
            hasTraces: !traceContainer.innerHTML.includes('Knowledge base searches appear here') && 
                      !traceContainer.innerHTML.includes('Tool calls appear here'),
            traceCount: traceContainer.children.length
          });
        }
      }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Handle chat reopening from minimized state
  useEffect(() => {
    if (!isMinimized && widgetRef.current) {
      console.log('🔄 Chat widget reopened - preparing event listeners');
      
      // Force reset event listeners to ensure they're properly attached
      setTimeout(() => {
        if (widgetRef.current) {
          widgetRef.current.forceResetEventListeners();
          console.log('✅ Event listeners reset after reopening chat');
        }
      }, EVENT_LISTENER_RESET_DELAY_MS);
      
      // Only restore if we have stored history and the UI is empty or showing initialization
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        const hasMessages = chatContainer.children.length > 0 && 
          !chatContainer.innerHTML.includes('AI Agent Ready') &&
          !chatContainer.innerHTML.includes('AI Agent Loading') &&
          !chatContainer.innerHTML.includes('AI Agent Unavailable');
        
        const storedHistory = conversationManager.getChatHistory();
        
        if (!hasMessages && storedHistory.length > 0) {
          console.log(`🔄 Restoring ${storedHistory.length} messages to UI`);
          
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            if (widgetRef.current) {
              widgetRef.current.restoreChatUI();
            } else {
              // Fallback: restore manually if widget not ready
              console.log('📋 Widget not ready, manually restoring messages');
              restoreSessionManually();
            }
          }, 100);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMinimized]);

  return (
    <>
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300" />
      )}
      
      <div 
        className={`chat-sidebar transition-all duration-300 ${
          isFullscreen 
            ? 'fixed inset-2 sm:inset-4 z-50 w-auto h-auto max-w-none bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden' 
            : isMinimized 
              ? 'fixed bottom-12 right-12 z-40 w-20 h-20 chat-button-glow rounded-full cursor-pointer transform hover:scale-110 transition-all duration-300 border-2 border-white/30 backdrop-blur-sm'
              : 'fixed top-24 right-4 bottom-4 z-40 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden'
        }`}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
      >
      {!isMinimized && (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
              <p className="text-white/80 text-sm">Ask about Duc Nguyen</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/80 hover:text-white transition-colors duration-200"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <X size={20} /> : <Maximize size={20} />}
            </button>
            {!isFullscreen && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                title={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white/90 text-xs font-medium">WebLLM Ready • No Install</span>
        </div>
      </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex">
              <button
                onClick={() => {
                  console.log('🔄 Switching to chat tab - preserving session');
                  conversationManager.updateLastActivity();
                  
                  // Save current state before switching
                  if (activeTab === 'trace') {
                    const traceContainer = document.getElementById('tool-trace');
                    if (traceContainer && !traceContainer.innerHTML.includes('Knowledge base searches appear here') &&
                        !traceContainer.innerHTML.includes('Tool calls appear here')) {
                      // Let AgentWidget handle saving traces instead of manual storage
                      if (widgetRef.current && typeof widgetRef.current.saveToolTracesToStorage !== 'undefined') {
                        console.log('💾 AgentWidget handling tool trace save before tab switch');
                      } else {
                        // Fallback to manual save (legacy)
                        const traces = Array.from(traceContainer.children).map(child => ({
                          html: child.outerHTML,
                          timestamp: Date.now()
                        }));
                        sessionStorage.setItem('tool-traces', JSON.stringify(traces));
                        console.log('💾 Saved tool traces before tab switch (legacy method)');
                      }
                    }
                  }
                  
                  setActiveTab('chat');
                }}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'chat'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MessageCircle size={16} />
                  <span>Chat</span>
                </div>
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Switching to tools tab - preserving session');
                  conversationManager.updateLastActivity();
                  setActiveTab('trace');
                }}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'trace'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Cpu size={16} />
                  <span>Tools</span>
                  {sessionStorage.getItem('tool-traces') && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className={`p-3 sm:p-4 flex flex-col ${
            isFullscreen 
              ? 'h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]' 
              : 'h-[calc(100vh-12rem)] sm:h-[600px]'
          }`}>
            {/* Chat Tab Content */}
            <div className={activeTab === 'chat' ? 'flex flex-col flex-1' : 'hidden'}>
              {/* Session Info Bar */}
              {sessionState && (
                <div className="mb-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 text-xs text-blue-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Session Active • {chatHistory.length} messages</span>
                    <span className="text-blue-500">• {sessionState.sessionId.split('_')[2]}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        conversationManager.clearSession();
                          // Also clear any tool traces and stored triggers
                          sessionStorage.removeItem('tool-traces');
                          sessionStorage.removeItem('agentConversationHistory');
                          sessionStorage.removeItem('auto-trigger-disabled');
                          console.log('🗑️ All session data cleared');
                          window.location.reload();
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors duration-200 text-xs"
                        title="Clear chat history and restart session"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Chat Messages */}
                <div 
                  id="chat-messages" 
                  className={`flex-1 border border-gray-200 rounded-xl overflow-y-auto bg-gradient-to-b from-gray-50 to-white transition-all duration-300 ${
                    isFullscreen 
                      ? 'text-base p-6 mb-6 shadow-inner' 
                      : 'text-sm p-4 mb-4'
                  }`}
                  style={{ 
                    minHeight: isFullscreen ? '500px' : '320px',
                    scrollBehavior: 'smooth'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                    <MessageCircle size={32} className="mb-3 text-gray-400" />
                    <p className="font-medium">AI Agent Loading...</p>
                    <p className="text-sm">Semantic search initializing</p>
                  </div>
                </div>
                
                {/* Input Section */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      id="message-input" 
                      type="text" 
                      placeholder="Ask about Duc's experience, skills, or contact info..." 
                      className={`flex-1 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                        isFullscreen ? 'py-3 text-base' : 'py-2 text-sm'
                      }`}
                    />
                    <button 
                      id="send-message"
                      className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 font-medium ${
                        isFullscreen ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                  
                  {/* Suggested Questions */}
                  <div className="flex flex-wrap gap-1.5">
                    {suggestionButtons.map((suggestion, index) => (
                      <button 
                        key={index}
                        className={`suggested-question px-2.5 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105 font-medium ${
                          suggestion.color === 'blue' ? 'bg-blue-50 hover:bg-blue-100 text-blue-700' :
                          suggestion.color === 'purple' ? 'bg-purple-50 hover:bg-purple-100 text-purple-700' :
                          suggestion.color === 'green' ? 'bg-green-50 hover:bg-green-100 text-green-700' :
                          suggestion.color === 'orange' ? 'bg-orange-50 hover:bg-orange-100 text-orange-700' :
                          'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => handleSuggestionClick(suggestion.message)}
                        title={`Ask: ${suggestion.message}`}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
            </div>
            
            {/* Tool Trace Tab Content - Always in DOM but hidden when not active */}
            <div 
              id="tool-trace"
              className={`${activeTab === 'trace' ? 'flex-1' : 'hidden'} border border-gray-200 rounded-xl p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white ${
                isFullscreen ? 'text-base' : 'text-sm'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                <Cpu size={32} className="mb-3 text-gray-400" />
                <p className="font-medium">Tool Calls</p>
                <p className="text-sm">Knowledge base searches appear here</p>
              </div>
            </div>
          </div>
        </>
      )}

      {isMinimized && (
        <div 
          className="w-full h-full flex items-center justify-center hover:scale-105 transition-transform duration-300"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMinimized(false);
          }}
          title="Open AI Assistant - Click to chat!"
        >
          <MessageCircle size={24} className="text-white drop-shadow-lg animate-pulse" />
        </div>
      )}
    </div>
    </>
  );
}

export default AgentSidebar;
