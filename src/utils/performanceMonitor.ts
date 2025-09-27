interface SearchMetrics {
  query: string;
  resultCount: number;
  searchTime: number;
  cacheHit: boolean;
  timestamp: number;
  searchStrategy?: 'keyword-only' | 'hybrid' | 'semantic-only' | 'fallback';
  semanticAvailable?: boolean;
}

class PerformanceMonitor {
  private metrics: SearchMetrics[] = [];
  private maxMetrics = 100;
  
  recordSearch(
    query: string, 
    resultCount: number, 
    searchTime: number, 
    cacheHit: boolean = false,
    searchStrategy?: 'keyword-only' | 'hybrid' | 'semantic-only' | 'fallback',
    semanticAvailable?: boolean
  ) {
    const metric: SearchMetrics = {
      query: query.toLowerCase().trim(),
      resultCount,
      searchTime,
      cacheHit,
      timestamp: Date.now(),
      searchStrategy,
      semanticAvailable
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log slow searches in development
    if (searchTime > 50) {
      console.warn(`Slow search detected: "${query}" took ${searchTime}ms`);
    }
  }
  
  getStats() {
    if (this.metrics.length === 0) {
      return { 
        averageTime: 0, 
        totalSearches: 0, 
        cacheHitRate: 0,
        hybridSearchRate: 0,
        semanticAvailabilityRate: 0
      };
    }
    
    const totalTime = this.metrics.reduce((sum, m) => sum + m.searchTime, 0);
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    const hybridSearches = this.metrics.filter(m => m.searchStrategy === 'hybrid').length;
    const semanticAvailable = this.metrics.filter(m => m.semanticAvailable === true).length;
    
    return {
      averageTime: Math.round(totalTime / this.metrics.length * 100) / 100,
      totalSearches: this.metrics.length,
      cacheHitRate: Math.round((cacheHits / this.metrics.length) * 100),
      slowQueries: this.metrics.filter(m => m.searchTime > 50).length,
      hybridSearchRate: Math.round((hybridSearches / this.metrics.length) * 100),
      semanticAvailabilityRate: Math.round((semanticAvailable / this.metrics.length) * 100),
      searchStrategies: {
        'keyword-only': this.metrics.filter(m => m.searchStrategy === 'keyword-only').length,
        'hybrid': this.metrics.filter(m => m.searchStrategy === 'hybrid').length,
        'semantic-only': this.metrics.filter(m => m.searchStrategy === 'semantic-only').length,
        'fallback': this.metrics.filter(m => m.searchStrategy === 'fallback').length,
      }
    };
  }
  
  getRecentQueries(limit: number = 10): SearchMetrics[] {
    return this.metrics
      .slice(-limit)
      .reverse();
  }
  
  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Performance measurement wrapper
export function measureSearchTime(fn: Function, query: string, ...args: any[]): any {
  const startTime = performance.now();
  const result = fn(...args);
  const endTime = performance.now();
  
  const searchTime = Math.round((endTime - startTime) * 100) / 100;
  const resultCount = Array.isArray(result) ? result.length : 1;
  
  performanceMonitor.recordSearch(query, resultCount, searchTime);
  
  return result;
}