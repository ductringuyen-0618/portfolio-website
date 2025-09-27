// Initialize JSON Knowledge Base on App Load
// This ensures the JSON KB is loaded when the app starts

import { jsonKnowledgeLoader } from './utils/jsonKnowledgeLoader';

export async function initializeJsonKnowledgeBase() {
  try {
    console.log('🚀 Initializing JSON Knowledge Base...');
    
    await jsonKnowledgeLoader.loadFromFile('/agent/duc_nguyen_kb_with_github.json');
    
    const stats = jsonKnowledgeLoader.getEnhancedStats();
    console.log('📊 JSON KB Stats:', stats);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize JSON Knowledge Base:', error);
    return false;
  }
}

// Auto-initialize when module loads (optional)
// Uncomment the line below if you want automatic initialization
// initializeJsonKnowledgeBase();