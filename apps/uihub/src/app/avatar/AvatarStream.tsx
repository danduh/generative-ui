import React, { useEffect, useRef, useState } from 'react';
import {
  getToken,
  speakNext,
  startAvatar,
  VoiceToken,
} from './AvatarService';

import { AvatarSynthesizer } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/AvatarSynthesizer';
import { startWebRTC } from './WebRTC';
import { AVATAR_CONFIG_INIT, STT_TTS_INIT } from './const';

const INIT_TEXT_TO_SPEAK =
  'A live rep? After all we spent on this AI? Come on, embrace the brilliance—it’s here to serve you, like it or not.';
// const INIT_TEXT_TO_SPEAK = 'Hello there';

const avatarConfig = AVATAR_CONFIG_INIT;
const sttTtsConfig = STT_TTS_INIT;

const VideoStream: React.FC<any> = ({textToSpeak}) => {
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
    setNextTextToSpeak(textToSpeak)
  }, [textToSpeak]);

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
    </>
  );
};

export default VideoStream;
