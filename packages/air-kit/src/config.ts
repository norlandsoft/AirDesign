/**
 * air-kit 全局配置模块
 *
 * 各业务应用在启动时调用 defineSdkConfig 注入应用名称、存储前缀、主题色等配置。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {SdkConfig} from './types/auth'

let _config: SdkConfig | null = null

const DEFAULT_CONFIG: SdkConfig = {
  storagePrefix: 'air-app',
  appName: 'Unknown',
}

/** 定义 air-kit 全局配置，应在应用入口最早调用 */
export function defineSdkConfig(config: SdkConfig): SdkConfig {
  _config = config
  return config
}

/** 获取当前 air-kit 配置 */
export function getSdkConfig(): SdkConfig {
  return _config || DEFAULT_CONFIG
}

/** 生成带应用前缀的 sessionStorage 键名 */
export function storageKey(suffix: string): string {
  return `${getSdkConfig().storagePrefix}-${suffix}`
}

/**
 * 是否为平台 Admin 模式（loginId 固定为 admin）。
 * Admin 前端只访问 /admin/*，不走 /api/v1/auth/*。
 */
export function isAdminPlatform(): boolean {
  return getSdkConfig().loginId?.toLowerCase() === 'admin'
}

/** @deprecated 使用 defineSdkConfig */
export const defineAuthConfig = defineSdkConfig

/** @deprecated 使用 getSdkConfig */
export const getAuthConfig = getSdkConfig
