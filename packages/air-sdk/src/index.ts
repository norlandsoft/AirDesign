/**
 * AirSDK 业务前端脚手架入口
 *
 * 为接口测试平台、测试管理平台、数据治理平台等企业应用提供统一的
 * 登录页、安全布局、用户设置、跨应用切换等业务组件与用户 Store。
 * 依赖 air-design 通用 UI 组件库，实现布局与样式一致性。
 * 状态管理基于 Zustand（已去 DVA/Umi 依赖）。
 *
 * @author ChaiMingXu, 2026/06/19
 */

// 配置
export {defineSdkConfig, getSdkConfig, storageKey} from './config'
/** @deprecated 使用 defineSdkConfig */
export {defineSdkConfig as defineAuthConfig} from './config'
/** @deprecated 使用 getSdkConfig */
export {getSdkConfig as getAuthConfig} from './config'

// 用户 Store（Zustand，取代 DVA UserModel）
export {default as useUserStore, UserModel} from './models/user'
export type {UserState} from './models/user'

// 布局组件
export {default as SecurityLayout} from './layouts/SecurityLayout'
// 登录页由各业务服务自行实现，air-sdk 不再内置

// 业务组件
export {default as AppSwitcher} from './components/AppSwitcher'
export {default as UserSettings} from './components/UserSettings'

// 页面组件（登录页由各业务服务自行实现，air-sdk 不再内置）

// 工具函数
export {POST, GET, SSE_POST} from './utils/HttpRequest'
export {SHA} from './utils/CryptoUtils'
export {getIconUrl, getAvatarUrl, getAgentIconUrl, extractAvatarId, AGENT_ICON_DEFAULT, AGENT_ICON_OPTIONS} from './utils/IconUtils'
export {randomString, UUID, shortId, equalJsonArray} from './utils/StringUtils'
export {formatFileSize} from './utils/FormatUtils'

// 类型导出
export type {SdkConfig} from './types/auth'
/** @deprecated 使用 SdkConfig */
export type {SdkConfig as AuthConfig} from './types/auth'
export type {UserResponse, UserLoginRequest, AdminPasswordChangeRequest} from './types/user'
export type {DisplaySettings, UserSettingsResponse, UserSettingsUpdateRequest} from './types/userSettings'
