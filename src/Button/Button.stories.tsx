import type { Meta, StoryObj } from '@storybook/react'
import Button from './index'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary', 'danger', 'text', 'link'],
      description: '按钮类型',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    loading: {
      control: 'boolean',
      description: '是否加载中',
    },
    icon: {
      control: 'text',
      description: '图标名称或 ReactNode',
    },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: '默认按钮',
    type: 'default',
  },
}

export const Primary: Story = {
  args: {
    children: '主要按钮',
    type: 'primary',
  },
}

export const Danger: Story = {
  args: {
    children: '危险按钮',
    type: 'danger',
  },
}

export const Text: Story = {
  args: {
    children: '文本按钮',
    type: 'text',
  },
}

export const Link: Story = {
  args: {
    children: '链接按钮',
    type: 'link',
  },
}

export const WithIcon: Story = {
  args: {
    children: '带图标',
    type: 'primary',
    icon: 'plus',
  },
}

export const Disabled: Story = {
  args: {
    children: '禁用按钮',
    type: 'primary',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: '加载中',
    type: 'primary',
    loading: true,
  },
}

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button type="default">默认</Button>
      <Button type="primary">主要</Button>
      <Button type="danger">危险</Button>
      <Button type="text">文本</Button>
      <Button type="link">链接</Button>
    </div>
  ),
}
