function TestComponent() {
  console.log('🧪 TestComponent rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f8ff',
      border: '2px solid #007bff',
      margin: '20px'
    }}>
      <h1 style={{ color: '#007bff' }}>🧪 React Test Component</h1>
      <p>If you can see this, React components are rendering!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '5px' 
      }}>
        <h3>Status Check:</h3>
        <ul>
          <li>✅ React is working</li>
          <li>✅ Components are rendering</li>
          <li>✅ JavaScript is executing</li>
          <li>✅ DOM is updating</li>
        </ul>
      </div>
    </div>
  );
}

export default TestComponent;
