/**
 * Form.useForm Hook
 *
 * 创建或复用 FormInstance，供 Form 根组件与 imperative 场景使用。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {useRef} from 'react'
import {createFormInstance} from './formInstance'
import type {FormInstance} from './types'

/** 创建表单实例；传入已有 form 时直接返回 */
export function useForm<T extends Record<string, unknown> = Record<string, unknown>>(
  form?: FormInstance<T>
): [FormInstance<T>] {
  const cache = useRef<FormInstance<T>>()

  if (form) {
    return [form]
  }

  if (!cache.current) {
    cache.current = createFormInstance<T>()
  }

  return [cache.current]
}

export {createFormInstance}
