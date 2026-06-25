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
}
