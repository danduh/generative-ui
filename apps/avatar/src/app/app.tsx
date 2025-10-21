import '../styles.css';
import TalkingAvatarChat from './components/Settings';
import { ConfigProvider } from './context';


export function App() {
  return (
    <div>
      <ConfigProvider>
        <TalkingAvatarChat />
      </ConfigProvider>
    </div>
  );
}

export default App;
