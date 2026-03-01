import type { Meta, StoryObj } from '@storybook/react'
import Icon from './index'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: '图标名称',
    },
    size: {
      control: { type: 'range', min: 12, max: 64, step: 4 },
      description: '图标大小',
    },
    color: {
      control: 'color',
      description: '图标颜色',
    },
    thickness: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.5 },
      description: '线条粗细',
    },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    name: 'home',
    size: 24,
    color: '#123F68',
    thickness: 1.5,
  },
}

export const Small: Story = {
  args: {
    name: 'settings',
    size: 16,
    color: '#123F68',
  },
}

export const Large: Story = {
  args: {
    name: 'user',
    size: 48,
    color: '#123F68',
  },
}

export const CustomColor: Story = {
  args: {
    name: 'heart',
    size: 32,
    color: '#e74c3c',
  },
}

export const ThickStroke: Story = {
  args: {
    name: 'star',
    size: 32,
    color: '#f39c12',
    thickness: 2.5,
  },
}

export const IconGrid: Story = {
  render: () => {
    const icons = [
      'home',
      'user',
      'settings',
      'search',
      'heart',
      'star',
      'plus',
      'close',
      'check',
      'edit',
      'delete',
      'download',
      'upload',
      'folder',
      'file',
      'mail',
    ]
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          padding: '20px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
        }}
      >
        {icons.map((iconName) => (
          <div
            key={iconName}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name={iconName} size={32} color="#fff" />
            <span style={{ color: '#fff', fontSize: '12px' }}>{iconName}</span>
          </div>
        ))}
      </div>
    )
  },
}
