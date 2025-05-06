/* Relative Path: /components/InteractiveAvatar.tsx */
/* eslint-disable no-console */
'use client';

/**
 * InteractiveAvatar.tsx
 *
 * Key changes to ensure:
 * 1) We add partial text to a buffer *each time* we get a partial event.
 * 2) We also keep merging that buffer into a single "partial" line in the transcription array
 * so the transcription file updates in real time (with partial text).
 * 3) Once the avatar stops talking, we finalize that line with the entire text from the buffer.
 */

import StreamingAvatar, {
  AvatarQuality,
  VoiceEmotion,
  TaskType,
  StreamingEvents,
} from '@heygen/streaming-avatar';
import { Button, Card, CardBody, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { BsArrowsFullscreen } from 'react-icons/bs';

import ChatHistory from './ChatHistory';

import { AVATARS, STT_LANGUAGE_LIST } from '@/app/lib/constants';
import { getPSTTimestamp } from '@/utils/dateUtils';

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Build a "complex" date-based filename
 * e.g. 2025_01_03_13_07_18_2e177416-b139-4e63-ae75-a51abd1eac46.txt
 */
function buildDateTimeFilename(streamId: string, extension: string = 'txt') {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0'); // Corrected: getDate()
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}_${mm}_${dd}_${hh}_${min}_${sec}_${streamId}.${extension}`;
}

interface TranscriptionEntry {
  timestamp: string;
  type: 'avatar' | 'user' | 'system' | 'error';
  content: string;
  transcription?: string;
  turnId?: string;
  isPartial?: boolean;
}

const saveTranscriptionToFile = debounce(
  async (transcriptionArr: TranscriptionEntry[], streamId: string, filename?: string) => {
    try {
      const sorted = [...transcriptionArr].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const body = {
        streamId,
        transcription: sorted,
        timestamp: new Date().toISOString(),
        filename,
      };

      const res = await fetch('/api/save-transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        console.warn('Failed to save transcription:', data.error);
        if (typeof window !== 'undefined') window.alert('Failed to save transcription');
      }
    } catch (err) {
      console.warn('Error saving transcription:', err);
      if (typeof window !== 'undefined') window.alert('Error saving transcription');
    }
  },
  1000
);

const DEBOUNCE_SAVE_TIMEOUT = 2000;

// STUB for addTranscriptionEntry
const addTranscriptionEntry = (entry: TranscriptionEntry) => {
  console.log('STUB: addTranscriptionEntry called with:', entry);
};

interface StreamingAvatarApiConfig {
  token: string;
  basePath?: string;
}

interface StartAvatarRequest {
  avatarName: string;
  quality?: AvatarQuality;
  voice?: {
    voiceId?: string;
    rate?: number;
    emotion?: VoiceEmotion;
  };
  language?: string;
  knowledgeId?: string;
  knowledgeBase?: string;
  disableIdleTimeout?: boolean;
}

interface InteractiveAvatarProps {
  avatarId?: string;
  initialKnowledgeId?: string;
  knowledgeBase?: string;
  voiceId?: string;
  emotion?: VoiceEmotion;
  language?: string;
  initialMessage?: string;
  enableUserTranscription?: boolean;
  autoStart?: boolean;
  apiKey?: string;
  transcriptionConfig?: { save: boolean };
}

export default function InteractiveAvatar({
  avatarId: initialAvatarId = '',
  initialKnowledgeId,
  knowledgeBase,
  voiceId,
  emotion,
  language = 'en-US',
  initialMessage,
  enableUserTranscription = true,
  autoStart = false,
  apiKey,
  transcriptionConfig = { save: true },
}: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const isSessionActiveRef = useRef(false);

  const [stream, setStream] = useState<MediaStream>();
  const streamIdRef = useRef<string | undefined>(undefined);

  const [avatarId, setAvatarId] = useState<string>(initialAvatarId);
  const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);
  const transcriptionRef = useRef(transcription);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimeout = useRef<NodeJS.Timeout>();

  const avatarPartialBufferRef = useRef<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef<boolean>(false);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatarInstance = useRef<StreamingAvatar | null>(null);

  const [debug, setDebug] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const sessionFilenameRef = useRef<string | null>(null);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);

  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isAvatarThinking, setIsAvatarThinking] = useState(false);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [currentAvatarSpeech, setCurrentAvatarSpeech] = useState('');
  const [userSpeaking, setUserSpeaking] = useState<boolean>(false);

  const onAvatarTalkingMessageRef = useRef<((data: any) => void) | null>(null);
  const onAvatarEndMessageRef = useRef<((data: any) => void) | null>(null);

  // --- Utility Functions ---
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    console.log('Activity detected, inactivity timer reset.');
  }, []);

  // This function is not used in the current microphone handling logic but kept for potential future use with other STT providers.
  async function transcribeAudioWithDeepInfra(
    audioBlob: Blob,
    streamId: string
  ): Promise<string | null> {
    try {
      const formData = new FormData();

      formData.append('audio', audioBlob, `user_${streamId}.webm`);
      formData.append('type', 'user');
      formData.append('streamId', streamId);
      const res = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data && data.success && data.transcription) {
        return data.transcription;
      }

      return null;
    } catch (err) {
      console.error('Transcription API error:', err);

      return null;
    }
  }

  useEffect(() => {
    if (initialAvatarId) {
      setAvatarId(initialAvatarId);
    }
  }, [initialAvatarId]);

  useEffect(() => {
    transcriptionRef.current = transcription;
  }, [transcription]);

  const debouncedSaveTranscription = useRef(
    debounce(async () => {
      if (!isSessionActiveRef.current || !streamIdRef.current) return;
      const fileName = sessionFilenameRef.current || buildDateTimeFilename(streamIdRef.current); // Ensure filename is set

      sessionFilenameRef.current = fileName; // Persist if generated

      try {
        const response = await fetch('/api/save-transcription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId: streamIdRef.current,
            transcription: transcriptionRef.current,
            filename: fileName,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          console.error('Failed to save transcription:', await response.text());
        }
      } catch (error) {
        console.error('Error saving transcription:', error);
      }
    }, DEBOUNCE_SAVE_TIMEOUT)
  ).current;

  const setAndSaveTranscription = useCallback(
    // This function is not directly used by the new addTranscriptionEntry but is kept for reference
    (updater: (prev: TranscriptionEntry[]) => TranscriptionEntry[]) => {
      setTranscription(prev => {
        const updated = updater(prev);
        const lastEntry = updated[updated.length - 1];

        if (lastEntry && lastEntry.transcription) {
          setTranscriptionHistory(prevHistory => {
            if (
              lastEntry.type === 'system' ||
              (lastEntry.type === 'user' &&
                (lastEntry.content.includes('started speaking') ||
                  lastEntry.content.includes('stopped speaking')))
            ) {
              return prevHistory;
            }
            if (lastEntry.type === 'avatar' && lastEntry.isPartial) {
              return prevHistory;
            }
            const exists = prevHistory.some(
              msg => msg.type === lastEntry.type && msg.content === lastEntry.transcription
            );

            if (!exists) {
              return [
                ...prevHistory,
                {
                  timestamp: lastEntry.timestamp,
                  type: lastEntry.type,
                  content: lastEntry.transcription || '',
                  isPartial: false,
                },
              ];
            }

            return prevHistory;
          });
        }
        debouncedSaveTranscription();

        return updated;
      });
    },
    [debouncedSaveTranscription]
  );

  // --- Event Handlers (SDK Events) ---
  const handleStreamReady = useCallback(
    (event: any) => {
      console.log('Stream is ready:', event.detail);
      setDebug('Stream ready. Attaching to video element.');
      if (mediaStream.current && event.detail instanceof MediaStream) {
        mediaStream.current.srcObject = event.detail;
        mediaStream.current.onloadedmetadata = () => {
          mediaStream.current?.play().catch(e => console.error('Play failed:', e));
          setDebug('Video playback started.');
        };
        setStream(event.detail);
      } else {
        console.warn(
          'Stream ready event did not contain a MediaStream or mediaStream ref is not available.'
        );
        setDebug('Warning: Stream ready event without MediaStream or mediaStream missing.');
      }
    },
    [] // Removed setDebug from dependencies as it's a stable state setter
  );

  const handleStreamDisconnected = useCallback(
    () => {
      console.log('Stream disconnected.');
      setDebug('Stream disconnected.');
      setIsSessionActive(false);
      setStream(undefined);
    },
    [] // Removed setDebug, setIsSessionActive from dependencies
  );

  const handleAvatarStartTalking = useCallback(
    () => {
      console.log('Avatar started talking.');
      setDebug('Avatar started talking.');
      setIsAvatarSpeaking(true);
      setIsAvatarThinking(false);
    },
    [] // Removed setDebug, setIsAvatarSpeaking, setIsAvatarThinking
  );

  const handleAvatarStopTalking = useCallback(() => {
    console.log('Avatar stopped talking.');
    setDebug('Avatar stopped talking.');
    setIsAvatarSpeaking(false);
    if (currentAvatarSpeech && currentTurnId) {
      addTranscriptionEntry({
        timestamp: getPSTTimestamp(),
        type: 'avatar',
        content: '(final speech segment after stop talking)',
        transcription: currentAvatarSpeech,
        turnId: currentTurnId,
        isPartial: false,
      });
    }
    setCurrentAvatarSpeech('');
    setCurrentTurnId(null);
  }, [currentAvatarSpeech, currentTurnId]); // addTranscriptionEntry is stable, getPSTTimestamp is global

  const handleAvatarSpeech = useCallback(
    (data: { text: string; type: 'partial' | 'final'; turnId?: string }) => {
      const { text, type, turnId } = data;

      setDebug(`Avatar speech (${type}): ${text.substring(0, 50)}...`);

      if (turnId && currentTurnId !== turnId) {
        setCurrentTurnId(turnId);
      }
      const effectiveTurnId = turnId || currentTurnId;

      if (type === 'partial') {
        setCurrentAvatarSpeech(prev => prev + text);
        addTranscriptionEntry({
          timestamp: getPSTTimestamp(),
          type: 'avatar',
          content: '(partial speech segment)',
          transcription: currentAvatarSpeech + text,
          turnId: effectiveTurnId,
          isPartial: true,
        });
      } else if (type === 'final') {
        addTranscriptionEntry({
          timestamp: getPSTTimestamp(),
          type: 'avatar',
          content: '(final SDK message segment)',
          transcription: text,
          turnId: effectiveTurnId,
          isPartial: false,
        });
      }
    },
    [currentTurnId, currentAvatarSpeech] // addTranscriptionEntry is stable, getPSTTimestamp is global
  );

  // Moved fetchAccessToken definition before its first use in startSession
  const fetchAccessToken = useCallback(async (): Promise<string | null> => {
    if (apiKey) {
      setDebug('Using provided API key.');

      return apiKey;
    }
    setDebug('Fetching access token from /api/heygen/get-access-token...');
    try {
      const response = await fetch('/api/heygen/get-access-token');

      if (!response.ok) {
        let errorDataMessage = 'Failed to fetch access token';

        try {
          const errorData = await response.json();

          errorDataMessage = errorData.message || errorDataMessage;
        } catch (e) {
          errorDataMessage = response.statusText || errorDataMessage;
        }
        throw new Error(errorDataMessage);
      }
      const data = await response.json();

      setDebug('Access token fetched successfully.');

      return data.token;
    } catch (error: any) {
      console.error('Error fetching access token:', error);
      setDebug(`Error fetching access token: ${error.message}`);
      addTranscriptionEntry({
        timestamp: getPSTTimestamp(),
        type: 'error',
        content: `Token fetch error: ${error.message}`,
      });

      return null;
    }
  }, [apiKey]); // addTranscriptionEntry is stable, getPSTTimestamp is global

  // --- Microphone Handling ---
  const sendAudioData = useCallback(
    async (audioBlob: Blob) => {
      if (!avatarInstance.current || !isSessionActiveRef.current) {
        // Use ref for isSessionActive
        setDebug('Cannot send audio: No active session or avatar instance.');

        return;
      }
      if (audioBlob.size === 0) {
        setDebug('Skipping empty audio blob.');

        return;
      }
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioData = new Uint8Array(arrayBuffer);

        setDebug(`Sending audio data: ${audioData.length} bytes.`);
        await avatarInstance.current.sendUserAudio(audioData);
        setDebug('Audio data sent.');
      } catch (err: any) {
        console.error('Error sending audio data:', err);
        setDebug(`Error sending audio data: ${err.message}`);
        addTranscriptionEntry({
          timestamp: getPSTTimestamp(),
          type: 'error',
          content: `Error sending audio: ${err.message}`,
        });
      }
    },
    [] // isSessionActiveRef is a ref, avatarInstance is a ref, addTranscriptionEntry is stable
  );

  const processUserAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      setDebug('No audio chunks to process.');

      return;
    }
    setDebug('Processing user audio chunks...');
    const audioBlob = new Blob(audioChunksRef.current, {
      type: mediaRecorderRef.current?.mimeType || 'audio/webm',
    });

    audioChunksRef.current = [];

    if (transcriptionConfig.save) {
      const userAudioFilename = buildDateTimeFilename(
        `${streamIdRef.current}_user_turn_${Date.now()}`,
        'webm'
      );

      setDebug(
        `User audio blob created (${(audioBlob.size / 1024).toFixed(
          2
        )} KB), would save as ${userAudioFilename}`
      );
    }
    await sendAudioData(audioBlob);
  }, [transcriptionConfig, sendAudioData]); // audioChunksRef, mediaRecorderRef, streamIdRef are refs

  const startRecording = useCallback(async () => {
    if (!isSessionActiveRef.current || !avatarInstance.current) {
      // Use ref for isSessionActive
      setDebug('Cannot start recording: Session not active or no avatar instance.');

      return;
    }
    if (isRecordingRef.current) {
      setDebug('Already recording.');

      return;
    }
    if (isMicMuted) {
      setDebug('Mic is muted, cannot start recording.');

      return;
    }
    try {
      setDebug('Requesting microphone access...');
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setDebug('Microphone access granted.');
      isRecordingRef.current = true;
      setUserSpeaking(true);
      mediaRecorderRef.current = new MediaRecorder(micStream);
      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        setDebug('Recording stopped. Processing audio data...');
        await processUserAudio();
        setUserSpeaking(false);
        isRecordingRef.current = false;
        micStream.getTracks().forEach(track => track.stop());
        setDebug('Microphone stream tracks stopped.');
      };
      mediaRecorderRef.current.start(1000);
      setDebug('Microphone recording started.');
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setDebug(`Error starting recording: ${err.message}`);
      addTranscriptionEntry({
        timestamp: getPSTTimestamp(),
        type: 'error',
        content: `Mic error: ${err.message}`,
      });
      isRecordingRef.current = false;
      setUserSpeaking(false);
    }
  }, [isMicMuted, processUserAudio, setUserSpeaking]); // isSessionActiveRef, avatarInstance, isRecordingRef, mediaRecorderRef, audioChunksRef are refs

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      setDebug('Stopping microphone recording...');
      mediaRecorderRef.current.stop();
    } else {
      setDebug('Not recording or mediaRecorder not initialized.');
    }
  }, []); // mediaRecorderRef, isRecordingRef are refs

  // --- Session Management ---
  const endSession = useCallback(async () => {
    if (!avatarInstance.current && !isSessionActiveRef.current) {
      setDebug('No active session or avatar instance to end.');

      return;
    }
    setDebug('Ending session...');
    setIsLoadingSession(true);

    if (isRecordingRef.current && mediaRecorderRef.current) {
      stopRecording();
    }

    if (avatarInstance.current) {
      try {
        setDebug('Stopping avatar session via SDK...');
        await avatarInstance.current.stopAvatar();
        setDebug('Avatar session stopped successfully via SDK.');
      } catch (err: any) {
        console.error('Error stopping avatar session via SDK:', err);
        setDebug(`Error stopping avatar via SDK: ${err.message}`);
        addTranscriptionEntry({
          timestamp: getPSTTimestamp(),
          type: 'error',
          content: `Error stopping session via SDK: ${err.message}`,
        });
      } finally {
        avatarInstance.current.off(StreamingEvents.STREAM_READY, handleStreamReady);
        avatarInstance.current.off(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);
        avatarInstance.current.off(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);
        if (onAvatarTalkingMessageRef.current) {
          avatarInstance.current.off(
            StreamingEvents.AVATAR_TALKING_MESSAGE,
            onAvatarTalkingMessageRef.current
          );
        }
        if (onAvatarEndMessageRef.current) {
          avatarInstance.current.off(
            StreamingEvents.AVATAR_END_MESSAGE,
            onAvatarEndMessageRef.current
          );
        }
        avatarInstance.current.off(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStopTalking);
        avatarInstance.current = null;
      }
    }

    // setSessionId(null); // These state setters are not defined in the component
    // setVideoUrl('');
    setIsSessionActive(false);
    setIsAvatarSpeaking(false);
    setIsAvatarThinking(false);
    setCurrentTurnId(null);
    setCurrentAvatarSpeech('');
    if (mediaStream.current) {
      mediaStream.current.srcObject = null;
    }
    setStream(undefined);
    setIsLoadingSession(false);
    setDebug('Session ended and states reset.');

    if (transcription.length > 0 && streamIdRef.current) {
      saveTranscriptionToFile(
        transcription,
        streamIdRef.current,
        buildDateTimeFilename(streamIdRef.current)
      );
    }
  }, [
    stopRecording,
    handleStreamReady,
    handleStreamDisconnected,
    handleAvatarStartTalking,
    handleAvatarStopTalking,
    transcription,
  ]); // Other dependencies are refs or stable setters/globals

  const startSession = useCallback(async () => {
    if (avatarInstance.current) {
      console.error('Session already active, cannot start new one.');
      setDebug('Error: Session already active.');

      return;
    }
    setDebug('Starting session...');
    setIsLoadingSession(true);
    setTranscription([]);
    setCurrentAvatarSpeech('');
    setCurrentTurnId(null);
    const newStreamId = crypto.randomUUID();

    streamIdRef.current = newStreamId;
    sessionFilenameRef.current = buildDateTimeFilename(newStreamId); // Set filename early

    onAvatarTalkingMessageRef.current = (data: any) =>
      handleAvatarSpeech({ ...data, type: 'partial' });
    onAvatarEndMessageRef.current = (data: any) => handleAvatarSpeech({ ...data, type: 'final' });

    try {
      const token = await fetchAccessToken();

      if (!token) {
        setDebug('Failed to fetch access token.');
        setIsLoadingSession(false);

        return;
      }
      const newAvatarSdkInstance = new StreamingAvatar({ token });

      avatarInstance.current = newAvatarSdkInstance;

      newAvatarSdkInstance.on(StreamingEvents.STREAM_READY, handleStreamReady);
      newAvatarSdkInstance.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);
      newAvatarSdkInstance.on(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);
      if (onAvatarTalkingMessageRef.current) {
        newAvatarSdkInstance.on(
          StreamingEvents.AVATAR_TALKING_MESSAGE,
          onAvatarTalkingMessageRef.current
        );
      }
      if (onAvatarEndMessageRef.current) {
        newAvatarSdkInstance.on(
          StreamingEvents.AVATAR_END_MESSAGE,
          onAvatarEndMessageRef.current
        );
      }
      newAvatarSdkInstance.on(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStopTalking);

      const startRequest: StartAvatarRequest = {
        quality: AvatarQuality.Medium,
        avatarName: initialAvatarId || AVATARS[0].avatar_id,
        ...(initialKnowledgeId && { knowledgeId: initialKnowledgeId }),
        ...(knowledgeBase && { knowledgeBase: knowledgeBase }),
        voice: {
          voiceId:
            voiceId ||
            AVATARS.find(a => a.avatar_id === (initialAvatarId || AVATARS[0].avatar_id))?.voice_id,
          emotion: emotion || VoiceEmotion.FRIENDLY,
        },
        language: language || 'en-US',
        disableIdleTimeout: true,
      };

      setDebug(`Starting avatar with request: ${JSON.stringify(startRequest, null, 2)}`);
      const res = await newAvatarSdkInstance.createStartAvatar(startRequest);

      setDebug(`Session created with ID: ${res.session_id}, URL: ${res.url}`);

      await newAvatarSdkInstance.startSession();
      setDebug('LiveKit connection initiated via avatar.startSession().');
      setIsSessionActive(true);
      setIsLoadingSession(false);

      if (initialMessage) {
        addTranscriptionEntry({
          timestamp: getPSTTimestamp(),
          type: 'system',
          content: `Sending initial message: \"${initialMessage}\"`,
        });
        await newAvatarSdkInstance.speak({ text: initialMessage, taskType: TaskType.TALK });
      }
      if (enableUserTranscription) {
        // Only start recording if enabled
        startRecording();
      }
    } catch (error: any) {
      console.error('Error starting session:', error);
      setDebug(`Error starting session: ${error.message}`);
      addTranscriptionEntry({
        timestamp: getPSTTimestamp(),
        type: 'error',
        content: `Failed to start session: ${error.message}`,
      });
      if (typeof window !== 'undefined') window.alert(`Error starting session: ${error.message}`);
      if (avatarInstance.current) {
        await endSession();
      } else {
        setIsLoadingSession(false);
      }
    }
  }, [
    initialAvatarId,
    initialKnowledgeId,
    knowledgeBase,
    voiceId,
    emotion,
    language,
    initialMessage,
    fetchAccessToken,
    handleAvatarSpeech,
    handleStreamReady,
    handleStreamDisconnected,
    handleAvatarStartTalking,
    handleAvatarStopTalking,
    startRecording,
    endSession,
    enableUserTranscription, // Added enableUserTranscription
  ]);

  // --- UI Handlers ---
  const handleToggleMic = () => {
    if (!enableUserTranscription) {
      setDebug("User transcription is disabled. Mic toggle won't start/stop recording.");

      // Optionally, still allow muting the UI state if that's desired for other reasons
      // setIsMicMuted(prev => !prev);
      return;
    }
    setIsMicMuted(prev => {
      const nextMutedState = !prev;

      if (nextMutedState) {
        stopRecording();
        console.log('Microphone muted.');
      } else {
        startRecording();
        console.log('Microphone unmuted.');
      }
      addTranscriptionEntry({
        timestamp: getPSTTimestamp(),
        type: 'system',
        content: `Mic ${nextMutedState ? 'muted' : 'unmuted'} by user.`,
      });

      return nextMutedState;
    });
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Error entering fullscreen:', err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error('Error exiting fullscreen:', err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setLastMouseMove(Date.now());
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Inactivity => end session
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveDuration = now - lastActivityRef.current;
      const timeoutMs = 3 * 60 * 1000;

      if (isSessionActiveRef.current && inactiveDuration >= timeoutMs) {
        console.log('Session ended due to inactivity');
        setDebug('Session ended due to inactivity.');
        endSession();
      } else if (isSessionActiveRef.current) {
        timeoutId = setTimeout(checkInactivity, Math.max(0, timeoutMs - inactiveDuration));
      }
    };

    if (isSessionActiveRef.current) {
      resetInactivityTimer(); // Reset timer when session becomes active or on first check
      timeoutId = setTimeout(checkInactivity, 3 * 60 * 1000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [endSession, resetInactivityTimer]); // isSessionActiveRef changes are handled by the effect below

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
    if (isSessionActive) {
      resetInactivityTimer(); // Reset inactivity timer when session becomes active
      // The inactivity useEffect will then start its own timer
    }
  }, [isSessionActive, resetInactivityTimer]);

  // --- Effects ---
  useEffect(() => {
    if (autoStart && !isSessionActive && !isLoadingSession) {
      setDebug('Auto-starting session...');
      startSession();
    }
  }, [autoStart, isSessionActive, isLoadingSession, startSession]);

  useEffect(() => {
    return () => {
      if (isSessionActiveRef.current || avatarInstance.current) {
        setDebug('Component unmounting. Ending session if active.');
        endSession();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        setDebug('Cleaning up media recorder tracks on unmount.');
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
    };
  }, [endSession]); // Only endSession as it's stable and handles its own dependencies

  // Dummy state setters for missing states, if any, to avoid crashes.
  const setSessionId = (id: string | null) => console.log('setSessionId called with:', id);
  const setVideoUrl = (url: string) => console.log('setVideoUrl called with:', url);

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col justify-center items-center gap-4">
          {stream ? (
            <div
              ref={containerRef}
              className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
              onMouseMove={handleMouseMove}
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <video
                  ref={mediaStream}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-gray-900"
                >
                  <track kind="captions" />
                </video>
                <div
                  className={`absolute transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    width: '95%',
                    maxWidth: '600px',
                  }}
                >
                  <div className="flex justify-center gap-2 p-2 sm:p-3 bg-black/50 rounded-lg backdrop-blur-sm">
                    <Button
                      className="btn-solid rounded-lg min-w-0 px-2 sm:px-4"
                      disabled={!isSessionActive || !enableUserTranscription} // Also disable if user transcription is off
                      size="sm"
                      variant="shadow"
                      onPress={handleToggleMic}
                    >
                      {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                    </Button>
                    <Button
                      className="btn-solid rounded-lg min-w-0 px-2 sm:px-4"
                      disabled={!isSessionActive && !isLoadingSession}
                      isLoading={isLoadingSession && isSessionActive}
                      size="sm"
                      variant="shadow"
                      onPress={endSession}
                    >
                      End Session
                    </Button>
                    <Button
                      isIconOnly
                      className="btn-solid rounded-lg min-w-0 w-8 sm:w-10"
                      size="sm"
                      variant="shadow"
                      onPress={handleToggleFullscreen}
                    >
                      <BsArrowsFullscreen className="text-base sm:text-lg" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 gap-8">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gray-900">
                  <Image
                    fill
                    priority
                    alt={`${
                      AVATARS.find(a => a.avatar_id === avatarId)?.name || 'default'
                    } preview`}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={
                      `/${(AVATARS.find(a => a.avatar_id === avatarId)?.name || AVATARS[0]?.name || 'Alex')}_avatar_preview.webp`
                    }
                    onError={e =>
                      (e.currentTarget.src = `https://placehold.co/1280x720/000000/FFFFFF?text=Preview+Not+Available`)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  className="w-full text-white"
                  classNames={{
                    label: 'text-white',
                    value: 'text-white',
                    trigger: 'bg-gray-800 data-[hover=true]:bg-gray-700',
                    listbox: 'bg-gray-800',
                    popoverContent: 'bg-gray-800',
                  }}
                  disabled={isLoadingSession}
                  label="Select Language (STT)"
                  selectedKeys={language ? [language] : []}
                  onChange={e => console.log('Language selected in UI (STT):', e.target.value)}
                >
                  {STT_LANGUAGE_LIST.map(lang => (
                    <SelectItem
                      key={lang.key}
                      className="text-white data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-600"
                      textValue={lang.label}
                      value={lang.value}
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </Select>
                <Button
                  className="btn-primary w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!avatarId || isLoadingSession}
                  isLoading={isLoadingSession}
                  size="lg"
                  onPress={startSession}
                >
                  Start Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-[500px] max-w-full w-full justify-center items-center flex rounded-lg overflow-hidden relative bg-gray-100 dark:bg-gray-900">
              <div className="flex flex-col items-center gap-4">
                <Spinner color="primary" size="lg" />
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  Loading Session...
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {(transcription.length > 0 || isSessionActive) && (
        <Card className="mt-4">
          <CardBody>
            <ChatHistory className="max-h-[400px] overflow-y-auto" messages={transcription} />
          </CardBody>
        </Card>
      )}

      {debug && (
        <div className="mt-4 p-2 bg-gray-800 text-gray-300 text-xs rounded fixed bottom-2 right-2 z-[100] max-w-xs break-words">
          <strong>Debug:</strong> {debug}
        </div>
      )}
    </div>
  );
}
