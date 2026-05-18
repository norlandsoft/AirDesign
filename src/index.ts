/**
 * AirDesign 组件库主入口
 *
 * 导出全部组件，供外部项目通过 npm install air-design 使用。
 * 引入 base.less 以加载 Space Grotesk、JetBrains Mono 字体及 CSS 变量。
 *
 * @author ChaiMingXu, on 2026/05/14
 */

import './style/base.less'
import './style/antd.less'
import './style/semi.less'
import './style/tide.less'
import './style/layout.less'

// Ant Design 组件转发（Button、Table、Spin 由 AirDesign 自有组件提供，antd 原生版加 Antd 前缀）
export {
  Form, Input, Select, DatePicker, TimePicker, InputNumber, Checkbox, Switch, Slider, Rate, Upload, Cascader, TreeSelect,
  Card, Tag, Statistic, Avatar, Badge, Timeline, Tooltip, Popover, Popconfirm, Empty, Typography, Image, Calendar, Descriptions,
  Modal, Drawer, Alert, Progress, Result, Skeleton,
  Layout, Row, Col, Divider, Space,
  Menu, Dropdown, Breadcrumb, Steps, Pagination, Tabs, Anchor,
  Radio, AutoComplete, Watermark, FloatButton, ConfigProvider, App,
  message, notification, theme,
  Button as AntdButton, Table as AntdTable, Spin as AntdSpin,
} from 'antd'
export type {
  FormProps, FormInstance, FormItemProps, InputProps, SelectProps, DatePickerProps, TimeRangePickerProps,
  InputNumberProps, CheckboxProps, SwitchProps, UploadProps,
  CardProps, TagProps, StatisticProps, AvatarProps, BadgeProps, TooltipProps, PopoverProps, PopconfirmProps, TypographyProps,
  ModalProps, DrawerProps, AlertProps,
  LayoutProps, RowProps, ColProps,
  MenuProps, DropdownProps, BreadcrumbProps, PaginationProps, TabsProps,
  RadioProps, RadioChangeEvent, ConfigProviderProps,
} from 'antd'

// 核心 UI 组件
export {default as Button} from './Button'
export {default as IconButton} from './Button/IconButton'
export {default as MenuButton} from './Button/MenuButton'
export {default as ToggleButton} from './Button/ToggleButton'
export {default as Icon} from './Icon'
export {default as ColorPicker} from './ColorPicker'
export {default as Message} from './Message'
export {success, warn, warning, error, info} from './Notification'
export {default as Dialog} from './Dialog'
export {default as UploadDialog} from './Dialog/UploadDialog'
export {default as EditableLabel} from './EditableLabel'
export {default as GroupSplitter} from './GroupSplitter'
export {default as Help} from './Help'
export {default as SlidePanel} from './SlidePanel'
export {default as Splitter} from './Splitter'
export {Pane} from './Splitter'
export {default as TabPanel} from './TabPanel'
export {default as Tree} from './Tree'
export {default as List} from './List'
export {default as LoadingPanel} from './LoadingPanel'
export {default as Spin} from './Spin'
export {default as Table} from './Table'
export {default as TableRowMenu} from './Table/TableRowMenu'

// 业务组件
export {default as CodeEditor} from './CodeEditor'
export type {CodeEditorRef} from './CodeEditor'

export {default as Kanban} from './Kanban'

export {default as Markdown} from './Markdown'

export {default as MenuBar} from './MenuBar'

export {default as MindPanel} from './MindPanel'
export type {MindData, MindNodeData} from './MindPanel/data/MindData'

export {default as PropertiesNaviBar} from './PropertiesNaviBar'

export {default as RichEditor} from './RichEditor'
export type {RichEditorRef} from './RichEditor'

export {default as WebClient} from './WebClient'

// 看板类型导出
export type {ActionProps, ActionStatus} from './Kanban/KanbanProps'
