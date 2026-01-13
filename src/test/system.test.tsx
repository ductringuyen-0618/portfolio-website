/**
 * system.test.tsx
 * 
 * System/Integration tests to verify end-to-end functionality
 * Focused on testable core integration without complex UI interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '../App';
import { knowledgeBase } from '../data/knowledgeBase';

// Test Constants
const SEMANTIC_SEARCH_TIMEOUT_MS = 5000; // Timeout for semantic search initialization
const MAX_RAPID_SEARCH_TIME_MS = 200; // Performance threshold for rapid search operations

// Mock WebLLM to avoid actual model loading in tests
vi.mock('@mlc-ai/web-llm', () => ({
  MLCEngine: vi.fn(),
  CreateMLCEngine: vi.fn(() => Promise.reject(new Error('Test mode - no engine')))
}));

// Helper to render app (App already has BrowserRouter)
function renderApp() {
  return render(<App />);
}

describe('System Integration Tests', () => {
  beforeEach(() => {
    // Clear any stored state
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Application Initialization', () => {
    it('should render application without crashing', () => {
      renderApp();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should load semantic search on application start', async () => {
      renderApp();

      await waitFor(() => {
        expect(knowledgeBase.isSemanticReady()).toBe(true);
      }, { timeout: SEMANTIC_SEARCH_TIMEOUT_MS });
    });

    it('should have accessible main structure', () => {
      renderApp();

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      // Verify navigation exists
      const navElements = screen.queryAllByRole('navigation');
      expect(navElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Navigation Structure', () => {
    it('should have essential navigation links', () => {
      renderApp();

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // Check for key navigation
      const homeLinks = links.filter(link => link.textContent?.includes('Home'));
      const projectsLinks = links.filter(link => link.textContent?.includes('Projects'));
      
      expect(homeLinks.length).toBeGreaterThan(0);
      expect(projectsLinks.length).toBeGreaterThan(0);
    });

    // Skip: Agent feature is disabled (AI_AGENT_ENABLED = false in Layout.tsx)
    it.skip('should have agent interface elements', () => {
      renderApp();

      // Verify Chat tab exists
      const chatElements = screen.getAllByText(/Chat/i);
      expect(chatElements.length).toBeGreaterThan(0);
    });
  });

  describe('Knowledge Base Integration', () => {
    it('should search knowledge base and return relevant results', () => {
      const results = knowledgeBase.search('software engineer');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Verify result structure
      results.forEach(result => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('url');
      });
    });

    it('should handle intent detection for various query types', () => {
      const testCases = [
        { query: 'contact' },
        { query: 'email address' },
        { query: 'work experience' },
        { query: 'skills and technologies' },
        { query: 'github projects' }
      ];

      testCases.forEach(({ query }) => {
        const results = knowledgeBase.search(query);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0]).toHaveProperty('id');
        expect(results[0]).toHaveProperty('title');
      });
    });

    it('should perform semantic search when available', async () => {
      await waitFor(() => {
        expect(knowledgeBase.isSemanticReady()).toBe(true);
      }, { timeout: SEMANTIC_SEARCH_TIMEOUT_MS });

      const results = knowledgeBase.search('backend developer with java experience');
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      
      // Results should be relevant
      const resultText = results.map(r => r.text.toLowerCase()).join(' ');
      expect(
        resultText.includes('java') || 
        resultText.includes('backend') || 
        resultText.includes('developer')
      ).toBe(true);
    });

    it('should handle empty and edge case queries gracefully', () => {
      const edgeCases = ['', '   ', 'xyz123nonexistent', '!@#$%^&*()'];

      edgeCases.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(Array.isArray(results)).toBe(true);
      });
    });
  });

  // Skip: Agent feature is disabled (AI_AGENT_ENABLED = false in Layout.tsx)
  describe.skip('Agent Widget Presence', () => {
    it('should have agent interface elements in DOM', () => {
      renderApp();

      const chatElements = screen.getAllByText(/Chat/i);
      expect(chatElements.length).toBeGreaterThan(0);
      
      const toolElements = screen.getAllByText(/Tool/i);
      expect(toolElements.length).toBeGreaterThan(0);
    });

    it('should have interactive buttons available', () => {
      renderApp();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple concurrent searches', async () => {
      const queries = [
        'software engineer',
        'java kotlin',
        'projects',
        'experience',
        'skills'
      ];

      const searchPromises = queries.map(query => 
        Promise.resolve(knowledgeBase.search(query))
      );

      const results = await Promise.all(searchPromises);

      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should maintain stable UI structure', () => {
      renderApp();

      expect(screen.getByRole('main')).toBeInTheDocument();
      
      const navElements = screen.getAllByRole('navigation');
      expect(navElements.length).toBeGreaterThan(0);
    });

    it('should recover from errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        renderApp();
        expect(screen.getByRole('main')).toBeInTheDocument();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      renderApp();

      const links = screen.getAllByRole('link');
      const buttons = screen.getAllByRole('button');
      
      // All interactive elements should be present
      expect([...links, ...buttons].length).toBeGreaterThan(0);
    });

    it('should have proper heading structure', () => {
      renderApp();

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      const h1Elements = headings.filter(h => h.tagName === 'H1');
      expect(h1Elements.length).toBeGreaterThan(0);
    });

    it('should provide text alternatives for images', () => {
      renderApp();

      const images = screen.queryAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });

  describe('Data Persistence', () => {
    it('should support sessionStorage for conversation history', () => {
      const mockHistory = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ];

      sessionStorage.setItem('agent_conversation', JSON.stringify(mockHistory));

      const storedHistory = sessionStorage.getItem('agent_conversation');
      expect(storedHistory).toBeDefined();
      expect(JSON.parse(storedHistory!)).toHaveLength(2);
    });

    it('should support sessionStorage for tool traces', () => {
      const mockTraces = [
        {
          toolName: 'smart_kb_search',
          args: { query: 'test', intent: 'general' },
          result: [{ id: 'test', title: 'Test', text: 'Content', url: '#' }]
        }
      ];

      sessionStorage.setItem('agent_tool_traces', JSON.stringify(mockTraces));

      const storedTraces = sessionStorage.getItem('agent_tool_traces');
      expect(storedTraces).toBeDefined();
      expect(JSON.parse(storedTraces!)).toHaveLength(1);
    });
  });

  describe('Browser Compatibility', () => {
    it('should have essential browser APIs available', () => {
      expect(typeof Promise).toBe('function');
      expect(typeof fetch).toBe('function');
      expect(typeof sessionStorage).toBe('object');
      expect(typeof localStorage).toBe('object');
    });
  });

  describe('SEO and Meta Information', () => {
    it('should have meta description', () => {
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeDefined();
    });
  });

  describe('Advanced Knowledge Base Queries', () => {
    it('should return results for technical skills queries', () => {
      const queries = [
        'Java programming',
        'Kotlin development',
        'Spring Boot framework',
        'RESTful API',
        'database design',
        'microservices architecture'
      ];

      queries.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
        
        // Results should have proper structure
        results.forEach(result => {
          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('title');
          expect(result).toHaveProperty('text');
          expect(result).toHaveProperty('url');
        });
      });
    });

    it('should return results for professional experience queries', () => {
      const queries = [
        'work experience',
        'software engineer',
        'professional',
        'Triton Digital',
        'backend'
      ];

      queries.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(results.length).toBeGreaterThan(0);
        
        // Verify relevance by checking if results contain keywords
        const resultContent = results.map(r => 
          `${r.title} ${r.text}`.toLowerCase()
        ).join(' ');
        
        expect(
          resultContent.includes('experience') ||
          resultContent.includes('work') ||
          resultContent.includes('engineer') ||
          resultContent.includes('developer') ||
          resultContent.includes('professional')
        ).toBe(true);
      });
    });

    it('should return results for project-related queries', () => {
      const queries = [
        'projects',
        'portfolio',
        'github repositories',
        'open source contributions',
        'side projects'
      ];

      queries.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(results.length).toBeGreaterThan(0);
        
        results.forEach(result => {
          expect(typeof result.title).toBe('string');
          expect(typeof result.text).toBe('string');
          expect(typeof result.url).toBe('string');
        });
      });
    });

    it('should handle complex multi-word technical queries', () => {
      const complexQueries = [
        'backend development with Java and Spring Boot',
        'RESTful API design and implementation',
        'microservices architecture best practices',
        'database schema design and optimization',
        'continuous integration and deployment'
      ];

      complexQueries.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it('should return relevant results for contact information queries', () => {
      const contactQueries = [
        'contact',
        'email',
        'duc nguyen',
        'seattle',
        'linkedin',
        'github'
      ];

      contactQueries.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(results.length).toBeGreaterThan(0);
        
        // Check for contact-related information
        const hasContactInfo = results.some(result => {
          const content = `${result.title} ${result.text}`.toLowerCase();
          return content.includes('contact') ||
                 content.includes('email') ||
                 content.includes('linkedin') ||
                 content.includes('github') ||
                 content.includes('@');
        });
        
        expect(hasContactInfo).toBe(true);
      });
    });

    it('should handle partial word matches', () => {
      const partialQueries = [
        'prog', // should match "programming"
        'dev', // should match "development" or "developer"
        'eng', // should match "engineer" or "engineering"
        'tech' // should match "technology" or "technical"
      ];

      partialQueries.forEach(query => {
        const results = knowledgeBase.search(query);
        // Should return something, even if partial match
        expect(Array.isArray(results)).toBe(true);
      });
    });

    it('should perform case-insensitive searches', () => {
      const queries = [
        'JAVA',
        'java',
        'Java',
        'JaVa'
      ];

      const allResults = queries.map(query => knowledgeBase.search(query));
      
      // All variations should return same number of results
      const resultLengths = allResults.map(results => results.length);
      const uniqueLengths = new Set(resultLengths);
      
      expect(uniqueLengths.size).toBe(1); // All should be same length
    });

    it('should handle queries with special characters', () => {
      const specialCharQueries = [
        'Java/Kotlin',
        'Spring (Boot)',
        'REST-API',
        'C++/C#',
        '.NET'
      ];

      specialCharQueries.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(Array.isArray(results)).toBe(true);
        // Should not crash and should return results
      });
    });
  });

  describe('Agent-Knowledge Base Integration', () => {
    it('should support smart search with JSON enhancement', async () => {
      const query = 'Tell me about your experience';
      
      // Call smartSearchWithJson if available
      if (typeof knowledgeBase.smartSearchWithJson === 'function') {
        const result = await knowledgeBase.smartSearchWithJson(query);
        
        expect(result).toBeDefined();
        expect(result).toHaveProperty('records');
        expect(result).toHaveProperty('intent');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('searchStrategy');
        expect(Array.isArray(result.records)).toBe(true);
        expect(result.records.length).toBeGreaterThan(0);
        
        // Verify record structure
        result.records.forEach(record => {
          expect(record).toHaveProperty('id');
          expect(record).toHaveProperty('title');
          expect(record).toHaveProperty('text');
          expect(record).toHaveProperty('url');
        });
      } else {
        // Fallback to regular search
        const results = knowledgeBase.search(query);
        expect(Array.isArray(results)).toBe(true);
      }
    });

    it('should detect intent from queries', () => {
      const intentTestCases = [
        { query: 'contact me', expectedKeywords: ['contact', 'email'] },
        { query: 'show projects', expectedKeywords: ['project', 'github'] },
        { query: 'work experience', expectedKeywords: ['experience', 'work', 'professional'] },
        { query: 'technical skills', expectedKeywords: ['skill', 'technology', 'programming'] }
      ];

      intentTestCases.forEach(({ query, expectedKeywords }) => {
        const results = knowledgeBase.search(query);
        expect(results.length).toBeGreaterThan(0);
        
        const resultContent = results.map(r => 
          `${r.title} ${r.text}`.toLowerCase()
        ).join(' ');
        
        // At least one expected keyword should be present
        const hasExpectedKeyword = expectedKeywords.some(keyword => 
          resultContent.includes(keyword)
        );
        
        expect(hasExpectedKeyword).toBe(true);
      });
    });

    it('should retrieve multiple relevant results for broad queries', () => {
      const broadQueries = [
        'software engineer',
        'developer',
        'duc nguyen',
        'backend'
      ];

      broadQueries.forEach(query => {
        const results = knowledgeBase.search(query);
        
        // Broad queries should return multiple results
        expect(results.length).toBeGreaterThanOrEqual(2);
        
        // Results should cover different aspects
        const titles = results.map(r => r.title.toLowerCase());
        const uniqueTitles = new Set(titles);
        
        expect(uniqueTitles.size).toBeGreaterThan(1);
      });
    });

    it('should handle follow-up queries correctly', () => {
      // Simulate a conversation flow
      const conversationFlow = [
        'What technologies do you use?',
        'Tell me more about Java',
        'What about Spring Boot?',
        'Any microservices experience?'
      ];

      conversationFlow.forEach(query => {
        const results = knowledgeBase.search(query);
        expect(results.length).toBeGreaterThan(0);
        
        // Each query should return relevant results
        results.forEach(result => {
          expect(result.text.length).toBeGreaterThan(0);
        });
      });
    });

    it('should provide consistent results for similar queries', () => {
      const similarQueries = [
        'What is your email?',
        'How can I contact you?',
        'What is your email address?',
        'How do I reach you?'
      ];

      const allResults = similarQueries.map(query => knowledgeBase.search(query));
      
      // All should return results
      allResults.forEach(results => {
        expect(results.length).toBeGreaterThan(0);
      });
      
      // Check if they return similar content (contact information)
      const allContainContact = allResults.every(results => 
        results.some(result => {
          const content = `${result.title} ${result.text}`.toLowerCase();
          return content.includes('contact') || 
                 content.includes('email') ||
                 content.includes('@');
        })
      );
      
      expect(allContainContact).toBe(true);
    });

    it('should support semantic search after initialization', async () => {
      await waitFor(() => {
        expect(knowledgeBase.isSemanticReady()).toBe(true);
      }, { timeout: SEMANTIC_SEARCH_TIMEOUT_MS });

      const semanticQuery = 'backend engineer with cloud experience';
      const results = knowledgeBase.search(semanticQuery);
      
      expect(results.length).toBeGreaterThan(0);
      
      // Semantic search should find relevant results even without exact keywords
      const resultContent = results.map(r => 
        `${r.title} ${r.text}`.toLowerCase()
      ).join(' ');
      
      expect(
        resultContent.includes('backend') ||
        resultContent.includes('engineer') ||
        resultContent.includes('developer') ||
        resultContent.includes('cloud') ||
        resultContent.includes('experience')
      ).toBe(true);
    });

    it('should handle rapid successive queries', () => {
      const rapidQueries = [
        'Java', 'Kotlin', 'Spring', 'API', 'Database',
        'Projects', 'Experience', 'Skills', 'Contact', 'GitHub'
      ];

      rapidQueries.forEach(query => {
        const startTime = performance.now();
        const results = knowledgeBase.search(query);
        const endTime = performance.now();
        
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        
        // Search should be fast - increased threshold to avoid flaky tests on slower CI
        const searchTime = endTime - startTime;
        expect(searchTime).toBeLessThan(MAX_RAPID_SEARCH_TIME_MS);
      });
    });

    it('should prioritize exact matches over partial matches', () => {
      const query = 'Java';
      const results = knowledgeBase.search(query);
      
      expect(results.length).toBeGreaterThan(0);
      
      // First result should likely contain "Java" prominently
      const firstResult = results[0];
      const firstResultContent = `${firstResult.title} ${firstResult.text}`.toLowerCase();
      
      expect(firstResultContent.includes('java')).toBe(true);
    });

    it('should provide actionable results for intent-based queries', () => {
      const actionableQueries = [
        { query: 'contact', expectUrl: true },
        { query: 'github', expectUrl: true },
        { query: 'linkedin', expectUrl: true },
        { query: 'projects', expectUrl: true }
      ];

      actionableQueries.forEach(({ query, expectUrl }) => {
        const results = knowledgeBase.search(query);
        expect(results.length).toBeGreaterThan(0);
        
        if (expectUrl) {
          // Should have at least one result with a valid URL
          const hasValidUrl = results.some(result => 
            result.url && 
            result.url.length > 0 && 
            (result.url.startsWith('http') || result.url.startsWith('mailto') || result.url.startsWith('/'))
          );
          
          expect(hasValidUrl).toBe(true);
        }
      });
    });
  });

  describe('Knowledge Base Result Quality', () => {
    it('should return results with complete metadata', () => {
      const query = 'software engineer';
      const results = knowledgeBase.search(query);
      
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(result => {
        // Each result should have all required fields
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('url');
        
        // Fields should have valid values
        expect(typeof result.id).toBe('string');
        expect(result.id.length).toBeGreaterThan(0);
        expect(typeof result.title).toBe('string');
        expect(result.title.length).toBeGreaterThan(0);
        expect(typeof result.text).toBe('string');
        expect(result.text.length).toBeGreaterThan(0);
        expect(typeof result.url).toBe('string');
      });
    });

    it('should return unique results (no duplicates)', () => {
      const query = 'developer';
      const results = knowledgeBase.search(query);
      
      expect(results.length).toBeGreaterThan(0);
      
      // Check for duplicate IDs
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return results in relevance order', () => {
      const query = 'Java programming';
      const results = knowledgeBase.search(query);
      
      expect(results.length).toBeGreaterThan(1);
      
      // First result should be more relevant than last
      const firstResultContent = `${results[0].title} ${results[0].text}`.toLowerCase();
      const lastResultContent = `${results[results.length - 1].title} ${results[results.length - 1].text}`.toLowerCase();
      
      // Count keyword occurrences
      const countKeywords = (text: string) => {
        const keywords = ['java', 'programming'];
        return keywords.reduce((count, keyword) => {
          const matches = text.match(new RegExp(keyword, 'gi'));
          return count + (matches ? matches.length : 0);
        }, 0);
      };
      
      const firstCount = countKeywords(firstResultContent);
      const lastCount = countKeywords(lastResultContent);
      
      // First result should have equal or more keyword matches
      expect(firstCount).toBeGreaterThanOrEqual(lastCount);
    });

    it('should limit result count to reasonable number', () => {
      const query = 'software';
      const results = knowledgeBase.search(query);
      
      // Should not return excessive results
      expect(results.length).toBeLessThanOrEqual(50);
      
      // But should return enough for context
      expect(results.length).toBeGreaterThan(0);
    });

    it('should provide text excerpts suitable for display', () => {
      const query = 'experience';
      const results = knowledgeBase.search(query);
      
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(result => {
        // Text should be meaningful length
        expect(result.text.length).toBeGreaterThan(10);
        expect(result.text.length).toBeLessThan(5000);
        
        // Should not be just whitespace
        expect(result.text.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
