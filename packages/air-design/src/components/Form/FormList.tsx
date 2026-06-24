/**
 * Form.List 动态字段列表
 *
 * 支持动态增删表单项，对齐 antd Form.List 的 fields / add / remove / move API。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useMemo, useSyncExternalStore} from 'react'
import {FormItemPrefixContext, mergeNamePath, useFormContext, useFormItemPrefix} from './context'
import {getPathValue, pathKey} from './pathUtils'
import type {FormListProps} from './types'
import type {InternalFormInstance} from './formInstance'

const FormList: React.FC<FormListProps> = ({name, children}) => {
  const {form} = useFormContext()
  const parentPrefix = useFormItemPrefix()
  const listName = useMemo(() => mergeNamePath(parentPrefix, name), [parentPrefix, name])

  const snapshot = useSyncExternalStore(
    (listener) => form._subscribe(listener),
    () => form._getSnapshot(),
    () => form._getSnapshot()
  )

  const listValue = getPathValue(snapshot.values, listName)
  const items = Array.isArray(listValue) ? listValue : []
  const internalForm = form as InternalFormInstance

  const operations = {
    add(defaultValue: unknown = {}) {
      const current = getPathValue(form._getSnapshot().values, listName)
      const next = Array.isArray(current) ? [...current, defaultValue] : [defaultValue]
      internalForm.__updateValue?.(listName, next)
    },
    remove(index: number) {
      const current = getPathValue(form._getSnapshot().values, listName)
      if (!Array.isArray(current)) return
      internalForm.__updateValue?.(
        listName,
        current.filter((_, i) => i !== index)
      )
    },
    move(from: number, to: number) {
      const current = getPathValue(form._getSnapshot().values, listName)
      if (!Array.isArray(current) || from === to) return
      const next = [...current]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      internalForm.__updateValue?.(listName, next)
    },
  }

  const fields = items.map((_, index) => ({
    name: index,
    key: index,
  }))

  return <>{children(fields, operations)}</>
}

/** 供 Form.List 行内 Form.Item 使用的路径前缀 Provider */
export const FormListField: React.FC<{fieldName: number; listName: (string | number)[]; children: React.ReactNode}> = ({
  fieldName,
  listName,
  children,
}) => {
  const prefix = useMemo(
    () => [...listName, fieldName],
    [pathKey(listName), fieldName]
  )
  return <FormItemPrefixContext.Provider value={prefix}>{children}</FormItemPrefixContext.Provider>
}

export default FormList
