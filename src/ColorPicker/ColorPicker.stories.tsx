import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import ColorPicker, { CustomColorPickerProps } from './index'
import './index.less'

const meta: Meta<typeof ColorPicker> = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'color',
      description: '当前颜色值',
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
      description: '触发方式',
    },
    popupWidth: {
      control: { type: 'range', min: 300, max: 600, step: 25 },
      description: '弹窗宽度',
    },
  },
}

export default meta
type Story = StoryObj<CustomColorPickerProps>

// 基础演示组件
const ColorPickerDemo: React.FC<Partial<CustomColorPickerProps>> = (props) => {
  const [color, setColor] = React.useState<string | null>('#1890ff')

  return (
    <ColorPicker value={color} onChangeComplete={(c) => setColor(c.toHexString())} {...props}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            background: color || '#fff',
            border: '2px solid rgba(255,255,255,0.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
        <span style={{ color: '#fff', fontWeight: 500 }}>{color || '选择颜色'}</span>
      </div>
    </ColorPicker>
  )
}

export const Basic: Story = {
  render: () => <ColorPickerDemo />,
}

export const HoverTrigger: Story = {
  render: () => <ColorPickerDemo trigger="hover" />,
}

export const CustomWidth: Story = {
  render: () => <ColorPickerDemo popupWidth={500} />,
}

export const WithButton: Story = {
  render: () => {
    const [color, setColor] = React.useState<string | null>('#52c41a')

    return (
      <ColorPicker value={color} onChangeComplete={(c) => setColor(c.toHexString())}>
        <button
          style={{
            padding: '10px 20px',
            background: color || 'rgba(28, 48, 82, 0.92)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          点击选择颜色
        </button>
      </ColorPicker>
    )
  },
}

export const ColorPalette: Story = {
  render: () => {
    const colors = [
      { name: 'Primary', value: '#1890ff' },
      { name: 'Success', value: '#52c41a' },
      { name: 'Warning', value: '#faad14' },
      { name: 'Error', value: '#ff4d4f' },
    ]

    return (
      <div style={{ display: 'flex', gap: '16px' }}>
        {colors.map((item) => (
          <ColorPicker
            key={item.name}
            value={item.value}
            onChangeComplete={(c) => {
              item.value = c.toHexString()
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: item.value,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              />
              <span style={{ color: '#fff', fontSize: '12px' }}>{item.name}</span>
            </div>
          </ColorPicker>
        ))}
      </div>
    )
  },
}
