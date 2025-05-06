/* eslint-disable @typescript-eslint/no-unused-vars */
import { promises as fsPromises } from 'fs';
import path from 'path';

import { XMLParser } from 'fast-xml-parser';
import { NextResponse } from 'next/server';

/**
 * GET /api/get-mba-instructions
 * Retrieves a list of MBA instruction XML files with their names, paths, and intro messages.
 * Response format: { success, data, error }
 */

export async function GET() {
  const apiRouteName = 'get-mba-instructions'; // For logging context

  // Determine base directory
  let baseDir = process.cwd();
  const isDocker =
    process.env.DOCKER === 'true' ||
    (await fsPromises
      .access('/app')
      .then(() => true)
      .catch(() => false));

  // In Docker, the files are copied to /app directly, not in /app/app
  if (isDocker || baseDir.endsWith('/app') || baseDir.endsWith('\\app')) {
    baseDir = '/app';
  } else {
    // Check if we're in a subdirectory structure
    try {
      const appDirExists = await fsPromises
        .access(path.join(baseDir, 'app'))
        .then(() => true)
        .catch(() => false);

      if (appDirExists) {
        baseDir = path.join(baseDir, 'app');
      }
    } catch (err) {}
  }

  let instructionsDir = path.join(baseDir, 'ai_instructions'); // MBA files are in 'ai_instructions' directly

  let files: string[] = [];
  let foundPath = false;

  // Try the primary path first
  try {
    await fsPromises.access(instructionsDir);
    files = (await fsPromises.readdir(instructionsDir)).filter(file => file.endsWith('.xml'));
    foundPath = true;
  } catch (err: any) {}

  // Try alternative paths if the primary path fails
  const altPaths = [
    '/app/ai_instructions',
    path.join(process.cwd(), 'ai_instructions'),
    path.join(process.cwd(), 'app', 'ai_instructions'),
  ];

  for (const altPath of altPaths) {
    try {
      await fsPromises.access(altPath);

      files = (await fsPromises.readdir(altPath)).filter(file => file.endsWith('.xml'));
      instructionsDir = altPath;
      foundPath = true;
      break;
    } catch (altErr) {}
  }

  if (!foundPath) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'DIR_ACCESS_ERROR',
          message: `MBA instructions directory not accessible or not found: ${instructionsDir}. CWD: ${baseDir}. Initial CWD: ${process.cwd()}`,
          details: null,
        },
      },
      { status: 404 }
    );
  }

  if (files.length === 0) {
    return NextResponse.json(
      { success: true, data: { instructions: [] }, error: null },
      { status: 200 }
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
            parsedXml?.MBA?.intro_message ||
            parsedXml?.instruction?.intro_message ||
            parsedXml?.scenario?.intro_message ||
            parsedXml?.document?.intro_message ||
            parsedXml?.root?.intro_message ||
            parsedXml?.mba_case_study?.intro_message;

          if (typeof extractedMessage === 'string' && extractedMessage.trim() !== '') {
            introMessage = extractedMessage.trim();
          } else if (typeof extractedMessage === 'object' && extractedMessage['#text']) {
            introMessage = extractedMessage['#text'].trim();
          }
        } catch (parseError: any) {}

        return {
          name: file,
          path: `/ai_instructions/${file}`, // Client-facing path, assuming MBA files are direct children of ai_instructions
          introMessage,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: { instructions }, error: null },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'FILE_PROCESSING_ERROR',
          message: 'Failed to process MBA instruction files.',
          details: { name: error.name, message: error.message },
        },
      },
      { status: 500 }
    );
  }
}
