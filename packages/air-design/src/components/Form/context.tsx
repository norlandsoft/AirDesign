/**
 * Form 上下文
 *
 * 向 FormItem / FormList 传递 form 实例、布局与标签列配置。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {createContext, useContext} from 'react'
import type {ColProps, FormLayout} from './types'
import type {InternalFormInstance} from './formInstance'

export interface FormContextValue {
  form: InternalFormInstance
  layout: FormLayout
  labelCol?: ColProps
  wrapperCol?: ColProps
  labelAlign?: 'left' | 'right'
  requiredMark?: boolean | 'optional'
}

export const FormContext = createContext<FormContextValue | null>(null)

/** 读取 Form 上下文 */
export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext)
  if (!ctx) {
    throw new Error('Form 子组件必须在 Form 内使用')
  }
  return ctx
}

/** 读取 Form 上下文（可选，无 Form 包裹时返回 null） */
export function useOptionalFormContext(): FormContextValue | null {
  return useContext(FormContext)
}

/** FormItem 嵌套上下文：用于 Form.List 子项相对路径 */
export const FormItemPrefixContext = createContext<(string | number)[]>([])

export function useFormItemPrefix(): (string | number)[] {
  return useContext(FormItemPrefixContext)
}

/** 合并 Form.List 前缀与 FormItem name */
export function mergeNamePath(prefix: (string | number)[], name?: (string | number)[] | string | number) {
  if (name == null) return prefix
  const path = Array.isArray(name) ? name : [name]
  return [...prefix, ...path]
}
