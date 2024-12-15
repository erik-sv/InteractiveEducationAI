"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import { useEffect, useState } from 'react';
import { Button } from "@nextui-org/react";

export default function App() {
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const avatarId = 'Dexter_Lawyer_Sitting_public';

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      try {
        const response = await fetch('/api/get-knowledge-base');
        const data = await response.json();
        if (data.knowledgeBase) {
          setKnowledgeBase(data.knowledgeBase);
        }
      } catch (error) {
        console.error('Error loading knowledge base:', error);
      }
    };

    loadKnowledgeBase();
  }, []);

  const handleDonate = () => {
    // Add donation link or modal here
    window.open('https://example.com/donate', '_blank');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] w-full mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
              AI Education Platform
            </h1>
            <p className="text-xl text-gray-300">
              Empowering Teachers & Students with Personalized Tutoring
            </p>
          </div>
          <div className="w-full bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6">
            <InteractiveAvatar 
              defaultAvatarId={avatarId}
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
