/**
 * SVG 解析缓存
 * 跨组件实例共享解析结果，避免重复 DOMParser 调用
 * Created by ChaiMingxu
 */
const svgCache = new Map<string, string | null>()

export function getCachedSvg(
  name: string,
  size: number,
  thickness: number,
  parser: (name: string, size: number, thickness: number) => string | null
): string | null {
  const cacheKey = `${name}:${size}:${thickness}`

  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey)!
  }

  const result = parser(name, size, thickness)
  svgCache.set(cacheKey, result)
  return result
}

export function clearIconCache(): void {
  svgCache.clear()
}
