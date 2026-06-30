/**
 * 用户设置类型定义
 *
 * 定义用户个性化设置的数据结构，包括显示偏好等配置。
 * AirFramework /api/v1/user/settings 接口使用 settings 字段（JSON 字符串）。
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
  /** 显示设置 JSON，AirFramework 必填 */
  settings?: string;
  /** 部分旧版平台接口字段，仅作兼容读取 */
  displaySettings?: string;
}

/** 用户设置响应 */
export interface UserSettingsResponse {
  id?: string;
  userId?: string;
  /** 显示设置 JSON，AirFramework 标准字段 */
  settings?: string;
  /** 部分旧版平台接口字段，仅作兼容读取 */
  displaySettings?: string;
}
