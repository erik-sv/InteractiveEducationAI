import type { Voice } from './page';

import React, { useState } from 'react';

/**
 * VoiceCard component displays a single voice option with dynamic audio playback support.
 * Audio is only loaded when the user presses play.
 * Supports both .mp3 and .wav preview audio files.
 * @param cardKey - Unique key for the card
 * @param voice - Voice data
 */
interface VoiceCardProps {
  cardKey: string;
  voice: Voice;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ cardKey, voice }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioUrl = voice.preview_audio;
  const isSupportedAudio =
    typeof audioUrl === 'string' && (audioUrl.endsWith('.mp3') || audioUrl.endsWith('.wav'));

  // Handler for play button
  const handlePlay = () => setIsPlaying(true);
  // Handler for stop/pause
  const handleStop = () => setIsPlaying(false);

  // Handler for copy button
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voice.voice_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback if clipboard fails
      setCopied(false);
    }
  };

  return (
    <div
      key={cardKey}
      aria-label={`Voice card for ${voice.name}`}
      className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700 flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="font-semibold text-lg mb-2 text-center">{voice.name}</div>
      <div className="text-sm text-gray-400 mb-1">Language: {voice.language}</div>
      <div className="text-sm text-gray-400 mb-1">Gender: {voice.gender}</div>
      <div className="text-sm text-gray-400 mb-1">
        Emotion Support: {voice.emotion_support ? 'Yes' : 'No'}
      </div>
      <div className="text-sm text-gray-400 mb-1">
        Streaming: {voice.support_interactive_avatar ? 'Yes' : 'No'}
      </div>
      <div className="text-sm text-gray-400 mb-2">
        Pause Support: {voice.support_pause ? 'Yes' : 'No'}
      </div>
      <div className="flex flex-row gap-2 items-center mb-2">
        <span className="text-xs text-gray-500 select-all" title="Voice ID">
          ID: {voice.voice_id}
        </span>
        <button
          key={cardKey}
          aria-label={copied ? 'Voice ID copied' : 'Copy voice ID'}
          className={`ml-2 px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${copied ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white'}`}
          tabIndex={0}
          type="button"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy Voice ID'}
        </button>
      </div>
      {isSupportedAudio ? (
        <div className="w-full mt-2 flex flex-col items-center">
          {!isPlaying ? (
            <button
              key={cardKey}
              aria-label={`Play preview audio for ${voice.name}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              tabIndex={0}
              type="button"
              onClick={handlePlay}
            >
              ▶ Play
            </button>
          ) : (
            <audio
              autoPlay
              controls
              aria-label={`Preview audio for ${voice.name}`}
              className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              src={audioUrl}
              tabIndex={0}
              onEnded={handleStop}
              onPause={handleStop}
            >
              <track kind="captions" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      ) : (
        <div className="text-red-400 text-xs mt-2" role="alert">
          No preview audio available.
        </div>
      )}
    </div>
  );
};

export default VoiceCard;
