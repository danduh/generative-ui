import React, { useState } from 'react';
import AvatarStream from './AvatarStream';
import { SpeechResSettings } from './settings/SpeechResSettings';
import { OpenAISettings } from './settings/OpenAISettings';
import { SpeechSettings } from './settings/SpeechSettings';
import { AvatarConfig } from './settings/AvatarConfig';
import { useConfig } from '../context';

const TalkingAvatarChat: React.FC<any> = ({
  standAlong,
}: {
  standAlong?: boolean;
}) => {
  const { avatarConfig, sttTtsConfig } = useConfig();
  const [avatarReady, setAvatarReady] = useState<boolean>(false);

  const initAvatar = async () => {
    if (avatarReady) return;
    setAvatarReady(true);
  };

  if (standAlong) {
    console.log('AutoStart for AVATAR');
    initAvatar();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Talking Avatar Chat Demo</h1>
      {!avatarReady && (
        <div id="configuration" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4">
            <SpeechResSettings />
            <OpenAISettings />
            <SpeechSettings />
            <AvatarConfig />
          </div>

          <button
            onClick={initAvatar}
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-600"
          >
            Open Avatar Session
          </button>
        </div>
      )}
      {avatarReady && (
        <AvatarStream avatarConfig={avatarConfig} sttTtsConfig={sttTtsConfig} />
      )}
    </div>
  );
};
export default TalkingAvatarChat;
