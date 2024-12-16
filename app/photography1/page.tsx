"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import { AVATARS } from "@/app/lib/constants";
import { useEffect, useState } from 'react';
import { Button, Select, SelectItem } from "@nextui-org/react";

export default function Photography1() {
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].avatar_id);

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      try {
        const response = await fetch('/api/get-photography1-knowledge-base');
        const data = await response.json();
        if (data.knowledgeBase) {
          setKnowledgeBase(data.knowledgeBase);
        }
      } catch (error) {
        console.error('Error loading photography knowledge base:', error);
      }
    };

    loadKnowledgeBase();
  }, []);

  const handleDonate = () => {
    window.open('https://example.com/donate', '_blank');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] w-full mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
              Photography Fundamentals
            </h1>
            <p className="text-xl text-gray-300">
              Master Camera Settings with Interactive Learning
            </p>
            <div className="w-full max-w-xs mx-auto">
              <Select
                label="Select Avatar"
                selectedKeys={[selectedAvatar]}
                onChange={(e) => setSelectedAvatar(e.target.value)}
                className="max-w-xs"
              >
                {AVATARS.map((avatar) => (
                  <SelectItem
                    key={avatar.avatar_id}
                    value={avatar.avatar_id}
                    textValue={avatar.name}
                    startContent={
                      <img
                        src={`/${avatar.name}_avatar_preview.webp`}
                        alt={`${avatar.name} preview`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    }
                  >
                    {avatar.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="w-full bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6">
            <InteractiveAvatar 
              defaultAvatarId={selectedAvatar}
              knowledgeBase={knowledgeBase}
            />
          </div>
          <div className="flex justify-center pt-4">
            <Button
              className="btn-primary text-lg px-8 py-6 rounded-lg"
              size="lg"
              onClick={handleDonate}
            >
              Donate Now
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}