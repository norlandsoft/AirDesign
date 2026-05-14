/**
 * 自定义字段相关类型定义
 * 对应后端的DTO（Request）和VO（Response）结构
 *
 * Created by ChaiMingXu, on 2026/3/29
 */

/**
 * 自定义字段创建请求
 */
export interface CustomFieldCreateRequest {
  /** 字段ID，主键，可选，如果不提供则自动生成 */
  id?: string;

  /** 字段编码，在同一项目/产品下必须唯一 */
  code?: string;

  /** 字段名称，用于显示 */
  name?: string;

  /** 字段类型（如 text、number、select、date 等） */
  fieldType?: string;

  /** 字段描述，说明该字段的用途 */
  description?: string;

  /** 字段状态：A-启用，F-禁用，D-删除 */
  status?: string;

  /** 排序顺序，用于控制字段的显示顺序 */
  sortOrder?: number;

  /** 字段默认值 */
  defaultValue?: string;

  /** 字段选项（用于 select 等类型的可选值，JSON 格式） */
  options?: string;

  /** 是否必填 */
  required?: boolean;

  /** 所属项目ID，用于数据隔离 */
  projectId?: string;

  /** 所属产品ID，用于数据隔离 */
  productId?: string;
}

/**
 * 自定义字段更新请求
 */
export interface CustomFieldUpdateRequest {
  /** 字段ID，主键，必填 */
  id: string;

  /** 字段编码 */
  code?: string;

  /** 字段名称 */
  name?: string;

  /** 字段类型 */
  fieldType?: string;

  /** 字段描述 */
  description?: string;

  /** 字段状态：A-启用，F-禁用，D-删除 */
  status?: string;

  /** 排序顺序 */
  sortOrder?: number;

  /** 字段默认值 */
  defaultValue?: string;

  /** 字段选项 */
  options?: string;

  /** 是否必填 */
  required?: boolean;

  /** 所属项目ID */
  projectId?: string;

  /** 所属产品ID */
  productId?: string;
}

/**
 * 自定义字段查询请求
 */
export interface CustomFieldQueryRequest {
  /** 字段ID */
  id?: string;

  /** 字段编码 */
  code?: string;

  /** 字段名称（模糊查询） */
  name?: string;

  /** 字段类型 */
  fieldType?: string;

  /** 字段状态：A-启用，F-禁用，D-删除 */
  status?: string;

  /** 所属项目ID */
  projectId?: string;

  /** 所属产品ID */
  productId?: string;
}

/**
 * 自定义字段响应对象
 */
export interface CustomFieldResponse {
  /** 字段ID，主键 */
  id: string;

  /** 字段编码 */
  code?: string;

  /** 字段名称 */
  name?: string;

  /** 字段类型 */
  fieldType?: string;

  /** 字段描述 */
  description?: string;

  /** 字段状态：A-启用，F-禁用，D-删除 */
  status?: string;

  /** 字段状态描述（格式化后的状态文本） */
  statusText?: string;

  /** 排序顺序 */
  sortOrder?: number;

  /** 字段默认值 */
  defaultValue?: string;

  /** 字段选项 */
  options?: string;

  /** 是否必填 */
  required?: boolean;

  /** 所属项目ID */
  projectId?: string;

  /** 所属产品ID */
  productId?: string;
}
