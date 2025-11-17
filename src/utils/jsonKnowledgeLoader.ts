// JSON Knowledge Base Loader and Integration Utility
// This utility loads the optimized JSON knowledge base and integrates it with the existing system

export interface JsonKnowledgeRecord {
  id: string;
  type: string;
  title: string;
  text: string;
  metadata: {
    tags: string[];
    priority?: 'high' | 'medium' | 'low';
    intent_match?: string[];
    action_buttons?: Array<{
      type: 'link' | 'email';
      url: string;
      label: string;
    }>;
    source: string;
    recruiter_keywords?: string[];
    quantified_impact?: string;
    experience_level?: Record<string, string>;
    core_technologies?: string[];
    availability_status?: string;
    response_time?: string;
    repository_count?: number;
    tech_stack_diversity?: string[];
  };
}

export interface JsonKnowledgeBase {
  kb_schema_version: string;
  owner: string;
  generated_on: string;
  documents: JsonKnowledgeRecord[];
}

export class JsonKnowledgeLoader {
  private jsonData: JsonKnowledgeBase | null = null;
  private cache: Map<string, JsonKnowledgeRecord[]> = new Map();

  async loadFromFile(jsonPath: string = '/agent/duc_nguyen_kb_with_github.json'): Promise<void> {
    try {
      console.log('📄 Loading JSON knowledge base...');
      const response = await fetch(jsonPath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON KB: ${response.status}`);
      }

      this.jsonData = await response.json();
      console.log(`✅ JSON KB loaded: ${this.jsonData?.documents.length} documents`);
    } catch (error) {
      console.error('❌ Failed to load JSON knowledge base:', error);
      throw error;
    }
  }

  // Convert JSON records to the existing KnowledgeRecord format
  convertToKnowledgeRecords(): Array<{
    id: string;
    title: string;
    url: string;
    text: string;
    _metadata?: JsonKnowledgeRecord['metadata'];
  }> {
    if (!this.jsonData) return [];

    return this.jsonData.documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      url: this.extractUrlFromMetadata(doc),
      text: doc.text,
      // Enhanced metadata for smart search
      _metadata: doc.metadata
    }));
  }

  // Smart search with JSON metadata integration
  smartSearchJson(query: string, limit: number = 5): {
    records: JsonKnowledgeRecord[];
    metadata: Record<string, unknown>;
    actionButtons?: Array<{type: 'link' | 'email', url: string, label: string}>;
  } {
    if (!this.jsonData) {
      return { records: [], metadata: {} };
    }

    const cacheKey = `${query.toLowerCase()}_${limit}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return this.processSearchResults(cached, query);
    }

    // Intent-based search using JSON metadata
    const queryLower = query.toLowerCase();
    let matchedDocs: JsonKnowledgeRecord[] = [];

    // Priority 1: Intent match
    matchedDocs = this.jsonData.documents.filter(doc => 
      doc.metadata.intent_match?.some(intent => 
        queryLower.includes(intent.toLowerCase())
      )
    );

    // Priority 2: Tag match
    if (matchedDocs.length < limit) {
      const tagMatches = this.jsonData.documents.filter(doc => 
        doc.metadata.tags.some(tag => 
          queryLower.includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(queryLower)
        )
      );
      matchedDocs = [...matchedDocs, ...tagMatches].slice(0, limit);
    }

    // Priority 3: Text/title search
    if (matchedDocs.length < limit) {
      const textMatches = this.jsonData.documents.filter(doc => 
        doc.title.toLowerCase().includes(queryLower) ||
        doc.text.toLowerCase().includes(queryLower)
      );
      matchedDocs = [...matchedDocs, ...textMatches].slice(0, limit);
    }

    // Remove duplicates
    const uniqueDocs = matchedDocs.filter((doc, index, self) => 
      self.findIndex(d => d.id === doc.id) === index
    ).slice(0, limit);

    // Cache results
    this.cache.set(cacheKey, uniqueDocs);

    return this.processSearchResults(uniqueDocs, query);
  }

  private processSearchResults(docs: JsonKnowledgeRecord[], query: string) {
    // Extract action buttons from high-priority matches
    const actionButtons: Array<{type: 'link' | 'email', url: string, label: string}> = [];
    
    docs.forEach(doc => {
      if (doc.metadata.action_buttons && doc.metadata.priority === 'high') {
        actionButtons.push(...doc.metadata.action_buttons);
      }
    });

    // Convert to knowledge records format
    const records = docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      url: this.extractUrlFromMetadata(doc),
      text: doc.text,
      _metadata: doc.metadata
    }));

    return {
      records,
      metadata: {
        searchStrategy: 'json-enhanced',
        intentMatched: this.detectIntent(query, docs),
        totalMatches: docs.length,
        hasActionButtons: actionButtons.length > 0
      },
      actionButtons: actionButtons.length > 0 ? actionButtons : undefined
    };
  }

  private detectIntent(query: string, matchedDocs: JsonKnowledgeRecord[]): string {
    // Check for specific intents
    if (/\b(linkedin|professional\s+profile|connect)\b/i.test(query)) return 'linkedin';
    if (/\b(github|projects?|portfolio|code)\b/i.test(query)) return 'github';
    if (/\b(contact|email|hire|reach)\b/i.test(query)) return 'contact';
    if (/\b(skills?|technical|stack|technologies?)\b/i.test(query)) return 'skills';
    if (/\b(experience|work|job|career)\b/i.test(query)) return 'experience';

    // Infer from matched documents
    if (matchedDocs.some(doc => doc.metadata.intent_match?.includes('contact'))) return 'contact';
    if (matchedDocs.some(doc => doc.metadata.intent_match?.includes('github'))) return 'github';
    
    return 'general';
  }

  private extractUrlFromMetadata(doc: JsonKnowledgeRecord): string {
    // Extract relevant URLs based on document type
    switch (doc.type) {
      case 'contact':
        return 'mailto:duc.tri.nguyen0186@gmail.com';
      case 'projects_github':
        return 'https://github.com/ductringuyen0186';
      case 'project':
        return `https://github.com/ductringuyen0186/${doc.id.replace('_', '-')}`;
      default:
        return 'https://ductringuyen0186.github.io/portfolio-website/';
    }
  }

  // Get enhanced metadata for performance monitoring
  getEnhancedStats() {
    if (!this.jsonData) return null;

    return {
      totalDocuments: this.jsonData.documents.length,
      documentTypes: [...new Set(this.jsonData.documents.map(d => d.type))],
      highPriorityDocs: this.jsonData.documents.filter(d => d.metadata.priority === 'high').length,
      actionableDocuments: this.jsonData.documents.filter(d => d.metadata.action_buttons?.length).length,
      cacheSize: this.cache.size,
      lastLoaded: this.jsonData.generated_on
    };
  }

  // Clear cache for memory management
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 JSON knowledge cache cleared');
  }

  isLoaded(): boolean {
    return this.jsonData !== null;
  }
}

// Singleton instance for global use
export const jsonKnowledgeLoader = new JsonKnowledgeLoader();