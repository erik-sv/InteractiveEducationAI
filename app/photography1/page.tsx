'use client';

import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/button';

import InteractiveAvatar from '@/components/InteractiveAvatar';

export default function Photography1() {
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  // const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].avatar_id);
  const [selectedAvatar] = useState('Ann_Therapist_public');
  const [introMessage, setIntroMessage] = useState<string>('');

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      try {
        const response = await fetch('/api/get-photography1-knowledge-base');
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
            setIntroMessage('Welcome! Please wait while we load your personalized experience.');
          }
        }
      } catch (error) {}
    };

    loadKnowledgeBase();
  }, []);

  const handleDonate = () => {
    window.open('https://donate.stripe.com/dR6eXK3mXdF70A83cc', '_blank');
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] w-full mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
              Photography Fundamentals
            </h1>
            <p className="text-xl text-gray-300">
              Master Camera Settings with Interactive Learning
            </p>
            {/* <div className="w-full max-w-xs mx-auto">
              <Select
                className="max-w-xs"
                label="Select Avatar"
                selectedKeys={[selectedAvatar]}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              >
                {AVATARS.map((avatar) => (
                  <SelectItem
                    key={avatar.avatar_id}
                    startContent={
                      <img
                        alt={`${avatar.name} preview`}
                        className="w-8 h-8 rounded-full object-cover"
                        src={`/${avatar.name}_avatar_preview.webp`}
                      />
                    }
                    textValue={avatar.name}
                    value={avatar.avatar_id}
                  >
                    {avatar.name}
                  </SelectItem>
                ))}
              </Select>
            </div> */}
          </div>
          <div className="w-full bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6">
            <InteractiveAvatar
              defaultAvatarId={selectedAvatar}
              introMessage={introMessage}
              knowledgeBase={knowledgeBase}
            />
          </div>
          <div className="flex justify-center pt-4">
            <Button
              className="btn-primary text-lg px-8 py-6 rounded-lg"
              size="lg"
              onClick={handleDonate}
            >
              Donate
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
