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
}

export default function InteractiveAvatar({ defaultAvatarId, knowledgeBase }: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [avatarId, setAvatarId] = useState<string>(defaultAvatarId || "");
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
        knowledgeBase: knowledgeBase, // Use the knowledge base directly
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
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug(error.message);
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
              className="h-[500px] max-w-full w-full justify-center items-center flex rounded-lg overflow-hidden relative"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowControls(false)}
            >
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              >
                <track kind="captions" />
              </video>
              <div 
                className={`absolute transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}
              >
                <div className="flex gap-3 p-4 bg-black/50 rounded-lg backdrop-blur-sm">
                  <Button
                    className="btn-solid rounded-lg"
                    size="lg"
                    variant="shadow"
                    onClick={handleToggleMic}
                  >
                    {isMicMuted ? "Unmute Mic" : "Mute Mic"}
                  </Button>
                  <Button
                    className="btn-solid rounded-lg"
                    size="lg"
                    variant="shadow"
                    onClick={handleInterrupt}
                  >
                    Interrupt
                  </Button>
                  <Button
                    className="btn-danger rounded-lg"
                    size="lg"
                    variant="shadow"
                    onClick={endSession}
                  >
                    End Session
                  </Button>
                  <Button
                    className="btn-solid rounded-lg"
                    size="lg"
                    variant="shadow"
                    onClick={handleToggleFullscreen}
                    isIconOnly
                  >
                    <BsArrowsFullscreen className="text-xl" />
                  </Button>
                </div>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/avatar_preview.png"
                  alt="AI Tutor Preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col gap-4 w-full">
                <Select
                  label="Select language"
                  placeholder="Select language"
                  className="max-w-xs"
                  selectedKeys={[language]}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                  }}
                  defaultSelectedKeys={["en"]}
                >
                  {STT_LANGUAGE_LIST.map((lang) => (
                    <SelectItem key={lang.key} value={lang.key}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </Select>
                <div className="flex flex-col gap-4">
                  <Button
                    className="btn-solid w-full rounded-lg"
                    size="lg"
                    onClick={startSession}
                  >
                    Start Session
                  </Button>
                </div>
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
