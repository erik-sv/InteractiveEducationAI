'use client';

import { useEffect, useState } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { Spinner } from '@nextui-org/react';

import InteractiveAvatar from '@/components/InteractiveAvatar';

interface InstructionFile {
  name: string;
  path: string;
  introMessage: string;
}

export default function HealthcarePage() {
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const [userInstructionsHtml, setUserInstructionsHtml] = useState<string | null>(null);
  const [selectedAvatar] = useState('Katya_Chair_Sitting_public');
  const [introMessage, setIntroMessage] = useState<string>('');
  const [selectedInstruction, setSelectedInstruction] = useState<string>('');
  const [instructions, setInstructions] = useState<InstructionFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioTitle, setScenarioTitle] = useState<string>('');

  useEffect(() => {
    // Fetch available healthcare instructions
    const fetchInstructions = async () => {
      try {
        const response = await fetch('/api/get-healthcare-instructions');
        const data = await response.json();

        setInstructions(data.data.instructions);
        if (data.data.instructions.length > 0) {
          setSelectedInstruction(data.data.instructions[0].name);
        }
      } catch (error) {
        setError('Error loading instructions');
      }
    };

    fetchInstructions();
  }, []);

  useEffect(() => {
    if (selectedInstruction && instructions.length > 0) {
      const currentInstruction = instructions.find(inst => inst.name === selectedInstruction);

      if (currentInstruction) {
        setIntroMessage(currentInstruction.introMessage);
      }
    }
  }, [selectedInstruction, instructions]);

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      if (!selectedInstruction) return;
      setKnowledgeBase(''); // Clear previous knowledge base
      setUserInstructionsHtml(null); // Clear previous instructions
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/get-healthcare-knowledge-base?file=${selectedInstruction}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
          setKnowledgeBase(result.data.knowledgeBase || '');
          if (result.data.userInstructionsHtml) {
            const { title, sanitizedHtml } = extractTitleAndSanitizeHtml(
              result.data.userInstructionsHtml
            );

            setScenarioTitle(title);
            setUserInstructionsHtml(sanitizedHtml);
          } else {
            setScenarioTitle('');
            setUserInstructionsHtml(null);
          }
        } else {
          throw new Error(result.error?.message || 'Failed to load knowledge base');
        }
      } catch (err: any) {
        setError(err.message);
        setKnowledgeBase('');
        setUserInstructionsHtml(null); // Clear instructions on error
        setScenarioTitle('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeBase();
  }, [selectedInstruction]);

  // Utility to format file names into user-friendly names
  function formatInstructionName(name: string) {
    return name
      .replace(/_/g, ' ')
      .replace(/\.xml$/, '')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // Utility to extract scenario title and sanitize/transform HTML for dark mode
  function extractTitleAndSanitizeHtml(html: string): { title: string; sanitizedHtml: string } {
    // Remove <style>, <meta>, and <title> tags
    let sanitized = html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<meta[\s\S]*?>/gi, '')
      .replace(/<title[\s\S]*?<\/title>/gi, '');
    // Extract first <h2> as scenario title
    let title = '';

    sanitized = sanitized.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/i, (match, p1) => {
      title = p1;

      return '';
    });
    // Replace .guidance and .examples classes with Tailwind classes
    sanitized = sanitized
      .replace(
        /class=["']guidance["']/g,
        'class="bg-blue-900/60 border-l-4 border-blue-400 p-4 my-4 rounded"'
      )
      .replace(
        /class=["']examples["']/g,
        'class="bg-green-900/60 border-l-4 border-green-400 p-4 my-4 rounded"'
      );
    // Remove inline background-color and color styles
    sanitized = sanitized
      .replace(/background-color:[^;"']*;?/gi, '')
      .replace(/color:[^;"']*;?/gi, '');

    return { title, sanitizedHtml: sanitized };
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] w-full mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Healthcare Assistant</h1>
            <p className="text-xl text-gray-300">Your Personal Healthcare Assistant</p>
            <div className="w-full max-w-xs mx-auto">
              <Select
                label="Select Example"
                selectedKeys={[selectedInstruction]}
                onChange={e => setSelectedInstruction(e.target.value)}
              >
                {instructions.map(instruction => (
                  <SelectItem key={instruction.name} value={instruction.name}>
                    {formatInstructionName(instruction.name)}
                  </SelectItem>
                ))}
              </Select>
            </div>
            {/* Scenario Title */}
            {scenarioTitle && (
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-300 text-center mb-6">
                {scenarioTitle}
              </h2>
            )}
          </div>
          <div className="w-full bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6">
            {error && <p className="text-red-500 text-center">Error: {error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Instructions Panel (New) */}
              {userInstructionsHtml && (
                <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-blue-700 max-h-[600px] overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{ __html: userInstructionsHtml }}
                    className="prose prose-invert prose-h1:text-blue-300 prose-h2:text-blue-200 prose-h3:text-blue-200 prose-h4:text-blue-200 prose-p:text-gray-100 prose-blockquote:text-gray-100 prose-strong:text-white prose-li:text-gray-100 prose-a:text-blue-400 prose-code:text-gray-100 prose-pre:bg-gray-900 prose-table:text-gray-100 prose-th:text-white prose-thead:text-white prose-tr:text-gray-100"
                  />
                </div>
              )}
              {!userInstructionsHtml && isLoading && (
                <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 flex justify-center items-center min-h-[200px]">
                  <Spinner color="primary" label="Loading Instructions..." />
                </div>
              )}
              {!userInstructionsHtml && !isLoading && selectedInstruction && (
                <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 flex justify-center items-center min-h-[200px]">
                  <p className="text-gray-400">No specific instructions found for this scenario.</p>
                </div>
              )}

              {/* Interactive Avatar */}
              <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                {selectedInstruction && knowledgeBase ? (
                  <InteractiveAvatar
                    defaultAvatarId={selectedAvatar} // Correct prop name
                    introMessage={introMessage}
                    knowledgeBase={knowledgeBase}
                    voiceId="7194df66c861492fb6cc379e99905e22" // Specific voice for healthcare
                  />
                ) : (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <p className="text-gray-400">Please select a scenario to begin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
