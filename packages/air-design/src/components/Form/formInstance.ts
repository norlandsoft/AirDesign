/**
 * Form 实例工厂
 *
 * 维护 values、字段注册表与校验状态，提供 antd FormInstance 对齐的 imperative API。
 * 通过订阅模式驱动 Form / FormItem 重渲染。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {cloneValues, containsName, deletePathValue, getPathValue, pathKey, setPathValue, toPath} from './pathUtils'
import {validateRules} from './validate'
import type {FieldEntity, FieldMeta, FormInstance, FormSnapshot, NamePath, SetFieldOptions} from './types'

type FinishHandler<T> = (values: T) => void
type FinishFailedHandler<T> = (info: {
  values: Partial<T>
  errorFields: {name: NamePath; errors: string[]}[]
}) => void
type ValuesChangeHandler<T> = (changed: Partial<T>, all: Partial<T>) => void

interface FormInternalOptions<T extends Record<string, unknown>> {
  onFinish?: FinishHandler<T>
  onFinishFailed?: FinishFailedHandler<T>
  onValuesChange?: ValuesChangeHandler<T>
}

/** 创建 Form 实例 */
export function createFormInstance<T extends Record<string, unknown> = Record<string, unknown>>(
  options: FormInternalOptions<T> = {}
): FormInstance<T> {
  let values: Record<string, unknown> = {}
  let initialValues: Record<string, unknown> = {}
  const fieldEntities = new Map<string, FieldEntity>()
  const fieldMeta = new Map<string, FieldMeta>()
  const listeners = new Set<() => void>()
  let handlers: FormInternalOptions<T> = {...options}

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  const getMeta = (name: NamePath): FieldMeta => {
    const key = pathKey(name)
    return fieldMeta.get(key) ?? {touched: false, validating: false, errors: []}
  }

  const setMeta = (name: NamePath, patch: SetFieldOptions) => {
    const key = pathKey(name)
    const prev = getMeta(name)
    fieldMeta.set(key, {
      touched: patch.touched ?? prev.touched,
      validating: patch.validating ?? prev.validating,
      errors: patch.errors ?? prev.errors,
    })
  }

  const updateValue = (name: NamePath, value: unknown) => {
    const prev = getPathValue(values, name)
    const entity = fieldEntities.get(pathKey(name))
    const normalized = entity?.normalize ? entity.normalize(value, prev, values) : value
    values = setPathValue(values, name, normalized)
    setMeta(name, {touched: true})
    notify()
    if (options.onValuesChange) {
      const changed = setPathValue({}, name, getPathValue(values, name)) as Partial<T>
      handlers.onValuesChange?.(changed, values as Partial<T>)
    }
  }

  const validateField = async (name: NamePath): Promise<string | null> => {
    const entity = fieldEntities.get(pathKey(name))
    if (!entity) return null
    setMeta(name, {validating: true, errors: []})
    notify()
    const value = getPathValue(values, name)
    const label = typeof entity.label === 'string' ? entity.label : undefined
    const rules = entity.rules ?? []
    const mergedRules = entity.required
      ? [{required: true, message: `请输入${label ?? '该字段'}`}, ...rules]
      : rules
    const error = await validateRules(value, mergedRules, label)
    setMeta(name, {validating: false, errors: error ? [error] : []})
    notify()
    return error
  }

  const instance: FormInstance<T> = {
    getFieldValue(name) {
      return getPathValue(values, name)
    },

    getFieldsValue(nameList) {
      if (nameList === true || nameList === undefined) {
        return cloneValues(values) as Partial<T>
      }
      const result: Record<string, unknown> = {}
      ;(nameList as NamePath[]).forEach((name) => {
        const path = toPath(name)
        result[pathKey(name)] = getPathValue(values, name)
      })
      return result as Partial<T>
    },

    setFieldValue(name, value) {
      updateValue(name, value)
    },

    setFieldsValue(partial) {
      Object.entries(partial).forEach(([key, val]) => {
        values = setPathValue(values, key, val)
      })
      notify()
    },

    resetFields(fields) {
      if (!fields) {
        values = cloneValues(initialValues)
        fieldMeta.forEach((_, key) => {
          fieldMeta.set(key, {touched: false, validating: false, errors: []})
        })
      } else {
        fields.forEach((name) => {
          const initVal = getPathValue(initialValues, name)
          if (initVal === undefined) {
            values = deletePathValue(values, name)
          } else {
            values = setPathValue(values, name, initVal)
          }
          setMeta(name, {touched: false, validating: false, errors: []})
        })
      }
      notify()
    },

    async validateFields(nameList) {
      const targets: NamePath[] = []
      fieldEntities.forEach((entity) => {
        if (containsName(nameList, entity.name)) {
          targets.push(entity.name)
        }
      })

      const errorFields: {name: NamePath; errors: string[]}[] = []
      for (const name of targets) {
        const error = await validateField(name)
        if (error) {
          errorFields.push({name, errors: [error]})
        }
      }

      if (errorFields.length > 0) {
        throw {values: cloneValues(values) as Partial<T>, errorFields}
      }
      return cloneValues(values) as T
    },

    submit() {
      instance
        .validateFields()
        .then((result) => {
          handlers.onFinish?.(result)
        })
        .catch((info) => {
          handlers.onFinishFailed?.(info)
        })
    },

    _registerField(entity) {
      const key = pathKey(entity.name)
      fieldEntities.set(key, entity)
      if (!fieldMeta.has(key)) {
        fieldMeta.set(key, {touched: false, validating: false, errors: []})
      }
      notify()
      return () => {
        fieldEntities.delete(key)
        fieldMeta.delete(key)
        notify()
      }
    },

    _subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    _getSnapshot(): FormSnapshot {
      const fields: Record<string, FieldMeta> = {}
      fieldMeta.forEach((meta, key) => {
        fields[key] = {...meta}
      })
      return {values: cloneValues(values), fields}
    },

    _setInitialValues(next) {
      initialValues = cloneValues(next as Record<string, unknown>)
      values = cloneValues(initialValues)
      notify()
    },
  }

  ;(instance as InternalFormInstance<T> & {__validateField?: typeof validateField}).__validateField = validateField
  ;(instance as InternalFormInstance<T> & {__updateValue?: typeof updateValue}).__updateValue = updateValue
  ;(instance as InternalFormInstance<T> & {__getMeta?: typeof getMeta}).__getMeta = getMeta
  ;(instance as InternalFormInstance<T> & {__setHandlers?: (next: FormInternalOptions<T>) => void}).__setHandlers = (
    next
  ) => {
    handlers = {...handlers, ...next}
  }

  return instance
}

export type InternalFormInstance<T extends Record<string, unknown> = Record<string, unknown>> =
  FormInstance<T> & {
    __validateField?: (name: NamePath) => Promise<string | null>
    __updateValue?: (name: NamePath, value: unknown) => void
    __getMeta?: (name: NamePath) => FieldMeta
    __setHandlers?: (options: FormInternalOptions<T>) => void
  }

/** 绑定 Form 级事件处理器 */
export function updateFormHandlers<T extends Record<string, unknown>>(
  form: InternalFormInstance<T>,
  options: FormInternalOptions<T>
) {
  form.__setHandlers?.(options)
}
