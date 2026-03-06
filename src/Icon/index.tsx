/**
 * Icon 组件：按 name 渲染 SVG 图标，使用构建时生成的 icons-data
 * 优化：使用 useMemo + 全局缓存，避免 useState + useEffect 的额外渲染
 * Created by ChaiMingxu
 */
import React, { useMemo } from 'react'
import { iconData } from './icons-data'
import { getCachedSvg } from './icon-cache'

interface IconsProps {
  name: string
  size?: number
  color?: string
  thickness?: number
  className?: string
}

/**
 * 纯函数：解析 SVG 字符串，设置尺寸和描边粗细
 */
function parseSvg(name: string, size: number, thickness: number): string | null {
  let raw = iconData[name]
  if (!raw) {
    raw =
      iconData[name.toLowerCase()] ??
      iconData[name.toUpperCase()] ??
      iconData[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()]
  }
  if (!raw) {
    return null
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'image/svg+xml')
  const svgElement = doc.querySelector('svg')
  if (!svgElement) {
    return null
  }

  svgElement.setAttribute('height', size.toString())
  svgElement.setAttribute('width', size.toString())
  const allElements = svgElement.querySelectorAll(
    'g, path, circle, rect, line, polyline, polygon'
  )
  allElements.forEach((element) => {
    if (element.hasAttribute('stroke-width')) {
      element.setAttribute('stroke-width', thickness.toString())
    }
  })
  return svgElement.outerHTML
}

const Icon: React.FC<IconsProps> = (props) => {
  const { name, size = 24, color = '#123F68', thickness = 1.5, className } = props

  const svgContent = useMemo(() => {
    if (!name) return null
    return getCachedSvg(name, size, thickness, parseSvg)
  }, [name, size, thickness])

  if (!name) {
    return <div className={className} style={{ width: size, height: size }} />
  }

  if (svgContent === null) {
    return (
      <div className={className} style={{ width: size, height: size, color: 'red' }}>
        {name}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

export default Icon
