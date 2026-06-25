/**
 * air-kit 业务前端套件入口
 *
 * 与 air-design 并列，为企业应用提供登录页、安全布局、用户设置、
 * 跨应用切换等业务组件与用户 Store；可随平台能力扩展更多模块。
 * 依赖 air-design 通用 UI 组件库。状态管理基于 Zustand。
 *
 * @author ChaiMingXu, 2026/06/24
 */

// 配置
export {defineSdkConfig, getSdkConfig, storageKey} from './config'

// 用户 Store（Zustand，取代 DVA UserModel）
export {default as useUserStore, UserModel} from './models/user'
export type {UserState} from './models/user'

// 布局组件
export {default as SecurityLayout} from './layouts/SecurityLayout'

// 业务组件
export {default as AppSwitcher} from './components/AppSwitcher'
export {default as UserSettings} from './components/UserSettings'

// 页面组件
export {default as Login, LOGIN_THEMES} from './pages/Login'
export type {LoginTheme} from './pages/Login'

// 工具函数
export {POST, GET, SSE_POST} from './utils/HttpRequest'
export {SHA} from './utils/CryptoUtils'
export {getIconUrl, getAvatarUrl, getAgentIconUrl, extractAvatarId, AGENT_ICON_DEFAULT, AGENT_ICON_OPTIONS} from './utils/IconUtils'
export {randomString, UUID, shortId, equalJsonArray} from './utils/StringUtils'
export {formatFileSize} from './utils/FormatUtils'

// 类型导出
export type {SdkConfig} from './types/auth'
export type {UserResponse, UserLoginRequest} from './types/user'
export type {DisplaySettings, UserSettingsResponse, UserSettingsUpdateRequest} from './types/userSettings'
