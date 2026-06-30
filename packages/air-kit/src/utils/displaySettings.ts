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
import type {UserSettingsResponse} from '../types/userSettings'

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
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (VALID_FONT_SIZES.includes(parsed)) return parsed
  }
  return DEFAULT_FONT_SIZE
}

/**
 * 解析 displaySettings JSON 为 DisplaySettings 对象
 */
export function parseDisplaySettings(settingsJson?: string | null): {fontSize?: unknown} {
  if (!settingsJson?.trim()) return {}
  try {
    return JSON.parse(settingsJson) as {fontSize?: unknown}
  } catch {
    return {}
  }
}

/**
 * 从 displaySettings JSON 字符串解析 fontSize
 */
export function parseFontSizeFromSettings(settingsJson?: string | null): number {
  return normalizeFontSize(parseDisplaySettings(settingsJson).fontSize)
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
 * 从 UserSettingsResponse 提取显示设置 JSON（兼容 settings / displaySettings 两种字段名）
 */
export function extractDisplaySettingsJson(userSettings?: UserSettingsResponse | null): string | null | undefined {
  return userSettings?.settings ?? userSettings?.displaySettings
}

/**
 * 合并已有设置并序列化为 API 请求体 settings 字段值
 */
export function buildSettingsPayload(
  existingJson: string | null | undefined,
  patch: {fontSize: unknown},
): string {
  const merged = {
    ...parseDisplaySettings(existingJson),
    fontSize: normalizeFontSize(patch.fontSize),
  }
  return JSON.stringify(merged)
}

/**
 * 根据远端 settings JSON 应用并缓存字号
 */
export function applyDisplaySettingsFromUserSettings(settingsJson?: string | null): void {
  applyAndCacheFontSize(parseFontSizeFromSettings(settingsJson))
}

/**
 * 根据 UserSettingsResponse 应用并缓存字号
 */
export function applyDisplaySettingsFromResponse(userSettings?: UserSettingsResponse | null): void {
  applyDisplaySettingsFromUserSettings(extractDisplaySettingsJson(userSettings))
}

/**
 * 应用启动时从 sessionStorage 恢复字号（须在 defineSdkConfig 之后调用）
 */
export function bootstrapDisplaySettings(): void {
  const cached = readCachedFontSize()
  applyBaseFontSize(cached ?? DEFAULT_FONT_SIZE)
}
