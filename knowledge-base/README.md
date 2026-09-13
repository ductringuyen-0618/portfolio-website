# Knowledge Base System

This folder contains PDF documents and the optimized knowledge base system for the AI assistant.

## System Architecture

### 1. **Hybrid Search System**
- **Structured Data**: Pre-processed TypeScript records for fast retrieval
- **PDF Processing**: Dynamic PDF text extraction using PDF.js
- **Intelligent Caching**: Multi-level caching for optimal performance

### 2. **Current Documents**
- `resume.pdf` - Duc Nguyen's complete resume and professional background

### 3. **Search Optimization Features**

#### **🚀 Performance Optimizations:**
- **Inverted Index**: Pre-built token index for O(1) candidate retrieval
- **Smart Caching**: Query results cached with LRU eviction
- **Prefix Matching**: Handles partial word matches
- **Stop Word Filtering**: Removes common words for better relevance

#### **🎯 Relevance Scoring:**
- **Multi-factor Scoring**: Title match, exact token, substring, rarity
- **Domain-specific Boosts**: Enhanced scoring for tech terms
- **ID-specific Targeting**: Direct mapping for common queries
- **TF-IDF Inspired**: Rare term boosting for better precision

#### **🧠 Semantic Search (NEW):**
- **Local Embeddings**: Transformers.js for browser-based semantic understanding
- **Hybrid Search**: Combines keyword + semantic search for best results
- **Cosine Similarity**: Vector-based relevance matching
- **Intelligent Routing**: Chooses optimal search strategy per query
- **Fallback System**: Graceful degradation when semantic search unavailable

#### **📊 Performance Monitoring:**
- **Real-time Metrics**: Search time, cache hit rate, result counts
- **Slow Query Detection**: Automatic performance alerts
- **Analytics Dashboard**: Search patterns and optimization insights

## Technical Implementation

### **Search Flow:**
1. **Query Normalization**: Remove stopwords, normalize text
2. **Cache Check**: Fast return for repeated queries
3. **Index Lookup**: Use inverted index for candidate selection
4. **Relevance Scoring**: Multi-factor scoring algorithm
5. **Result Ranking**: Sort by relevance score
6. **Cache Storage**: Store results for future use

### **PDF Integration:**
- **Asynchronous Processing**: Non-blocking PDF text extraction
- **Background Initialization**: PDFs processed during app startup
- **Fallback Strategy**: Graceful degradation if PDF processing fails

### **Performance Benchmarks:**
- **Keyword Search**: <5ms (cached), <15ms (uncached)
- **Semantic Search**: ~100-500ms (first-time), ~50-100ms (model cached)
- **Hybrid Search**: Intelligent routing for optimal performance
- **Cache Hit Rate**: ~80% for typical usage patterns
- **Memory Footprint**: ~2MB (knowledge base) + ~50MB (semantic models)
- **Model Loading**: ~10-15s initial download, cached afterwards

## Adding New Documents

### **PDF Documents:**
1. Add PDF files to this folder
2. Update `AgentWidget.ts` to include new PDF URLs
3. The system will automatically process and index content

### **Structured Data:**
1. Add new records to `src/data/knowledgeBase.ts`
2. Include appropriate tags and metadata
3. System rebuilds index automatically

## Usage Examples

```typescript
// Search with performance monitoring
const results = knowledgeBase.search("Duc's LinkedIn profile");

// Get performance stats
const stats = performanceMonitor.getStats();
console.log(`Average search time: ${stats.averageTime}ms`);

// Clear cache for fresh data
knowledgeBase.clearCache();
```

## Future Enhancements

- **Semantic Search**: Vector embeddings with cosine similarity
- **Multi-modal**: Support for images and other document types  
- **Real-time Updates**: Dynamic content refresh without restart
- **Advanced Analytics**: Search pattern analysis and recommendation