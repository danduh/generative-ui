import { VoiceToken } from './AvatarService';
import { RefObject } from 'react';

export const startWebRTC = async (
  voiceToken: VoiceToken,
  videoRef: RefObject<HTMLVideoElement>,
  audioRef: RefObject<HTMLAudioElement>
) => {
  // if (peerConnectionRef.current) return peerConnectionRef.current; // Prevent multiple starts

  console.log('Starting WebRTC');
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [voiceToken.iceServerUrl],
        username: voiceToken.iceServerUsername,
        credential: voiceToken.iceServerCredential,
      },
    ],
  });

  peerConnection.ontrack = (event) => {
    console.log('Track received:', event);

    if (event.track.kind === 'video') {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.onloadedmetadata = function (e) {
          videoRef.current?.play();
        };
      }
    } else if (event.track.kind === 'audio') {
      if (audioRef.current) {
        audioRef.current.srcObject = event.streams[0];
      }
    }
  };

  peerConnection.addTransceiver('video', { direction: 'sendrecv' });
  peerConnection.addTransceiver('audio', { direction: 'sendrecv' });
  peerConnection.createDataChannel('eventChannel');

  peerConnection.oniceconnectionstatechange = () => {
    console.log(`WebRTC status: ${peerConnection.iceConnectionState}`);
  };
  return peerConnection;
};
