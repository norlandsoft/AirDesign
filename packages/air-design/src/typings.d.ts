/**
 * 全局类型定义文件
 *
 * @author ChaiMingXu, 2026/06/19
 */

// Vite 客户端类型：提供 import.meta.glob 等类型声明
/// <reference types="vite/client" />

declare module '*.css';

// 默认 SVG 导入（返回 URL 字符串）
declare module '*.svg' {
  const src: string
  export default src
}

// ?raw 查询参数导入（返回文件内容字符串），Icon 组件的 icons-data 使用
declare module '*.svg?raw' {
  const content: string
  export default content
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

declare module '*.woff2';
