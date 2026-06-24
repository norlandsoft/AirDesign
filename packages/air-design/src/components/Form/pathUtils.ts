/**
 * 表单字段路径工具
 *
 * 支持 antd 风格的嵌套字段名（字符串或路径数组），用于读写 values 与 fields 元信息。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {NamePath} from './types'

/** 将 NamePath 规范为路径数组 */
export function toPath(name: NamePath): (string | number)[] {
  if (Array.isArray(name)) return name
  return [name]
}

/** 路径转字符串 key，用于 Map 存储 */
export function pathKey(name: NamePath): string {
  return toPath(name).join('.')
}

/** 按路径读取嵌套对象值 */
export function getPathValue(obj: Record<string, unknown>, name: NamePath): unknown {
  const path = toPath(name)
  let current: unknown = obj
  for (const key of path) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string | number, unknown>)[key]
  }
  return current
}

/** 按路径写入嵌套对象值（不可变更新） */
export function setPathValue(
  obj: Record<string, unknown>,
  name: NamePath,
  value: unknown
): Record<string, unknown> {
  const path = toPath(name)
  if (path.length === 0) return obj

  const clone = {...obj}
  let current: Record<string | number, unknown> = clone

  path.forEach((key, index) => {
    if (index === path.length - 1) {
      current[key] = value
      return
    }
    const next = current[key]
    const nextObj =
      next != null && typeof next === 'object' && !Array.isArray(next)
        ? {...(next as Record<string, unknown>)}
        : Array.isArray(next)
          ? [...next]
          : {}
    current[key] = nextObj
    current = nextObj as Record<string | number, unknown>
  })

  return clone
}

/** 按路径删除字段（重置时用） */
export function deletePathValue(obj: Record<string, unknown>, name: NamePath): Record<string, unknown> {
  const path = toPath(name)
  if (path.length === 0) return obj

  const clone = {...obj}
  let current: Record<string | number, unknown> = clone

  path.forEach((key, index) => {
    if (index === path.length - 1) {
      delete current[key]
      return
    }
    const next = current[key]
    if (next == null || typeof next !== 'object') return
    const nextClone = Array.isArray(next) ? [...next] : {...(next as Record<string, unknown>)}
    current[key] = nextClone
    current = nextClone as Record<string | number, unknown>
  })

  return clone
}

/** 深拷贝简单对象（表单 values 用） */
export function cloneValues<T extends Record<string, unknown>>(values: T): T {
  return JSON.parse(JSON.stringify(values)) as T
}

/** 比较两个 NamePath 是否相同 */
export function isSamePath(a: NamePath, b: NamePath): boolean {
  return pathKey(a) === pathKey(b)
}

/** 判断 nameList 是否包含指定字段 */
export function containsName(nameList: NamePath[] | undefined, name: NamePath): boolean {
  if (!nameList) return true
  const key = pathKey(name)
  return nameList.some((item) => pathKey(item) === key)
}
