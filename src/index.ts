/**
 * AirDesign 组件库主入口
 *
 * 导出全部组件，供外部项目通过 npm install air-design 使用。
 * 引入 base.less 以加载 Space Grotesk、JetBrains Mono 字体及 CSS 变量。
 *
 * @author ChaiMingXu, on 2026/05/14
 */

// AirDesign 核心组件库（含 base.less）
export * from './components/AirDesign'

// 业务组件
export {default as CodeEditor} from './components/CodeEditor'
export type {CodeEditorRef} from './components/CodeEditor'

export {default as Kanban} from './components/Kanban'

export {default as Markdown} from './components/Markdown'

export {default as MenuBar} from './components/MenuBar'

export {default as MindPanel} from './components/MindPanel'

export {default as PropertiesNaviBar} from './components/PropertiesNaviBar'

export {default as RichEditor} from './components/RichEditor'
export type {RichEditorRef} from './components/RichEditor'

export {default as Toolbar} from './components/Toolbar'
export type {ToolbarItem, ToolbarProps} from './components/Toolbar'

export {default as WebClient} from './components/WebClient'

export {default as WebShell} from './components/WebShell'
export type {WebShellConnectOptions, WebShellProps} from './components/WebShell'

// 看板类型导出
export type {ActionProps, ActionStatus} from './components/Kanban/KanbanProps'
