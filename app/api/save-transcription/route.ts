import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { formatPSTTimestamp } from '@/utils/dateUtils';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { streamId, transcription, timestamp } = data;

    // Create transcriptions directory if it doesn't exist
    const transcriptionsDir = path.join(process.cwd(), 'transcriptions');
    if (!fs.existsSync(transcriptionsDir)) {
      fs.mkdirSync(transcriptionsDir, { recursive: true });
    }

    // Format the transcription into a readable format
    const formattedTranscription = transcription.map((entry: any) => {
      const pstTimestamp = formatPSTTimestamp(entry.timestamp);
      return `[${pstTimestamp}] ${entry.type.toUpperCase()}: ${entry.content}${
        entry.transcription ? '\nTranscription: ' + entry.transcription : ''
      }`;
    }).join('\n\n');

    // Create filename with stream ID
    const filename = `${streamId}.txt`;
    const filePath = path.join(transcriptionsDir, filename);

    // Add session metadata at the beginning
    const metadata = `Stream ID: ${streamId}\nTimestamp (PST): ${formatPSTTimestamp(timestamp)}\n\n`;
    
    // If file exists, append to it, otherwise create new
    const fullContent = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, 'utf8') + '\n' + formattedTranscription
      : metadata + formattedTranscription;

    fs.writeFileSync(filePath, fullContent, 'utf8');

    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    console.error('Error saving transcription:', error);
    return NextResponse.json({ success: false, error: 'Failed to save transcription' }, { status: 500 });
  }
}
