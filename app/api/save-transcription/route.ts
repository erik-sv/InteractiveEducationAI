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

    // Format transcriptions, filtering for completed transcriptions only
    const formattedTranscriptions = transcription
      .filter((entry: any) => {
        // For avatar, only include entries with transcription (partial)
        if (entry.type === 'avatar') {
          return entry.transcription != null;
        }
        // For user, only include entries with transcription (completed)
        if (entry.type === 'user') {
          return (
            entry.transcription != null &&
            !entry.content.includes('started speaking') &&
            !entry.content.includes('stopped speaking')
          );
        }

        return false;
      })
      .map((entry: any) => {
        const pstTimestamp = formatPSTTimestamp(entry.timestamp);
        const type = entry.type.toUpperCase();

        // Use transcription for both user and avatar
        const message = entry.transcription || entry.content;

        return `[${pstTimestamp}] ${type}: ${message}`;
      });

    // Write the content
    const filePath = path.join(transcriptionsDir, finalFilename);
    const metadata = `Stream ID: ${streamId}\nTimestamp (PST): ${formatPSTTimestamp(timestamp)}\n\n`;
    const content = metadata + formattedTranscriptions.join('\n\n');

    // Always overwrite with the latest version
    fs.writeFileSync(filePath, content, 'utf8');

    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save transcription' }, { status: 500 });
  }
}
