import React from 'react';
import { AIComponentProps } from '@frontai/types';
import { ConfigProvider } from '../context';
import TalkingAvatarChat from '../components/Settings';

const AvatarLiveView: React.FC<AIComponentProps> = ({}) => {
  return (
    <ConfigProvider>
      <TalkingAvatarChat standAlong={true} />
    </ConfigProvider>
  );
};

export default AvatarLiveView;
