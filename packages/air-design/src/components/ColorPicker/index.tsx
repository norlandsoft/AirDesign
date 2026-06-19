/**
 * ColorPicker 颜色选择器
 *
 * 重写为基于 react-colorful + Radix Popover 的自建实现，摆脱对 antd ColorPicker 内部
 * Picker/Presets 子件的依赖。功能对齐旧版：取色面板、预设调色板、「无背景色」重置。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {HexColorPicker} from 'react-colorful'
import {Popover, PopoverTrigger, PopoverContent} from '@/primitives/popover'
import {Separator} from '@/primitives/separator'
import {cn} from '@/lib/cn'

/** 预设颜色配置：键为分组名，值为颜色数组 */
export interface PresetColorConfig {
  [key: string]: string[] | undefined
}

/** 内置预设调色板（替代 @ant-design/colors 的 presetPalettes） */
const DEFAULT_PRESETS: PresetColorConfig = {
  red: ['#ff4d4f', '#ff7875', '#ffa39e'],
  volcano: ['#fa541c', '#ff7a45', '#fa8c16'],
  orange: ['#fa8c16', '#ffa940', '#ffc53d'],
  gold: ['#faad14', '#ffc53d', '#ffe58f'],
  yellow: ['#fadb14', '#d4b106', '#f5222d'],
  lime: ['#a0d911', '#73d13d', '#52c41a'],
  green: ['#52c41a', '#389e0d', '#237804'],
  cyan: ['#13c2c2', '#08979c', '#006d75'],
  blue: ['#1677ff', '#0958d9', '#003eb3'],
  geekblue: ['#2f54eb', '#1d39c4', '#10239e'],
  purple: ['#722ed1', '#531dab', '#391085'],
  magenta: ['#eb2f96', '#c41d7f', '#9e1068'],
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
  /** 弹窗宽度，默认 375px */
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
  popupWidth = 375,
  children,
  className,
}) => {
  const presets = presetColors ?? DEFAULT_PRESETS
  const current = value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : '#1677ff'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className={cn('inline-flex', className)}>{children}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" style={{width: popupWidth}} align="start">
        <div className="flex gap-3">
          {/* 左：取色面板 */}
          <div className="flex flex-col gap-2">
            <HexColorPicker
              color={current}
              onChange={(hex) => onChangeComplete?.(toColorObject(hex))}
              style={{width: 200, height: 160}}
            />
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block size-5 rounded border" style={{backgroundColor: current}}/>
              <span className="font-mono uppercase">{current}</span>
            </div>
          </div>

          <Separator orientation="vertical"/>

          {/* 右：预设调色板 + 无背景色 */}
          <div className="flex-1 space-y-3">
            {Object.entries(presets).map(([label, colors]) =>
              colors && colors.length ? (
                <div key={label}>
                  <div className="mb-1 text-xs capitalize text-muted-foreground">{label}</div>
                  <div className="flex flex-wrap gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => onChangeComplete?.(toColorObject(color))}
                        className="size-5 rounded border border-border transition-transform hover:scale-110"
                        style={{backgroundColor: color}}
                      />
                    ))}
                  </div>
                </div>
              ) : null
            )}
            <button
              type="button"
              onClick={() => onChangeComplete?.(toColorObject('#ffffff'))}
              className="w-full rounded border border-dashed py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              无背景色
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AirColorPicker
