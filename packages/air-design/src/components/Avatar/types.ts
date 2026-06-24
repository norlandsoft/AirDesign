/**
 * Avatar 组件类型定义
 *
 * API 对齐 antd Avatar / Avatar.Group 常用能力。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'

/** Avatar 尺寸：预设或像素值 */
export type AvatarSize = number | 'large' | 'small' | 'default'

/** Avatar 形状 */
export type AvatarShape = 'circle' | 'square'

/** Avatar 组件 Props（对齐 antd） */
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** 图片地址 */
  src?: string
  /** 图片 srcSet */
  srcSet?: string
  /** 图片 alt */
  alt?: string
  /** 字符型头像内容（通常为 1–2 个字符） */
  children?: ReactNode
  /** 图标型头像；string 时按 Icon 名称渲染 */
  icon?: ReactNode | string
  /** 形状，默认 circle */
  shape?: AvatarShape
  /** 尺寸，默认 32px */
  size?: AvatarSize
  /** 字符型头像字间距，默认 4 */
  gap?: number
  /** 图片 img 的 crossOrigin */
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  /** 图片是否可拖拽 */
  draggable?: boolean | 'true' | 'false'
  /** 图片加载失败回调；返回 false 时不自动降级（仍由 Radix 控制展示） */
  onError?: () => boolean
  /** 点击头像时触发；传入后自动展示手型光标 */
  onClick?: React.MouseEventHandler<HTMLSpanElement>
}

/** Avatar.Group max 配置 */
export interface AvatarGroupMaxProps {
  /** 最多展示的头像数量，超出部分折叠为 +N */
  count?: number
  /** +N 头像的内联样式 */
  style?: CSSProperties
}

/** Avatar.Group Props */
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** 组内 Avatar 统一尺寸 */
  size?: AvatarSize
  /** 组内 Avatar 统一形状 */
  shape?: AvatarShape
  /** 最大展示数量 */
  max?: AvatarGroupMaxProps
}
