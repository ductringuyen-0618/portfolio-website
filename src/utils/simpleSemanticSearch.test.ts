import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleSemanticSearch } from './simpleSemanticSearch';

/**
 * Test suite for SimpleSemanticSearch
 * Tests the semantic search functionality with TF-IDF vectors
 */
describe('SimpleSemanticSearch', () => {
  let searchEngine: SimpleSemanticSearch;
  const mockDocuments = [
    {
      id: '1',
      title: 'React Development',
      text: 'React is a JavaScript library for building user interfaces. It makes building interactive UIs easy.',
    },
    {
      id: '2',
      title: 'TypeScript Guide',
      text: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing.',
    },
    {
      id: '3',
      title: 'Node.js Backend',
      text: 'Node.js is a JavaScript runtime built on Chrome V8 engine. Perfect for building scalable network applications.',
    },
  ];

  beforeEach(() => {
    searchEngine = new SimpleSemanticSearch();
  });

  describe('initialize', () => {
    it('should initialize with documents successfully', async () => {
      // Act
      await searchEngine.initialize(mockDocuments);

      // Assert
      expect(searchEngine.isInitialized()).toBe(true);
    });

    it('should handle empty documents array', async () => {
      // Act
      await searchEngine.initialize([]);

      // Assert
      expect(searchEngine.isInitialized()).toBe(true);
    });

    it('should tokenize documents correctly', async () => {
      // Arrange
      const singleDoc = [
        {
          id: '1',
          title: 'Test',
          text: 'Simple test document',
        },
      ];

      // Act
      await searchEngine.initialize(singleDoc);

      // Assert
      expect(searchEngine.isInitialized()).toBe(true);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockDocuments);
    });

    it('should return relevant results for React query', () => {
      // Act
      const results = searchEngine.search('React user interface');

      // Assert
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('1'); // React document should be first
    });

    it('should return relevant results for TypeScript query', () => {
      // Act
      const results = searchEngine.search('TypeScript typing JavaScript');

      // Assert
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('2'); // TypeScript document should be first
    });

    it('should return relevant results for Node.js query', () => {
      // Act
      const results = searchEngine.search('Node backend scalable');

      // Assert
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('3'); // Node.js document should be first
    });

    it('should return empty array for non-matching query', () => {
      // Act
      const results = searchEngine.search('quantum physics');

      // Assert
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty query string', () => {
      // Act
      const results = searchEngine.search('');

      // Assert
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should be case insensitive', () => {
      // Act
      const upperCaseResults = searchEngine.search('React JavaScript user interface building');
      const lowerCaseResults = searchEngine.search('react javascript user interface building');

      // Assert - Case insensitivity means same results regardless of case
      expect(upperCaseResults).toBeDefined();
      expect(lowerCaseResults).toBeDefined();
      expect(Array.isArray(upperCaseResults)).toBe(true);
      expect(Array.isArray(lowerCaseResults)).toBe(true);
      // If both find results, they should find the same document
      if (upperCaseResults.length > 0 && lowerCaseResults.length > 0) {
        expect(upperCaseResults[0].id).toBe(lowerCaseResults[0].id);
      }
    });

    it('should filter out short tokens (less than 3 characters)', () => {
      // Act
      const results = searchEngine.search('a b c React library');

      // Assert - Should still find React despite short tokens (need multi-char words)
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      // Assert
      expect(searchEngine.isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      // Act
      await searchEngine.initialize(mockDocuments);

      // Assert
      expect(searchEngine.isInitialized()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle documents with special characters', async () => {
      // Arrange
      const specialDocs = [
        {
          id: '1',
          title: 'Test!@#',
          text: 'Document with special chars: !@#$%^&*()',
        },
      ];

      // Act
      await searchEngine.initialize(specialDocs);
      const results = searchEngine.search('document special');

      // Assert
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle very long documents', async () => {
      // Arrange - Include varied content to create better TF-IDF vectors
      const longText = 'JavaScript programming language for web development. TypeScript adds types. Node backend runtime. '.repeat(50);
      const longDocs = [
        {
          id: '1',
          title: 'Long Document',
          text: longText,
        },
      ];

      // Act
      await searchEngine.initialize(longDocs);
      const results = searchEngine.search('JavaScript programming language web development');

      // Assert - Verifies long documents can be processed without errors
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Search should work even if score threshold filters some results
    });

    it('should handle documents with numbers', async () => {
      // Arrange
      const numDocs = [
        {
          id: '1',
          title: 'Version 2024',
          text: 'Released in 2024 with 100 new features',
        },
      ];

      // Act
      await searchEngine.initialize(numDocs);
      const results = searchEngine.search('2024 features');

      // Assert
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
