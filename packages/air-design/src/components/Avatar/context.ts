/**
 * Avatar.Group 上下文
 *
 * 向组内 Avatar 传递统一的 size / shape，便于堆叠展示时样式一致。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {createContext, useContext} from 'react'
import type {AvatarProps} from './types'

export interface AvatarGroupContextValue {
  size?: AvatarProps['size']
  shape?: AvatarProps['shape']
}

export const AvatarGroupContext = createContext<AvatarGroupContextValue>({})

/** 读取 Avatar.Group 注入的尺寸与形状配置 */
export function useAvatarGroupContext(): AvatarGroupContextValue {
  return useContext(AvatarGroupContext)
}
