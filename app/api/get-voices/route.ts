import path from 'path';
import fs from 'fs';
import { Console } from 'console';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Voice type structure matching the voice data JSON.
 */
interface Voice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio: string;
  support_pause: boolean;
  emotion_support: boolean;
  support_interactive_avatar: boolean;
  support_locale: boolean;
}

/**
 * GET handler for /api/get-voices
 * Returns a flat, structured response: { success, data: { voices: [...] }, error }
 */
export async function GET(_req: NextRequest) {
  // Use rich-style structured logging
  const log = new Console({ stdout: process.stdout, stderr: process.stderr });

  try {
    const filePath = path.resolve(process.cwd(), 'docs', 'heygen-voices.json');

    if (!fs.existsSync(filePath)) {
      log.error(
        JSON.stringify({
          level: 'ERROR',
          code: 'FILE_NOT_FOUND',
          msg: 'Voice data file not found',
          filePath,
        })
      );

      return NextResponse.json(
        {
          success: false,
          data: { voices: [] },
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'Voice data file not found.',
          },
        },
        { status: 404 }
      );
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const voices: Voice[] = JSON.parse(fileContent);

    log.log(JSON.stringify({ level: 'INFO', code: 'VOICES_LOADED', count: voices.length }));

    return NextResponse.json(
      {
        success: true,
        data: { voices },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    let errorMessage = 'An unexpected error occurred.';
    let code = 'INTERNAL_SERVER_ERROR';

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error instanceof SyntaxError) {
      errorMessage = 'Error parsing JSON data from the voice file.';
      code = 'JSON_PARSE_ERROR';
    }
    log.error(JSON.stringify({ level: 'ERROR', code, msg: errorMessage }));

    return NextResponse.json(
      {
        success: false,
        data: { voices: [] },
        error: {
          code,
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
