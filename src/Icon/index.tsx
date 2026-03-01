/**
 * Icon 组件：按 name 渲染 SVG 图标，使用构建时生成的 icons-data
 * Created by ChaiMingxu
 */
import React, { useEffect, useState } from 'react'
import { iconData } from './icons-data'

interface IconsProps {
  name: string
  size?: number
  color?: string
  thickness?: number
  className?: string
}

const Icon: React.FC<IconsProps> = (props) => {
  const { name, size = 24, color = '#123F68', thickness = 1.5, className } = props
  const [svgContent, setSvgContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!name) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError('')
      let raw = iconData[name]
      if (!raw) {
        raw =
          iconData[name.toLowerCase()] ??
          iconData[name.toUpperCase()] ??
          iconData[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()]
      }
      if (!raw) {
        setError(name)
        setLoading(false)
        return
      }
      const parser = new DOMParser()
      const doc = parser.parseFromString(raw, 'image/svg+xml')
      const svgElement = doc.querySelector('svg')
      if (svgElement) {
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
        setSvgContent(svgElement.outerHTML)
      } else {
        setError('SVG元素未找到')
      }
    } catch (err) {
      setError(name)
    } finally {
      setLoading(false)
    }
  }, [name, size, color, thickness])

  if (loading) {
    return <div className={className} style={{ width: size, height: size }} />
  }
  if (error) {
    return (
      <div className={className} style={{ width: size, height: size, color: 'red' }}>
        {error}
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
