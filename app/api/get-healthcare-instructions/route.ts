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
  const instructionsDir = path.join(process.cwd(), 'ai_instructions', 'healthcare');
  let files: string[] = [];

  try {
    files = fs.readdirSync(instructionsDir).filter(file => file.endsWith('.xml'));
  } catch (err) {
    // Optionally use structured logging here for production
    // logger.error({ event: 'dir_not_found', instructionsDir, err });

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'DIR_NOT_FOUND',
          message: `Instructions directory not found: ${instructionsDir}`,
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
          } else if (typeof extractedMessage === 'object' && extractedMessage['#text']) {
            introMessage = extractedMessage['#text'];
          }
        } catch (parseError) {}

        return {
          name: file,
          path: `/ai_instructions/healthcare/${file}`,
          introMessage,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: { instructions }, error: null },
      { status: 200 }
    );
  } catch (error) {
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
