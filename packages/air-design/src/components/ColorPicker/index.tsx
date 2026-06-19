/**
 * ColorPicker 颜色选择器
 *
 * 重写为基于 react-colorful + Radix Popover 的自建实现，摆脱对 antd ColorPicker 内部
 * Picker/Presets 子件的依赖。取色面板、可编辑 hex 输入、预设色网格、「无背景色」重置。
 * 编辑 hex 后取色面板指示器自动同步到对应颜色位置。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useState} from 'react'
import {HexColorPicker} from 'react-colorful'
import {Popover, PopoverTrigger, PopoverContent} from '@/primitives/popover'
import {Input} from '@/primitives/input'
import {cn} from '@/lib/cn'

/** 预设颜色配置：键为分组名，值为颜色数组 */
export interface PresetColorConfig {
  [key: string]: string[] | undefined
}

/** 内置预设色（每组主色，共 12 个，紧凑网格展示） */
const DEFAULT_PRESET_SWATCHES = [
  '#ff4d4f',
  '#fa541c',
  '#fa8c16',
  '#faad14',
  '#a0d911',
  '#52c41a',
  '#13c2c2',
  '#1677ff',
  '#2f54eb',
  '#722ed1',
  '#eb2f96',
  '#595959',
]

const FALLBACK_COLOR = '#1677ff'

/** 从分组预设中提取展示色板：每组取首个颜色，去重并限制数量 */
function flattenPresetSwatches(presets: PresetColorConfig, max = 12): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const colors of Object.values(presets)) {
    if (!colors?.length) continue
    for (const color of colors) {
      if (seen.has(color)) continue
      seen.add(color)
      result.push(color)
      if (result.length >= max) return result
    }
  }
  return result
}

/** 规范化 hex：支持 #RGB / #RRGGBB，无效时返回 null */
function normalizeHex(input: string): string | null {
  let hex = input.trim()
  if (!hex) return null
  if (!hex.startsWith('#')) hex = `#${hex}`
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    const [, r, g, b] = hex
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return hex.toLowerCase()
  }
  return null
}

/** 解析外部 value，无效时回退默认色 */
function resolveColor(value?: string | null): string {
  return normalizeHex(value ?? '') ?? FALLBACK_COLOR
}

export interface ColorPickerProps {
  /** 当前颜色值（hex 字符串） */
  value?: string | null
  /** 颜色变化完成回调，接收 hex 字符串 */
  onChangeComplete?: (color: {toHexString: () => string}) => void
  /** 触发方式，默认 click */
  trigger?: 'click' | 'hover'
  /** 自定义预设颜色 */
  presetColors?: PresetColorConfig
  /** 弹窗宽度，默认 240px */
  popupWidth?: number
  /** 触发元素 */
  children: React.ReactNode
  className?: string
}

/** 将字符串包装成 antd 兼容的 {toHexString} 结构，便于消费方零改动 */
function toColorObject(hex: string) {
  return {toHexString: () => hex}
}

const AirColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChangeComplete,
  presetColors,
  popupWidth = 240,
  children,
  className,
}) => {
  const swatches = presetColors
    ? flattenPresetSwatches(presetColors)
    : DEFAULT_PRESET_SWATCHES

  const [pickerColor, setPickerColor] = useState(() => resolveColor(value))
  const [hexInput, setHexInput] = useState(() => resolveColor(value))

  /** 外部 value 变化时同步面板与输入框 */
  useEffect(() => {
    const next = resolveColor(value)
    setPickerColor(next)
    setHexInput(next)
  }, [value])

  /** 提交有效 hex，同步取色面板并通知外部 */
  const applyColor = (hex: string) => {
    setPickerColor(hex)
    setHexInput(hex)
    onChangeComplete?.(toColorObject(hex))
  }

  /** 尝试规范化并提交；失败时回退到当前有效色 */
  const commitHexInput = (raw: string, revertOnFail = true) => {
    const normalized = normalizeHex(raw)
    if (normalized) {
      applyColor(normalized)
      return true
    }
    if (revertOnFail) setHexInput(pickerColor)
    return false
  }

  const handlePickerChange = (hex: string) => {
    applyColor(hex.toLowerCase())
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setHexInput(next)
    const normalized = normalizeHex(next)
    if (normalized) applyColor(normalized)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className={cn('inline-flex', className)}>{children}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" style={{width: popupWidth}} align="start">
        <div className="flex flex-col gap-3">
          <HexColorPicker
            color={pickerColor}
            onChange={handlePickerChange}
            style={{width: '100%', height: 140}}
          />
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-5 shrink-0 rounded border"
              style={{backgroundColor: pickerColor}}
            />
            <Input
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={() => commitHexInput(hexInput)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitHexInput(hexInput)
                  ;(e.target as HTMLInputElement).blur()
                }
                if (e.key === 'Escape') {
                  setHexInput(pickerColor)
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              className="h-7 flex-1 font-mono text-xs uppercase"
              spellCheck={false}
              aria-label="颜色代码"
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => applyColor(color.toLowerCase())}
                className={cn(
                  'size-6 rounded border transition-transform hover:scale-110',
                  color.toLowerCase() === pickerColor.toLowerCase()
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-border'
                )}
                style={{backgroundColor: color}}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => applyColor('#ffffff')}
            className="w-full rounded border border-dashed py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            无背景色
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AirColorPicker
