import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Message from './index'
import './index.less'

const meta: Meta = {
  title: 'Components/Message',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta

// 按钮样式
const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  margin: '8px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  backdropFilter: 'blur(12px)',
}

export const Info: StoryObj = {
  render: () => (
    <button
      style={{ ...buttonStyle, background: 'rgba(24, 144, 255, 0.9)', color: '#fff' }}
      onClick={() => Message.info('这是一条信息提示')}
    >
      显示 Info 消息
    </button>
  ),
}

export const Success: StoryObj = {
  render: () => (
    <button
      style={{ ...buttonStyle, background: 'rgba(82, 196, 26, 0.9)', color: '#fff' }}
      onClick={() => Message.success('操作成功！')}
    >
      显示 Success 消息
    </button>
  ),
}

export const Error: StoryObj = {
  render: () => (
    <button
      style={{ ...buttonStyle, background: 'rgba(255, 77, 79, 0.9)', color: '#fff' }}
      onClick={() => Message.error('操作失败，请重试')}
    >
      显示 Error 消息
    </button>
  ),
}

export const Warning: StoryObj = {
  render: () => (
    <button
      style={{ ...buttonStyle, background: 'rgba(250, 173, 20, 0.9)', color: '#fff' }}
      onClick={() => Message.warning('请注意，这是一条警告')}
    >
      显示 Warning 消息
    </button>
  ),
}

export const AllTypes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <button
        style={{ ...buttonStyle, background: 'rgba(24, 144, 255, 0.9)', color: '#fff' }}
        onClick={() => Message.info('信息提示')}
      >
        Info
      </button>
      <button
        style={{ ...buttonStyle, background: 'rgba(82, 196, 26, 0.9)', color: '#fff' }}
        onClick={() => Message.success('成功提示')}
      >
        Success
      </button>
      <button
        style={{ ...buttonStyle, background: 'rgba(255, 77, 79, 0.9)', color: '#fff' }}
        onClick={() => Message.error('错误提示')}
      >
        Error
      </button>
      <button
        style={{ ...buttonStyle, background: 'rgba(250, 173, 20, 0.9)', color: '#fff' }}
        onClick={() => Message.warning('警告提示')}
      >
        Warning
      </button>
    </div>
  ),
}

export const CustomDuration: StoryObj = {
  render: () => (
    <button
      style={{ ...buttonStyle, background: 'rgba(28, 48, 82, 0.92)', color: '#fff' }}
      onClick={() => Message.success('这条消息将显示 5 秒', 5)}
    >
      显示 5 秒消息
    </button>
  ),
}

export const WithCallback: StoryObj = {
  render: () => (
    <button
      style={{ ...buttonStyle, background: 'rgba(28, 48, 82, 0.92)', color: '#fff' }}
      onClick={() =>
        Message.success('消息关闭后执行回调', 2, () => {
          alert('回调被执行了！')
        })
      }
    >
      带回调的消息
    </button>
  ),
}

export const Destroyable: StoryObj = {
  render: () => {
    const showMessageAndDestroy = () => {
      Message.info('这条消息可以被销毁', 10)
    }

    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          style={{ ...buttonStyle, background: 'rgba(28, 48, 82, 0.92)', color: '#fff' }}
          onClick={showMessageAndDestroy}
        >
          显示消息
        </button>
        <button
          style={{ ...buttonStyle, background: 'rgba(255, 77, 79, 0.9)', color: '#fff' }}
          onClick={() => Message.destroyAll()}
        >
          销毁所有消息
        </button>
      </div>
    )
  },
}
