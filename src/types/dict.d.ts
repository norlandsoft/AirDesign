/**
 * 数据字典相关类型定义
 * 对应后端的DTO（Request）和VO（Response）结构
 * Created by ChaiMingXu, on 2026/1/8
 */

/**
 * 字典类型创建请求
 */
export interface DictTypeCreateRequest {
  /**
   * 字典类型ID，主键，可选，如果不提供则自动生成
   */
  id?: string;

  /**
   * 字典类型编码，用于程序中使用，在同一项目/产品下必须唯一
   */
  code?: string;

  /**
   * 字典类型名称，用于显示
   */
  name?: string;

  /**
   * 字典类型描述，说明该字典类型的用途
   */
  description?: string;

  /**
   * 字典类型状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 排序顺序，用于控制字典类型的显示顺序
   */
  sortOrder?: number;

  /**
   * 所属项目ID，用于数据隔离，不同项目具有不同的字典值（可为空，表示全局字典）
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离，不同产品具有不同的字典值（可为空，表示全局字典）
   */
  productId?: string;
}

/**
 * 字典类型更新请求
 */
export interface DictTypeUpdateRequest {
  /**
   * 字典类型ID，主键，必填
   */
  id: string;

  /**
   * 字典类型编码，用于程序中使用，在同一项目/产品下必须唯一
   */
  code?: string;

  /**
   * 字典类型名称，用于显示
   */
  name?: string;

  /**
   * 字典类型描述，说明该字典类型的用途
   */
  description?: string;

  /**
   * 字典类型状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 排序顺序，用于控制字典类型的显示顺序
   */
  sortOrder?: number;

  /**
   * 所属项目ID，用于数据隔离，不同项目具有不同的字典值（可为空，表示全局字典）
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离，不同产品具有不同的字典值（可为空，表示全局字典）
   */
  productId?: string;
}

/**
 * 字典类型查询请求
 */
export interface DictTypeQueryRequest {
  /**
   * 字典类型ID
   */
  id?: string;

  /**
   * 字典类型编码（精确查询）
   */
  code?: string;

  /**
   * 字典类型名称（模糊查询）
   */
  name?: string;

  /**
   * 字典类型状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 所属项目ID，用于数据隔离查询
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离查询
   */
  productId?: string;
}

/**
 * 字典类型响应对象
 */
export interface DictTypeResponse {
  /**
   * 字典类型ID，主键
   */
  id: string;

  /**
   * 字典类型编码，用于程序中使用
   */
  code?: string;

  /**
   * 字典类型名称，用于显示
   */
  name?: string;

  /**
   * 字典类型描述，说明该字典类型的用途
   */
  description?: string;

  /**
   * 字典类型状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 字典类型状态描述（格式化后的状态文本）
   */
  statusText?: string;

  /**
   * 排序顺序，用于控制字典类型的显示顺序
   */
  sortOrder?: number;

  /**
   * 所属项目ID，用于数据隔离，不同项目具有不同的字典值（可为空，表示全局字典）
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离，不同产品具有不同的字典值（可为空，表示全局字典）
   */
  productId?: string;
}

/**
 * 字典项创建请求
 */
export interface DictItemCreateRequest {
  /**
   * 字典项ID，主键，可选，如果不提供则自动生成
   */
  id?: string;

  /**
   * 所属字典类型ID，关联sys_dict_type表，必填
   */
  typeId?: string;

  /**
   * 字典项编码，在同一字典类型下必须唯一
   */
  code?: string;

  /**
   * 字典项名称，用于显示
   */
  name?: string;

  /**
   * 字典项值，用于程序中使用
   */
  value?: string;

  /**
   * 字典项描述，说明该字典项的用途
   */
  description?: string;

  /**
   * 字典项状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 排序顺序，用于控制字典项的显示顺序
   */
  sortOrder?: number;

  /**
   * 所属项目ID，用于数据隔离，不同项目具有不同的字典值（可为空，表示全局字典）
   * 通常继承自所属字典类型的projectId
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离，不同产品具有不同的字典值（可为空，表示全局字典）
   * 通常继承自所属字典类型的productId
   */
  productId?: string;
}

/**
 * 字典项更新请求
 */
export interface DictItemUpdateRequest {
  /**
   * 字典项ID，主键，必填
   */
  id: string;

  /**
   * 所属字典类型ID，关联sys_dict_type表
   */
  typeId?: string;

  /**
   * 字典项编码，在同一字典类型下必须唯一
   */
  code?: string;

  /**
   * 字典项名称，用于显示
   */
  name?: string;

  /**
   * 字典项值，用于程序中使用
   */
  value?: string;

  /**
   * 字典项描述，说明该字典项的用途
   */
  description?: string;

  /**
   * 字典项状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 排序顺序，用于控制字典项的显示顺序
   */
  sortOrder?: number;

  /**
   * 所属项目ID，用于数据隔离，不同项目具有不同的字典值（可为空，表示全局字典）
   * 通常继承自所属字典类型的projectId
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离，不同产品具有不同的字典值（可为空，表示全局字典）
   * 通常继承自所属字典类型的productId
   */
  productId?: string;
}

/**
 * 字典项查询请求
 */
export interface DictItemQueryRequest {
  /**
   * 字典项ID
   */
  id?: string;

  /**
   * 所属字典类型ID
   */
  typeId?: string;

  /**
   * 字典类型编码（通过字典类型编码查询该类型下的所有字典项）
   */
  typeCode?: string;

  /**
   * 字典项编码（精确查询）
   */
  code?: string;

  /**
   * 字典项名称（模糊查询）
   */
  name?: string;

  /**
   * 字典项值（精确查询）
   */
  value?: string;

  /**
   * 字典项状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 所属项目ID，用于数据隔离查询
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离查询
   */
  productId?: string;
}

/**
 * 字典项响应对象
 */
export interface DictItemResponse {
  /**
   * 字典项ID，主键
   */
  id: string;

  /**
   * 所属字典类型ID，关联sys_dict_type表
   */
  typeId?: string;

  /**
   * 所属字典类型编码（用于显示）
   */
  typeCode?: string;

  /**
   * 所属字典类型名称（用于显示）
   */
  typeName?: string;

  /**
   * 字典项编码，在同一字典类型下必须唯一
   */
  code?: string;

  /**
   * 字典项名称，用于显示
   */
  name?: string;

  /**
   * 字典项值，用于程序中使用
   */
  value?: string;

  /**
   * 字典项描述，说明该字典项的用途
   */
  description?: string;

  /**
   * 字典项状态：A-启用，F-禁用，D-删除
   */
  status?: string;

  /**
   * 字典项状态描述（格式化后的状态文本）
   */
  statusText?: string;

  /**
   * 排序顺序，用于控制字典项的显示顺序
   */
  sortOrder?: number;

  /**
   * 所属项目ID，用于数据隔离，不同项目具有不同的字典值（可为空，表示全局字典）
   */
  projectId?: string;

  /**
   * 所属产品ID，用于数据隔离，不同产品具有不同的字典值（可为空，表示全局字典）
   */
  productId?: string;
}
