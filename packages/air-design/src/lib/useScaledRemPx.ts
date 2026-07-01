/**
 * 读取当前根字号下 rem 对应的像素值
 *
 * 随 --font-scale 变化自动更新，供虚拟列表行高等需传 px 的 API 与 CSS rem 对齐。
 *
 * @author ChaiMingXu, 2026/06/25
 */
import {useEffect, useState} from 'react'
import {REM_BASE} from './rem'

/**
 * 将 rem 数值换算为当前文档下的 px（四舍五入），字号档位切换时自动刷新
 */
export function useScaledRemPx(rem: number, fallbackPx = rem * REM_BASE): number {
  const readPx = () => {
    if (typeof document === 'undefined') return fallbackPx
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || REM_BASE
    return Math.round(rem * rootPx)
  }

  const [px, setPx] = useState(readPx)

  useEffect(() => {
    const sync = () => setPx(readPx())
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-font-size'],
    })
    window.addEventListener('resize', sync)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [rem, fallbackPx])

  return px
}
