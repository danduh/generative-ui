import React, { ChangeEvent } from 'react';
import { useConfig } from '../../context';
import { characterData } from './avatarCharacters';

export const AvatarConfig: React.FC = () => {
  const { avatarConfig, setAvatarConfig } = useConfig();

  const handleCharacterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setAvatarConfig((prevConfig) => ({
      ...prevConfig,
      character: value,
      style: ''
    }));
  };

  const handleStyleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setAvatarConfig((prevConfig) => ({
      ...prevConfig,
      style: value,
    }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = event.target;

    setAvatarConfig((prevConfig) => ({
      ...prevConfig,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };
  console.log(avatarConfig);
  return (
    <section className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold">Avatar Configuration</h2>

      <div className="flex space-x-4 mt-4">
        <div className="flex-1">
          <label
            className="block text-sm mb-2"
            htmlFor="talkingAvatarCharacter"
          >
            Select Character:
          </label>
          <select
            id="talkingAvatarCharacter"
            value={avatarConfig.character}
            onChange={handleCharacterChange}
            className="block w-full p-1 border rounded"
          >
            <option value="">--Select a character--</option>
            {characterData.map((character) => (
              <option key={character.character} value={character.character}>
                {character.character}
              </option>
            ))}
          </select>
        </div>

        {avatarConfig.character && (
          <div className="flex-1">
            <label className="block text-sm mb-2" htmlFor="talkingAvatarStyle">
              Select Style:
            </label>
            <select
              id="talkingAvatarStyle"
              value={avatarConfig.style}
              onChange={handleStyleChange}
              className="block w-full p-1 border rounded"
            >
              <option value="">--Select a style--</option>
              {(characterData.find((char) => char.character === avatarConfig.character)?.styles || []).map(
                (style) => (
                  <option key={style.style} value={style.style}>
                    {style.style}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {/*{avatarConfig.style && (*/}
        {/*  <div className="flex-1">*/}
        {/*    <label className="block text-sm mb-2" htmlFor="gestures">*/}
        {/*      Gestures:*/}
        {/*    </label>*/}
        {/*    <select id="gestures" className="block w-full p-1 border rounded">*/}
        {/*      {characterData[avatarConfig.character]?.styles[avatarConfig.style]?.map(*/}
        {/*        (gesture) => (*/}
        {/*          <option key={gesture} value={gesture}>*/}
        {/*            {gesture}*/}
        {/*          </option>*/}
        {/*        )*/}
        {/*      )}*/}
        {/*    </select>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            id="customizedAvatar"
            checked={avatarConfig.customized}
            onChange={handleInputChange}
            className="mr-2"
          />
          Custom Avatar
        </label>
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            id="autoReconnectAvatar"
            checked={avatarConfig.autoReconnect}
            onChange={handleInputChange}
            className="mr-2"
          />
          Auto Reconnect
        </label>
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            id="useLocalVideoForIdle"
            checked={avatarConfig.useLocalVideoForIdle}
            onChange={handleInputChange}
            className="mr-2"
          />
          Use Local Video for Idle
        </label>
      </div>
    </section>
  );
};
