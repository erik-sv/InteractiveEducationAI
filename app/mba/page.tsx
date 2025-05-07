'use client';

import { useEffect, useState } from 'react';
import { Select, SelectItem } from '@nextui-org/react';

import InteractiveAvatar from '@/components/InteractiveAvatar';

interface InstructionFile {
  name: string;
  path: string;
}

export default function MBAPage() {
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const [selectedAvatar] = useState('Dexter_Lawyer_Sitting_public');
  const [introMessage, setIntroMessage] = useState<string>('');
  const [selectedInstruction, setSelectedInstruction] = useState<string>('');
  const [instructions, setInstructions] = useState<InstructionFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch available instructions
    const fetchInstructions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/get-mba-instructions');
        const data = await response.json();

        if (data.success && data.data && Array.isArray(data.data.instructions)) {
          setInstructions(data.data.instructions);
          if (data.data.instructions.length > 0) {
            setSelectedInstruction(data.data.instructions[0].name);
          }
        } else {
          setError('Failed to load MBA topics. Please try again later.');
          setInstructions([]);
        }
      } catch (error) {
        setError('Failed to load MBA topics. Please try again later.');
        setInstructions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, []);

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      if (!selectedInstruction) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/get-mba-knowledge-base?fileName=${selectedInstruction}`);
        const data = await response.json();

        if (data.success && data.data && data.data.knowledgeBaseXml && data.data.parsedContent) {
          // The API returns XML content in data.data.content
          const rawXmlForHeyGen = data.data.knowledgeBaseXml;

          setKnowledgeBase(rawXmlForHeyGen);

          // Extract intro message from the content structure
          try {
            const introMsg =
              data.data.parsedContent.MBA?.intro_message ||
              'Welcome to your MBA tutor! Please select a topic to begin.';

            setIntroMessage(introMsg);
          } catch (error) {
            setError(
              'Error extracting intro message: ' +
                (error instanceof Error ? error.message : String(error))
            );
            setIntroMessage('Welcome to your MBA tutor! Please select a topic to begin.');
          }
        } else {
          setError(
            'Failed to load knowledge base: ' +
              (data.error?.message || data.error || 'Unknown error')
          );
        }
      } catch (error) {
        setError('Error loading MBA content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeBase();
  }, [selectedInstruction]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] w-full mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">MBA Tutor</h1>
            <p className="text-xl text-gray-300">Your Personal MBA Course Assistant</p>

            {error && <div className="p-4 bg-red-900/50 text-white rounded-md">{error}</div>}

            {loading ? (
              <div className="w-full max-w-xs mx-auto p-4">Loading MBA topics...</div>
            ) : (
              <div className="w-full max-w-xs mx-auto">
                <Select
                  isDisabled={instructions.length === 0}
                  label="Select Topic"
                  selectedKeys={[selectedInstruction]}
                  onChange={e => setSelectedInstruction(e.target.value)}
                >
                  {instructions && instructions.length > 0 ? (
                    instructions.map(instruction => (
                      <SelectItem key={instruction.name} value={instruction.name}>
                        {instruction.name.replace('.xml', '').replace(/_/g, ' ')}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-topics" value="no-topics">
                      No topics available
                    </SelectItem>
                  )}
                </Select>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-lg">Loading MBA content...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-lg text-red-400">{error}</p>
                <p className="mt-2">Please try selecting a different topic or refresh the page.</p>
              </div>
            ) : (
              <InteractiveAvatar
                defaultAvatarId={selectedAvatar}
                introMessage={introMessage}
                knowledgeBase={knowledgeBase}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
