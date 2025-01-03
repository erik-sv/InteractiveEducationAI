// In /api/save-transcription (Node side), example changes to respect the `filename` if provided:
import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

import { formatPSTTimestamp } from '@/utils/dateUtils';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { streamId, transcription, timestamp, filename } = data;

    // Construct a final filename
    const finalFilename = filename || `${streamId}.txt`;

    // Ensure directory exists
    const transcriptionsDir = path.join(process.cwd(), 'transcriptions');

    if (!fs.existsSync(transcriptionsDir)) {
      fs.mkdirSync(transcriptionsDir, { recursive: true });
    }

    // Format text
    const formattedTranscription = transcription
      .map((entry: any) => {
        const pstTimestamp = formatPSTTimestamp(entry.timestamp);

        return `[${pstTimestamp}] ${entry.type.toUpperCase()}: ${entry.content}${
          entry.transcription ? '\nTranscription: ' + entry.transcription : ''
        }`;
      })
      .join('\n\n');

    // Write or append
    const filePath = path.join(transcriptionsDir, finalFilename);
    const metadata = `Stream ID: ${streamId}\nTimestamp (PST): ${formatPSTTimestamp(timestamp)}\n\n`;

    let newContent;

    if (fs.existsSync(filePath)) {
      // Read existing content and split into lines
      const existingContent = fs.readFileSync(filePath, 'utf8');
      const existingLines = new Set(existingContent.split('\n\n').filter(Boolean));
      const newLines = formattedTranscription.split('\n\n').filter(Boolean);

      // Only add lines that don't already exist
      const uniqueNewLines = newLines.filter((line: string) => !existingLines.has(line));

      if (uniqueNewLines.length > 0) {
        newContent = existingContent + '\n\n' + uniqueNewLines.join('\n\n');
      } else {
        newContent = existingContent;
      }
    } else {
      newContent = metadata + formattedTranscription;
    }

    fs.writeFileSync(filePath, newContent, 'utf8');

    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    console.error('Error saving transcription:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to save transcription' },
      { status: 500 }
    );
  }
}
