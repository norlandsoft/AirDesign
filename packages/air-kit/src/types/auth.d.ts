/** SDK 全局配置类型 */
export interface SdkConfig {
  /** sessionStorage 键名前缀，用于多应用隔离 */
  storagePrefix: string
  /** 应用名称，显示在登录页等位置 */
  appName: string
  /** 应用副标题 */
  appTagline?: string
  /** 登录页主题色 */
  theme?: 'blue' | 'teal' | 'cyan' | 'emerald' | 'indigo' | 'violet' | 'rose' | 'orange' | 'amber' | 'slate'
  /**
   * 固定登录身份（登录 ID）。
   * 配置后登录页将隐藏用户名输入框，仅保留密码输入框，并以该固定值作为登录 ID 提交。
   * 适用于单账户场景（如 AirFramework 管理后台仅有 admin 一个账户）。
   * 不配置则保持默认的双输入框（用户名 + 密码）模式。
   */
  loginId?: string
}
