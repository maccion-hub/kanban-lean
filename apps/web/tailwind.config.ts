import type { Config } from 'tailwindcss';
import maccionPreset from '../../packages/ui/src/tailwind-preset';
import animate from 'tailwindcss-animate';

const config: Config = {
  presets: [maccionPreset as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  plugins: [animate],
};

export default config;
