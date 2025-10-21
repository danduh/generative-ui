import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { COG_SVC_REGION, COG_SVC_SUBSCRIPTION_KEY } from './const';

export const getSpeechRecognizer = () => {
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    COG_SVC_SUBSCRIPTION_KEY,
    COG_SVC_REGION
  );
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  return recognizer;
};
