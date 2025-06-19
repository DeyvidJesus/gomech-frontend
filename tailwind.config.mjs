import { join } from 'path';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [join(__dirname, 'src/**/*.{ts,tsx}')],
  theme: { extend: {} },
  plugins: [],
};

export default config;
