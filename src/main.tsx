import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Initialize test integrations on app startup
const initializeTestData = () => {
  const existingIntegrations = localStorage.getItem('integrations');
  if (!existingIntegrations) {
    const testIntegrations = [
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
          // 🔧 REPLACE WITH YOUR REAL DATAFORSEO CREDENTIALS:
          // Get credentials from: https://app.dataforseo.com/api-dashboard
          login: 'test-user',        // ❌ Replace with your DataForSEO email
          password: 'test-pass',     // ❌ Replace with your DataForSEO API password
          useSandbox: true           // ✅ Use sandbox for testing, set to false for live data
          
          // 📝 Example with real credentials:
          // login: 'your-email@company.com',
          // password: 'your-api-password-here', 
          // useSandbox: false  // for real live data
        },
        lastTested: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    
    localStorage.setItem('integrations', JSON.stringify(testIntegrations));
    console.log('Initialized test integrations:', testIntegrations);
  }
};

// Initialize test data
initializeTestData();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 