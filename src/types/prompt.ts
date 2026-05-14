/**
 * 提示词管理相关类型
 * 与后端 DTO/VO 对应，支持名称与内容更新，不支持新增、删除
 *
 * @author ChaiMingXu
 */

/** 更新提示词请求（可更新 name、content） */
export interface LangPromptUpdateRequest {
  id: string;
  name?: string;
  content?: string;
}

/** 查询提示词请求（列表/单条/删除） */
export interface LangPromptQueryRequest {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
}

/** 提示词响应（VO） */
export interface LangPromptResponse {
  id: string;
  name?: string;
  description?: string;
  content?: string;
  status?: string;
  statusText?: string;
}
