import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // بارگذاری متغیرهای محیطی از فایل .env در صورت وجود
    const env = loadEnv(mode, path.resolve('.'), '');
    
    /**
     * کلید اختصاصی شما: AIzaSyCf5NGycTd_K2ntf-Nd1uiWd7NfEFJVq28
     * این کلید باید هم برای فایربیس و هم برای Gemini (در صورت یکی بودن تنظیمات کنسول گوگل) استفاده شود.
     * اگر کلید Gemini متفاوت است، مقدار env.GEMINI_API_KEY را جایگزین کنید.
     */
    const KEY_TO_USE = env.GEMINI_API_KEY || "AIzaSyCf5NGycTd_K2ntf-Nd1uiWd7NfEFJVq28";

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // این بخش باعث می‌شود در کل پروژه process.env.API_KEY قابل استفاده باشد
        'process.env.API_KEY': JSON.stringify(KEY_TO_USE),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});