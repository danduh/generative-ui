import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { AvatarSynthesizer } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/AvatarSynthesizer';
import { COG_SVC_REGION, COG_SVC_SUBSCRIPTION_KEY } from './const';
import { Dispatch, SetStateAction } from 'react';

export type AvatarConfig = {
  character: string;
  style: string;
  customized: boolean;
  autoReconnect: boolean;
  useLocalVideoForIdle: boolean;
};

export interface STT {
  locales: string; //'en-US,de-DE,es-ES,fr-FR,it-IT,ja-JP,ko-KR,zh-CN';
  ttsVoice: string; //'en-US-AvaMultilingualNeural';
  customVoiceEndpointId: string;
  personalVoiceSpeakerProfileID: string;
}

export type SttTtsConfig = {
  locales: string;
  ttsVoice: string;
  customVoiceEndpointId: string;
  personalVoiceSpeakerProfileID: string;
  continuousConversation: boolean;
};

export interface VoiceToken {
  iceServerUrl: string;
  iceServerUsername: string;
  iceServerCredential: string;
}

const videoFormat: SpeechSDK.AvatarVideoFormat =
  new SpeechSDK.AvatarVideoFormat(
    /*codec*/ 'h264',
    /*bitrate*/ 2000000,
    /*width*/ 1920,
    /*height*/ 1080
  );

function htmlEncode(text: string) {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match]);
}

export const getToken = async (): Promise<VoiceToken> => {
  const url = `https://${COG_SVC_REGION}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`;

  return await fetch(url, {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': COG_SVC_SUBSCRIPTION_KEY,
    },
  })
    .then((response) => response.json())
    .then((responseData) => {
      const iceServerUrl = responseData.Urls[0];
      const iceServerUsername = responseData.Username;
      const iceServerCredential = responseData.Password;
      return { iceServerUrl, iceServerUsername, iceServerCredential };
    });
};

export const startAvatar = async (
  avatar: AvatarConfig,
  stt: STT,
  peerConnection: RTCPeerConnection
) => {
  const speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(
    COG_SVC_SUBSCRIPTION_KEY,
    COG_SVC_REGION
  );

  const avatarConfig = new SpeechSDK.AvatarConfig(
    avatar.character,
    avatar.style,
    videoFormat
  );
  const avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(
    speechSynthesisConfig,
    avatarConfig
  );
  avatarSynthesizer.avatarEventReceived = function (s, e) {
    let offsetMessage =
      ', offset from session start: ' + e.offset / 10000 + 'ms.';
    if (e.offset === 0) {
      offsetMessage = '';
    }

    console.log('Event received: ' + e.description + offsetMessage);
  };

  const speechRecognitionConfig = SpeechSDK.SpeechConfig.fromEndpoint(
    new URL(
      `wss://${COG_SVC_REGION}.stt.speech.microsoft.com/speech/universal/v2`
    ),
    COG_SVC_SUBSCRIPTION_KEY
  );
  speechRecognitionConfig.setProperty(
    SpeechSDK.PropertyId.SpeechServiceConnection_LanguageIdMode,
    'Continuous'
  );
  const sttLocales = stt.locales.split(',');
  const autoDetectSourceLanguageConfig =
    SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(sttLocales);

  const speechRecognizer = SpeechSDK.SpeechRecognizer.FromConfig(
    speechRecognitionConfig,
    autoDetectSourceLanguageConfig,
    SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()
  );

  await avatarSynthesizer
    .startAvatarAsync(peerConnection)
    .then((r: any) => {
      if (r.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log('] Avatar started. Result ID: ' + r.resultId);
      } else {
        console.log('] Unable to start avatar. Result ID: ' + r.resultId);
        if (r.reason === SpeechSDK.ResultReason.Canceled) {
          const cancellationDetails =
            SpeechSDK.CancellationDetails.fromResult(r);
          if (
            cancellationDetails.reason === SpeechSDK.CancellationReason.Error
          ) {
            console.log(cancellationDetails.errorDetails);
          }
          console.log(
            'Unable to start avatar: ' + cancellationDetails.errorDetails
          );
        }
      }
    })
    .catch((error) => {
      console.log('] Avatar failed to start. Error: ' + error);
    });

  return avatarSynthesizer;
  // setDataSources(azureCogSearchEndpoint, azureCogSearchApiKey, azureCogSearchIndexName)
};

/**
 *
 * @param text
 * @param endingSilenceMs
 * @param avatarSynthesizer
 * @param setIisSpeaking
 */
export const speakNext = (
  text: string,
  avatarSynthesizer: AvatarSynthesizer,
  endingSilenceMs = 1000,
  setIisSpeaking: Dispatch<SetStateAction<boolean>>
) => {
  const ttsVoice = 'en-US-AvaMultilingualNeural';
  const volumeLevel = '2'; // Set the volume level (0.0 to 2.0, where 1.0 is the default)
  const personalVoiceSpeakerProfileID = '';
  let ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'>
<voice name='${ttsVoice}'>
<mstts:ttsembedding speakerProfileId='${personalVoiceSpeakerProfileID}'><mstts:leadingsilence-exact value='0'/>
<prosody rate='1.2' volume='${volumeLevel}'>
        ${htmlEncode(text)}
      </prosody></mstts:ttsembedding></voice></speak>`;
  if (endingSilenceMs > 0) {
    ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${ttsVoice}'><mstts:ttsembedding speakerProfileId='${personalVoiceSpeakerProfileID}'><mstts:leadingsilence-exact value='0'/><prosody volume='${volumeLevel}'>${htmlEncode(
      text
    )}<break time='${endingSilenceMs}ms' /></prosody></mstts:ttsembedding></voice></speak>`;
  }

  avatarSynthesizer
    .speakSsmlAsync(ssml)
    .then((result) => {
      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log(
          `Speech synthesized to speaker for text [ ${text} ]. Result ID: ${result.resultId}`
        );
        setIisSpeaking(false);
      } else {
        console.log(
          `Error occurred while speaking the SSML. Result ID: ${result.resultId}`
        );
      }
    })
    .catch((error) => {
      console.log(`Error occurred while speaking the SSML: [ ${error} ]`);
    });
};
