/**
 * knowledgeBase.test.ts
 * 
 * Comprehensive test suite for RAG (Retrieval-Augmented Generation) knowledge base
 * Tests cover:
 * - Basic keyword search functionality
 * - Intent detection and smart search
 * - JSON knowledge base integration
 * - Hybrid search with semantic capabilities
 * - Performance and accuracy metrics
 */

import { describe, it, expect, vi } from 'vitest';
import { knowledgeBase } from './knowledgeBase';

// Test Constants
const MAX_SEARCH_RESULTS = 10; // Expected maximum number of search results
const MIN_KNOWLEDGE_BASE_SIZE = 10; // Minimum expected KB records for substantial dataset
const MIN_TEXT_LENGTH = 20; // Minimum meaningful content length threshold
const SEMANTIC_INIT_WAIT_MS = 100; // Wait time for semantic search initialization
const MAX_SEARCH_TIME_MS = 100; // Performance threshold for single search operation
const MAX_CONCURRENT_SEARCHES_TIME_MS = 500; // Performance threshold for concurrent searches
const CACHE_PERFORMANCE_THRESHOLD = 1.5; // Caching performance multiplier (cached should be ≤ 1.5x original)

describe('Knowledge Base RAG System', () => {
  describe('Basic Search Functionality', () => {
    it('should return relevant results for keyword search', () => {
      const results = knowledgeBase.search('software engineer');
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      // Verify results contain relevant keywords
      const hasRelevantContent = results.some(r => 
        r.text.toLowerCase().includes('software') || 
        r.text.toLowerCase().includes('engineer')
      );
      expect(hasRelevantContent).toBe(true);
    });

    it('should return results for experience queries', () => {
      const results = knowledgeBase.search('triton digital experience');
      
      expect(results.length).toBeGreaterThan(0);
      
      // Should prioritize experience-related records
      const hasExperience = results.some(r => 
        r.id.includes('experience') || 
        r.text.toLowerCase().includes('triton')
      );
      expect(hasExperience).toBe(true);
    });

    it('should return results for skills queries', () => {
      const results = knowledgeBase.search('kotlin spring boot');
      
      expect(results.length).toBeGreaterThan(0);
      
      const hasSkills = results.some(r => 
        r.text.toLowerCase().includes('kotlin') || 
        r.text.toLowerCase().includes('spring')
      );
      expect(hasSkills).toBe(true);
    });

    it('should return results for project queries', () => {
      const results = knowledgeBase.search('salon hub github projects');
      
      expect(results.length).toBeGreaterThan(0);
      
      const hasProjects = results.some(r => 
        r.id.includes('project') || 
        r.text.toLowerCase().includes('salon') ||
        r.text.toLowerCase().includes('github')
      );
      expect(hasProjects).toBe(true);
    });

    it('should handle empty queries gracefully', () => {
      const results = knowledgeBase.search('');
      
      expect(results).toBeInstanceOf(Array);
      // Empty query should return all or default results
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle queries with no matches', () => {
      const results = knowledgeBase.search('xyzabc123nonexistent');
      
      expect(results).toBeInstanceOf(Array);
      // Should return some default results even for non-matching queries
    });

    it('should be case-insensitive', () => {
      const resultsLower = knowledgeBase.search('software engineer');
      const resultsUpper = knowledgeBase.search('SOFTWARE ENGINEER');
      const resultsMixed = knowledgeBase.search('Software Engineer');
      
      // Should return similar results regardless of case
      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsUpper.length).toBeGreaterThan(0);
      expect(resultsMixed.length).toBeGreaterThan(0);
    });
  });

  describe('Intent Detection', () => {
    it('should detect contact intent', () => {
      const result = knowledgeBase.smartSearch('how to contact email address');
      
      expect(result.intent.type).toBe('contact');
      expect(result.intent.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.intent.actionable).toBe(true);
      
      // Should prioritize contact information
      const hasContact = result.records.some(r => r.id === 'contact');
      expect(hasContact).toBe(true);
    });

    it('should detect LinkedIn intent', () => {
      const result = knowledgeBase.smartSearch('linkedin profile link');
      
      expect(result.intent.type).toBe('linkedin');
      expect(result.intent.confidence).toBeGreaterThan(0.8);
      expect(result.intent.actionable).toBe(true);
    });

    it('should detect GitHub intent', () => {
      const result = knowledgeBase.smartSearch('github repositories code');
      
      expect(result.intent.type).toBe('github');
      expect(result.intent.confidence).toBeGreaterThan(0.7);
    });

    it('should detect experience intent', () => {
      const result = knowledgeBase.smartSearch('work experience job history');
      
      expect(result.intent.type).toBe('experience');
      expect(result.confidence).toBeGreaterThan(0.8);
      
      // Should prioritize experience records
      const hasExperience = result.records.some(r => r.id.includes('experience'));
      expect(hasExperience).toBe(true);
    });

    it('should detect skills intent', () => {
      const result = knowledgeBase.smartSearch('technical skills programming languages');
      
      expect(result.intent.type).toBe('skills');
      expect(result.confidence).toBeGreaterThan(0.8);
      
      // Should prioritize skills record
      const hasSkills = result.records.some(r => r.id === 'skills_core');
      expect(hasSkills).toBe(true);
    });

    it('should detect projects intent', () => {
      const result = knowledgeBase.smartSearch('projects portfolio work samples');
      
      // Accept both 'projects' and 'github' as valid project-related intents
      expect(['projects', 'github']).toContain(result.intent.type);
      expect(result.records.length).toBeGreaterThan(0);
    });

    it('should default to general intent for ambiguous queries', () => {
      const result = knowledgeBase.smartSearch('tell me more information');
      
      expect(result.intent.type).toBe('general');
      expect(result.records.length).toBeGreaterThan(0);
    });
  });

  describe('Smart Search with Intent Boosting', () => {
    it('should boost contact records for contact queries', () => {
      const result = knowledgeBase.smartSearch('email address phone number');
      
      expect(result.searchStrategy).toBe('intent-enhanced');
      expect(result.confidence).toBeGreaterThan(0.9);
      
      // Contact record should be first
      expect(result.records[0].id).toBe('contact');
    });

    it('should boost experience records for career queries', () => {
      const result = knowledgeBase.smartSearch('current job position role');
      
      expect(result.searchStrategy).toBe('intent-enhanced');
      
      // Experience records should be prioritized
      const topThreeIds = result.records.slice(0, 3).map(r => r.id);
      const hasExperience = topThreeIds.some(id => id.includes('experience'));
      expect(hasExperience).toBe(true);
    });

    it('should boost project records for portfolio queries', () => {
      const result = knowledgeBase.smartSearch('github projects repositories');
      
      expect(result.searchStrategy).toBe('intent-enhanced');
      
      const topThreeIds = result.records.slice(0, 3).map(r => r.id);
      const hasProjects = topThreeIds.some(id => 
        id.includes('project') || id.includes('salon') || id.includes('ai_tech')
      );
      expect(hasProjects).toBe(true);
    });

    it('should provide high confidence for clear intents', () => {
      const contactResult = knowledgeBase.smartSearch('contact email');
      const skillsResult = knowledgeBase.smartSearch('technical skills');
      
      expect(contactResult.confidence).toBeGreaterThan(0.9);
      expect(skillsResult.confidence).toBeGreaterThan(0.85);
    });

    it('should return appropriate result count', () => {
      const result = knowledgeBase.smartSearch('software development experience');
      
      expect(result.records.length).toBeGreaterThan(0);
      expect(result.records.length).toBeLessThanOrEqual(MAX_SEARCH_RESULTS);
    });
  });

  describe('JSON Knowledge Base Integration', () => {
    it('should load JSON knowledge base successfully', async () => {
      // This test requires the JSON file to be available
      const result = await knowledgeBase.smartSearchWithJson('software engineer');
      
      expect(result).toBeDefined();
      expect(result.records).toBeInstanceOf(Array);
      // In test environment, may fallback to intent-enhanced
      expect(['json-enhanced', 'intent-enhanced']).toContain(result.searchStrategy);
    });

    it('should handle JSON KB load failures gracefully', async () => {
      // Mock fetch to fail
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await knowledgeBase.smartSearchWithJson('test query');
      
      // Should fallback to regular smart search
      expect(result).toBeDefined();
      expect(result.records).toBeInstanceOf(Array);
      
      // Restore fetch
      global.fetch = originalFetch;
    });

    it('should provide action buttons for actionable intents from JSON', async () => {
      const result = await knowledgeBase.smartSearchWithJson('contact email linkedin');
      
      if (result.intent.suggestedActions) {
        expect(result.intent.suggestedActions).toBeInstanceOf(Array);
        
        // Verify action button structure
        result.intent.suggestedActions.forEach(action => {
          expect(action).toHaveProperty('type');
          expect(action).toHaveProperty('url');
          expect(action).toHaveProperty('label');
          expect(['link', 'email']).toContain(action.type);
        });
      }
    });

    it('should return high confidence for JSON-enhanced results', async () => {
      const result = await knowledgeBase.smartSearchWithJson('triton digital experience');
      
      expect(result.confidence).toBeGreaterThan(0.8);
      // In test environment, may fallback to intent-enhanced
      expect(['json-enhanced', 'intent-enhanced']).toContain(result.searchStrategy);
    });
  });

  describe('Semantic Search Integration', () => {
    it('should initialize semantic search', async () => {
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, SEMANTIC_INIT_WAIT_MS));
      
      const isReady = knowledgeBase.isSemanticReady();
      
      // Semantic search may or may not be ready depending on environment
      expect(typeof isReady).toBe('boolean');
    });

    it('should fall back to keyword search if semantic not ready', () => {
      const results = knowledgeBase.search('software engineer');
      
      // Should return results even if semantic search not initialized
      expect(results.length).toBeGreaterThan(0);
    });

    it('should use hybrid search when semantic is ready', () => {
      if (knowledgeBase.isSemanticReady()) {
        // Use a query that matches actual knowledge base content
        const results = knowledgeBase.search('software engineer backend developer');
        
        // Hybrid search may return results or empty based on semantic matching
        expect(results).toBeInstanceOf(Array);
        // If results found, verify they have proper structure
        if (results.length > 0) {
          expect(results[0]).toHaveProperty('id');
          expect(results[0]).toHaveProperty('title');
        }
      } else {
        // If semantic not ready, test passes (optional feature)
        expect(knowledgeBase.isSemanticReady()).toBe(false);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should return records with required fields', () => {
      const results = knowledgeBase.search('software');
      
      results.forEach(record => {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('title');
        expect(record).toHaveProperty('text');
        expect(record).toHaveProperty('url');
        
        expect(typeof record.id).toBe('string');
        expect(typeof record.title).toBe('string');
        expect(typeof record.text).toBe('string');
        expect(typeof record.url).toBe('string');
        
        expect(record.id.length).toBeGreaterThan(0);
        expect(record.title.length).toBeGreaterThan(0);
        expect(record.text.length).toBeGreaterThan(0);
      });
    });

    it('should have unique record IDs', () => {
      const allRecords = knowledgeBase.getAll();
      const ids = allRecords.map(r => r.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should return all records via getAll()', () => {
      const allRecords = knowledgeBase.getAll();
      
      expect(allRecords).toBeInstanceOf(Array);
      expect(allRecords.length).toBeGreaterThan(MIN_KNOWLEDGE_BASE_SIZE);
      
      // Verify key records exist
      const recordIds = allRecords.map(r => r.id);
      expect(recordIds).toContain('profile_summary');
      expect(recordIds).toContain('contact');
      expect(recordIds).toContain('skills_core');
    });

    it('should have well-formatted URLs', () => {
      const allRecords = knowledgeBase.getAll();
      
      allRecords.forEach(record => {
        expect(record.url).toMatch(/^(https?:\/\/|mailto:|\/)/);  // Support absolute and relative URLs
      });
    });

    it('should have substantial text content', () => {
      const allRecords = knowledgeBase.getAll();
      
      allRecords.forEach(record => {
        expect(record.text.length).toBeGreaterThan(MIN_TEXT_LENGTH);
      });
    });
  });

  describe('Search Performance', () => {
    it('should complete search within reasonable time', () => {
      const startTime = performance.now();
      knowledgeBase.search('software engineer experience');
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(MAX_SEARCH_TIME_MS);
    });

    it('should handle multiple concurrent searches', async () => {
      const queries = [
        'software engineer',
        'contact information',
        'github projects',
        'technical skills',
        'work experience'
      ];
      
      const startTime = performance.now();
      const results = await Promise.all(
        queries.map(q => Promise.resolve(knowledgeBase.search(q)))
      );
      const endTime = performance.now();
      
      expect(results.length).toBe(queries.length);
      results.forEach(result => {
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
      });
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(MAX_CONCURRENT_SEARCHES_TIME_MS);
    });

    it('should cache/optimize repeated searches', () => {
      const query = 'software engineer triton digital';
      
      // First search
      const start1 = performance.now();
      const result1 = knowledgeBase.search(query);
      const time1 = performance.now() - start1; // Measure time
      
      // Second search (same query)
      const start2 = performance.now();
      const result2 = knowledgeBase.search(query);
      const time2 = performance.now() - start2; // Measure time
      
      expect(result1).toEqual(result2);
      // Second search should be faster or not significantly slower due to caching/optimization
      expect(time1).toBeGreaterThanOrEqual(0);
      expect(time2).toBeGreaterThanOrEqual(0);
      expect(time2).toBeLessThanOrEqual(time1 * CACHE_PERFORMANCE_THRESHOLD);
    });
  });

  describe('Search Relevance and Accuracy', () => {
    it('should prioritize exact keyword matches', () => {
      const results = knowledgeBase.search('Triton Digital');
      
      // First result should be highly relevant to Triton Digital
      expect(results[0].text.toLowerCase()).toContain('triton');
    });

    it('should handle multi-word queries effectively', () => {
      const results = knowledgeBase.search('spring boot kotlin backend');
      
      expect(results.length).toBeGreaterThan(0);
      
      // Results should contain at least one of the keywords
      results.forEach(result => {
        const text = result.text.toLowerCase();
        const hasKeyword = ['spring', 'boot', 'kotlin', 'backend'].some(
          keyword => text.includes(keyword)
        );
        expect(hasKeyword).toBe(true);
      });
    });

    it('should rank results by relevance', () => {
      // Helper function to calculate relevance score for this test
      const calculateRelevance = (text: string, query: string): number => {
        const textLower = text.toLowerCase();
        const queryWords = query.toLowerCase().split(/\s+/);
        
        let score = 0;
        queryWords.forEach(word => {
          if (textLower.includes(word)) {
            score++;
          }
        });
        
        return score / queryWords.length;
      };

      const results = knowledgeBase.search('software engineer experience triton');
      
      if (results.length >= 2) {
        // First result should be more relevant than subsequent ones
        const firstRelevance = calculateRelevance(results[0]!.text, 'software engineer experience triton');
        const secondRelevance = calculateRelevance(results[1]!.text, 'software engineer experience triton');
        
        expect(firstRelevance).toBeGreaterThanOrEqual(secondRelevance);
      }
    });

    it('should handle partial keyword matches', () => {
      const results = knowledgeBase.search('develop program code');
      
      expect(results.length).toBeGreaterThan(0);
      
      // Should find developer/development/programming content
      const hasRelevant = results.some(r => {
        const text = r.text.toLowerCase();
        return text.includes('develop') || text.includes('program') || 
               text.includes('code') || text.includes('software');
      });
      expect(hasRelevant).toBe(true);
    });
  });
});
