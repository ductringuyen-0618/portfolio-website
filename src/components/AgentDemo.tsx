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

interface AgentSidebarProps {}

function AgentSidebar(_props: AgentSidebarProps = {}) {
  const widgetRef = useRef<AgentWidget | null>(null);
  const initializedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'trace'>('chat');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionState, setSessionState] = useState<ChatSessionState | null>(null);

  // Debug function to show stored vs displayed state
  const debugSessionState = () => {
    const stored = conversationManager.getChatHistory();
    const session = conversationManager.getSessionState();
    console.log('🔍 Debug Session State:');
    console.log('  📦 Stored messages:', stored.length);
    console.log('  💭 React state messages:', chatHistory.length);
    console.log('  🔑 Session ID:', session?.sessionId);
    console.log('  ⏰ Last activity:', session?.lastActivity);
    console.log('  📋 Stored content:', stored);
    console.log('  💬 React content:', chatHistory);
  };

  // Test function to add a sample message for testing session memory
  const addTestMessage = () => {
    const testMessage: ChatMessage = {
      role: 'user',
      content: `Test message - ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      id: `test_${Date.now()}`
    };
    conversationManager.saveChatMessage(testMessage);
    console.log('🧪 Added test message for session memory testing');
  };

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
          console.log('✅ Manual restoration successful');
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

      const messageWrapper = document.createElement('div');
      messageWrapper.className = `flex mb-3 ${role === 'user' ? 'justify-end' : 'justify-start'} chat-message restored-message`;
      messageWrapper.setAttribute('data-restored', 'true');
      
      if (role === 'user') {
        messageWrapper.innerHTML = `
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-xs shadow-sm">
            <div class="text-sm font-medium">${conversationManager.escapeHtml(content)}</div>
          </div>
        `;
      } else {
        messageWrapper.innerHTML = `
          <div class="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md max-w-sm shadow-sm border border-gray-200">
            <div class="flex items-start space-x-2">
              <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                AI
              </div>
              <div class="text-sm leading-relaxed">${conversationManager.escapeHtml(content)}</div>
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
        // Optionally auto-send the message
        const sendButton = document.getElementById('send-message') as HTMLButtonElement;
        if (sendButton) {
          sendButton.click();
        }
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
  useEffect(() => {
    try {
      // Clean up any duplicates first
      const loadedHistory = conversationManager.deduplicateMessages();
      const loadedState = conversationManager.getSessionState();
      
      console.log('🚀 Component Mount - Session Check:');
      console.log('  📝 Clean history length:', loadedHistory.length);
      console.log('  📊 Session state exists:', !!loadedState);
      console.log('  ⏰ Is recent session:', conversationManager.isRecentSession());
      console.log('  💾 Clean messages:', loadedHistory);
      console.log('  🔑 Session state:', loadedState);
      
      // Force update React state with clean data
      setChatHistory(loadedHistory);
      setSessionState(loadedState);
      
      // Log detailed session info
      const stats = conversationManager.getSessionStats();
      console.log('📊 Session Stats on Mount:', {
        ...stats,
        historyLength: loadedHistory.length,
        hasState: !!loadedState,
        isRecentSession: conversationManager.isRecentSession()
      });
      
      // If we have history, try immediate restoration
      if (loadedHistory.length > 0) {
        console.log('🎯 Attempting immediate chat restoration...');
        setTimeout(() => {
          const restored = conversationManager.restoreConversation();
          if (restored) {
            console.log('🔄 Pre-initialization restoration successful');
            // Verify messages are actually in the DOM
            setTimeout(() => {
              const chatContainer = document.getElementById('chat-messages');
              const messageElements = chatContainer?.querySelectorAll('.chat-message');
              console.log('✅ DOM Verification:', {
                storedMessages: loadedHistory.length,
                domMessages: messageElements?.length || 0,
                containerExists: !!chatContainer
              });
            }, 200);
          } else {
            console.log('❌ Pre-initialization restoration failed');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
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
        
        if (hasRecentSession && hasHistory && !needsInit) {
          // Try to restore existing session without full LLM initialization
          console.log('🔄 Restoring existing chat session with history...');
          
          try {
            // Create widget but don't initialize LLM yet
            const widget = new AgentWidget();
            widgetRef.current = widget;
            
            // Restore conversation immediately
            const restored = conversationManager.restoreConversation();
            if (restored) {
              // Setup event listeners for interaction
              widget.quickSetup();
              // Ensure UI shows the restored messages
              setTimeout(() => widget.restoreChatUI(), 100);
              conversationManager.updateLastActivity();
              
              console.log('✅ Chat session restored successfully without re-initialization!');
              return;
            }
          } catch (restoreError) {
            console.warn('Quick session restoration failed:', restoreError);
            // Continue to full initialization
          }
        }
        
        // Full initialization needed
        console.log('🚀 Full AI Agent initialization starting...');
        const widget = new AgentWidget();
        widgetRef.current = widget;
        
        await widget.initialize();
        widget.setupEventListeners();
        
        // Mark as initialized in session
        conversationManager.markInitialized();
        
        // Restore conversation if available
        setTimeout(() => {
          conversationManager.restoreConversation();
          // Ensure UI shows the restored messages
          if (widgetRef.current) {
            widgetRef.current.restoreChatUI();
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
  }, []);

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

  // Handle chat reopening from minimized state
  useEffect(() => {
    if (!isMinimized && widgetRef.current) {
      // Only restore if we have stored history and the UI is empty or showing initialization
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        const hasMessages = chatContainer.children.length > 0 && 
          !chatContainer.innerHTML.includes('AI Agent Ready') &&
          !chatContainer.innerHTML.includes('AI Agent Loading') &&
          !chatContainer.innerHTML.includes('AI Agent Unavailable');
        
        const storedHistory = conversationManager.getChatHistory();
        
        if (!hasMessages && storedHistory.length > 0) {
          console.log(`🔄 Chat reopened from minimized - restoring ${storedHistory.length} messages to UI`);
          
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
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('chat')}
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
                onClick={() => setActiveTab('trace')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'trace'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Cpu size={16} />
                  <span>Tools</span>
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
            {activeTab === 'chat' ? (
              <>
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
                        onClick={addTestMessage}
                        className="text-orange-600 hover:text-orange-800 font-medium px-2 py-1 rounded hover:bg-orange-100 transition-colors duration-200 text-xs"
                        title="Add test message"
                      >
                        Test
                      </button>
                      <button
                        onClick={debugSessionState}
                        className="text-purple-600 hover:text-purple-800 font-medium px-2 py-1 rounded hover:bg-purple-100 transition-colors duration-200 text-xs"
                        title="Debug session state (check console)"
                      >
                        Debug
                      </button>
                      <button
                        onClick={restoreSessionManually}
                        className="text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded hover:bg-green-100 transition-colors duration-200"
                        title="Restore previous conversation"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => {
                          conversationManager.clearSession();
                          window.location.reload();
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors duration-200"
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
                  className={`flex-1 border border-gray-200 rounded-xl p-4 mb-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white ${
                    isFullscreen ? 'text-base' : 'text-sm'
                  }`}
                  style={{ minHeight: isFullscreen ? '400px' : '320px' }}
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
              </>
            ) : (
              /* Tool Trace Tab */
              <div 
                id="tool-trace"
                className={`flex-1 border border-gray-200 rounded-xl p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white ${
                  isFullscreen ? 'text-base' : 'text-sm'
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                  <Cpu size={32} className="mb-3 text-gray-400" />
                  <p className="font-medium">Tool Calls</p>
                  <p className="text-sm">Knowledge base searches appear here</p>
                </div>
              </div>
            )}
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
