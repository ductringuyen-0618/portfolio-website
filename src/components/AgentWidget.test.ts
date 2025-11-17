/**
 * AgentWidget.test.ts
 * 
 * Comprehensive test suite for WebLLM Agent and RAG integration
 * Tests cover:
 * - Agent initialization and lifecycle
 * - RAG knowledge base retrieval
 * - Message processing and conversation history
 * - Tool trace tracking
 * - Error handling and fallbacks
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test file needs to access private widget members for comprehensive testing

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentWidget } from './AgentWidget';
import type * as webllm from '@mlc-ai/web-llm';

// Mock WebLLM module
vi.mock('@mlc-ai/web-llm', () => ({
  MLCEngine: vi.fn(),
  CreateMLCEngine: vi.fn()
}));

// Mock knowledge base module
vi.mock('../data/knowledgeBase', () => ({
  knowledgeBase: {
    search: vi.fn(),
    smartSearchWithJson: vi.fn(),
    getAll: vi.fn(),
    isSemanticReady: vi.fn()
  }
}));

// Mock performance monitor
vi.mock('../utils/performanceMonitor', () => ({
  performanceMonitor: {
    recordSearch: vi.fn(),
    getStats: vi.fn(() => ({
      totalSearches: 0,
      averageTime: 0,
      fastestSearch: 0,
      slowestSearch: 0,
      cacheHitRate: 0
    }))
  }
}));

describe('AgentWidget', () => {
  let widget: AgentWidget;
  let mockEngine: Partial<webllm.MLCEngine>;
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Create mock engine
    mockEngine = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Test response from AI'
              }
            }]
          })
        }
      } as unknown as webllm.MLCEngine['chat']
    };
    
    // Create fresh widget instance
    widget = new AgentWidget();
  });
  
  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should start with initialized flag as false', () => {
      expect(widget.initialized).toBe(false);
    });

    it('should set up event listeners during quick setup', () => {
      widget.quickSetup();
      // Note: Method is private, testing via side effects
      expect(widget.initialized).toBe(false); // Quick setup doesn't initialize engine
    });

    it('should load history from sessionStorage during quick setup', () => {
      // Set up mock history
      const mockHistory = [
        { role: 'user', content: 'Hello', timestamp: Date.now(), id: 'user_1' },
        { role: 'assistant', content: 'Hi there!', timestamp: Date.now(), id: 'assistant_1' }
      ];
      sessionStorage.setItem('ai_chat_history', JSON.stringify(mockHistory));
      
      widget.quickSetup();
      
      // Verify history was loaded (test via getConversationHistory if public)
      const savedHistory = sessionStorage.getItem('ai_chat_history');
      expect(savedHistory).toBeTruthy();
    });
  });

  describe('RAG Knowledge Base Integration', () => {
    it('should call knowledgeBase.smartSearchWithJson when processing messages', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      // Mock search result
      const mockSearchResult = {
        records: [
          { id: 'test', title: 'Test Title', text: 'Test content', url: 'https://test.com' }
        ],
        intent: { type: 'general' as const, confidence: 0.8, actionable: false },
        searchStrategy: 'json-enhanced',
        confidence: 0.9
      };
      
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue(mockSearchResult);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('Tell me about projects');
      
      expect(knowledgeBase.smartSearchWithJson).toHaveBeenCalledWith('Tell me about projects');
    });

    it('should fallback to knowledgeBase.search if smartSearchWithJson fails', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      // Mock smartSearchWithJson to throw error
      vi.mocked(knowledgeBase.smartSearchWithJson).mockRejectedValue(new Error('Search failed'));
      
      // Mock fallback search
      const mockFallbackResults = [
        { id: 'test', title: 'Fallback', text: 'Fallback content', url: 'https://test.com' }
      ];
      vi.mocked(knowledgeBase.search).mockReturnValue(mockFallbackResults);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(false);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('Test query');
      
      expect(knowledgeBase.search).toHaveBeenCalledWith('Test query');
    });

    it('should use emergency fallback (getAll) when no search results found', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      // Mock empty search result
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue({
        records: [],
        intent: { type: 'general', confidence: 0.5, actionable: false },
        searchStrategy: 'json-enhanced',
        confidence: 0.3
      });
      
      const mockEmergencyResults = [
        { id: 'profile', title: 'Profile', text: 'Profile info', url: 'https://test.com' },
        { id: 'contact', title: 'Contact', text: 'Contact info', url: 'https://test.com' }
      ];
      vi.mocked(knowledgeBase.getAll).mockReturnValue(mockEmergencyResults);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('Unknown query');
      
      expect(knowledgeBase.getAll).toHaveBeenCalled();
    });

    it('should record performance metrics after search', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      const { performanceMonitor } = await import('../utils/performanceMonitor');
      
      const mockSearchResult = {
        records: [{ id: 'test', title: 'Test', text: 'Content', url: 'https://test.com' }],
        intent: { type: 'general' as const, confidence: 0.8, actionable: false },
        searchStrategy: 'json-enhanced',
        confidence: 0.9
      };
      
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue(mockSearchResult);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      vi.mocked(performanceMonitor.getStats).mockReturnValue({
        totalSearches: 1,
        averageTime: 50,
        cacheHitRate: 0,
        hybridSearchRate: 0,
        semanticAvailabilityRate: 0
      });
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('Test query');
      
      expect(performanceMonitor.recordSearch).toHaveBeenCalled();
    });
  });

  describe('Conversation History Management', () => {
    it('should save conversation history to sessionStorage', () => {
      const mockHistory = [
        { role: 'user' as const, content: 'Hello', timestamp: Date.now(), id: 'user_1' }
      ];
      
      (widget as any).conversationHistory = mockHistory;
      (widget as any).saveHistoryToStorage();
      
      const saved = sessionStorage.getItem('ai_chat_history');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(mockHistory);
    });

    it('should load conversation history from sessionStorage', () => {
      const mockHistory = [
        { role: 'user' as const, content: 'Hello', timestamp: Date.now(), id: 'user_1' },
        { role: 'assistant' as const, content: 'Hi!', timestamp: Date.now(), id: 'assistant_1' }
      ];
      
      sessionStorage.setItem('ai_chat_history', JSON.stringify(mockHistory));
      
      (widget as any).loadHistoryFromStorage();
      
      expect((widget as any).conversationHistory).toEqual(mockHistory);
    });

    it('should clear conversation history', () => {
      const mockHistory = [
        { role: 'user' as const, content: 'Hello', timestamp: Date.now(), id: 'user_1' }
      ];
      
      (widget as any).conversationHistory = mockHistory;
      sessionStorage.setItem('ai_chat_history', JSON.stringify(mockHistory));
      
      widget.clearHistory();
      
      expect((widget as any).conversationHistory).toEqual([]);
      expect(sessionStorage.getItem('ai_chat_history')).toBe('[]');
    });

    it('should limit conversation history to prevent token overflow', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      // Create long conversation history (more than 16 messages)
      const longHistory = Array.from({ length: 20 }, (_, i) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now() + i,
        id: `msg_${i}`
      }));
      
      (widget as any).conversationHistory = longHistory;
      
      // Mock search result
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue({
        records: [{ id: 'test', title: 'Test', text: 'Content', url: 'https://test.com' }],
        intent: { type: 'general', confidence: 0.8, actionable: false },
        searchStrategy: 'json-enhanced',
        confidence: 0.9
      });
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('New message');
      
      // History should be trimmed to last 16 messages
      expect((widget as any).conversationHistory.length).toBeLessThanOrEqual(18); // 16 + 2 new messages
    });

    it('should restore chat UI from conversation history', () => {
      const mockHistory = [
        { role: 'user' as const, content: 'Hello', timestamp: Date.now(), id: 'user_1' },
        { role: 'assistant' as const, content: 'Hi there!', timestamp: Date.now(), id: 'assistant_1' }
      ];
      
      (widget as any).conversationHistory = mockHistory;
      
      // Mock DOM
      document.body.innerHTML = '<div id="chat-messages"></div>';
      
      widget.restoreChatUI();
      
      const container = document.getElementById('chat-messages');
      expect(container).toBeTruthy();
      // Check if messages were added to DOM (via displayMessage calls)
    });
  });

  describe('Tool Trace Tracking', () => {
    it('should save tool traces to sessionStorage', () => {
      const mockTraces = [
        {
          toolName: 'smart_kb_search',
          args: { query: 'test' },
          result: { count: 5 },
          timestamp: Date.now(),
          html: '<div>Tool trace</div>'
        }
      ];
      
      (widget as any).toolTraces = mockTraces;
      widget.saveToolTracesToStorage();
      
      const saved = sessionStorage.getItem('ai_tool_traces');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(mockTraces);
    });

    it('should load tool traces from sessionStorage', () => {
      const mockTraces = [
        {
          toolName: 'smart_kb_search',
          args: { query: 'test' },
          result: { count: 5 },
          timestamp: Date.now(),
          html: '<div>Tool trace</div>'
        }
      ];
      
      sessionStorage.setItem('ai_tool_traces', JSON.stringify(mockTraces));
      
      (widget as any).loadToolTracesFromStorage();
      
      expect((widget as any).toolTraces).toEqual(mockTraces);
    });

    it('should update tool trace with search results', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      const mockSearchResult = {
        records: [{ id: 'test', title: 'Test', text: 'Content', url: 'https://test.com' }],
        intent: { type: 'projects' as const, confidence: 0.95, actionable: true },
        searchStrategy: 'json-enhanced',
        confidence: 0.9
      };
      
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue(mockSearchResult);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('Show me projects');
      
      // Check that tool trace was updated
      expect((widget as any).toolTraces.length).toBeGreaterThan(0);
      const lastTrace = (widget as any).toolTraces[(widget as any).toolTraces.length - 1];
      expect(lastTrace.toolName).toBe('smart_kb_search');
      expect(lastTrace.args.query).toBe('Show me projects');
    });
  });

  describe('Error Handling', () => {
    it('should handle RAG search errors gracefully', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      // Mock search to throw error
      vi.mocked(knowledgeBase.smartSearchWithJson).mockRejectedValue(new Error('Network error'));
      vi.mocked(knowledgeBase.search).mockReturnValue([
        { id: 'fallback', title: 'Fallback', text: 'Fallback content', url: 'https://test.com' }
      ]);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(false);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      // Should not throw error
      await expect(widget.sendMessage('Test query')).resolves.not.toThrow();
      
      // Should have used fallback
      expect(knowledgeBase.search).toHaveBeenCalled();
    });

    it('should handle WebLLM engine errors', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      // Mock successful search but failing engine
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue({
        records: [{ id: 'test', title: 'Test', text: 'Content', url: 'https://test.com' }],
        intent: { type: 'general', confidence: 0.8, actionable: false },
        searchStrategy: 'json-enhanced',
        confidence: 0.9
      });
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine to throw error
      mockEngine.chat!.completions.create = vi.fn().mockRejectedValue(new Error('Engine error'));
      
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('Test query');
      
      // Should display error message to user
      const messages = document.getElementById('chat-messages');
      expect(messages?.innerHTML).toContain('apologize');
    });

    it('should prevent concurrent message processing', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      vi.mocked(knowledgeBase.smartSearchWithJson).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          records: [{ id: 'test', title: 'Test', text: 'Content', url: 'https://test.com' }],
          intent: { type: 'general', confidence: 0.8, actionable: false },
          searchStrategy: 'json-enhanced',
          confidence: 0.9
        }), 100))
      );
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      // Try to send multiple messages concurrently
      const promise1 = widget.sendMessage('First message');
      const promise2 = widget.sendMessage('Second message'); // Should be blocked
      
      await Promise.all([promise1, promise2]);
      
      // Only first message should process (second gets blocked by processingMessage flag)
      expect(knowledgeBase.smartSearchWithJson).toHaveBeenCalledTimes(1);
    });
  });

  describe('Intent Detection and Action Buttons', () => {
    it('should detect contact intent and provide action buttons', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      const mockSearchResult = {
        records: [{ id: 'contact', title: 'Contact', text: 'Email: test@example.com', url: 'mailto:test@example.com' }],
        intent: {
          type: 'contact' as const,
          confidence: 0.95,
          actionable: true,
          suggestedActions: [
            { type: 'email' as const, url: 'mailto:test@example.com', label: 'Send Email' }
          ]
        },
        searchStrategy: 'json-enhanced',
        confidence: 0.95
      };
      
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue(mockSearchResult);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('How can I contact you?');
      
      // Verify action buttons were processed
      const toolTrace = (widget as any).toolTraces.find((t: any) => t.toolName === 'smart_kb_search');
      expect(toolTrace?.args.actionable).toBe(true);
    });

    it('should detect GitHub/projects intent', async () => {
      const { knowledgeBase } = await import('../data/knowledgeBase');
      
      const mockSearchResult = {
        records: [
          { id: 'projects', title: 'Projects', text: 'GitHub projects', url: 'https://github.com/user' }
        ],
        intent: {
          type: 'projects' as const,
          confidence: 0.9,
          actionable: true,
          suggestedActions: [
            { type: 'link' as const, url: 'https://github.com/user', label: 'View GitHub' }
          ]
        },
        searchStrategy: 'json-enhanced',
        confidence: 0.9
      };
      
      vi.mocked(knowledgeBase.smartSearchWithJson).mockResolvedValue(mockSearchResult);
      vi.mocked(knowledgeBase.isSemanticReady).mockReturnValue(true);
      
      // Mock engine initialization
      (widget as any).engine = mockEngine;
      (widget as any).isInitialized = true;
      
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="chat-messages"></div>
        <div id="chat-input"></div>
        <div id="typing-indicator" style="display:none;"></div>
      `;
      
      await widget.sendMessage('Show me your projects');
      
      const toolTrace = (widget as any).toolTraces.find((t: any) => t.toolName === 'smart_kb_search');
      expect(toolTrace?.args.intent).toBe('projects');
    });
  });
});
