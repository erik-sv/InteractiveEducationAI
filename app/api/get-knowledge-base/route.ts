import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'donor_chatbot_instructions.xml');
    const knowledgeBase = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ knowledgeBase });
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to load knowledge base' },
      { status: 500 }
    );
  }
}
