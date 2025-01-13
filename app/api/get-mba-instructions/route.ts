import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const instructionsDir = path.join(process.cwd(), "app/ai_instructions");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(instructionsDir)) {
      fs.mkdirSync(instructionsDir, { recursive: true });
    }

    const files = fs.readdirSync(instructionsDir)
      .filter(file => file.endsWith('.xml'))
      .map(file => ({
        name: file,
        path: path.join(instructionsDir, file)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ instructions: files });
  } catch (error) {
    console.error("Error reading instructions directory:", error);
    return NextResponse.json({ error: "Failed to read instructions" }, { status: 500 });
  }
}
