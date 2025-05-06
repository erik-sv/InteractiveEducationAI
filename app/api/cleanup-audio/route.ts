import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { audioFilePath } = await request.json();

    if (!audioFilePath) {
      return NextResponse.json(
        { success: false, error: 'No audio file path provided' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), audioFilePath);

    // Check if file exists before attempting to delete
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Audio file not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to clean up audio file' },
      { status: 500 }
    );
  }
}
