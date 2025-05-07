/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';
import { promises as fsPromises } from 'fs';

import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

/**
 * GET /api/get-healthcare-knowledge-base
 * Retrieves content and user instructions for a specific healthcare knowledge base XML file.
 * Query param: `fileName` (e.g., 'some-healthcare-document.xml')
 * Response format: { success, data, error }
 */
export async function GET(request: Request) {
  const apiRouteName = 'get-healthcare-knowledge-base';

  // Get the filename from the URL
  const url = new URL(request.url);
  const fileName = url.searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'MISSING_FILENAME',
          message: 'No filename provided',
          details: null,
        },
      },
      { status: 400 }
    );
  }

  // Determine base directory
  let baseDir = process.cwd();
  const isDocker =
    process.env.DOCKER === 'true' ||
    (await fsPromises
      .access('/app')
      .then(() => true)
      .catch(() => false));

  if (isDocker || baseDir.endsWith('/app') || baseDir.endsWith('\\app')) {
    baseDir = '/app';
  } else {
    // Check if we're in a subdirectory structure
    try {
      const appDirExists = await fsPromises
        .access(path.join(baseDir, 'app'))
        .then(() => true)
        .catch(() => false);

      if (appDirExists) {
      }
    } catch (err) {}
  }

  // Healthcare knowledge base files are in 'ai_instructions/healthcare'
  let filePath = path.join(baseDir, 'ai_instructions', 'healthcare', fileName);

  try {
    const healthcareDir = path.join(baseDir, 'ai_instructions', 'healthcare');

    try {
      await fsPromises.access(healthcareDir);

      const files = await fsPromises.readdir(healthcareDir);

      // Check if the requested file exists in any form (case-insensitive)
      const fileExists = files.some(
        file =>
          file.toLowerCase() === fileName.toLowerCase() ||
          file.replace(/\s+/g, '') === fileName.replace(/\s+/g, '')
      );

      // If file doesn't exist exactly as requested but exists with different casing/spacing
      if (!fileExists) {
        // Try to find a close match with more flexible comparison
        const closestMatch = files.find(file => {
          // Try different matching strategies
          // 1. Case-insensitive match
          if (file.toLowerCase() === fileName.toLowerCase()) return true;

          // 2. Ignore spaces
          if (file.replace(/\s+/g, '') === fileName.replace(/\s+/g, '')) return true;

          // 3. Normalize spaces around dashes
          const normalizedFile = file.replace(/\s*-\s*/g, '-');
          const normalizedFileName = fileName.replace(/\s*-\s*/g, '-');

          if (normalizedFile === normalizedFileName) return true;

          // 4. Check if the file contains the core part of the requested filename
          // This is useful for files like "memory_care_example_ - _Eleanor_Vance.xml"
          const fileCore = file.toLowerCase().replace(/[^a-z0-9]/g, '');
          const fileNameCore = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');

          if (fileCore.includes(fileNameCore) || fileNameCore.includes(fileCore)) return true;

          return false;
        });

        if (closestMatch) {
          // Use the actual filename from the directory
          filePath = path.join(baseDir, 'ai_instructions', 'healthcare', closestMatch);
        } else {
          // Try alternative paths if the file doesn't exist
          const altPaths = [
            '/app/ai_instructions/healthcare',
            path.join(process.cwd(), 'ai_instructions', 'healthcare'),
            path.join(process.cwd(), 'app', 'ai_instructions', 'healthcare'),
          ];

          let foundPath = null;

          for (const altPath of altPaths) {
            try {
              await fsPromises.access(altPath);
              const altFiles = await fsPromises.readdir(altPath);
              const altMatch = altFiles.find(file => {
                if (file.toLowerCase() === fileName.toLowerCase()) return true;
                if (file.replace(/\s+/g, '') === fileName.replace(/\s+/g, '')) return true;

                return false;
              });

              if (altMatch) {
                filePath = path.join(altPath, altMatch);
                foundPath = altPath;
                break;
              }
            } catch (e) {}
          }

          if (!foundPath) {
            return NextResponse.json(
              {
                success: false,
                data: null,
                error: {
                  code: 'FILE_NOT_FOUND',
                  message: `File not found: ${fileName}. Checked in ${healthcareDir} and alternative paths.`,
                  details: { searchedPaths: [healthcareDir, ...altPaths] },
                },
              },
              { status: 404 }
            );
          }
        }
      }
    } catch (dirError) {
      // Try alternative paths if the directory doesn't exist
      const altPaths = [
        '/app/ai_instructions/healthcare',
        path.join(process.cwd(), 'ai_instructions', 'healthcare'),
        path.join(process.cwd(), 'app', 'ai_instructions', 'healthcare'),
      ];

      let foundPath = null;

      for (const altPath of altPaths) {
        try {
          await fsPromises.access(altPath);
          foundPath = altPath;

          // Try to find the file in this alternative path
          const altFiles = await fsPromises.readdir(altPath);
          const altMatch = altFiles.find(file => {
            if (file.toLowerCase() === fileName.toLowerCase()) return true;
            if (file.replace(/\s+/g, '') === fileName.replace(/\s+/g, '')) return true;

            return false;
          });

          if (altMatch) {
            filePath = path.join(altPath, altMatch);
            break;
          }
        } catch (e) {}
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'FILE_ACCESS_ERROR',
          message: `Error accessing or reading file: ${filePath}`,
          details: error instanceof Error ? { message: error.message } : null,
        },
      },
      { status: 500 }
    );
  }

  // Dynamically construct user instructions path for healthcare
  const baseXmlName = path.basename(fileName, path.extname(fileName)); // Extracts 'filename' from 'filename.xml'
  const userInstructionHtmlFile = `USER_INSTRUCTIONS_${baseXmlName}.html`;
  const userInstructionsPath = path.join(
    baseDir,
    'user_instructions',
    'healthcare',
    userInstructionHtmlFile
  );

  try {
    // Check file existence first
    await fsPromises.access(filePath);

    const xmlContent = await fsPromises.readFile(filePath, 'utf8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
    });
    const jsonData = parser.parse(xmlContent);

    let userInstructionsContent = 'User instructions not available for this item.'; // Default message

    try {
      await fsPromises.access(userInstructionsPath);
      userInstructionsContent = await fsPromises.readFile(userInstructionsPath, 'utf8');
    } catch (userInstrError) {
      // Try alternative paths for user instructions
      const userInstrAltPaths = [
        path.join('/app', 'user_instructions', 'healthcare', userInstructionHtmlFile),
        path.join(process.cwd(), 'user_instructions', 'healthcare', userInstructionHtmlFile),
        path.join(process.cwd(), 'app', 'user_instructions', 'healthcare', userInstructionHtmlFile),
      ];

      for (const altPath of userInstrAltPaths) {
        try {
          await fsPromises.access(altPath);
          userInstructionsContent = await fsPromises.readFile(altPath, 'utf8');
          break;
        } catch (e) {}
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        parsedContent: jsonData,
        knowledgeBaseXml: xmlContent,
        userInstructions: userInstructionsContent,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'FILE_ACCESS_ERROR',
          message: `Error accessing or reading file: ${filePath}`,
          details: error instanceof Error ? { message: error.message } : null,
        },
      },
      { status: 500 }
    );
  }
}
