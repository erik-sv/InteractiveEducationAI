/* Relative Path: /components/InteractiveAvatar.tsx */
/* eslint-disable no-console */
'use client';

/**
 * InteractiveAvatar.tsx
 *
 * Key changes to ensure:
 *   1) We add partial text to a buffer *each time* we get a partial event.
 *   2) We also keep merging that buffer into a single "partial" line in the transcription array
 *      so the transcription file updates in real time (with partial text).
 *   3) Once the avatar stops talking, we finalize that line with the entire text from the buffer.
 */

import type { StartAvatarResponse } from '@heygen/streaming-avatar';

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';
import { Button, Card, CardBody, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { BsArrowsFullscreen } from 'react-icons/bs';

import ChatHistory from './ChatHistory';

import { AVATARS, STT_LANGUAGE_LIST } from '@/app/lib/constants';
import { getPSTTimestamp, formatPSTTimestamp } from '@/utils/dateUtils';

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
function buildDateTimeFilename(streamId: string) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = now.getDate();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}_${mm}_${dd}_${hh}_${min}_${sec}_${streamId}.txt`;
}

interface InteractiveAvatarProps {
  defaultAvatarId?: string;
  knowledgeBase?: string;
  introMessage?: string;
}

interface TranscriptionEntry {
  timestamp: string;
  type: 'avatar' | 'user' | 'system';
  content: string; // e.g. "(partial)" or "(final)" or "Started speaking"
  transcription?: string;
  turnId?: string; // unique ID per avatar speaking turn
  isPartial?: boolean; // helps differentiate partial vs final lines
}

export default function InteractiveAvatar({
  defaultAvatarId,
  knowledgeBase,
  introMessage,
}: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);

  // For the avatar's MediaStream
  const [stream, setStream] = useState<MediaStream>();
  const [streamId, setStreamId] = useState<string>();
  const streamIdRef = useRef<string | undefined>(undefined);

  const [avatarId, setAvatarId] = useState<string>(defaultAvatarId || '');
  const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const inactivityTimeout = useRef<NodeJS.Timeout>();

  // The partial buffer for the current avatar speaking turn
  const avatarPartialBufferRef = useRef<string[]>([]);

  // For the user mic
  const userMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const userMediaRef = useRef<MediaStream | null>(null);

  // The streaming avatar instance
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const isSessionActiveRef = useRef(false);

  // UI states
  const [language, setLanguage] = useState<string>('en');
  const [debug, setDebug] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<StartAvatarResponse>();
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  // We'll store the final filename after receiving the stream ID
  const sessionFilenameRef = useRef<string | null>(null);

  const [transcriptionHistory, setTranscriptionHistory] = useState<
    Array<{
      timestamp: string;
      type: 'USER' | 'AVATAR';
      content: string;
      isComplete: boolean;
    }>
  >([]);

  useEffect(() => {
    if (defaultAvatarId) {
      setAvatarId(defaultAvatarId);
    }
  }, [defaultAvatarId]);

  // Inactivity => end session
  useEffect(() => {
    if (!lastActivity) return;
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);

    inactivityTimeout.current = setTimeout(
      () => {
        console.log('Session ended due to inactivity');
        endSession();
      },
      3 * 60 * 1000
    );

    return () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    };
  }, [lastActivity]);

  const handleActivity = useCallback(() => {
    console.log('Speech activity detected, resetting timer');
    setLastActivity(Date.now());
  }, []);

  // Debounced saving to server
  const debouncedSaveTranscription = useRef(
    debounce(async (arr: TranscriptionEntry[]) => {
      if (!isSessionActiveRef.current || !streamIdRef.current) return;
      const fileName = sessionFilenameRef.current;

      if (!fileName) return;

      console.log('[DEBUG] About to save transcription. Current array:', arr);

      try {
        const response = await fetch('/api/save-transcription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId: streamIdRef.current,
            transcription: arr,
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
    }, 200)
  ).current;

  // Helper to update transcription array & do an immediate short-debounce save
  const setAndSaveTranscription = useCallback(
    (updater: (prev: TranscriptionEntry[]) => TranscriptionEntry[]) => {
      setTranscription(prev => {
        const updated = updater(prev);
        const lastEntry = updated[updated.length - 1];

        // Update chat history when we have a new transcription
        if (lastEntry && lastEntry.transcription) {
          setTranscriptionHistory(prev => {
            // Don't show system messages or partial transcriptions
            if (
              lastEntry.type === 'system' ||
              (lastEntry.type === 'user' &&
                (lastEntry.content.includes('started speaking') ||
                  lastEntry.content.includes('stopped speaking')))
            ) {
              return prev;
            }

            // For avatar messages, only show final ones
            if (lastEntry.type === 'avatar' && lastEntry.isPartial) {
              return prev;
            }

            // Check if this exact message already exists
            const exists = prev.some(
              msg =>
                msg.type === (lastEntry.type.toUpperCase() as 'USER' | 'AVATAR') &&
                msg.content === lastEntry.transcription
            );

            if (!exists) {
              return [
                ...prev,
                {
                  timestamp: formatPSTTimestamp(lastEntry.timestamp),
                  type: lastEntry.type.toUpperCase() as 'USER' | 'AVATAR',
                  content: lastEntry.transcription,
                  isComplete: !lastEntry.isPartial,
                },
              ];
            }

            return prev;
          });
        }

        debouncedSaveTranscription(updated);

        return updated;
      });
    },
    [debouncedSaveTranscription]
  );

  // MIME for user mic
  function getSupportedMimeType() {
    if (typeof window === 'undefined' || !window.MediaRecorder) return '';
    const possibleTypes = ['audio/webm; codecs=opus', 'audio/webm', 'audio/mp4'];

    return possibleTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }
  const mediaRecorderMimeType = getSupportedMimeType();

  // user => whisper
  const handleUserTranscription = useCallback(
    async (audioBlob: Blob) => {
      if (!isSessionActiveRef.current || !streamIdRef.current) {
        console.warn('Skipping user transcription; session not active or no streamId');

        return;
      }

      const formData = new FormData();

      formData.append('audio', audioBlob, `audio.${audioBlob.type.split('/')[1] || 'webm'}`);
      formData.append('type', 'user');
      formData.append('streamId', streamIdRef.current);

      try {
        const response = await fetch('/api/transcribe-audio', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Transcription API error:', await response.text());

          return;
        }

        const { transcription: text } = await response.json();

        console.log('Transcription successful (User):', text);

        // Add a new transcription entry for the user
        setAndSaveTranscription(prev => {
          const timestamp = userStopTimestampRef.current || getPSTTimestamp();
          // Create a new entry for this transcription
          const newTranscription = {
            timestamp,
            type: 'user' as const,
            content: 'Transcription successful (User)',
            transcription: text,
            isPartial: false,
          };

          // Add to chat history immediately
          setTranscriptionHistory(prevHistory => {
            // Check if this exact message already exists
            const exists = prevHistory.some(msg => msg.type === 'USER' && msg.content === text);

            if (!exists) {
              return [
                ...prevHistory,
                {
                  timestamp: formatPSTTimestamp(newTranscription.timestamp),
                  type: 'USER',
                  content: text,
                  isComplete: true,
                },
              ];
            }

            return prevHistory;
          });

          // Clear the timestamp ref after using it
          userStopTimestampRef.current = null;

          // Return updated transcription array with new entry
          return [...prev, newTranscription];
        });
      } catch (err) {
        console.error('Error in user transcription:', err);
      }
    },
    [setAndSaveTranscription]
  );

  // Setup user mic recorder
  const startContinuousUserRecording = useCallback(() => {
    if (!isSessionActiveRef.current || !userMediaRef.current) {
      console.warn('Skipping user mic record; session inactive or no user media');

      return;
    }

    if (userMediaRecorderRef.current?.state === 'recording') {
      userMediaRecorderRef.current.stop();
    }

    const recorder = new MediaRecorder(userMediaRef.current, {
      mimeType: mediaRecorderMimeType,
    });

    let audioChunks: Blob[] = [];

    recorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorderMimeType });

      audioChunks = [];
      console.log(`Processing user audio of size: ${audioBlob.size}`);
      await handleUserTranscription(audioBlob);

      if (isSessionActiveRef.current) {
        startContinuousUserRecording(); // re-start
      }
    };

    userMediaRecorderRef.current = recorder;
    recorder.start();
  }, [handleUserTranscription, mediaRecorderMimeType]);

  const stopRecording = useCallback((type: 'user', stopTimestamp?: string) => {
    if (type === 'user') {
      if (userMediaRecorderRef.current?.state === 'recording') {
        console.log('Stopping user recording');
        try {
          // Store timestamp in ref for use in handleUserTranscription
          if (stopTimestamp) {
            userStopTimestampRef.current = stopTimestamp;
          }
          userMediaRecorderRef.current.stop();
        } catch (err) {
          console.error('Error stopping user recorder:', err);
        }
      }
    }
  }, []);

  // -------------- AVATAR PARTIAL / FINAL --------------

  // Each time we get "partial" text from HeyGen, append to partial buffer & update the single partial line
  const handleAvatarPartialMessage = useCallback(
    (text: string) => {
      if (!isSessionActiveRef.current) return;

      // We simply store *all partial strings* in a buffer
      avatarPartialBufferRef.current.push(text);

      // Merge them so far
      const mergedSoFar = avatarPartialBufferRef.current.join('');

      console.log('[Avatar partial transcript => buffer merge]:', JSON.stringify(mergedSoFar));

      // Find our single partial line
      setAndSaveTranscription(prev => {
        const partialIdx = prev.findIndex(e => e.type === 'avatar' && e.isPartial);

        if (partialIdx < 0) return prev;

        const updated = [...prev];
        const old = updated[partialIdx];

        updated[partialIdx] = { ...old, transcription: mergedSoFar };

        return updated;
      });
    },
    [setAndSaveTranscription]
  );

  const handleAvatarStopTalking = useCallback(() => {
    if (!isSessionActiveRef.current) return;

    // The entire final text is the merged partial from the buffer
    const finalText = avatarPartialBufferRef.current.join('');

    avatarPartialBufferRef.current = []; // clear

    console.log('Avatar stopped => final text is:', JSON.stringify(finalText));

    // finalize partial => final
    setAndSaveTranscription(prev => {
      const partialIdx = prev.findIndex(e => e.type === 'avatar' && e.isPartial);

      if (partialIdx < 0) return prev;
      const updated = [...prev];
      const old = updated[partialIdx];

      updated[partialIdx] = {
        ...old,
        content: '(final)',
        isPartial: false,
        transcription: finalText,
      };

      return updated;
    });
  }, [setAndSaveTranscription]);

  // We'll create a partial line once we see AVATAR_START_TALKING
  const handleAvatarStartTalking = useCallback(() => {
    if (!isSessionActiveRef.current) return;

    console.log('Avatar started talking => create new partial line');
    // Insert a single partial line
    setAndSaveTranscription(prev => [
      ...prev,
      {
        timestamp: getPSTTimestamp(),
        type: 'avatar',
        content: '(partial)',
        transcription: '',
        isPartial: true,
      },
    ]);
  }, [setAndSaveTranscription]);

  // -------------- SUBSCRIBE TO HEYGEN EVENTS --------------
  useEffect(() => {
    if (!avatar.current) return;

    const onUserStart = () => {
      if (!isSessionActiveRef.current) return;
      console.log('>>>>> User started talking');
      setAndSaveTranscription(prev => [
        ...prev,
        { timestamp: getPSTTimestamp(), type: 'user', content: 'Started speaking' },
      ]);
      handleActivity();
    };

    const onUserStop = () => {
      if (!isSessionActiveRef.current) return;
      console.log('>>>>> User stopped talking');
      const stopTimestamp = getPSTTimestamp(); // Store timestamp when user stops

      stopRecording('user', stopTimestamp); // Pass timestamp to stopRecording
      setAndSaveTranscription(prev => [
        ...prev,
        { timestamp: stopTimestamp, type: 'user', content: 'Stopped speaking' },
      ]);
    };

    avatar.current.on(StreamingEvents.USER_START, onUserStart);
    avatar.current.on(StreamingEvents.USER_STOP, onUserStop);

    const onAvatarStart = () => {
      handleActivity();
      handleAvatarStartTalking();
    };

    const onAvatarPartialEvent = (evt: CustomEvent) => {
      handleActivity();
      const partial = evt.detail?.message || '';

      handleAvatarPartialMessage(partial);
    };

    const onAvatarStopEvent = () => {
      handleActivity();
      handleAvatarStopTalking();
    };

    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, onAvatarStart);
    avatar.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, onAvatarPartialEvent);
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, onAvatarStopEvent);

    return () => {
      avatar.current?.off(StreamingEvents.USER_START, onUserStart);
      avatar.current?.off(StreamingEvents.USER_STOP, onUserStop);

      avatar.current?.off(StreamingEvents.AVATAR_START_TALKING, onAvatarStart);
      avatar.current?.off(StreamingEvents.AVATAR_TALKING_MESSAGE, onAvatarPartialEvent);
      avatar.current?.off(StreamingEvents.AVATAR_STOP_TALKING, onAvatarStopEvent);
    };
  }, [
    avatar.current,
    handleActivity,
    handleAvatarStartTalking,
    handleAvatarPartialMessage,
    handleAvatarStopTalking,
    setAndSaveTranscription,
    stopRecording,
  ]);

  // -------------- START / END SESSION --------------
  const saveTranscription = async () => {
    if (!transcription.length) return;

    try {
      const response = await fetch('/api/save-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId: streamIdRef.current,
          transcription: transcription,
          timestamp: Date.now(),
          filename: sessionFilenameRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcription');
      }

      // Update chat history with completed transcriptions
      transcription.forEach(entry => {
        if (
          entry.transcription &&
          entry.type !== 'system' &&
          !(
            entry.type === 'user' &&
            (entry.content.includes('started speaking') ||
              entry.content.includes('stopped speaking'))
          )
        ) {
          setTranscriptionHistory(prev => {
            // Check if this message already exists
            const exists = prev.some(
              msg =>
                msg.type === (entry.type.toUpperCase() as 'USER' | 'AVATAR') &&
                msg.content === entry.transcription
            );

            if (!exists) {
              return [
                ...prev,
                {
                  timestamp: formatPSTTimestamp(entry.timestamp),
                  type: entry.type.toUpperCase() as 'USER' | 'AVATAR',
                  content: entry.transcription,
                  isComplete: !entry.isPartial,
                },
              ];
            }

            return prev;
          });
        }
      });
    } catch (error) {
      console.error('Error saving transcription:', error);
    }
  };

  async function fetchAccessToken() {
    try {
      const response = await fetch('/api/get-access-token', { method: 'POST' });
      const token = await response.text();

      return token;
    } catch (error) {
      console.error('Error fetching access token:', error);

      return '';
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    try {
      setIsSessionActive(true);
      isSessionActiveRef.current = true;

      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      userMediaRef.current = userMedia;
      startContinuousUserRecording();

      const token = await fetchAccessToken();

      avatar.current = new StreamingAvatar({ token });

      avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        stopRecording('user');
        endSession();
      });

      avatar.current.on(StreamingEvents.STREAM_READY, evt => {
        if (!isSessionActiveRef.current) return;
        console.log('>>>>> Stream ready:', evt.detail);

        setStream(evt.detail);
        streamIdRef.current = evt.detail.id;
        setStreamId(evt.detail.id);

        // Build a single date-based file name for entire session
        if (!sessionFilenameRef.current) {
          const name = buildDateTimeFilename(evt.detail.id);

          sessionFilenameRef.current = name;
          console.log('Session file name set to:', name);
        }

        if (mediaStream.current) {
          mediaStream.current.srcObject = evt.detail;
          mediaStream.current.onloadedmetadata = () => {
            mediaStream.current?.play().catch(err => console.error(err));
          };
        }
        console.log('Avatar audio stream is ready.');
      });

      const sessionInfo = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeBase,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.EXCITED,
        },
        language,
        disableIdleTimeout: true,
      });

      setData(sessionInfo);

      await avatar.current.startVoiceChat({ useSilencePrompt: false });
      await new Promise(r => setTimeout(r, 500));

      if (introMessage && introMessage.trim()) {
        console.log('Sending intro message:', introMessage);
        try {
          await avatar.current.speak({
            text: introMessage,
            taskType: TaskType.REPEAT,
            taskMode: TaskMode.SYNC,
          });
        } catch (e) {
          console.error('Error sending intro message:', e);
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setDebug(error instanceof Error ? error.message : 'Unknown error');
      setIsSessionActive(false);
      isSessionActiveRef.current = false;
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug('Avatar not initialized');

      return;
    }
    await avatar.current.interrupt().catch(e => setDebug(e.message));
  }

  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug('Avatar not initialized');

      return;
    }
    await avatar.current
      .speak({ text: '', taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC })
      .catch(e => setDebug(e.message));
    setIsLoadingRepeat(false);
  }

  async function endSession() {
    if (!isSessionActiveRef.current) {
      console.log('Session already inactive; ignoring endSession.');

      return;
    }
    console.log('Ending session...');
    setIsSessionActive(false);
    isSessionActiveRef.current = false;

    stopRecording('user');
    await avatar.current?.stopAvatar();

    // final save
    debouncedSaveTranscription([...transcription]);

    setStream(undefined);
    setStreamId(undefined);
    setData(undefined);
    setTranscription([]);
  }

  // UI
  const handleToggleMic = async () => {
    if (!avatar.current) return;
    if (!isMicMuted) {
      await avatar.current.closeVoiceChat();
    } else {
      await avatar.current.startVoiceChat();
    }
    setIsMicMuted(!isMicMuted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    setLastMouseMove(Date.now());
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);

    hideControlsTimeout.current = setTimeout(() => {
      if (Date.now() - lastMouseMove > 2000) {
        setShowControls(false);
      }
    }, 2000);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // track fullscreen
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // attach final stream
  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current?.play().catch(err => console.error(err));
        setDebug('Playing');
      };
    }
  }, [stream]);

  // Add ref for storing user stop timestamp
  const userStopTimestampRef = useRef<string | null>(null);

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col justify-center items-center gap-4">
          {/* Existing avatar stream content */}
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
                      size="sm"
                      variant="shadow"
                      onPress={handleToggleMic}
                    >
                      {isMicMuted ? 'Unmute' : 'Mute'}
                    </Button>
                    <Button
                      className="btn-solid rounded-lg min-w-0 px-2 sm:px-4"
                      size="sm"
                      variant="shadow"
                      onPress={handleInterrupt}
                    >
                      Stop
                    </Button>
                    <Button
                      className="btn-danger rounded-lg min-w-0 px-2 sm:px-4"
                      size="sm"
                      variant="shadow"
                      onPress={endSession}
                    >
                      End
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
                    alt={`${AVATARS.find(a => a.avatar_id === avatarId)?.name} preview`}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={`/${
                      AVATARS.find(a => a.avatar_id === avatarId)?.name
                    }_avatar_preview.webp`}
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
                  label="Select Language"
                  selectedKeys={[language]}
                  onChange={e => setLanguage(e.target.value)}
                >
                  {STT_LANGUAGE_LIST.map(lang => (
                    <SelectItem
                      key={lang.key}
                      className="text-white data-[hover=true]:bg-gray-700"
                      textValue={lang.label}
                      value={lang.value}
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </Select>
                <Button
                  className="btn-primary w-full h-14 text-lg"
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

      {(transcriptionHistory.length > 0 || isSessionActive) && (
        <Card className="mt-4">
          <CardBody>
            <ChatHistory
              className="max-h-[400px] overflow-y-auto"
              messages={transcriptionHistory}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
