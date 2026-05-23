/**
 * 全局类型定义文件
 *
 * @author ChaiMingXu, on 2026/05/23
 */

// Vite 客户端类型：提供 import.meta.glob 等类型声明
/// <reference types="vite/client" />

declare module '*.css';
declare module '*.less' {
  const classes: { [key: string]: string }
  export default classes
}
declare module '*.scss';
declare module '*.sass';

// 默认 SVG 导入（返回 URL 字符串），同时提供 ReactComponent 命名导出
declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export {ReactComponent}
  const src: string
  export default src
}

// vite-plugin-svgr 的 ?react 查询参数导入（返回 React 组件）
declare module '*.svg?react' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
