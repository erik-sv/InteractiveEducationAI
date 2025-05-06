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

  useEffect(() => {
    // Fetch available instructions
    const fetchInstructions = async () => {
      try {
        const response = await fetch('/api/get-mba-instructions');
        const data = await response.json();

        setInstructions(data.instructions);
        if (data.instructions.length > 0) {
          setSelectedInstruction(data.instructions[0].name);
        }
      } catch (error) {}
    };

    fetchInstructions();
  }, []);

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      if (!selectedInstruction) return;

      try {
        const response = await fetch(`/api/get-mba-knowledge-base?file=${selectedInstruction}`);
        const data = await response.json();

        if (data.knowledgeBase) {
          setKnowledgeBase(data.knowledgeBase);

          // Extract intro message from XML structure
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.knowledgeBase, 'text/xml');
          const introMessageElement = xmlDoc.querySelector('intro_message');

          if (introMessageElement) {
            setIntroMessage(introMessageElement.textContent || '');
          } else {
            setIntroMessage('Welcome to your MBA tutor! Please select a topic to begin.');
          }
        }
      } catch (error) {}
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
            <div className="w-full max-w-xs mx-auto">
              <Select
                label="Select Topic"
                selectedKeys={[selectedInstruction]}
                onChange={e => setSelectedInstruction(e.target.value)}
              >
                {instructions.map(instruction => (
                  <SelectItem key={instruction.name} value={instruction.name}>
                    {instruction.name.replace('.xml', '').replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="w-full bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6">
            <InteractiveAvatar
              defaultAvatarId={selectedAvatar}
              introMessage={introMessage}
              knowledgeBase={knowledgeBase}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
