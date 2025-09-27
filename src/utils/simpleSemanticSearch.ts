// Simple Vector Search Implementation (Fallback)
// This provides basic semantic search capabilities without external dependencies

export interface SimpleVector {
  id: string;
  text: string;
  tokens: string[];
  vector: number[];
}

export class SimpleSemanticSearch {
  private vectors: SimpleVector[] = [];
  private isReady = false;
  
  async initialize(documents: Array<{id: string, title: string, text: string}>) {
    console.log('Initializing simple semantic search...');
    
    // Create simple TF-IDF style vectors
    const allTokens = new Set<string>();
    const docTokens: Array<{id: string, text: string, tokens: string[]}> = [];
    
    // Tokenize all documents
    documents.forEach(doc => {
      const fullText = `${doc.title} ${doc.text}`.toLowerCase();
      const tokens = fullText.split(/\W+/).filter(t => t.length > 2);
      
      docTokens.push({
        id: doc.id,
        text: fullText,
        tokens
      });
      
      tokens.forEach(token => allTokens.add(token));
    });
    
    const vocabulary = Array.from(allTokens);
    
    // Create TF-IDF vectors
    this.vectors = docTokens.map(doc => {
      const vector = vocabulary.map(term => {
        const tf = doc.tokens.filter(t => t === term).length / doc.tokens.length;
        const df = docTokens.filter(d => d.tokens.includes(term)).length;
        const idf = Math.log(docTokens.length / (df + 1));
        return tf * idf;
      });
      
      return {
        id: doc.id,
        text: doc.text,
        tokens: doc.tokens,
        vector
      };
    });
    
    this.isReady = true;
    console.log(`Simple semantic search ready with ${this.vectors.length} vectors`);
  }
  
  search(query: string, limit: number = 5): Array<{id: string, score: number}> {
    if (!this.isReady) return [];
    
    const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    
    // Calculate similarity scores
    const scores = this.vectors.map(vec => {
      // Simple token overlap scoring
      const overlap = queryTokens.filter(token => vec.tokens.includes(token)).length;
      const score = overlap / Math.max(queryTokens.length, vec.tokens.length);
      
      return {
        id: vec.id,
        score
      };
    });
    
    return scores
      .filter(s => s.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  isInitialized(): boolean {
    return this.isReady;
  }
}

export const simpleSemanticSearch = new SimpleSemanticSearch();