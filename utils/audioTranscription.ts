import fs from 'fs';
import path from 'path';

export async function transcribeAudioBlob(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();

    formData.append('audio', audioBlob);
    formData.append('task', 'transcribe');
    formData.append('chunk_level', 'word');

    const response = await fetch(process.env.DEEPINFRA_WHISPER_ENDPOINT!, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();

    return result.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

export function saveAudioBlob(blob: Blob, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const buffer = Buffer.from(reader.result as ArrayBuffer);
        const audioDir = path.join(process.cwd(), 'audio_recordings');

        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }

        const filepath = path.join(audioDir, filename);

        fs.writeFileSync(filepath, new Uint8Array(buffer));
        resolve(filepath);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
