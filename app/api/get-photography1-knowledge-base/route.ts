import fs from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'photography_1_instructions.xml');
    const xmlContent = await fs.readFile(filePath, 'utf8');

    const parser = new XMLParser();
    const parsedXml = parser.parse(xmlContent);
    const introMessage = parsedXml.photography_course.intro_message;

    return NextResponse.json({
      success: true,
      knowledgeBase: xmlContent,
      introMessage,
    });
  } catch (error) {
    console.error('Error reading photography knowledge base:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load photography knowledge base',
      },
      { status: 500 }
    );
  }
}
