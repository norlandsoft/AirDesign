/**
 * AirDesign 组件库主入口（2.0）
 *
 * 底层：shadcn/ui（Radix UI）+ TailwindCSS。单一组件源、单一图标库（自有 Icon）、
 * 单一样式方案。引入 theme/index.css 加载设计 Token 与字体。
 *
 * 分层：
 * - primitives：Radix 薄封装（业务组件依赖，消费方一般不直接用）
 * - components：业务级组件（Button/Table/Tree/CodeEditor 等）
 *
 * @author ChaiMingXu, 2026/06/19
 */
import './theme/index.css'

// ===== 核心 UI 组件 =====
export {default as Button} from './components/Button'
export {default as IconButton} from './components/Button/IconButton'
export {default as MenuButton} from './components/Button/MenuButton'
export {default as ToggleButton} from './components/Button/ToggleButton'
export {default as Icon} from './components/Icon'
export {default as ColorPicker} from './components/ColorPicker'
export type {PresetColorConfig, ColorPickerProps} from './components/ColorPicker'
export {Tag, tagVariants} from './components/Tag'
export type {TagProps} from './components/Tag'
export {default as Message} from './components/Message'
export {default as message} from './components/Message'
export {default as Notice} from './components/Notice'
export {default as Dialog} from './components/Dialog'
export {default as UploadDialog} from './components/Dialog/UploadDialog'
export {default as EditableLabel} from './components/EditableLabel'
export {default as GroupSplitter} from './components/GroupSplitter'
export {default as Help} from './components/Help'
export {default as SlidePanel} from './components/SlidePanel'
export {default as Splitter} from './components/Splitter'
export {Pane} from './components/Splitter'
export {default as TabPanel} from './components/TabPanel'
export {default as Tree} from './components/Tree'
export type {TreeNode, TreeMenuItem} from './components/Tree'
export {default as List} from './components/List'
export {default as LoadingPanel} from './components/LoadingPanel'
export {default as Spin} from './components/Spin'
export {default as Table} from './components/Table'
export {default as TableRowMenu} from './components/Table/TableRowMenu'
export type {TableRowMenuItem} from './components/Table/TableRowMenu'

// ===== 复合业务组件 =====
export {default as CodeEditor} from './components/CodeEditor'
export type {CodeEditorRef} from './components/CodeEditor'

export {default as Kanban} from './components/Kanban'
export type {ActionProps, ActionStatus} from './components/Kanban/KanbanProps'

export {default as Markdown} from './components/Markdown'

export {default as MenuBar} from './components/MenuBar'

export {default as MindPanel} from './components/MindPanel'
export type {MindData, MindNodeData} from './components/MindPanel/data/MindData'

export {default as PropertiesNaviBar} from './components/PropertiesNaviBar'

export {default as RichEditor} from './components/RichEditor'
export type {RichEditorRef} from './components/RichEditor'

export {default as WebClient} from './components/WebClient'

// ===== primitives（可选，供深度定制消费方使用）=====
export * from './primitives'
