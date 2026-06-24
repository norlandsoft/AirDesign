/**
 * Form 根组件
 *
 * 提供表单上下文、initialValues、layout 与 submit 行为，对齐 antd Form 常用能力。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useEffect, useMemo} from 'react'
import {cn} from '@/lib/cn'
import {FormContext} from './context'
import FormItem from './FormItem'
import FormList from './FormList'
import {createFormInstance, updateFormHandlers} from './formInstance'
import {useForm} from './useForm'
import type {FormProps} from './types'
import type {InternalFormInstance} from './formInstance'
import './Form.css'

type FormComponent = (<T extends Record<string, unknown> = Record<string, unknown>>(
  props: FormProps<T>
) => React.ReactElement | null) & {
  Item: typeof FormItem
  List: typeof FormList
  useForm: typeof useForm
  create: typeof createFormInstance
}

function FormRoot<T extends Record<string, unknown> = Record<string, unknown>>(props: FormProps<T>) {
  const {
    form: propForm,
    initialValues,
    layout = 'vertical',
    labelCol,
    wrapperCol,
    labelAlign = 'right',
    requiredMark = true,
    onFinish,
    onFinishFailed,
    onValuesChange,
    className,
    style,
    children,
  } = props

  const [fallbackForm] = useForm<T>()
  const form = (propForm ?? fallbackForm) as InternalFormInstance<T>

  useEffect(() => {
    if (initialValues) {
      form._setInitialValues(initialValues)
    }
  }, [form, initialValues])

  useEffect(() => {
    updateFormHandlers<T>(form, {onFinish, onFinishFailed, onValuesChange})
  }, [form, onFinish, onFinishFailed, onValuesChange])

  const contextValue = useMemo(
    () => ({
      // 上下文层使用宽化后的实例类型，FormItem 仅通过 NamePath 读写 unknown 值
      form: form as InternalFormInstance,
      layout,
      labelCol,
      wrapperCol,
      labelAlign,
      requiredMark,
    }),
    [form, layout, labelCol, wrapperCol, labelAlign, requiredMark]
  )

  return (
    <FormContext.Provider value={contextValue}>
      <form
        className={cn('air-form', layout === 'inline' && 'air-form-inline flex flex-wrap items-start', className)}
        style={style}
        onSubmit={(event) => {
          event.preventDefault()
          form.submit()
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
}

const Form = FormRoot as FormComponent
Form.Item = FormItem
Form.List = FormList
Form.useForm = useForm
Form.create = createFormInstance

export default Form
