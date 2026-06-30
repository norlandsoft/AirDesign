/**
 * 用户设置类型定义
 *
 * 定义用户个性化设置的数据结构，包括显示偏好等配置。
 * settings 字段为 JSON 字符串，持久化在 AirFramework 平台，登录后由 air-kit 拉取并缓存在 sessionStorage。
 *
 * Author: ChaiMingXu, 2026/05/28
 */

/** 显示设置 */
export interface DisplaySettings {
  fontSize?: number;
}

/** 用户设置更新请求 */
export interface UserSettingsUpdateRequest {
  userId?: string;
  displaySettings?: string;
}

/** 用户设置响应 */
export interface UserSettingsResponse {
  id?: string;
  userId?: string;
  settings?: string;
}
