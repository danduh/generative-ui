import React, { useContext, useEffect, useState } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CanvasPanel from './components/CanvasPanel';
import ResizableDivider from './components/ResizableDivider';
import { AppContext, AppProvider } from './context/AppContext';
import { makeTransition } from './utils';
import InitialViewComponent from './initialview/InitialViewComponent'; // Import the component here
import { useFlags } from 'launchdarkly-react-client-sdk';

const App: React.FC = () => {
  // const { testEligContext } = useFlags();
  const [initMessage, setInitMessage] = useState<string>('');
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
  const [viewState, setViewState] = useState<boolean>(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(25);
  const { darkMode, toggleDarkMode, apiUsage } = useContext(AppContext);
  // console.log('myFeatureFlag', testEligContext);

  function nextState(showCanvas: boolean) {
    makeTransition(() => {
      setViewState(showCanvas);
    });
  }

  useEffect(() => {
    nextState(showCanvas);
  }, [showCanvas]);

  const onChange = (e: any) => {
    setInitMessage(e.target.value);
  };
  const initChat = (e: any) => {
    e.preventDefault();
    setShowCanvas(!showCanvas);
  };

  return (
    <AppProvider>
      <div className={`flex flex-col h-screen dark`}>
        <Header showCanvas={showCanvas} setShowCanvas={setShowCanvas} />
        {viewState && (
          <InitialViewComponent
            initMessage={initMessage}
            setInitMessage={setInitMessage}
            onChange={onChange}
            initChat={initChat}
          />
        )}
        {!viewState && (
          <div className="flex-grow flex overflow-hidden h-full">
            <div
              style={{ width: `${leftPanelWidth}%` }}
              className="h-full overflow-hidden bg-gray-50"
            >
              <ChatPanel initMessage={initMessage} />
            </div>
            <ResizableDivider setLeftPanelWidth={setLeftPanelWidth} />
            <div
              style={{ width: `${100 - leftPanelWidth}%` }}
              className="h-full overflow-hidden"
            >
              <CanvasPanel />
            </div>
          </div>
        )}
        {/*<Footer />*/}
      </div>
    </AppProvider>
  );
};

export default App;
