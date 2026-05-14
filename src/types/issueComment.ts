/**
 * 问题评论类型定义
 *
 * 用于定义问题评论相关的 TypeScript 接口类型
 *
 * Created by ChaiMingXu, on 2026/1/12
 */

/**
 * 评论创建请求
 */
export interface IssueCommentCreateRequest {
  id?: string;
  issueId: string;
  content: string;
  authorId: string;
}

/**
 * 评论更新请求
 */
export interface IssueCommentUpdateRequest {
  id: string;
  content: string;
  authorId: string;
}

/**
 * 评论查询请求
 */
export interface IssueCommentQueryRequest {
  id?: string;
  issueId?: string;
  authorId?: string;
}

/**
 * 评论响应
 */
export interface IssueCommentResponse {
  id: string;
  issueId: string;
  content: string;
  authorId: string;
  authorName?: string;
  createTime?: string;
}
