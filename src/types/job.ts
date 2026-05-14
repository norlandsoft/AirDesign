/**
 * 智能工作室工作（studio_job）相关类型定义
 *
 * 用于智能工作室工作台工作与工作日志。工作可拆分为多个 studio_action 任务。
 * 对应后端 studio_job / studio_job_log 及 Job / JobLog。
 *
 * 注意：执行状态由 JobSession 管理，Job 本身不再有状态字段。
 *
 * Created by ChaiMingXu, on 2026-02-14
 * Updated on 2026-03-28 - 重命名为 Job/Action
 */

// ─── 工作（Job / studio_job）类型 ───

/**
 * 工作创建请求
 */
export interface JobCreateRequest {
  /**
   * 工作ID（可选，不提供则自动生成）
   */
  id?: string;

  /**
   * 工作标题（必填）
   */
  title: string;

  /**
   * 工作描述
   */
  description?: string;

  /**
   * 分配的智能体ID
   */
  agentId?: string;

  /**
   * 工作空间ID
   */
  workspaceId?: string;

  /**
   * 父工作ID（用于分解后的子工作）
   */
  parentId?: string;
}

/**
 * 工作更新请求
 */
export interface JobUpdateRequest {
  /**
   * 工作ID（必填）
   */
  id: string;

  /**
   * 工作标题
   */
  title?: string;

  /**
   * 工作描述
   */
  description?: string;

  /**
   * 分配的智能体ID
   */
  agentId?: string;
}

/**
 * 工作查询请求
 */
export interface JobQueryRequest {
  /**
   * 工作ID
   */
  id?: string;

  /**
   * 标题（模糊搜索）
   */
  title?: string;

  /**
   * 智能体ID筛选
   */
  agentId?: string;

  /**
   * 工作空间ID筛选
   */
  workspaceId?: string;

  /**
   * 父工作ID筛选（传空字符串查询顶层工作）
   */
  parentId?: string;
}

/**
 * 工作响应对象
 */
export interface JobResponse {
  /**
   * 工作ID
   */
  id?: string;

  /**
   * 工作标题
   */
  title?: string;

  /**
   * 工作描述
   */
  description?: string;

  /**
   * 分配的智能体ID
   */
  agentId?: string;

  /**
   * 工作空间ID
   */
  workspaceId?: string;

  /**
   * 父工作ID
   */
  parentId?: string;

  /**
   * 创建时间（ISO 格式）
   */
  createTime?: string;

  /**
   * 更新时间（ISO 格式）
   */
  updateTime?: string;

  /**
   * 附件数量（bucket=studio 下的 plan 附件）
   */
  attachmentCount?: number;

  // === 以下字段从 Session 获取，用于前端展示 ===

  /**
   * 最新会话的执行状态（来自 JobSession）
   */
  sessionStatus?: SessionStatus;

  /**
   * 最新会话的执行结果（来自 JobSession）
   */
  sessionResult?: string;
}

/**
 * 会话状态枚举（与后端 JobSession.status 一致）
 */
export type SessionStatus = 'R' | 'P' | 'C' | 'F' | 'X';

// ─── 执行上下文（ExecutionContext）类型 ───

/**
 * 执行状态枚举
 */
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * 执行上下文状态码（与后端 ExecutionStatus.getCode() 一致）
 */
export type ExecutionStatusCode = 'P' | 'R' | 'S' | 'C' | 'F' | 'X';

/**
 * 执行上下文响应对象
 * 注意：后端返回的 status 为状态码（R/S/P/C/F/X），非 ExecutionStatus 枚举名
 */
export interface JobExecutionContextResponse {
  /**
   * 工作ID
   */
  jobId: string;

  /**
   * 工作标题
   */
  jobTitle?: string;

  /**
   * 智能体ID
   */
  agentId?: string;

  /**
   * 工作空间ID
   */
  workspaceId?: string;

  /**
   * 当前执行状态（后端返回状态码 R/S/P/C/F/X）
   */
  status?: ExecutionStatusCode;

