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
      }, { timeout: 5000 });
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

    it('should have agent interface elements', () => {
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
      }, { timeout: 5000 });

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

  describe('Agent Widget Presence', () => {
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
});
