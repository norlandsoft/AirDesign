import type { Preview } from '@storybook/react'
import './preview.less'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        gradient: {
          name: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },

        light: {
          name: 'light',
          value: '#ffffff',
        },

        dark: {
          name: 'dark',
          value: '#1a1a2e',
        }
      }
    },
  },

  decorators: [
    (Story) => (
      <div
        style={{
          padding: '24px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
}

export default preview
