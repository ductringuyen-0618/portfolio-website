// Demo: How to use the optimized JSON Knowledge Base
// Run this in browser console or integrate into your app

import { jsonKnowledgeLoader } from './src/utils/jsonKnowledgeLoader';
import { knowledgeBase } from './src/data/knowledgeBase';

async function demoJsonKnowledgeBase() {
  console.log('🚀 JSON Knowledge Base Demo');
  
  try {
    // Initialize the JSON KB
    await jsonKnowledgeLoader.loadFromFile('/agent/duc_nguyen_kb_with_github.json');
    console.log('✅ JSON KB Loaded');
    
    // Test different query types
    const testQueries = [
      'What is your LinkedIn profile?',
      'Show me your GitHub projects',
      'How can I contact you?',
      'What are your technical skills?',
      'Tell me about your experience at Triton Digital'
    ];
    
    console.log('\n📊 Testing Smart Search with Action Buttons:');
    
    for (const query of testQueries) {
      console.log(`\n🔍 Query: "${query}"`);
      
      const result = await knowledgeBase.smartSearchWithJson(query);
      
      console.log(`  Intent: ${result.intent.type}`);
      console.log(`  Confidence: ${result.confidence}`);
      console.log(`  Results: ${result.records.length}`);
      
      if (result.intent.suggestedActions) {
        console.log(`  Action Buttons: ${result.intent.suggestedActions.length}`);
        result.intent.suggestedActions.forEach(action => {
          console.log(`    - ${action.label}: ${action.url}`);
        });
      }
    }
    
    // Show stats
    const stats = knowledgeBase.getJsonStats();
    console.log('\n📈 JSON KB Statistics:', stats);
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Uncomment to run demo
// demoJsonKnowledgeBase();