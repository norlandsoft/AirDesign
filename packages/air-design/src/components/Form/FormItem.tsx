/**
 * Form.Item 表单项
 *
 * 负责标签、校验、错误展示，并向子控件注入 value / onChange（或 checked）等 props，
 * 行为对齐 antd Form.Item。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {cloneElement, isValidElement, useEffect, useMemo, useSyncExternalStore} from 'react'
import {cn} from '@/lib/cn'
import {FormItemPrefixContext, mergeNamePath, useFormContext, useFormItemPrefix} from './context'
import {pathKey} from './pathUtils'
import type {FormItemProps, NamePath} from './types'
import type {InternalFormInstance} from './formInstance'
import './Form.css'

interface FormItemExtendedProps extends FormItemProps {
  /** Form.List 内部使用的绝对路径 */
  absoluteName?: NamePath
}

/** 计算 horizontal 布局下列宽百分比 */
function colStyle(col?: {span?: number; offset?: number}): React.CSSProperties {
  const span = col?.span ?? 24
  const offset = col?.offset ?? 0
  return {
    flex: `0 0 ${(span / 24) * 100}%`,
    maxWidth: `${(span / 24) * 100}%`,
    marginLeft: offset ? `${(offset / 24) * 100}%` : undefined,
  }
}

/** 判断子元素是否已自行绑定 value */
function isControlledChild(child: React.ReactElement): boolean {
  return 'value' in (child.props as object) || 'checked' in (child.props as object)
}

const FormItem: React.FC<FormItemExtendedProps> = (props) => {
  const {
    name,
    absoluteName,
    label,
    rules,
    required,
    help,
    extra,
    hidden,
    valuePropName = 'value',
    trigger = 'onChange',
    validateTrigger = 'onChange',
    getValueFromEvent,
    normalize,
    colon = true,
    className,
    style,
    children,
  } = props

  const {form, layout, labelCol, wrapperCol, labelAlign, requiredMark} = useFormContext()
  const prefix = useFormItemPrefix()
  const fullName = useMemo<NamePath | undefined>(() => {
    if (absoluteName != null) return absoluteName
    if (name == null) return undefined
    return mergeNamePath(prefix, name)
  }, [absoluteName, name, prefix])

  const snapshot = useSyncExternalStore(
    (listener) => form._subscribe(listener),
    () => form._getSnapshot(),
    () => form._getSnapshot()
  )

  useEffect(() => {
    if (fullName == null) return undefined
    return form._registerField({
      name: fullName,
      rules,
      label,
      required,
      valuePropName,
      trigger,
      validateTrigger,
      getValueFromEvent,
      normalize,
    })
  }, [form, fullName, rules, label, required, valuePropName, trigger, validateTrigger, getValueFromEvent, normalize])

  if (hidden) return null

  const meta = fullName ? snapshot.fields[pathKey(fullName)] : undefined
  const errors = meta?.errors ?? []
  const status = errors.length > 0 ? 'error' : undefined
  const showRequired =
    requiredMark !== false &&
    (required || rules?.some((rule) => rule.required))

  const internalForm = form as InternalFormInstance

  const triggerValidate = async (triggerName: string) => {
    if (fullName == null) return
    const triggers = Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger]
    if (triggers.includes(triggerName)) {
      await internalForm.__validateField?.(fullName)
    }
  }

  const renderControl = () => {
    if (!isValidElement(children)) return children

    if (fullName == null || isControlledChild(children)) {
      return status ? cloneElement(children, {status} as Record<string, unknown>) : children
    }

    const fieldValue = form.getFieldValue(fullName)
    const injected: Record<string, unknown> = {
      [valuePropName]: fieldValue,
      status,
      id: pathKey(fullName),
    }

    injected[trigger] = (...args: unknown[]) => {
      const extractValue =
        getValueFromEvent ??
        ((...eventArgs: unknown[]) => {
          const first = eventArgs[0]
          if (first && typeof first === 'object' && first !== null && 'target' in first) {
            const target = (first as {target?: {value?: unknown; checked?: unknown}}).target
            if (target && 'checked' in target && typeof target.checked === 'boolean') {
              return target.checked
            }
            if (target && 'value' in target) {
              return target.value
            }
          }
          return first
        })
      const raw = extractValue(...args)
      internalForm.__updateValue?.(fullName, raw)
      const childHandler = (children.props as Record<string, unknown>)[trigger]
      if (typeof childHandler === 'function') {
        ;(childHandler as (...a: unknown[]) => void)(...args)
      }
      void triggerValidate(trigger)
    }

    if (trigger !== 'onBlur') {
      injected.onBlur = (...args: unknown[]) => {
        const childBlur = (children.props as Record<string, unknown>).onBlur
        if (typeof childBlur === 'function') {
          ;(childBlur as (...a: unknown[]) => void)(...args)
        }
        void triggerValidate('onBlur')
      }
    }

    return cloneElement(children, injected)
  }

  const labelNode = label != null && (
    <label
      className={cn(
        'air-form-item-label text-sm text-foreground',
        layout === 'horizontal' && 'pt-[9px]',
        labelAlign === 'right' && 'text-right'
      )}
      htmlFor={fullName ? pathKey(fullName) : undefined}
    >
      {showRequired && requiredMark !== 'optional' && (
        <span className="mr-1 text-destructive">*</span>
      )}
      {label}
      {layout === 'horizontal' && colon && label ? '：' : null}
      {showRequired && requiredMark === 'optional' && (
        <span className="ml-1 text-xs text-muted-foreground">（可选）</span>
      )}
    </label>
  )

  const control = (
    <div className="air-form-item-control min-w-0 flex-1">
      {renderControl()}
      {help && !errors.length ? (
        <div className="air-form-item-help mt-1 text-xs text-muted-foreground">{help}</div>
      ) : null}
      {errors.map((msg) => (
        <div key={msg} className="air-form-item-explain mt-1 text-xs text-destructive">
          {msg}
        </div>
      ))}
      {extra ? <div className="air-form-item-extra mt-1 text-xs text-muted-foreground">{extra}</div> : null}
    </div>
  )

  if (layout === 'inline') {
    return (
      <div className={cn('air-form-item air-form-item-inline mr-4 inline-flex align-top', className)} style={style}>
        {labelNode}
        {control}
      </div>
    )
  }

  if (layout === 'horizontal') {
    return (
      <div className={cn('air-form-item mb-5', className)} style={style}>
        <div className="air-form-item-row flex gap-3">
          {label != null ? (
            <div className="air-form-item-label-wrap shrink-0" style={colStyle(labelCol ?? {span: 6})}>
              {labelNode}
            </div>
          ) : null}
          <div style={colStyle(wrapperCol ?? {span: label != null ? 18 : 24})}>{control}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('air-form-item mb-5', className)} style={style}>
      {labelNode ? <div className="mb-1.5">{labelNode}</div> : null}
      {control}
    </div>
  )
}

export default FormItem
