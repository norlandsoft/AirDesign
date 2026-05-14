/**
 * 语言模型管理相关类型
 *
 * 与后端 LangModel DTO/VO 对应，提供创建、更新、查询与展示类型定义。
 * 设计思路：与后端字段一一对应，保证前后端类型一致。
 *
 * @author ChaiMingXu
 * Created by ChaiMingXu, on 2026-02-08
 */

/** 创建语言模型请求 */
export interface LangModelCreateRequest {
  id?: string;
  name?: string;
  description?: string;
  model?: string;
  provider?: string;
  type?: string;
  api?: string;
  baseUrl?: string;
  apiKey?: string;
  status?: string;
}

/** 更新语言模型请求 */
export interface LangModelUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  model?: string;
  provider?: string;
  type?: string;
  api?: string;
  baseUrl?: string;
  apiKey?: string;
  status?: string;
  isDefault?: boolean;
}

/** 查询语言模型请求 */
export interface LangModelQueryRequest {
  id?: string;
  name?: string;
  description?: string;
  model?: string;
  provider?: string;
  type?: string;
  api?: string;
  status?: string;
}

/** 语言模型响应（VO） */
export interface LangModelResponse {
  id: string;
  name?: string;
  description?: string;
  model?: string;
  provider?: string;
  providerText?: string;
  type?: string;
  api?: string;
  apiText?: string;
  baseUrl?: string;
  apiKey?: string;
  status?: string;
  statusText?: string;
  /** 是否为系统默认模型 */
  isDefault?: boolean;
  createTime?: string;
  updateTime?: string;
}

/** 语言模型供应商响应 */
export interface LangModelProviderResponse {
  code: string;
  name?: string;
}
