/* Relative Path: /components/InteractiveAvatar.tsx */
/* eslint-disable no-console */

import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { BsArrowsFullscreen } from "react-icons/bs";

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";
import { getPSTTimestamp } from "@/utils/dateUtils";

interface InteractiveAvatarProps {
  defaultAvatarId?: string;
  knowledgeBase?: string;
  introMessage?: string;
}

interface TranscriptionEntry {
  timestamp: string;
  type: "avatar" | "user" | "system";
  content: string;
  transcription?: string;
}

export default function InteractiveAvatar({
  defaultAvatarId,
  knowledgeBase,
  introMessage,
}: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [streamId, setStreamId] = useState<string>();
  const streamIdRef = useRef<string | undefined>(undefined);
  const [debug, setDebug] = useState<string>();
  const [avatarId, setAvatarId] = useState<string>(defaultAvatarId || "");
  const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const inactivityTimeout = useRef<NodeJS.Timeout>();

  const userMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const avatarMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const userAudioChunksRef = useRef<Blob[]>([]);
  const avatarAudioChunksRef = useRef<Blob[]>([]);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Store user media stream separately for user recording
  const userMediaRef = useRef<MediaStream | null>(null);

  const handleActivity = useCallback(() => {
    console.log("Speech activity detected, resetting timer");
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    if (defaultAvatarId) {
      setAvatarId(defaultAvatarId);
    }
  }, [defaultAvatarId]);

  useEffect(() => {
    if (lastActivity) {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }

      inactivityTimeout.current = setTimeout(
        () => {
          console.log("Session ended due to inactivity");
          endSession();
        },
        3 * 60 * 1000,
      );
    }

    return () => {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
    };
  }, [lastActivity]);

  async function saveTranscription() {
    if (!streamId) return;

    try {
      const response = await fetch("/api/save-transcription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId,
          transcription,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save transcription");
      }
    } catch (error) {
      console.error("Error saving transcription:", error);
    }
  }

  const handleTranscription = async (
    audioBlob: Blob,
    type: "user" | "avatar",
  ) => {
    try {
      const currentStreamId = streamIdRef.current || streamId;

      if (!currentStreamId) {
        console.error("No streamId available for transcription");

        return;
      }

      const formData = new FormData();

      formData.append(
        "audio",
        audioBlob,
        `audio.${audioBlob.type.split("/")[1]}`,
      );
      formData.append("type", type);
      formData.append("streamId", currentStreamId);

      fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          if (!response.ok) {
            console.error("Transcription API error:", await response.text());

            return;
          }
          const { transcription: text } = await response.json();

          console.log("Transcription successful:", { text });

          setTranscription((prev) => {
            const lastEntry = [...prev]
              .reverse()
              .find((entry) => entry.type === type && !entry.transcription);

            if (lastEntry) {
              const updated = [...prev];
              const index = updated.lastIndexOf(lastEntry);

              updated[index] = { ...updated[index], transcription: text };

              return updated;
            }

            return prev;
          });

          // Save after updating transcription
          await saveTranscription();
        })
        .catch((error) => {
          console.error("Error in transcription:", error);
        });
    } catch (error) {
      console.error("Error preparing transcription:", error);
    }
  };

  const setupMediaRecorder = (stream: MediaStream, type: "user" | "avatar") => {
    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
      audioBitsPerSecond: 128000,
    });
    const chunksRef =
      type === "user" ? userAudioChunksRef : avatarAudioChunksRef;

    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log(`Received ${type} audio chunk of size: ${event.data.size}`);
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

      console.log(`Processing ${type} audio of size: ${audioBlob.size}`);
      await handleTranscription(audioBlob, type);

      // If this was the user recorder, restart continuous user recording
      if (type === "user") {
        startContinuousUserRecording();
      }
    };

    return recorder;
  };

  // Start continuous user recording
  const startContinuousUserRecording = useCallback(() => {
    if (!userMediaRef.current) return;
    if (userMediaRecorderRef.current?.state === "recording") {
      userMediaRecorderRef.current.stop();
    }
    userAudioChunksRef.current = [];
    userMediaRecorderRef.current = setupMediaRecorder(
      userMediaRef.current,
      "user",
    );
    // Continuous recording without timeslice
    userMediaRecorderRef.current.start();
    console.log("Started continuous user recording");
  }, []);

  const stopRecording = useCallback((type: "user" | "avatar") => {
    const recorderRef =
      type === "user" ? userMediaRecorderRef : avatarMediaRecorderRef;

    if (recorderRef.current?.state === "recording") {
      console.log(`Stopping ${type} recording`);
      recorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    if (avatar.current) {
      const handleUserSpeech = () => {
        console.log(">>>>> User started talking");
        // Do NOT start recording here; we are continuously recording user audio
        setTranscription((prev) => [
          ...prev,
          {
            timestamp: getPSTTimestamp(),
            type: "user",
            content: "Started speaking",
          },
        ]);
        handleActivity();
      };

      const handleUserStop = () => {
        console.log(">>>>> User stopped talking");
        // Stop the continuous recorder to finalize the transcription
        if (userMediaRecorderRef.current?.state === "recording") {
          userMediaRecorderRef.current.stop();
        }
        setTranscription((prev) => [
          ...prev,
          {
            timestamp: getPSTTimestamp(),
            type: "user",
            content: "Stopped speaking",
          },
        ]);
      };

      const handleAvatarSpeech = () => {
        console.log("Avatar started talking");
        if (!destinationRef.current?.stream) {
          console.error("Avatar audio stream not ready");

          return;
        }
        // For avatar, we start fresh recording each utterance
        if (avatarMediaRecorderRef.current?.state === "recording") {
          avatarMediaRecorderRef.current.stop();
        }
        avatarMediaRecorderRef.current = setupMediaRecorder(
          destinationRef.current.stream,
          "avatar",
        );
        avatarMediaRecorderRef.current.start();
        console.log(`Started recording for avatar`);

        setTranscription((prev) => [
          ...prev,
          {
            timestamp: getPSTTimestamp(),
            type: "avatar",
            content: "Started speaking",
          },
        ]);
        handleActivity();
      };

      const handleAvatarStop = () => {
        console.log("Avatar stopped talking");
        stopRecording("avatar");
        setTranscription((prev) => [
          ...prev,
          {
            timestamp: getPSTTimestamp(),
            type: "avatar",
            content: "Stopped speaking",
          },
        ]);
      };

      avatar.current.on(StreamingEvents.USER_START, handleUserSpeech);
      avatar.current.on(StreamingEvents.USER_STOP, handleUserStop);
      avatar.current.on(
        StreamingEvents.AVATAR_START_TALKING,
        handleAvatarSpeech,
      );
      avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStop);

      return () => {
        if (avatar.current) {
          avatar.current.off(StreamingEvents.USER_START, handleUserSpeech);
          avatar.current.off(StreamingEvents.USER_STOP, handleUserStop);
          avatar.current.off(
            StreamingEvents.AVATAR_START_TALKING,
            handleAvatarSpeech,
          );
          avatar.current.off(
            StreamingEvents.AVATAR_STOP_TALKING,
            handleAvatarStop,
          );
        }
      };
    }
  }, [avatar.current, handleActivity, stopRecording]);

  const [knowledgeId, setKnowledgeId] = useState<string>(knowledgeBase || "");
  const [language, setLanguage] = useState<string>("en");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<StartAvatarResponse>();
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token);

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }

    return "";
  }

  async function startSession() {
    setIsLoadingSession(true);
    try {
      const newToken = await fetchAccessToken();
      const audioContext = new AudioContext({
        sampleRate: 48000,
        latencyHint: "interactive",
      });

      await audioContext.audioWorklet.addModule("/audioWorklet.js");

      // Get user audio for user's speech
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      userMediaRef.current = userMedia;

      // Start continuous user recording immediately
      startContinuousUserRecording();

      avatar.current = new StreamingAvatar({ token: newToken });

      avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        // If stream disconnects unexpectedly, stop any ongoing recordings
        stopRecording("avatar");
        // Stopping user continuous recorder
        if (userMediaRecorderRef.current?.state === "recording") {
          userMediaRecorderRef.current.stop();
        }
        endSession();
      });

      avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
        setStream(event.detail);
        // Use the MediaStream's id directly as streamId
        streamIdRef.current = event.detail.id;
        setStreamId(event.detail.id);

        try {
          audioContextRef.current = new AudioContext();
          destinationRef.current =
            audioContextRef.current.createMediaStreamDestination();

          const avatarStreamSource =
            audioContextRef.current.createMediaStreamSource(event.detail);

          // Only connect avatar audio to destination for recording
          avatarStreamSource.connect(destinationRef.current);

          if (mediaStream.current) {
            mediaStream.current.srcObject = event.detail;
            mediaStream.current.onloadedmetadata = () => {
              mediaStream.current!.play();
            };
          }

          console.log(
            "Avatar audio context initialized from STREAM_READY MediaStream",
          );
        } catch (error) {
          console.error(
            "Error initializing avatar audio from STREAM_READY:",
            error,
          );
        }
      });

      avatar.current.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
        setIsUserTalking(true);
      });
      avatar.current.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
        setIsUserTalking(false);
      });

      try {
        const res = await avatar.current.createStartAvatar({
          quality: AvatarQuality.Low,
          avatarName: avatarId,
          knowledgeBase: knowledgeBase,
          voice: {
            rate: 1.5,
            emotion: VoiceEmotion.EXCITED,
          },
          language: language,
          disableIdleTimeout: true,
        });

        setData(res);
        await avatar.current.startVoiceChat({ useSilencePrompt: false });

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (introMessage && introMessage.trim()) {
          console.log("Sending intro message:", introMessage);
          try {
            await avatar.current.speak({
              text: introMessage,
              taskType: TaskType.REPEAT,
              taskMode: TaskMode.SYNC,
            });
          } catch (e) {
            console.error("Error sending intro message:", e);
          }
        }
      } catch (error) {
        console.error("Error starting avatar session:", error);
        setDebug(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      } finally {
        setIsLoadingSession(false);
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      setIsLoadingSession(false);
    }
  }

  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current
      .speak({ text: "", taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC })
      .catch((e) => {
        setDebug(e.message);
      });
    setIsLoadingRepeat(false);
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current.interrupt().catch((e) => {
      setDebug(e.message);
    });
  }

  async function endSession() {
    // Stop any ongoing recordings before ending session
    stopRecording("avatar");
    if (userMediaRecorderRef.current?.state === "recording") {
      userMediaRecorderRef.current.stop();
    }

    await avatar.current?.stopAvatar();
    await saveTranscription();
    setStream(undefined);
    setStreamId(undefined);
    setData(undefined);
    setTranscription([]);
  }

  const handleToggleMic = async () => {
    if (avatar.current) {
      if (!isMicMuted) {
        await avatar.current.closeVoiceChat();
      } else {
        await avatar.current.startVoiceChat();
      }
      setIsMicMuted(!isMicMuted);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    setLastMouseMove(Date.now());
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      // On unmount, end the session properly
      stopRecording("avatar");
      if (userMediaRecorderRef.current?.state === "recording") {
        userMediaRecorderRef.current.stop();
      }
      endSession();
    };
  }, [stopRecording]);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col justify-center items-center gap-4">
          {stream ? (
            <div
              ref={containerRef}
              className={`relative w-full ${isFullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}
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
                    showControls ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    width: "95%",
                    maxWidth: "600px",
                  }}
                >
                  <div className="flex justify-center gap-2 p-2 sm:p-3 bg-black/50 rounded-lg backdrop-blur-sm">
                    <Button
                      className="btn-solid rounded-lg min-w-0 px-2 sm:px-4"
                      size="sm"
                      variant="shadow"
                      onPress={handleToggleMic}
                    >
                      {isMicMuted ? "Unmute" : "Mute"}
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
                    alt={`${AVATARS.find((a) => a.avatar_id === avatarId)?.name} avatar preview`}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={`/${AVATARS.find((a) => a.avatar_id === avatarId)?.name}_avatar_preview.webp`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  className="w-full text-white"
                  classNames={{
                    label: "text-white",
                    value: "text-white",
                    trigger: "bg-gray-800 data-[hover=true]:bg-gray-700",
                    listbox: "bg-gray-800",
                    popoverContent: "bg-gray-800",
                  }}
                  label="Select Language"
                  selectedKeys={[language]}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {STT_LANGUAGE_LIST.map((lang) => (
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
    </div>
  );
}
