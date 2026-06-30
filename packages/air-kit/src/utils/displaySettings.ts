/**
 * 显示偏好工具：字号解析、应用与 sessionStorage 缓存
 *
 * 与 UserSettings/DisplaySettings 的字号档位一致（13/15/17 px），
 * 通过 air-design CSS 变量 --base-font-size 驱动全站 rem 缩放。
 * 登录后从 AirFramework 拉取用户设置并写入 sessionStorage，供同会话内快速恢复。
 *
 * @author ChaiMingXu, 2026/06/30
 */
import {storageKey} from '../config'

/** 字号档位（px），与 DisplaySettings FONT_OPTIONS 对齐 */
export const FONT_SIZE_PRESETS = {
  small: 13,
  medium: 15,
  large: 17,
} as const

/** 合法字号集合，用于校验远端设置与本地缓存 */
export const VALID_FONT_SIZES: readonly number[] = [
  FONT_SIZE_PRESETS.small,
  FONT_SIZE_PRESETS.medium,
  FONT_SIZE_PRESETS.large,
]

/** 无用户设置时的默认字号（中号） */
export const DEFAULT_FONT_SIZE = FONT_SIZE_PRESETS.medium

/** 字号选项，供 DisplaySettings 表单复用 */
export const FONT_SIZE_OPTIONS = [
  {value: FONT_SIZE_PRESETS.small, label: '小'},
  {value: FONT_SIZE_PRESETS.medium, label: '中'},
  {value: FONT_SIZE_PRESETS.large, label: '大'},
] as const

/** sessionStorage 缓存键后缀（完整键名由 storageKey 加应用前缀） */
const FONT_SIZE_STORAGE_SUFFIX = 'font-size'

/**
 * 将字号应用到 document 根节点，驱动 air-design rem 体系整体缩放
 */
export function applyBaseFontSize(px: number): void {
  document.documentElement.style.setProperty('--base-font-size', `${px}px`)
}

/**
 * 校验并规范化字号，非法值回落到 DEFAULT_FONT_SIZE
 */
export function normalizeFontSize(value: unknown): number {
  if (typeof value === 'number' && VALID_FONT_SIZES.includes(value)) {
    return value
  }
  return DEFAULT_FONT_SIZE
}

/**
 * 从用户 settings JSON 字符串解析 fontSize
 */
export function parseFontSizeFromSettings(settingsJson?: string | null): number {
  if (!settingsJson?.trim()) return DEFAULT_FONT_SIZE
  try {
    const parsed = JSON.parse(settingsJson) as {fontSize?: unknown}
    return normalizeFontSize(parsed.fontSize)
  } catch {
    return DEFAULT_FONT_SIZE
  }
}

/**
 * 从 sessionStorage 读取缓存字号；无缓存或非法值时返回 null
 */
export function readCachedFontSize(): number | null {
  try {
    const raw = sessionStorage.getItem(storageKey(FONT_SIZE_STORAGE_SUFFIX))
    if (raw == null) return null
    const px = Number(raw)
    return VALID_FONT_SIZES.includes(px) ? px : null
  } catch {
    return null
  }
}

/**
 * 将字号写入 sessionStorage，供同会话内刷新后快速应用
 */
export function writeCachedFontSize(px: number): void {
  try {
    sessionStorage.setItem(storageKey(FONT_SIZE_STORAGE_SUFFIX), String(normalizeFontSize(px)))
  } catch {
    // 隐私模式或配额满时忽略
  }
}

/**
 * 应用字号并同步 sessionStorage 缓存
 */
export function applyAndCacheFontSize(px: number): void {
  const normalized = normalizeFontSize(px)
  applyBaseFontSize(normalized)
  writeCachedFontSize(normalized)
}

/**
 * 根据远端 userSettings.settings 字段应用并缓存字号
 */
export function applyDisplaySettingsFromUserSettings(settingsJson?: string | null): void {
  applyAndCacheFontSize(parseFontSizeFromSettings(settingsJson))
}

/**
 * 应用启动时从 sessionStorage 恢复字号（须在 defineSdkConfig 之后调用）
 */
export function bootstrapDisplaySettings(): void {
  const cached = readCachedFontSize()
  applyBaseFontSize(cached ?? DEFAULT_FONT_SIZE)
}
