import { AvatarConfig, SttTtsConfig } from './AvatarService';

export const COG_SVC_SUBSCRIPTION_KEY: string =
  process.env.REACT_APP_SPEACH_API_KEY || '';
export const COG_SVC_REGION: string = process.env.REACT_APP_SPEACH_REGION || '';

export const AVATAR_CONFIG_INIT: AvatarConfig = {
  character: 'lisa',
  style: 'casual-sitting',
  customized: false,
  autoReconnect: false,
  useLocalVideoForIdle: false,
};

export const STT_TTS_INIT: SttTtsConfig = {
  locales: 'en-US,de-DE,es-ES,fr-FR,it-IT,ja-JP,ko-KR,zh-CN',
  ttsVoice: 'en-US-AvaMultilingualNeural',
  customVoiceEndpointId: '',
  personalVoiceSpeakerProfileID: '',
  continuousConversation: false,
};
