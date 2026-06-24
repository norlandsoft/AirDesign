/**
 * Splitter.Panel 分割面板子项
 *
 * 仅作为 Splitter 的子元素使用，由父组件解析 props 并控制尺寸；不单独渲染布局。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React from 'react'
import type {SplitterPanelProps} from './types'

export const SPLITTER_PANEL_DISPLAY_NAME = 'SplitterPanel'

/** antd 兼容的分割子面板占位组件 */
const SplitterPanel: React.FC<SplitterPanelProps> = ({children}) => <>{children}</>
SplitterPanel.displayName = SPLITTER_PANEL_DISPLAY_NAME

export default SplitterPanel
