/**
 * Avatar 工具函数
 *
 * 尺寸解析与字符头像背景色生成（对齐 antd 色板策略）。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {ReactNode} from 'react'
import type {AvatarSize} from './types'

/** antd 预设尺寸（px） */
const PRESET_SIZE: Record<'large' | 'small' | 'default', number> = {
  large: 40,
  small: 24,
  default: 32,
}

/** antd 字符头像背景色板 */
const AVATAR_COLORS = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#1890ff']

/** 将 size 解析为像素值 */
export function resolveAvatarSize(size?: AvatarSize): number {
  if (typeof size === 'number') return size
  return PRESET_SIZE[size ?? 'default']
}

/** 根据字符串生成稳定的头像背景色 */
export function stringToAvatarColor(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/** 从 children 提取用于取色的文本 */
export function extractAvatarText(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map((item) => extractAvatarText(item)).join('')
  return ''
}
