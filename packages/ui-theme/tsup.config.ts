import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tokens: 'src/tokens/index.ts',
    presets: 'src/presets/index.ts',
    'tailwind/preset': 'src/tailwind/preset.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  loader: {
    '.json': 'json',
  },
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    'i18next',
    'react-i18next',
    'zustand',
    'dayjs',
    'react-hot-toast',
  ],
});

