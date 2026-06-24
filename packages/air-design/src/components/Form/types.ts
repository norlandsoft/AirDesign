/**
 * Form 表单类型定义
 *
 * 对齐 antd Form 常用 API：字段路径、校验规则、布局、FormInstance 方法等，
 * 便于业务从 antd 平滑迁移到 air-design 原生表单体系。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {CSSProperties, ReactNode} from 'react'

/** 字段名：字符串或嵌套路径 */
export type NamePath = string | number | (string | number)[]

/** 表单布局 */
export type FormLayout = 'horizontal' | 'vertical' | 'inline'

/** 校验规则（antd 常用子集） */
export interface Rule {
  /** 是否必填 */
  required?: boolean
  /** 失败提示文案 */
  message?: string
  /** 字符串/数组最小长度或数字最小值 */
  min?: number
  /** 字符串/数组最大长度或数字最大值 */
  max?: number
  /** 固定长度 */
  len?: number
  /** 正则校验 */
  pattern?: RegExp
  /** 值类型 */
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'array' | 'integer'
  /** 必填时是否禁止纯空白字符串 */
  whitespace?: boolean
  /** 自定义异步/同步校验 */
  validator?: (
    rule: Rule,
    value: unknown,
    callback?: (error?: string) => void
  ) => Promise<void | string> | void | string
}

/** 栅格列宽（antd labelCol / wrapperCol 语义，24 栅格） */
export interface ColProps {
  span?: number
  offset?: number
}

/** 字段元信息 */
export interface FieldMeta {
  /** 是否被用户操作过 */
  touched: boolean
  /** 是否正在校验 */
  validating: boolean
  /** 错误信息列表 */
  errors: string[]
}

/** 设置字段时的选项 */
export interface SetFieldOptions {
  errors?: string[]
  touched?: boolean
  validating?: boolean
}

/** Form 实例（对齐 antd FormInstance 常用方法） */
export interface FormInstance<T extends Record<string, unknown> = Record<string, unknown>> {
  /** 获取单个字段值 */
  getFieldValue: (name: NamePath) => unknown
  /** 获取多个或全部字段值 */
  getFieldsValue: (nameList?: NamePath[] | true) => Partial<T>
  /** 设置字段值 */
  setFieldValue: (name: NamePath, value: unknown) => void
  /** 批量设置字段值 */
  setFieldsValue: (values: Partial<T>) => void
  /** 重置字段到 initialValues */
  resetFields: (fields?: NamePath[]) => void
  /** 校验指定或全部字段 */
  validateFields: (nameList?: NamePath[]) => Promise<T>
  /** 提交：校验通过后触发 onFinish */
  submit: () => void
  /** 内部：注册字段实体 */
  _registerField: (entity: FieldEntity) => () => void
  /** 内部：订阅表单变更 */
  _subscribe: (listener: () => void) => () => void
  /** 内部：读取快照 */
  _getSnapshot: () => FormSnapshot
  /** 内部：设置 initialValues */
  _setInitialValues: (values: Partial<T>) => void
}

/** 字段注册实体 */
export interface FieldEntity {
  name: NamePath
  rules?: Rule[]
  label?: ReactNode
  required?: boolean
  valuePropName?: string
  trigger?: string
  validateTrigger?: string | string[]
  getValueFromEvent?: (...args: unknown[]) => unknown
  normalize?: (value: unknown, prevValue: unknown, allValues: Record<string, unknown>) => unknown
}

/** 表单内部快照 */
export interface FormSnapshot {
  values: Record<string, unknown>
  fields: Record<string, FieldMeta>
}

/** Form 根组件 Props */
export interface FormProps<T extends Record<string, unknown> = Record<string, unknown>> {
  form?: FormInstance<T>
  /** 初始值 */
  initialValues?: Partial<T>
  /** 布局 */
  layout?: FormLayout
  /** 标签列宽（horizontal） */
  labelCol?: ColProps
  /** 控件列宽（horizontal） */
  wrapperCol?: ColProps
  /** 标签对齐 */
  labelAlign?: 'left' | 'right'
  /** 必填星号位置 */
  requiredMark?: boolean | 'optional'
  /** 校验成功后回调 */
  onFinish?: (values: T) => void
  /** 校验失败后回调 */
  onFinishFailed?: (info: {values: Partial<T>; errorFields: {name: NamePath; errors: string[]}[]}) => void
  /** 任意字段变更 */
  onValuesChange?: (changedValues: Partial<T>, allValues: Partial<T>) => void
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Form.Item Props */
export interface FormItemProps {
  name?: NamePath
  label?: ReactNode
  rules?: Rule[]
  required?: boolean
  help?: ReactNode
  extra?: ReactNode
  hidden?: boolean
  /** 为 true 时不渲染表单项布局（标签/间距），仅向子控件注入表单绑定 */
  noStyle?: boolean
  /** 从子组件读取值的 prop 名，Checkbox/Switch 默认为 checked */
  valuePropName?: string
  /** 触发 value 更新的 prop 名 */
  trigger?: string
  /** 触发校验的事件 */
  validateTrigger?: string | string[]
  /** 从事件参数提取 value */
  getValueFromEvent?: (...args: unknown[]) => unknown
  /** 写入表单前规范化 value */
  normalize?: (value: unknown, prevValue: unknown, allValues: Record<string, unknown>) => unknown
  /** 无 label 时是否仍占标签列 */
  colon?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Form.List Props */
export interface FormListProps {
  name: NamePath
  children: (
    fields: {name: number; key: number}[],
    operations: {add: (defaultValue?: unknown) => void; remove: (index: number) => void; move: (from: number, to: number) => void}
  ) => ReactNode
}

/** Select 选项 */
export interface SelectOption {
  value: string | number
  label: ReactNode
  disabled?: boolean
}

/** Checkbox / Radio 组选项 */
export interface OptionType {
  value: string | number | boolean
  label: ReactNode
  disabled?: boolean
}
