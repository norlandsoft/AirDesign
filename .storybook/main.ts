import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-webpack5-compiler-swc', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    // 添加 Less 支持
    config.module = config.module || {}
    config.module.rules = config.module.rules || []

    config.module.rules.push({
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    })

    return config
  },
}

export default config
