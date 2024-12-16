import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents, TaskMode, TaskType, VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";
import Image from 'next/image';
import { BsArrowsFullscreen } from "react-icons/bs";

import {AVATARS, STT_LANGUAGE_LIST} from "@/app/lib/constants";

interface InteractiveAvatarProps {
  defaultAvatarId?: string;
  knowledgeBase?: string;
  introMessage?: string;
}

export default function InteractiveAvatar({ defaultAvatarId, knowledgeBase, introMessage }: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [avatarId, setAvatarId] = useState<string>(defaultAvatarId || "");

  useEffect(() => {
    if (defaultAvatarId) {
      setAvatarId(defaultAvatarId);
    }
  }, [defaultAvatarId]);

  const [knowledgeId, setKnowledgeId] = useState<string>(knowledgeBase || "");
  const [language, setLanguage] = useState<string>('en');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<StartAvatarResponse>();
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }

    return "";
  }

  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("Avatar stopped talking", e);
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log(">>>>> User started talking:", event);
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
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
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false
      });

      // Send intro message if provided
      if (introMessage) {
        await avatar.current.speak({ 
          text: introMessage, 
          taskType: TaskType.REPEAT, 
          taskMode: TaskMode.SYNC 
        }).catch((e) => {
          console.error("Error sending intro message:", e);
        });
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoadingSession(false);
    }
  }
  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    // speak({ text: text, task_type: TaskType.REPEAT })
    await avatar.current.speak({ text: "", taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC }).catch((e) => {
      setDebug(e.message);
    });
    setIsLoadingRepeat(false);
  }
  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current
      .interrupt()
      .catch((e) => {
        setDebug(e.message);
      });
  }
  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
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

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

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
                    maxWidth: '600px'
                  }}
                >
                  <div className="flex justify-center gap-2 p-2 sm:p-3 bg-black/50 rounded-lg backdrop-blur-sm">
                    <Button
                      className="btn-solid rounded-lg min-w-0 px-2 sm:px-4"
                      size="sm"
                      variant="shadow"
                      onClick={handleToggleMic}
                    >
                      {isMicMuted ? "Unmute" : "Mute"}
                    </Button>
                    <Button
                      className="btn-solid rounded-lg min-w-0 px-2 sm:px-4"
                      size="sm"
                      variant="shadow"
                      onClick={handleInterrupt}
                    >
                      Stop
                    </Button>
                    <Button
                      className="btn-danger rounded-lg min-w-0 px-2 sm:px-4"
                      size="sm"
                      variant="shadow"
                      onClick={endSession}
                    >
                      End
                    </Button>
                    <Button
                      className="btn-solid rounded-lg min-w-0 w-8 sm:w-10"
                      size="sm"
                      variant="shadow"
                      onClick={handleToggleFullscreen}
                      isIconOnly
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
                    src={`/${AVATARS.find(a => a.avatar_id === avatarId)?.name}_avatar_preview.webp`}
                    alt={`${AVATARS.find(a => a.avatar_id === avatarId)?.name} avatar preview`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Select Language"
                  selectedKeys={[language]}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-white"
                  classNames={{
                    label: "text-white",
                    value: "text-white",
                    trigger: "bg-gray-800 data-[hover=true]:bg-gray-700",
                    listbox: "bg-gray-800",
                    popoverContent: "bg-gray-800"
                  }}
                >
                  {STT_LANGUAGE_LIST.map((lang) => (
                    <SelectItem 
                      key={lang.key}
                      value={lang.value}
                      className="text-white data-[hover=true]:bg-gray-700"
                      textValue={lang.label}
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </Select>
                <Button
                  className="btn-primary w-full h-14 text-lg"
                  size="lg"
                  onClick={startSession}
                  isLoading={isLoadingSession}
                >
                  Start Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-[500px] max-w-full w-full justify-center items-center flex rounded-lg overflow-hidden relative bg-gray-100 dark:bg-gray-900">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" color="primary" />
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
