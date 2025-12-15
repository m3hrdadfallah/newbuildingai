import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // The third parameter '' ensures we load all env vars, not just VITE_*
    const env = loadEnv(mode, process.cwd(), '');
    
    // Robustly determine the API key from various common environment variable names
    // This fixes issues where deployment platforms use 'API_KEY' or 'GEMINI_API_KEY'
    const apiKey = env.API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});