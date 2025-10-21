import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { LDContext } from 'launchdarkly-js-client-sdk';
import { ELIG_KEYS } from './fake_data/fake_ld_context';

const ldClientId: string = process.env.REACT_APP_LAUNCHDARKLY_CLIENT_ID || '';
const context: LDContext = {
  key: 'AccoiuntHolderID',
  email: 'user@example.com',
  custom: {
    eligibilities: ELIG_KEYS,
    PayoneerFloor: 3,
  },
  profile: {
    key: 'userID',
    firstName: 'Bob',
    position: 'CFO',
  }
};

console.log(context);

console.log(process.env);
console.log(process.env.REACT_APP_OPENAI_DEPLOYMENT_ID);
console.log(process.env.NX_BUILD_TARGET);
console.log(process.env.NODE_ENV);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
  </StrictMode>
);
