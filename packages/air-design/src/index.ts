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
export {default as DatePicker, RangePicker} from './components/DatePicker'
export type {DatePickerProps, RangePickerProps, RangeValue} from './components/DatePicker'
export {default as Avatar, AvatarGroup} from './components/Avatar'
export type {AvatarProps, AvatarGroupProps, AvatarSize, AvatarShape} from './components/Avatar'
export {Grid, Row, Col, useBreakpoint, useViewportWidth, getActiveBreakpoint} from './components/Grid'
export type {
  RowProps,
  ColProps,
  ColSize,
  ColSizeConfig,
  Gutter,
  Breakpoint,
  BreakpointMap,
  RowJustify,
  RowAlign,
  ResponsiveValue,
} from './components/Grid'
export {default as Message} from './components/Message'
export {default as message} from './components/Message'
export {default as Notice} from './components/Notice'
export {default as Dialog} from './components/Dialog'
export {default as UploadDialog} from './components/Dialog/UploadDialog'
export {default as EditableLabel} from './components/EditableLabel'
export {default as GroupSplitter} from './components/GroupSplitter'
export {default as Help} from './components/Help'
export {default as InfoPage} from './components/InfoPage'
export type {InfoPageProps, InfoPageStatus} from './components/InfoPage'
export {default as SlidePanel} from './components/SlidePanel'
export {default as Splitter} from './components/Splitter'
export type {SplitterProps, SplitterPanelProps, SplitterLayout, PanelCollapsible, SplitterRef} from './components/Splitter'
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

export {default as NavMenu} from './components/NavMenu'
export type {NavMenuProps, NavMenuItem, NavMenuMode} from './components/NavMenu'

export {default as MindPanel} from './components/MindPanel'
export type {MindData, MindNodeData} from './components/MindPanel/data/MindData'

export {default as PropertiesNaviBar} from './components/PropertiesNaviBar'

export {default as RichEditor} from './components/RichEditor'
export type {RichEditorRef} from './components/RichEditor'

export {default as WebClient} from './components/WebClient'

// ===== Form 表单体系（antd 兼容 API）=====
export {
  Form,
  FormListField,
  useForm,
  createFormInstance,
  Input,
  PasswordInput,
  TextArea,
  NumberInput,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  RadixSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  PrimitiveInput,
  PrimitiveTextarea,
} from './components/Form'
export type {
  FormProps,
  FormItemProps,
  FormListProps,
  FormInstance,
  FormLayout,
  Rule,
  NamePath,
  SelectOption,
  OptionType,
  InputProps,
  TextAreaProps,
  NumberInputProps,
  SelectProps,
  CheckboxProps,
  CheckboxGroupProps,
  RadioProps,
  RadioGroupProps,
} from './components/Form'

// ===== primitives（可选，供深度定制消费方使用；Button/Dialog 见上方业务组件）=====
export {
  buttonVariants,
  type ButtonProps as PrimitiveButtonProps,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Separator,
  ScrollArea,
  ScrollBar,
  Skeleton,
  Slider,
  Avatar as RadixAvatar,
  AvatarImage as RadixAvatarImage,
  AvatarFallback as RadixAvatarFallback,
  Toaster,
  toast,
} from './primitives'
