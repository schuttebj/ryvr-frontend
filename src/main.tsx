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
        name: 'DataForSEO Integration',
        type: 'dataforseo',
        status: 'connected',
        config: { 
          // 🚨 REQUIRED: Real DataForSEO credentials needed - no mock data available
          // Get your credentials from: https://app.dataforseo.com/api-dashboard
          login: 'your-dataforseo-email@domain.com',     // ✅ Your DataForSEO account email
          password: 'your-dataforseo-api-password',      // ✅ Your DataForSEO API password  
          useSandbox: true                               // ✅ true = sandbox (free), false = live (paid)
          
          // 📝 To set up real credentials:
          // 1. Sign up at https://dataforseo.com/
          // 2. Go to API Dashboard: https://app.dataforseo.com/api-dashboard  
          // 3. Copy your email and API password
          // 4. Replace the values above
          // 5. Set useSandbox: true for testing (free), false for live data (costs credits)
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