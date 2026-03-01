import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import ModalDialog from './ModalDialog'
import './ModalDialog.less'

const meta: Meta<typeof ModalDialog> = {
  title: 'Components/Dialog',
  component: ModalDialog,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '对话框标题',
    },
    width: {
      control: { type: 'range', min: 300, max: 800, step: 50 },
      description: '对话框宽度',
    },
    closable: {
      control: 'boolean',
      description: '是否显示关闭按钮',
    },
    confirmable: {
      control: 'boolean',
      description: '是否显示确认按钮',
    },
    mask: {
      control: 'boolean',
      description: '是否显示遮罩',
    },
    loading: {
      control: 'boolean',
      description: '是否显示加载状态',
    },
    showFooter: {
      control: 'boolean',
      description: '是否显示底部',
    },
  },
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ModalDialog>

// 用于 Story 的包装组件
const DialogDemo: React.FC<{
  title?: string
  width?: number
  closable?: boolean
  confirmable?: boolean
  mask?: boolean
  loading?: boolean
  showFooter?: boolean
  okText?: string
  cancelText?: string
}> = (props) => {
  const [visible, setVisible] = React.useState(false)

  return (
    <div>
      <button
        onClick={() => setVisible(true)}
        style={{
          padding: '10px 20px',
          background: 'rgba(28, 48, 82, 0.92)',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        打开对话框
      </button>
      {visible && (
        <ModalDialog
          {...props}
          visible={visible}
          onCancel={() => setVisible(false)}
          onOk={() => {
            alert('确认操作')
            setVisible(false)
          }}
        >
          <div style={{ padding: '20px' }}>
            <p>这是一个毛玻璃风格的对话框组件。</p>
            <p>支持拖拽移动、自定义标题、加载状态等功能。</p>
          </div>
        </ModalDialog>
      )}
    </div>
  )
}

export const Basic: Story = {
  render: () => <DialogDemo title="基本对话框" />,
}

export const CustomWidth: Story = {
  render: () => <DialogDemo title="自定义宽度" width={600} />,
}

export const WithoutFooter: Story = {
  render: () => <DialogDemo title="无底部按钮" showFooter={false} />,
}

export const Loading: Story = {
  render: () => <DialogDemo title="加载中" loading={true} />,
}

export const WithoutMask: Story = {
  render: () => <DialogDemo title="无遮罩" mask={false} />,
}

export const CustomText: Story = {
  render: () => <DialogDemo title="自定义按钮文字" okText="提交" cancelText="返回" />,
}

export const OnlyConfirm: Story = {
  render: () => <DialogDemo title="仅确认按钮" closable={false} confirmable={true} />,
}

export const OnlyClose: Story = {
  render: () => <DialogDemo title="仅关闭按钮" closable={true} confirmable={false} />,
}
