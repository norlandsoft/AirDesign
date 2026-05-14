/**
 * 分页相关类型定义
 * Created by ChaiMingXu, on 2026/1/13
 */

/**
 * 分页信息
 */
export interface Pagination {
  /**
   * 当前页码，从1开始
   */
  current?: number;

  /**
   * 每页数据条数
   */
  pageSize?: number;

  /**
   * 数据总数
   */
  total?: number;
}
