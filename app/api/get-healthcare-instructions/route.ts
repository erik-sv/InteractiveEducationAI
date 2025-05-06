import path from 'path';
import fs from 'fs/promises';

import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// Helper to safely extract text, including from CDATA sections
const getText = (node: any): string => {
  if (typeof node === 'string') return node.trim();
  if (node && typeof node === 'object' && node['#text']) return String(node['#text']).trim();
  if (node && typeof node === 'object' && node.__cdata) return String(node.__cdata).trim();

  return '';
};

export async function GET() {
  // Determine base directory
  let baseDir = process.cwd();
  const isDocker =
    process.env.DOCKER === 'true' ||
    fs
      .access('/app')
      .then(() => true)
      .catch(() => false);

  // In Docker, the files are copied to /app directly, not in /app/app
  if (isDocker || baseDir.endsWith('/app') || baseDir.endsWith('\\app')) {
    baseDir = '/app';
  } else {
    // Check if we're in a subdirectory structure
    try {
      const appDirExists = await fs
        .access(path.join(baseDir, 'app'))
        .then(() => true)
        .catch(() => false);

      if (appDirExists) {
      }
    } catch (err) {}
  }

  const instructionsDir = path.join(baseDir, 'ai_instructions', 'healthcare');

  try {
    // First, check if the directory exists
    try {
      await fs.access(instructionsDir);
    } catch (accessErr) {
      // Try alternative paths if the directory doesn't exist
      const altPaths = [
        '/app/ai_instructions/healthcare',
        path.join(process.cwd(), 'ai_instructions', 'healthcare'),
        path.join(process.cwd(), 'app', 'ai_instructions', 'healthcare'),
      ];

      let foundPath = null;

      for (const altPath of altPaths) {
        try {
          await fs.access(altPath);
          foundPath = altPath;
          break;
        } catch (e) {}
      }

      if (foundPath) {
        return processInstructionsDirectory(foundPath);
      }

      return NextResponse.json({
        success: false,
        data: null,
        error: {
          code: 'DIR_NOT_FOUND',
          message: `Healthcare instructions directory not found at ${instructionsDir}. CWD: ${baseDir}. Initial CWD: ${process.cwd()}`,
          details: {
            errno: (accessErr as NodeJS.ErrnoException).errno,
            syscall: (accessErr as NodeJS.ErrnoException).syscall,
            path: instructionsDir,
          },
        },
      });
    }

    return processInstructionsDirectory(instructionsDir);
  } catch (err) {
    return NextResponse.json({
      success: false,
      data: null,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to read instructions directory',
        details: err instanceof Error ? { message: err.message } : null,
      },
    });
  }
}

async function processInstructionsDirectory(instructionsDir: string) {
  try {
    const files = await fs.readdir(instructionsDir);

    const xmlFiles = files.filter(file => file.endsWith('.xml'));

    const instructions = await Promise.all(
      xmlFiles.map(async file => {
        try {
          const filePath = path.join(instructionsDir, file);
          const content = await fs.readFile(filePath, 'utf8');

          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            textNodeName: '#text',
            cdataPropName: '__cdata',
            trimValues: true,
          });

          const result = parser.parse(content);

          // Extract introduction from the XML
          let intro = '';

          if (
            result.HEALTHCARE_INSTRUCTION_SET &&
            result.HEALTHCARE_INSTRUCTION_SET.OVERVIEW &&
            result.HEALTHCARE_INSTRUCTION_SET.OVERVIEW.INTRODUCTION
          ) {
            intro = getText(result.HEALTHCARE_INSTRUCTION_SET.OVERVIEW.INTRODUCTION);
          }

          return {
            fileName: file,
            introduction: intro,
          };
        } catch (parseError) {
          return {
            fileName: file,
            introduction: 'Failed to parse introduction',
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        instructions,
      },
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      data: null,
      error: {
        code: 'PROCESSING_ERROR',
        message: 'Failed to process instructions',
        details: err instanceof Error ? { message: err.message } : null,
      },
    });
  }
}
