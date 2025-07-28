// Test utility to check and create sample integrations for testing
// Run this in browser console to verify integrations are working

const testIntegrations = () => {
  console.log('=== Testing Integrations ===');
  
  // Check current integrations
  const existing = localStorage.getItem('integrations');
  console.log('Current integrations in localStorage:', existing);
  
  // Create test integrations if none exist
  if (!existing) {
    const sampleIntegrations = [
      {
        id: 'test-openai-1',
        name: 'Test OpenAI Integration',
        type: 'openai',
        status: 'connected',
        config: { 
          apiKey: 'sk-test...', 
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 1000
        },
        lastTested: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'test-dataforseo-1',
        name: 'Test DataForSEO Integration',
        type: 'dataforseo',
        status: 'connected',
        config: { 
          login: 'test-user',
          password: 'test-pass',
          useSandbox: true
        },
        lastTested: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    
    localStorage.setItem('integrations', JSON.stringify(sampleIntegrations));
    console.log('✅ Created test integrations:', sampleIntegrations);
  } else {
    console.log('✅ Integrations already exist');
  }
  
  // Test workflow creation
  const testWorkflow = {
    id: 'test-workflow-1',
    name: 'Test Workflow',
    description: 'Sample workflow for testing',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          id: 'trigger-1',
          type: 'trigger',
          label: 'Manual Trigger',
          config: { triggerType: 'manual' }
        }
      }
    ],
    edges: [],
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: []
  };
  
  // Save test workflow
  const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
  if (!workflows.find(w => w.id === testWorkflow.id)) {
    workflows.push(testWorkflow);
    localStorage.setItem('workflows', JSON.stringify(workflows));
    console.log('✅ Created test workflow:', testWorkflow);
  }
  
  console.log('=== Test Complete ===');
  console.log('Now try opening a workflow node settings to see if select options appear!');
};

// Auto-run the test
testIntegrations();

// Export for manual testing
if (typeof window !== 'undefined') {
  window.testIntegrations = testIntegrations;
} 