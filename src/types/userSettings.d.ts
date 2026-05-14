/**
 * 用户设置相关类型定义
 * 对应后端的DTO（Request）和VO（Response）结构
 * Created by ChaiMingXu, on 2026/1/13
 */

/**
 * 显示设置
 */
export interface DisplaySettings {
  /**
   * 是否启用分页
   */
  paginationEnabled?: boolean;

  /**
   * 每页显示条数
   */
  pageSize?: number;

  /**
   * 字体大小
   */
  fontSize?: number;

  /**
   * 是否显示状态栏
   */
  showStatusBar?: boolean;
}

/**
 * 用户设置更新请求
 */
export interface UserSettingsUpdateRequest {
  /**
   * 用户ID
   */
  userId?: string;

  /**
   * 显示设置JSON
   */
  displaySettings?: string;
}

/**
 * 用户设置响应
 */
export interface UserSettingsResponse {
  /**
   * 设置ID
   */
  id?: string;

  /**
   * 用户ID
   */
  userId?: string;

  /**
   * 显示设置JSON
   */
  displaySettings?: string;
}
