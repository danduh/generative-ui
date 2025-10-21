import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StartAvatarResponse,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';

const NEW_TOKEN =
  'YWIzMDdmYzc5MDNmNDRjZGI1YjVkMDE1YjM4MTg0MGEtMTY5NTA1ODgyNA==';

const HeyGenAvatar: React.FC<any> = ({ textToSpeak }) => {
  const [stream, setStream] = useState<MediaStream>();
  const [knowledgeId, setKnowledgeId] = useState<string>('');
  const [avatarId, setAvatarId] = useState<string>('Santa_Fireplace_Front_public');
  const [language, setLanguage] = useState<string>('en');

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>('');
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [isUserTalking, setIsUserTalking] = useState(false);

  async function startSession() {
    const newToken = NEW_TOKEN;

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log('Avatar started talking', e);
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log('Avatar stopped talking', e);
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log('Stream disconnected');
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log('>>>>> Stream ready:', event.detail);
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log('>>>>> User started talking:', event);
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log('>>>>> User stopped talking:', event);
      setIsUserTalking(false);
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeId: knowledgeId, // Or use a custom `knowledgeBase`.
        voice: {
          rate: 1.5, // 0.5 ~ 1.5
          emotion: VoiceEmotion.FRIENDLY, // elevenlabsSettings: {
          //   stability: 1,
          //   similarity_boost: 1,
          //   style: 1,
          //   use_speaker_boost: false,
          // },
        },
        language: language,
        disableIdleTimeout: true,
      });
      setData(res);
    } catch (error) {
      console.error('Error starting avatar session:', error);
    } finally {
      console.log('LOADED');
    }
  }

  async function handleSpeak(textToSpeak: string) {
    if (!avatar.current) {
      return;
    }
    // speak({ text: text, task_type: TaskType.REPEAT })
    await avatar.current
      .speak({
        text: textToSpeak,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      })
      .catch((e) => {
        console.error(e.message);
      });
  }

  async function handleInterrupt() {
    await avatar?.current?.interrupt().catch((e) => {
      console.log(e.message);
    });
  }

  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  // const previousText = usePrevious(text);
  // useEffect(() => {
  //   if (!previousText && text) {
  //     avatar.current?.startListening();
  //   } else if (previousText && !text) {
  //     avatar?.current?.stopListening();
  //   }
  // }, [text, previousText]);

  useEffect(() => {
    console.log('TEXTTOSPEAK', textToSpeak);
    setText(textToSpeak);
    handleSpeak(textToSpeak);
  }, [textToSpeak]);

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
      };
    }
  }, [mediaStream, stream]);

  return (
    <div>
      {stream && (
        <div className="h-[500px] w-[900px] justify-center items-center flex rounded-lg overflow-hidden">
          <video
            ref={mediaStream}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          >
            <track kind="captions" />
          </video>
        </div>
      )}
      <button
        className="bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white"
        onClick={startSession}
      >
        Start session
      </button>
    </div>
  );
};

export default HeyGenAvatar;
