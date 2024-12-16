import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'donor_chatbot_instructions.xml');
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    
    const parser = new XMLParser();
    const parsedXml = parser.parse(xmlContent);
    const introMessage = parsedXml.donor_chatbot?.intro_message;

    return NextResponse.json({ 
      success: true,
      knowledgeBase: xmlContent,
      introMessage 
    });
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load knowledge base' 
      },
      { status: 500 }
    );
  }
}
