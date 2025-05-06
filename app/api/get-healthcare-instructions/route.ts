import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

import { XMLParser } from 'fast-xml-parser';
import { NextResponse } from 'next/server';

/**
 * GET /api/get-healthcare-instructions
 * Retrieves a list of healthcare instruction XML files with their names, paths, and intro messages.
 * Response format: { success, data, error }
 */
export async function GET() {
  const instructionsDir = path.join(process.cwd(), 'app', 'ai_instructions', 'healthcare');
  let files: string[] = [];

  try {
    files = fs.readdirSync(instructionsDir).filter(file => file.endsWith('.xml'));
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'DIR_NOT_FOUND',
          message: 'Healthcare instructions directory not found.',
          details: err,
        },
      },
      { status: 404 }
    );
  }

  try {
    const instructions = await Promise.all(
      files.map(async file => {
        const filePath = path.join(instructionsDir, file);
        let introMessage = 'Introduction not available for this item.';

        try {
          const xmlContent = await fsPromises.readFile(filePath, 'utf8');
          const parser = new XMLParser({ ignoreAttributes: false });
          const parsedXml = parser.parse(xmlContent);

          const extractedMessage =
            parsedXml?.instruction?.intro_message ||
            parsedXml?.scenario?.intro_message ||
            parsedXml?.document?.intro_message ||
            parsedXml?.root?.intro_message ||
            parsedXml?.memory_care_assistant?.intro_message;

          if (typeof extractedMessage === 'string' && extractedMessage.trim() !== '') {
            introMessage = extractedMessage;
            console.log(`Successfully extracted introMessage for ${file}.`);
          } else if (typeof extractedMessage === 'object' && extractedMessage['#text']) {
            introMessage = extractedMessage['#text'];
            console.log(`Successfully extracted introMessage (from #text) for ${file}.`);
          } else {
            console.log(
              `Using default introMessage for ${file} as no specific message was found or extracted.`
            );
          }
        } catch (parseError) {
          console.error(`Error parsing XML file ${file}:`, parseError);
        }

        return {
          name: file,
          path: `/app/ai_instructions/healthcare/${file}`,
          introMessage,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: { instructions }, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing healthcare instructions:', error);

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process healthcare instructions.',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
