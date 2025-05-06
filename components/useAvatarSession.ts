/* eslint-disable @typescript-eslint/no-unused-vars */
import StreamingAvatar, { VoiceEmotion } from '@heygen/streaming-avatar';
import { useCallback, useRef, useState } from 'react';

/**
 * Custom React hook for managing avatar session state, events, and audio logic.
 * Encapsulates session lifecycle, event handlers, mic/audio state, and transcript buffer.
 *
 * Returns all state and handlers needed by InteractiveAvatar.
 */
export interface UseAvatarSessionProps {
  avatar: React.MutableRefObject<StreamingAvatar | null>;
  initialLanguage: string;
  initialVoice: string;
  onTranscription: (entry: any) => void;
}

export function useAvatarSession({
  avatar,
  initialLanguage,
  initialVoice,
  onTranscription,
}: UseAvatarSessionProps) {
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [avatarId, setAvatarId] = useState(initialVoice);
  const [emotion, setEmotion] = useState<VoiceEmotion | null>(null);

  // Audio and transcript refs
  const userMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const userAudioChunksRef = useRef<Blob[]>([]);
  const transcriptionRef = useRef<any[]>([]);

  // Session controls
  const startSession = useCallback(() => {
    setIsLoadingSession(true);
    // TODO: Add SDK logic to start avatar session
    setIsSessionActive(true);
    setIsLoadingSession(false);
  }, []);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
    // TODO: Add SDK logic to stop avatar session
  }, []);

  // Mic controls
  const toggleMic = useCallback(() => {
    setIsMicMuted(prev => !prev);
    // TODO: Add logic to start/stop recording
  }, []);

  // Language/voice controls
  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    // TODO: Add SDK logic to update language
  }, []);

  const handleVoiceChange = useCallback((voice: string) => {
    setAvatarId(voice);
    // TODO: Add SDK logic to update avatar/voice
  }, []);

  // Transcript handler
  const addTranscriptionEntry = useCallback(
    (entry: any) => {
      transcriptionRef.current.push(entry);
      onTranscription(entry);
    },
    [onTranscription]
  );

  return {
    // State
    isSessionActive,
    isLoadingSession,
    isMicMuted,
    language,
    avatarId,
    emotion,
    // Controls
    startSession,
    endSession,
    toggleMic,
    setEmotion,
    setLanguage: handleLanguageChange,
    setAvatarId: handleVoiceChange,
    addTranscriptionEntry,
    // Refs (for advanced use)
    userMediaRecorderRef,
    userAudioChunksRef,
    transcriptionRef,
  };
}
