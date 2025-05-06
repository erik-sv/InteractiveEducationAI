/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

import { getPSTDateForFilename } from '@/utils/dateUtils';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const type = formData.get('type');
    const streamId = formData.get('streamId');

    if (!audio || !type || !streamId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure audio is a Blob/File with content
    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json({ error: 'Invalid audio data' }, { status: 400 });
    }

    // Create audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), 'audio_recordings');

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Save the audio file
    const timestamp = getPSTDateForFilename();
    const extension = audio.type.split('/')[1] || 'webm';
    const audioFilename = `${streamId}_${type}_${timestamp}.${extension}`;
    const audioPath = path.join(audioDir, audioFilename);

    // Convert Blob to Buffer and save
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Empty audio buffer' }, { status: 400 });
    }

    fs.writeFileSync(audioPath, new Uint8Array(buffer));

    // Call DeepInfra API
    const deepInfraFormData = new FormData();

    deepInfraFormData.append('audio', new Blob([buffer], { type: audio.type }), audioFilename);
    deepInfraFormData.append('task', 'transcribe');
    deepInfraFormData.append('chunk_level', 'word');

    const response = await fetch(process.env.DEEPINFRA_WHISPER_ENDPOINT!, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      body: deepInfraFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`DeepInfra API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Clean up the audio file after successful transcription
    try {
      // Directly delete the file since we're on the server
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (cleanupError) {}

    return NextResponse.json({
      success: true,
      transcription: result.text || '',
      audioPath,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process audio' }, { status: 500 });
  }
}
