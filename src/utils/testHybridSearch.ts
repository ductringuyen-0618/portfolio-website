// Test Hybrid Knowledge Base Integration
// This file demonstrates the new LangChain.js + semantic search capabilities

import { knowledgeBase } from '../data/knowledgeBase';

export async function testHybridSearch() {
  console.log('🧪 Testing Hybrid Knowledge Base System');
  
  // Test queries
  const testQueries = [
    "What's Duc's LinkedIn?",
    "Tell me about his backend experience",
    "AI and machine learning projects",
    "Kubernetes and container orchestration",
    "How to contact Duc Nguyen?"
  ];
  
  console.log('📊 Current System Status:');
  console.log('- Semantic Search Ready:', knowledgeBase.isSemanticReady());
  console.log('- Knowledge Base Stats:', knowledgeBase.getSemanticStats());
  
  // Test each query
  for (const query of testQueries) {
    console.log(`\n🔍 Testing: "${query}"`);
    
    // Test keyword search (legacy)
    const startKeyword = performance.now();
    const keywordResults = knowledgeBase.legacySearch(query);
    const keywordTime = performance.now() - startKeyword;
    
    console.log(`  📝 Keyword Search: ${keywordResults.length} results in ${keywordTime.toFixed(2)}ms`);
    
    // Test hybrid search (new)
    try {
      const startHybrid = performance.now();
      const hybridResults = await knowledgeBase.searchAsync(query);
      const hybridTime = performance.now() - startHybrid;
      
      console.log(`  🚀 Hybrid Search: ${hybridResults.length} results in ${hybridTime.toFixed(2)}ms`);
      console.log(`  📈 Performance: ${hybridTime > keywordTime ? 'Semantic overhead detected' : 'Faster than keyword'}`);
      
    } catch (error) {
      console.log(`  ⚠️ Hybrid Search Failed: ${error}`);
    }
  }
  
  // Display performance summary
  setTimeout(() => {
    console.log('\n📈 Final Performance Summary:');
    // Performance monitor stats would be logged here by AgentWidget
  }, 2000);
}

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testHybridSearch();
  }, 3000); // Wait for semantic search to initialize
}