import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/get-healthcare-knowledge-base?file=FILENAME
 * Returns the contents of a healthcare XML file as knowledgeBase
 * and the corresponding USER_INSTRUCTIONS HTML file content if available.
 * Response format: { success, data: { knowledgeBase, userInstructionsHtml }, error }
 */
export async function GET(req: Request) {
  const url = new URL(req.url!);
  const file = url.searchParams.get("file");

  if (!file || !file.endsWith('.xml')) {
    return NextResponse.json({ success: false, data: null, error: { code: "INVALID_FILE", message: "Valid .xml file parameter is required.", details: null } }, { status: 400 });
  }

  const xmlFilePath = path.join(process.cwd(), "app", "ai_instructions", "healthcare", file);
  const htmlFileName = `USER_INSTRUCTIONS_${file.replace(/\.xml$/i, '.html')}`;
  const htmlFilePath = path.join(process.cwd(), "app", "user_instructions", "healthcare", htmlFileName);

  try {
    // Read the main XML knowledge base file
    const knowledgeBase = fs.readFileSync(xmlFilePath, "utf8");

    // Try to read the corresponding user instructions HTML file
    let userInstructionsHtml: string | null = null;
    if (fs.existsSync(htmlFilePath)) {
      try {
        userInstructionsHtml = fs.readFileSync(htmlFilePath, "utf8");
      } catch (htmlErr) {
        console.warn(`Could not read user instructions file ${htmlFileName}:`, htmlErr);
        // Proceed without HTML instructions if reading fails
      }
    }

    // Return both knowledge base and user instructions HTML
    return NextResponse.json({ success: true, data: { knowledgeBase, userInstructionsHtml }, error: null }, { status: 200 });

  } catch (err: any) {
    // Handle error for the main XML file
    if (err.code === 'ENOENT') {
       return NextResponse.json({ success: false, data: null, error: { code: "FILE_NOT_FOUND", message: `Knowledge base file not found: ${file}`, details: err } }, { status: 404 });
    }
    // Handle other potential errors
    console.error(`Error processing request for ${file}:`, err);
    return NextResponse.json({ success: false, data: null, error: { code: "INTERNAL_ERROR", message: `An error occurred while retrieving file: ${file}`, details: err.message || 'Unknown error' } }, { status: 500 });
  }
}
