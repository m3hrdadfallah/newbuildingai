import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, path.resolve('.'), '');
    
    // کلید اختصاصی شما که درخواست کردید تغییر نکند
    const userApiKey = "AIzaSyCf5NGycTd_K2ntf-Nd1uiWd7NfEFJVq28";

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // تزریق کلید به عنوان متغیر محیطی برای استفاده در SDK
        'process.env.API_KEY': JSON.stringify(userApiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});