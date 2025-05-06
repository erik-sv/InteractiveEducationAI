import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

import { getPSTDateForFilename } from "@/utils/dateUtils";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");
    const type = formData.get("type");
    const streamId = formData.get("streamId");

    if (!audio || !type || !streamId) {
      console.error("Missing required fields:", {
        audio: !!audio,
        type,
        streamId,
      });

      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Ensure audio is a Blob/File with content
    if (!(audio instanceof Blob) || audio.size === 0) {
      console.error("Invalid audio data:", {
        isBlob: audio instanceof Blob,
        size: audio instanceof Blob ? audio.size : "N/A",
        type: audio instanceof Blob ? audio.type : typeof audio,
      });

      return NextResponse.json(
        { error: "Invalid audio data" },
        { status: 400 },
      );
    }

    // Create audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), "audio_recordings");

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Save the audio file
    const timestamp = getPSTDateForFilename();
    const extension = audio.type.split("/")[1] || "webm";
    const audioFilename = `${streamId}_${type}_${timestamp}.${extension}`;
    const audioPath = path.join(audioDir, audioFilename);

    // Convert Blob to Buffer and save
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      console.error("Empty audio buffer");

      return NextResponse.json(
        { error: "Empty audio buffer" },
        { status: 400 },
      );
    }

    fs.writeFileSync(audioPath, new Uint8Array(buffer));
    console.log("Saved audio file:", {
      path: audioPath,
      size: buffer.length,
      type: audio.type,
    });

    // Call DeepInfra API
    const deepInfraFormData = new FormData();

    deepInfraFormData.append(
      "audio",
      new Blob([buffer], { type: audio.type }),
      audioFilename,
    );
    deepInfraFormData.append("task", "transcribe");
    deepInfraFormData.append("chunk_level", "word");

    console.log("Calling DeepInfra API with:", {
      filename: audioFilename,
      filesize: buffer.length,
      mimetype: audio.type,
    });

    const response = await fetch(process.env.DEEPINFRA_WHISPER_ENDPOINT!, {
      method: "POST",
      headers: {
        Authorization: `bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      body: deepInfraFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("DeepInfra API error:", errorText);
      throw new Error(`DeepInfra API error: ${response.statusText}`);
    }

    const result = await response.json();

    console.log("DeepInfra API response:", result);

    // Clean up the audio file after successful transcription
    try {
      // Directly delete the file since we're on the server
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        console.log(`Successfully deleted audio file: ${audioPath}`);
      } else {
        console.log(`Audio file not found: ${audioPath}`);
      }
    } catch (cleanupError) {
      console.error("Error during audio cleanup:", cleanupError);
    }

    return NextResponse.json({
      success: true,
      transcription: result.text || "",
      audioPath,
    });
  } catch (error) {
    console.error("Error processing audio:", error);

    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 },
    );
  }
}
