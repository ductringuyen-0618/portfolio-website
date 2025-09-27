# Open Source RAG Libraries for Browser-Based Knowledge Base

## Overview
Research on client-side RAG (Retrieval-Augmented Generation) libraries that work in browsers without requiring database connections. These libraries can enhance your current optimized knowledge base system.

## Top Recommendations

### 1. **LangChain.js** ⭐⭐⭐⭐⭐
- **GitHub**: https://github.com/langchain-ai/langchainjs
- **NPM**: `@langchain/core`, `@langchain/community`
- **Why Choose**: Most comprehensive RAG ecosystem for JavaScript
- **Browser Compatible**: ✅ Full support with Vite/Webpack
- **Features**:
  - Document loaders (PDF, text, JSON)
  - Vector stores (in-memory, Chroma.js)
  - Text splitters and embeddings
  - Retrieval chains and QA chains
  - Works with WebLLM and local models

```bash
npm install @langchain/core @langchain/community langchain
```

**Integration Example**:
```typescript
import { MemoryVectorStore } from '@langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Create vector store from your knowledge base
const vectorStore = await MemoryVectorStore.fromTexts(
  knowledgeBase.records.map(r => r.text),
  knowledgeBase.records.map(r => ({ id: r.id, title: r.title })),
  new OpenAIEmbeddings() // Can use local embeddings too
);
```

### 2. **Chroma.js** ⭐⭐⭐⭐
- **GitHub**: https://github.com/chroma-core/chroma
- **NPM**: `chromadb`
- **Why Choose**: Lightweight vector database for browsers
- **Browser Compatible**: ✅ With SQLite WASM
- **Features**:
  - In-memory vector storage
  - Cosine similarity search
  - Metadata filtering
  - Collection management

```bash
npm install chromadb
```

### 3. **Pinecone (Browser SDK)** ⭐⭐⭐
- **GitHub**: https://github.com/pinecone-io/pinecone-ts-client
- **NPM**: `@pinecone-database/pinecone`
- **Why Choose**: Production-ready vector search
- **Browser Compatible**: ✅ REST API based
- **Features**:
  - Managed vector database
  - Real-time updates
  - Namespace isolation
  - Production scaling

### 4. **Weaviate Client** ⭐⭐⭐
- **GitHub**: https://github.com/weaviate/typescript-client
- **NPM**: `weaviate-ts-client`
- **Browser Compatible**: ✅ HTTP-based
- **Features**:
  - GraphQL queries
  - Hybrid search (vector + keyword)
  - Multi-modal capabilities

### 5. **HNSWLib.js** ⭐⭐⭐⭐
- **GitHub**: https://github.com/nmslib/hnswlib
- **NPM**: `hnswlib-node` (needs WASM wrapper)
- **Why Choose**: Fast approximate nearest neighbor search
- **Browser Compatible**: ⚠️ Needs WASM compilation
- **Features**:
  - Memory-efficient indexing
  - Fast similarity search
  - No external dependencies

## Recommended Architecture for Your Project

### **Phase 1: Enhance Current System with LangChain.js**

```typescript
// Enhanced knowledgeBase.ts with LangChain integration
import { MemoryVectorStore } from '@langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

class HybridKnowledgeBase extends OptimizedKnowledgeBase {
  private vectorStore?: MemoryVectorStore;
  
  async initializeVectorStore() {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    
    // Create embeddings for semantic search
    const texts = records.map(r => r.text);
    const metadatas = records.map(r => ({ id: r.id, title: r.title }));
    
    // Use Ollama embeddings for local processing
    this.vectorStore = await MemoryVectorStore.fromTexts(
      texts,
      metadatas,
      new OllamaEmbeddings({ model: "nomic-embed-text" })
    );
  }
  
  async hybridSearch(query: string): Promise<KnowledgeRecord[]> {
    // Combine your optimized keyword search with vector search
    const keywordResults = super.search(query);
    
    if (this.vectorStore) {
      const vectorResults = await this.vectorStore.similaritySearch(query, 3);
      // Merge and deduplicate results
      return this.mergeResults(keywordResults, vectorResults);
    }
    
    return keywordResults;
  }
}
```

### **Phase 2: Local Embeddings with Transformers.js**

```bash
npm install @xenova/transformers
```

```typescript
import { pipeline } from '@xenova/transformers';

class LocalEmbeddingKnowledgeBase {
  private embedder?: any;
  
  async initialize() {
    // Load local embedding model (runs in browser)
    this.embedder = await pipeline('feature-extraction', 
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  
  async generateEmbeddings(texts: string[]) {
    const embeddings = await Promise.all(
      texts.map(text => this.embedder(text))
    );
    return embeddings;
  }
}
```

## Installation Commands

### **Minimal LangChain Setup**:
```bash
npm install @langchain/core @langchain/community langchain
```

### **Full RAG Stack**:
```bash
# Core RAG libraries
npm install @langchain/core @langchain/community langchain
npm install @xenova/transformers  # Local embeddings
npm install chromadb              # Vector database

# PDF and document processing
npm install pdf-parse pdf2pic     # Already have pdfjs-dist
npm install mammoth               # Word docs

# Utility libraries
npm install compromise            # NLP processing
npm install fuse.js              # Fuzzy search backup
```

### **Lightweight Alternative**:
```bash
# Just transformers.js for embeddings + your current system
npm install @xenova/transformers
```

## Integration Strategy

### **Option A: Enhance Current System** (Recommended)
1. Keep your optimized inverted index system
2. Add LangChain.js for semantic search
3. Combine keyword + vector results
4. Use local embeddings with Transformers.js

### **Option B: Full Migration** 
1. Replace current system with LangChain document chains
2. Use MemoryVectorStore for all searches
3. Add conversation memory
4. Implement retrieval QA chains

### **Option C: Hybrid Approach**
1. Current system for exact matches
2. Vector search for semantic queries
3. Fallback to fuzzy search
4. Performance monitoring for all methods

## Performance Comparison

| Library | Bundle Size | Init Time | Search Speed | Browser Support |
|---------|-------------|-----------|--------------|----------------|
| Current System | ~5KB | Instant | <5ms | ✅ Perfect |
| LangChain.js | ~200KB | ~2s | ~15-50ms | ✅ Good |
| Chroma.js | ~150KB | ~1s | ~10-30ms | ✅ Good |
| Transformers.js | ~50MB | ~10s | ~100-500ms | ✅ Excellent |

## Next Steps

1. **Install LangChain.js**: Enhance semantic capabilities
2. **Add Transformers.js**: Local embedding generation
3. **Implement Hybrid Search**: Best of both worlds
4. **Performance Testing**: Compare against current system
5. **Gradual Migration**: Keep current system as fallback

Would you like me to implement any of these solutions in your project?