  /**
   * 状态消息
   */
  statusMessage?: string;

  /**
   * 执行进度（0-100）
   */
  progress?: number;

  /**
   * 当前执行的步骤描述
   */
  currentStep?: string;

  /**
   * 错误消息
   */
  errorMessage?: string;

  /**
   * 重试次数
   */
  retryCount?: number;

  /**
   * 开始时间戳（毫秒）
   */
  startTime?: number;

  /**
   * 结束时间戳（毫秒）
   */
  endTime?: number;

  /**
   * 执行时长（毫秒）
   */
  duration?: number;
}

// ─── 工作日志（JobLog）类型 ───

/**
 * 日志级别枚举
 */
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

/**
 * 工作日志创建请求
 */
export interface JobLogCreateRequest {
  /**
   * 关联的工作ID studio_job.id（必填）
   */
  jobId: string;

  /**
   * 日志内容（必填）
   */
  content: string;

  /**
   * 日志级别：INFO、WARN、ERROR，默认INFO
   */
  level?: LogLevel;
}

/**
 * 工作日志查询请求
 */
export interface JobLogQueryRequest {
  /**
   * 关联的工作ID（必填）
   */
  jobId: string;

  /**
   * 日志级别筛选
   */
  level?: LogLevel;
}

/**
 * 工作日志响应对象
 */
export interface JobLogResponse {
  /**
   * 日志ID
   */
  id?: string;

  /**
   * 关联的工作ID
   */
  jobId?: string;

  /**
   * 日志内容
   */
  content?: string;

  /**
   * 日志级别：INFO、WARN、ERROR
   */
  level?: LogLevel;

  /**
   * 日志级别描述（格式化后的级别文本）
   */
  levelText?: string;

  /**
   * 创建时间（ISO 格式）
   */
  createTime?: string;
}

// ─── 状态映射 ───

/**
 * 会话状态映射表
 */
export const SESSION_STATUS_MAP: Record<SessionStatus, string> = {
  R: '执行中',
  P: '已暂停',
  C: '已完成',
  F: '失败',
  X: '已取消',
};

/**
 * 会话状态颜色映射
 */
export const SESSION_STATUS_COLOR: Record<SessionStatus, string> = {
  R: 'blue',
  P: 'gold',
  C: 'green',
  F: 'red',
  X: 'default',
};

/**
 * 执行状态映射表（枚举名 -> 展示文案）
 */
export const EXECUTION_STATUS_MAP: Record<ExecutionStatus, string> = {
  PENDING: '待处理',
  RUNNING: '执行中',
  PAUSED: '已暂停',
  COMPLETED: '已完成',
  FAILED: '失败',
  CANCELLED: '已取消',
};

/**
 * 后端返回的状态码映射（R/S/P/C/F/X -> 展示文案），与 ExecutionStatus 的 code 一致
 */
export const EXECUTION_STATUS_CODE_MAP: Record<string, string> = {
  R: '执行中',
  S: '已暂停',
  P: '待处理',
  C: '已完成',
  F: '失败',
  X: '已取消',
};

/**
 * 执行状态颜色映射
 */
export const EXECUTION_STATUS_COLOR: Record<ExecutionStatus, string> = {
  PENDING: 'orange',
  RUNNING: 'blue',
  PAUSED: 'gold',
  COMPLETED: 'green',
  FAILED: 'red',
  CANCELLED: 'default',
};

/**
 * 日志级别映射表
 */
export const LOG_LEVEL_MAP: Record<LogLevel, string> = {
  INFO: '信息',
  WARN: '警告',
  ERROR: '错误',
};

/**
 * 执行阶段映射表（SessionPhase）
 */
export const SESSION_PHASE_MAP: Record<string, string> = {
  IDLE: '空闲',
  SETUP: '任务分解中',
  EXECUTE: '任务执行中',
  SUMMARIZE: '结果汇总中',
  COMPLETED: '已完成',
  FAILED: '已失败',
  CANCELLED: '已取消',
};
