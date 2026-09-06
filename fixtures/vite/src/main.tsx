import type {} from 'react-keybound/jsx';
import { createRoot } from 'react-dom/client';
import { KeyboundProvider } from 'react-keybound';

createRoot(document.getElementById('root')!).render(
  <KeyboundProvider>
    <button onClick={() => console.log('saved')}>Save</button>
    <button>&Save</button>
    <input hotkey="mod+k" aria-label="Search" />
  </KeyboundProvider>,
);
