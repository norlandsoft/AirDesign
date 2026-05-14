/**
 * 工作流执行设置相关类型定义
 * 对应后端的DTO（Request）和VO（Response）结构
 * Created by ChaiMingXu, on 2026/1/21
 */

/**
 * 工作流执行设置创建请求
 */
export interface WorkflowPropsCreateRequest {
  /**
   * 设置ID，可选，如果不提供则自动生成
   */
  id?: string;

  /**
   * 用户ID
   */
  userId?: string;

  /**
   * 工作流ID
   */
  workflowId?: string;

  /**
   * 是否输出日志
   * true-输出日志，false-不输出日志
   * 默认值：true
   */
  saveLog?: boolean;

  /**
   * 日志级别
   * 可选值：DEBUG-调试，INFO-信息，WARN-警告，ERROR-错误
   * 默认值：INFO
   */
  logLevel?: string;

  /**
   * 错误处理方式
   * CONTINUE-节点失败后继续执行后续节点
   * STOP-节点失败后停止整个流程
   * 默认值：STOP
   */
  errorHandling?: string;
}

/**
 * 工作流执行设置更新请求
 */
export interface WorkflowPropsUpdateRequest {
  /**
   * 设置ID，主键，必填
   */
  id?: string;

  /**
   * 是否输出日志
   * true-输出日志，false-不输出日志
   */
  saveLog?: boolean;

  /**
   * 日志级别
   * 可选值：DEBUG-调试，INFO-信息，WARN-警告，ERROR-错误
   */
  logLevel?: string;

  /**
   * 错误处理方式
   * CONTINUE-节点失败后继续执行后续节点
   * STOP-节点失败后停止整个流程
   */
  errorHandling?: string;
}

/**
 * 工作流执行设置查询请求
 */
export interface WorkflowPropsQueryRequest {
  /**
   * 设置ID
   */
  id?: string;

  /**
   * 用户ID
   */
  userId?: string;

  /**
   * 工作流ID
   */
  workflowId?: string;
}

/**
 * 工作流执行设置响应
 */
export interface WorkflowPropsResponse {
  /**
   * 设置ID，主键
   */
  id?: string;

  /**
   * 用户ID
   */
  userId?: string;

  /**
   * 工作流ID
   */
  workflowId?: string;

  /**
   * 是否输出日志
   * true-输出日志，false-不输出日志
   */
  saveLog?: boolean;

  /**
   * 日志级别
   * DEBUG-调试，INFO-信息，WARN-警告，ERROR-错误
   */
  logLevel?: string;

  /**
   * 日志级别文本（格式化后的显示文本）
   */
  logLevelText?: string;

  /**
   * 错误处理方式
   * CONTINUE-节点失败后继续执行后续节点
   * STOP-节点失败后停止整个流程
   */
  errorHandling?: string;

  /**
   * 错误处理方式文本（格式化后的显示文本）
   */
  errorHandlingText?: string;
}
