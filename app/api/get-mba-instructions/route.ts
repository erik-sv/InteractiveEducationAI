import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const instructionsDir = path.join(process.cwd(), 'app', 'ai_instructions');
    let instructions: { name: string; path: string }[] = [];

    try {
      if (!fs.existsSync(instructionsDir)) {
        // logger.error({ event: 'dir_not_found', instructionsDir });
        fs.mkdirSync(instructionsDir, { recursive: true });
      }

      instructions = fs
        .readdirSync(instructionsDir)
        .filter(file => file.endsWith('.xml'))
        .map(file => ({
          name: file,
          path: path.join(instructionsDir, file),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json({ instructions });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to read instructions' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read instructions' }, { status: 500 });
  }
}
