import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'photography_1_instructions.xml');
    const knowledgeBase = await fs.readFile(filePath, 'utf8');
    
    return NextResponse.json({ 
      success: true,
      knowledgeBase 
    });
  } catch (error) {
    console.error('Error reading photography knowledge base:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load photography knowledge base' 
      },
      { status: 500 }
    );
  }
}
