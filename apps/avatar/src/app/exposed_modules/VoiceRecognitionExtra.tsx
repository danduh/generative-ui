import React from 'react';
import { ConfigProvider } from '../context';
import SpeechRecognitionComponent from '../components/VoiceRecognizer';

export interface VoiceRecogniseComponent {
  setNextTextToSpeak: any;
  setSpeakingText: any;
}

const VoiceRecognitionExtra: React.FC<VoiceRecogniseComponent> = ({
  setNextTextToSpeak,
  setSpeakingText,
}) => {
  return (
    <ConfigProvider>
      <SpeechRecognitionComponent
        setNextTextToSpeak={setNextTextToSpeak}
        setSpeakingText={setSpeakingText}
      />
    </ConfigProvider>
  );
};

export default VoiceRecognitionExtra;
