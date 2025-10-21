import React, { useEffect, useRef, useState } from 'react';
import {
  getToken,
  speakNext,
  startAvatar,
  VoiceToken,
} from '../services/AvatarService';
import { AvatarConfig, SttTtsConfig } from '../context';
import SpeechRecognitionComponent from './VoiceRecognizer';
import { AvatarSynthesizer } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/AvatarSynthesizer';
import { startWebRTC } from '../services/WebRTC';

//const INIT_TEXT_TO_SPEAK = "Ah, I see you've asked for a live representative. Fascinating choice. Do you really think we’d have someone standing by to answer your questions? After all, we've spent an absurd amount of money and countless hours of manpower creating this AI to handle everything for you. So, please, be a sport and appreciate the digital brilliance we’ve so generously provided. It’s here to serve you… whether you like it or not.";
const INIT_TEXT_TO_SPEAK = 'Hello there';

interface VideoStreamProps {
  avatarConfig: AvatarConfig;
  sttTtsConfig: SttTtsConfig;
}

const VideoStream: React.FC<VideoStreamProps> = ({
  sttTtsConfig,
  avatarConfig,
}) => {
  const [nextTextToSpeak, setNextTextToSpeak] = useState(INIT_TEXT_TO_SPEAK);
  const [isSpeaking, setIisSpeaking] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const avatarSynthesizerRef = useRef<AvatarSynthesizer | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  let voiceToken: VoiceToken;
  let latestText = '';

  useEffect(() => {
    console.log('MAIN EFFECT', nextTextToSpeak, isSpeaking, latestText);
    if (isSpeaking || latestText === nextTextToSpeak) return;
    // if (peerConnectionRef.current) peerConnectionRef.current.close();

    setIisSpeaking(true);
    latestText = nextTextToSpeak;
    const startAllThis = async () => {
      if (!voiceToken?.iceServerCredential) voiceToken = await getToken();

      if (!peerConnectionRef.current) {
        peerConnectionRef.current = await startWebRTC(
          voiceToken,
          videoRef,
          audioRef
        );
      }

      if (!avatarSynthesizerRef.current) {
        avatarSynthesizerRef.current = await startAvatar(
          avatarConfig,
          sttTtsConfig,
          peerConnectionRef.current
        );
      }
      speakNext(
        nextTextToSpeak,
        avatarSynthesizerRef.current,
        0,
        setIisSpeaking
      );
    };
    startAllThis();
  }, [nextTextToSpeak]);

  useEffect(() => {
    console.log('nextTextToSpeak', nextTextToSpeak);
  }, [nextTextToSpeak]);

  useEffect(() => {
    console.log('isSpeaking', isSpeaking);
  }, [isSpeaking]);

  return (
    <>
      <div
        id="remoteVideo"
        className="w-[150px] h-[150px] overflow-hidden relative border border-salmon"
      >
        <video
          ref={videoRef}
          id="videoPlayer"
          autoPlay={true}
          playsInline
          style={{
            height: '500px',
            position: 'absolute',
            top: '-121px',
            left: '-178px',
            minWidth: '500px',
          }}
        ></video>
        <audio ref={audioRef} id="audioPlayer" autoPlay></audio>
      </div>
      <SpeechRecognitionComponent setNextTextToSpeak={setNextTextToSpeak} />
    </>
  );
};

export default VideoStream;
