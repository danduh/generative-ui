import React, { MutableRefObject, useRef, useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/SpeechRecognizer';
import { getSpeechRecognizer } from './SpeachService';

export interface SRComponent {
  // Final spoken text
  setNextTextToSpeak: any;
  // Continuable udated text as user speaks
  setSpeakingText?: (text: string) => void;
}

const SpeechRecognitionComponent: React.FC<SRComponent> = ({
  setNextTextToSpeak,
  setSpeakingText,
}) => {
  const [listening, setListening] = useState(false);
  const recognizer: MutableRefObject<SpeechRecognizer | null> =
    useRef<SpeechRecognizer>(null);

  const startRecognition = () => {
    recognizer.current = getSpeechRecognizer();
    if (listening) return;

    // In progress
    recognizer.current.recognizing = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
        if (setSpeakingText) setSpeakingText(e.result.text);
      }
    };

    recognizer.current.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        setNextTextToSpeak(e.result.text);
      }
    };

    recognizer.current.startContinuousRecognitionAsync(
      () => setListening(true),
      (err) => console.error('Error starting recognition:', err)
    );
  };

  const stopRecognition = () => {
    if (!listening) return;

    recognizer.current?.stopContinuousRecognitionAsync(
      () => {
        setListening(false);
        recognizer.current?.close();
      },
      (err) => console.error('Error stopping recognition:', err)
    );
  };

  const iconColor = listening ? '#EA332F' : '#A956F7';

  return (
    <button onClick={listening ? stopRecognition : startRecognition}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.14"
          d="M24 45C35.598 45 45 35.598 45 24C45 12.402 35.598 3 24 3C12.402 3 3 12.402 3 24C3 35.598 12.402 45 24 45Z"
          stroke={iconColor}
          stroke-width="6"
        ></path>
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="18"
          fill={iconColor}
        ></rect>
        <path
          d="M30.25 23C30.6297 23 30.9435 23.2822 30.9932 23.6482L31 23.75V24.25C31 27.8094 28.245 30.7254 24.751 30.9817L24.75 33.25C24.75 33.6642 24.4142 34 24 34C23.6203 34 23.3065 33.7178 23.2568 33.3518L23.25 33.25L23.25 30.9818C19.8332 30.7316 17.1228 27.938 17.0041 24.4863L17 24.25V23.75C17 23.3358 17.3358 23 17.75 23C18.1297 23 18.4435 23.2822 18.4932 23.6482L18.5 23.75V24.25C18.5 27.077 20.7344 29.3821 23.5336 29.4956L23.75 29.5H24.25C27.077 29.5 29.3821 27.2656 29.4956 24.4664L29.5 24.25V23.75C29.5 23.3358 29.8358 23 30.25 23ZM24 14C26.2091 14 28 15.7909 28 18V24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24V18C20 15.7909 21.7909 14 24 14Z"
          fill="white"
        ></path>
      </svg>
    </button>
  );
};

export default SpeechRecognitionComponent;



