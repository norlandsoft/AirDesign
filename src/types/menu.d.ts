/**
 * 系统菜单相关类型定义
 * 对应后端的DTO（Request）和VO（Response）结构
 * Created by ChaiMingXu, on 2026/1/1
 */

export interface SysMenuCreateRequest {
  id?: string;
  name?: string;
  icon?: string;
  parent?: string;
  sortOrder?: number;
}

export interface SysMenuUpdateRequest {
  id: string;
  name?: string;
  icon?: string;
  parent?: string;
  sortOrder?: number;
}

export interface SysMenuQueryRequest {
  id?: string;
  name?: string;
  parent?: string;
  sortOrder?: number;
}

export interface SysMenuResponse {
  id: string;
  name?: string;
  icon?: string;
  parent?: string;
  sortOrder?: number;
}

