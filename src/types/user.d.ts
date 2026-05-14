/**
 * 用户相关类型定义
 * 对应后端的DTO（Request）和VO（Response）结构
 * Created by ChaiMingXu, on 2026/1/1
 */

/**
 * 用户登录请求
 */
export interface UserLoginRequest {
  /**
   * 用户ID，用于登录
   */
  id: string;

  /**
   * 用户密码，前端传输前经过sha256加密
   */
  password: string;
}

/**
 * 用户创建请求
 */
export interface UserCreateRequest {
  /**
   * 用户ID，主键，用于登录
   */
  id: string;

  /**
   * 用户密码（可选，如果不提供则使用默认密码123456）
   */
  password?: string;

  /**
   * 用户真实姓名
   */
  name?: string;

  /**
   * 用户邮箱
   */
  email?: string;

  /**
   * 用户手机号
   */
  phone?: string;

  /**
   * 用户头像，缺省值为u01
   */
  avatar?: string;

  /**
   * 用户状态：F-禁用，A-启用，D-删除
   */
  status?: string;

  /**
   * 用户角色：admin-管理员，user-普通用户
   */
  role?: string;
}

/**
 * 用户更新请求
 */
export interface UserUpdateRequest {
  /**
   * 用户ID，主键，必填
   */
  id: string;

  /**
   * 用户密码（可选，如果提供则更新密码）
   */
  password?: string;

  /**
   * 用户真实姓名
   */
  name?: string;

  /**
   * 用户邮箱
   */
  email?: string;

  /**
   * 用户手机号
   */
  phone?: string;

  /**
   * 用户头像
   */
  avatar?: string;

  /**
   * 用户状态：F-禁用，A-启用，D-删除
   */
  status?: string;

  /**
   * 用户角色：admin-管理员，user-普通用户
   */
  role?: string;
}

/**
 * 用户查询请求
 */
export interface UserQueryRequest {
  /**
   * 用户ID
   */
  id?: string;

  /**
   * 用户真实姓名（模糊查询）
   */
  name?: string;

  /**
   * 用户邮箱
   */
  email?: string;

  /**
   * 用户手机号
   */
  phone?: string;

  /**
   * 用户状态：F-禁用，A-启用，D-删除
   */
  status?: string;

  /**
   * 用户角色：admin-管理员，user-普通用户
   */
  role?: string;
}

/**
 * 用户响应对象
 * 用于前端展示，不包含敏感信息
 */
export interface UserResponse {
  /**
   * 用户ID，主键，用于登录
   */
  id: string;

  /**
   * 用户真实姓名
   */
  name?: string;

  /**
   * 用户邮箱
   */
  email?: string;

  /**
   * 用户手机号
   */
  phone?: string;

  /**
   * 用户头像
   */
  avatar?: string;

  /**
   * 用户状态：F-禁用，A-启用，D-删除
   */
  status?: string;

  /**
   * 用户状态描述（格式化后的状态文本）
   */
  statusText?: string;

  /**
   * 用户角色：admin-管理员，user-普通用户
   */
  role?: string;

  /**
   * 用户角色描述（格式化后的角色文本）
   */
  roleText?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新时间
   */
  updateTime?: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /**
   * 认证token
   */
  token: string;

  /**
   * 用户信息（注意：后端LoginResponse中使用的是User对象，为了兼容性暂时保留）
   * 后续可以改为UserResponse
   */
  user: UserResponse | any;
}

/**
 * 管理员密码修改请求
 */
export interface AdminPasswordChangeRequest {
  /**
   * 新密码，前端传输前经过sha256加密
   */
  password: string;
}
