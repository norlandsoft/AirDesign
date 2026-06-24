/**
 * Form 字段校验引擎
 *
 * 实现 antd Rule 常用能力：required、长度、范围、pattern、type、自定义 validator。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {Rule} from './types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

/** 执行单条规则，返回错误文案或 null */
export async function validateRule(
  value: unknown,
  rule: Rule,
  label?: string
): Promise<string | null> {
  const labelText = typeof label === 'string' ? label : '该字段'

  if (rule.required) {
    if (isEmpty(value)) {
      return rule.message ?? `请输入${labelText}`
    }
    if (rule.whitespace && typeof value === 'string' && value.trim() === '') {
      return rule.message ?? `请输入${labelText}`
    }
    if (rule.type === 'array' && Array.isArray(value) && value.length === 0) {
      return rule.message ?? `请选择${labelText}`
    }
  }

  if (isEmpty(value)) {
    return null
  }

  if (rule.type === 'array' && !Array.isArray(value)) {
    return rule.message ?? `${labelText}必须是数组`
  }

  if (typeof value === 'string') {
    if (rule.len != null && value.length !== rule.len) {
      return rule.message ?? `${labelText}长度必须为 ${rule.len} 个字符`
    }
    if (rule.min != null && value.length < rule.min) {
      return rule.message ?? `${labelText}至少 ${rule.min} 个字符`
    }
    if (rule.max != null && value.length > rule.max) {
      return rule.message ?? `${labelText}最多 ${rule.max} 个字符`
    }
  }

  if (typeof value === 'number') {
    if (rule.type === 'integer' && !Number.isInteger(value)) {
      return rule.message ?? `${labelText}必须是整数`
    }
    if (rule.min != null && value < rule.min) {
      return rule.message ?? `${labelText}不能小于 ${rule.min}`
    }
    if (rule.max != null && value > rule.max) {
      return rule.message ?? `${labelText}不能大于 ${rule.max}`
    }
  }

  if (Array.isArray(value)) {
    if (rule.min != null && value.length < rule.min) {
      return rule.message ?? `${labelText}至少选择 ${rule.min} 项`
    }
    if (rule.max != null && value.length > rule.max) {
      return rule.message ?? `${labelText}最多选择 ${rule.max} 项`
    }
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message ?? `${labelText}格式不正确`
  }

  if (rule.type === 'email' && typeof value === 'string' && !EMAIL_PATTERN.test(value)) {
    return rule.message ?? `请输入有效的邮箱地址`
  }

  if (rule.type === 'url' && typeof value === 'string' && !URL_PATTERN.test(value)) {
    return rule.message ?? `请输入有效的 URL`
  }

  if (rule.validator) {
    const result = await rule.validator(rule, value)
    if (typeof result === 'string' && result) return result
  }

  return null
}

/** 依次执行规则列表，返回首个错误 */
export async function validateRules(
  value: unknown,
  rules: Rule[] | undefined,
  label?: string
): Promise<string | null> {
  if (!rules?.length) return null
  for (const rule of rules) {
    const error = await validateRule(value, rule, label)
    if (error) return error
  }
  return null
}
