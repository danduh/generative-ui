import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { chat } from '../services/api-client';
import IModulesMap from '../services/ui-client';
import { Skeleton } from '@mui/material';
import VideoStream from '../avatar/AvatarStream';
import { makeTransition } from '../utils';

type ViewState = 'initial' | 'loading' | 'success';

const loadingMsgs: string[] = [
  'Hold on.',
  'One moment.',
  'Checking now.',
  'Just a sec.',
  'Give me a sec.',
  'Let me see.',
  'On it.',
  'Wait a bit.',
  'Looking into it.',
  'Hang tight.',
];

let lastMessage: string | null = null;

const getRandomMessage = (): string => {
  let newMessage: string;
  do {
    newMessage = loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)];
  } while (newMessage === lastMessage);

  lastMessage = newMessage;
  return newMessage;
};

const CanvasPanel: React.FC = () => {
  const {
    canvasInstructions,
    addMessage,
    setCanvasInstructions,
    loading,
    toggleLoading,
  } = useContext(AppContext);
  const [viewState, setViewState] = useState<ViewState>('initial');
  const [textToSpeak, setTextToSpeak] = useState<string>('');
  const [viewLiveRep, setViewLiveRep] = useState<boolean>(false);
  const [keepView, setKeepView] = useState<boolean>(false);

  const [furtherInstructions, setFurtherInstructions] = useState<string>();

  function nextState(newState: ViewState) {
    makeTransition(() => {
      setViewState((state) => {
        if (newState) return newState;
        if (state === 'initial') return 'loading';
        if (state === 'loading') return 'success';
        return 'initial';
      });
    });
  }

  useEffect(() => {
    console.log('Intent to be rendered', canvasInstructions?.intent);
    setTextToSpeak(canvasInstructions?.description || '');
  }, [canvasInstructions]);

  useEffect(() => {
    setTextToSpeak(getRandomMessage());
  }, [viewState]);

  useEffect(() => {
    console.log(loading);
    if (loading) nextState('loading');
  }, [loading]);

  useEffect(() => {
    if (!furtherInstructions) return;
    setKeepView(true);
    addMessage({
      text: furtherInstructions,
      sender: 'user',
      timestamp: Date.now(),
    });
    chat(furtherInstructions, { setCanvasInstructions, addMessage });
    return () => {
      setFurtherInstructions('');
    };
  }, [furtherInstructions]);

  const ComponentKey = canvasInstructions?.intent.component;
  let Component = IModulesMap.get('ContextDisplay');

  useEffect(() => {
    if (ComponentKey) {
      toggleLoading(false);
      nextState('success');
      setKeepView(false)
    }
    if (ComponentKey === 'AvatarLiveView') {
      setViewLiveRep(true);
    }
  }, [ComponentKey]);

  if (IModulesMap.has(ComponentKey) && !keepView) {
    Component = IModulesMap.get(ComponentKey);
  }

  const genericProps = {
    setFurtherInstructions,
    ...canvasInstructions,
  };

  return (
    <div className="h-full flex flex-col">
      {viewLiveRep && <VideoStream textToSpeak={textToSpeak}></VideoStream>}
      <div className="w-3/4 m-auto  overflow-auto h-48 min-h-[80%]">
        {viewState === 'loading' && (
          <div
            style={{
              viewTransitionName: 'bg-grow',
            }}
          >
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
          </div>
        )}
        {viewState === 'success' && ( // Render the component if it exists in the map, passing the relevant props
          <div
            style={{
              viewTransitionName: 'bg-grow',
            }}
          >
            <React.Suspense fallback={<div>Loading...</div>}>
              <Component {...genericProps} />
            </React.Suspense>
          </div>
        )}
        {viewState === 'initial' && (
          <div style={{ viewTransitionName: 'bg-grow' }}>
            <div>Just tell me what do you want to do</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasPanel;
