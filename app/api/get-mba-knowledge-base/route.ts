import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file specified" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "app/ai_instructions", file);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const knowledgeBase = fs.readFileSync(filePath, "utf-8");

    return NextResponse.json({ knowledgeBase });
  } catch (error) {
    console.error("Error reading knowledge base:", error);
    return NextResponse.json(
      { error: "Failed to read knowledge base" },
      { status: 500 }
    );
  }
}
