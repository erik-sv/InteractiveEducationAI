// Simple script to test API endpoints
import fetch from 'node-fetch';

async function testEndpoints() {
  console.log('Testing API endpoints...');
  console.log('=======================\n');

  const endpoints = [
    { name: 'Healthcare Instructions', url: 'http://localhost:3000/api/get-healthcare-instructions' },
    { name: 'MBA Instructions', url: 'http://localhost:3000/api/get-mba-instructions' },
    // We'll test knowledge base endpoints with sample filenames if the instructions endpoints return data
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name}...`);
    try {
      const response = await fetch(endpoint.url);
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Success: ${data.success}`);
      
      if (data.success) {
        if (endpoint.name === 'Healthcare Instructions') {
          console.log(`Found ${data.data.instructions.length} healthcare instruction files`);
          if (data.data.instructions.length > 0) {
            const sampleFile = data.data.instructions[0].name;
            console.log(`Testing healthcare knowledge base with sample file: ${sampleFile}`);
            await testKnowledgeBase('Healthcare', sampleFile);
          }
        } else if (endpoint.name === 'MBA Instructions') {
          console.log(`Found ${data.data.instructions.length} MBA instruction files`);
          if (data.data.instructions.length > 0) {
            const sampleFile = data.data.instructions[0].name;
            console.log(`Testing MBA knowledge base with sample file: ${sampleFile}`);
            await testKnowledgeBase('MBA', sampleFile);
          }
        }
      } else {
        console.log(`Error: ${data.error.message}`);
      }
    } catch (error) {
      console.error(`Error testing ${endpoint.name}:`, error.message);
    }
    console.log('\n');
  }
}

async function testKnowledgeBase(type, fileName) {
  const endpoint = type === 'Healthcare' 
    ? `http://localhost:3000/api/get-healthcare-knowledge-base?fileName=${fileName}`
    : `http://localhost:3000/api/get-mba-knowledge-base?fileName=${fileName}`;
  
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    console.log(`Knowledge Base Status: ${response.status}`);
    console.log(`Knowledge Base Success: ${data.success}`);
    
    if (data.success) {
      console.log('Knowledge base content retrieved successfully');
      if (data.data.userInstructions) {
        console.log('User instructions found');
      }
    } else {
      console.log(`Knowledge Base Error: ${data.error.message}`);
    }
  } catch (error) {
    console.error(`Error testing ${type} knowledge base:`, error.message);
  }
}

// Run the tests
testEndpoints().catch(console.error);
