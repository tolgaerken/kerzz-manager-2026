import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: undefined,
      },
    },
  },
  viteFinal: async (config) => {
    // Storybook'u local network'ten erişilebilir yap
    if (config.server) {
      config.server.host = '0.0.0.0';
    }
    return config;
  },
};

export default config;
