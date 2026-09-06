import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import keybound from 'react-keybound/vite';

export default defineConfig({
  plugins: [keybound({ manifest: true }), react()],
});
