// Simple script to test the healthcare API endpoints
const fetch = require('node-fetch');

async function testHealthcareInstructions() {
  console.log('Testing /api/get-healthcare-instructions endpoint...');
  try {
    const response = await fetch('http://localhost:8080/api/get-healthcare-instructions');
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error testing healthcare instructions:', error);
  }
}

async function testHealthcareKnowledgeBase(fileName) {
  console.log(`Testing /api/get-healthcare-knowledge-base endpoint with fileName=${fileName}...`);
  try {
    const response = await fetch(`http://localhost:8080/api/get-healthcare-knowledge-base?fileName=${encodeURIComponent(fileName)}`);
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error testing healthcare knowledge base:', error);
  }
}

async function main() {
  // First test the instructions endpoint
  const instructionsData = await testHealthcareInstructions();
  
  // If we got instructions, test the knowledge base endpoint with the first file
  if (instructionsData && instructionsData.success && instructionsData.data && instructionsData.data.instructions.length > 0) {
    const firstFileName = instructionsData.data.instructions[0].fileName;
    console.log(`Found instruction file: ${firstFileName}`);
    await testHealthcareKnowledgeBase(firstFileName);
  } else {
    // Fallback to a known filename
    console.log('No instructions found, testing with hardcoded filename');
    await testHealthcareKnowledgeBase('memory_care_example_ - _Eleanor_Vance.xml');
  }
}

main().catch(console.error);
