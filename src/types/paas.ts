/**
 * 平台基础设施（PaaS）配置相关类型定义
 *
 * 与后端 AdminPaas 配置 DTO/VO 对应，用于平台 Admin 数据库、Redis 设置页面。
 *
 * Created by ChaiMingXu
 */

/** 数据库配置请求 */
export interface DatabaseConfigSaveRequest {
  driver?: string;
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  username?: string;
  password?: string;
}

/** 数据库配置响应 */
export interface DatabaseConfigResponse {
  driver?: string;
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  username?: string;
  password?: string;
}

/** Redis 配置请求 */
export interface RedisConfigSaveRequest {
  host?: string;
  port?: number;
  password?: string;
  database?: number;
}

/** Redis 配置响应 */
export interface RedisConfigResponse {
  host?: string;
  port?: number;
  password?: string;
  database?: number;
}

/** LibreOffice 配置请求 */
export interface LibreOfficeConfigSaveRequest {
  host?: string;
  port?: number;
}

/** LibreOffice 配置响应 */
export interface LibreOfficeConfigResponse {
  host?: string;
  port?: number;
}

/** Gitea 配置请求 */
export interface GiteaConfigSaveRequest {
  host?: string;
  port?: number;
  userId?: string;
  token?: string;
}

/** Gitea 配置响应 */
export interface GiteaConfigResponse {
  host?: string;
  port?: number;
  userId?: string;
  token?: string;
}

/** Storage 配置请求 */
export interface StorageConfigSaveRequest {
  host?: string;
  port?: number;
}

/** Storage 配置响应 */
export interface StorageConfigResponse {
  host?: string;
  port?: number;
}

/** OpenClaw 配置请求 */
export interface OpenClawConfigSaveRequest {
  openclawHome?: string;
  gatewayPort?: number;
  authToken?: string;
  timeoutChat?: number;
  timeoutSyncChat?: number;
  timeoutManagement?: number;
  timeoutDefault?: number;
}

/** OpenClaw 配置响应 */
export interface OpenClawConfigResponse {
  openclawHome?: string;
  gatewayPort?: number;
  authToken?: string;
  timeoutChat?: number;
  timeoutSyncChat?: number;
  timeoutManagement?: number;
  timeoutDefault?: number;
}

/** MinerU 配置请求 */
export interface MinerUConfigSaveRequest {
  host?: string;
  port?: number;
}

/** MinerU 配置响应 */
export interface MinerUConfigResponse {
  host?: string;
  port?: number;
}

/** SearXNG 搜索配置请求 */
export interface SearXNGConfigSaveRequest {
  host?: string;
  port?: number;
}

/** SearXNG 搜索配置响应 */
export interface SearXNGConfigResponse {
  host?: string;
  port?: number;
}

/** 网页爬虫配置请求 */
export interface CrawlConfigSaveRequest {
  jsoupEnabled?: boolean;
  jsoupTimeoutMs?: number;
  playwrightEnabled?: boolean;
  playwrightTimeoutMs?: number;
  playwrightWaitStrategy?: string;
  playwrightMaxConcurrentPages?: number;
  ocrEnabled?: boolean;
  ocrModelName?: string;
  refineEnabled?: boolean;
  refineModelName?: string;
  rateLimitEnabled?: boolean;
  rateLimitRpm?: number;
  proxyEnabled?: boolean;
  fallbackEnabled?: boolean;
  maxRetriesPerEngine?: number;
}

/** 网页爬虫配置响应 */
export interface CrawlConfigResponse {
  jsoupEnabled?: boolean;
  jsoupTimeoutMs?: number;
  playwrightEnabled?: boolean;
  playwrightTimeoutMs?: number;
  playwrightWaitStrategy?: string;
  playwrightMaxConcurrentPages?: number;
  ocrEnabled?: boolean;
  ocrModelName?: string;
  refineEnabled?: boolean;
  refineModelName?: string;
  rateLimitEnabled?: boolean;
  rateLimitRpm?: number;
  proxyEnabled?: boolean;
  fallbackEnabled?: boolean;
  maxRetriesPerEngine?: number;
}
