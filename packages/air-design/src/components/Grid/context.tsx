/**
 * Grid Row 上下文
 *
 * 向 Col 传递 gutter 间距，保证列 padding 与行负 margin 一致。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {createContext, useContext} from 'react'
import type {RowContextValue} from './types'

export const RowContext = createContext<RowContextValue>({gutter: [0, 0]})

/** 读取 Row gutter 配置 */
export function useRowContext(): RowContextValue {
  return useContext(RowContext)
}
