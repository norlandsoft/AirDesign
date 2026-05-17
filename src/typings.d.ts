/**
 * 全局类型定义文件
 *
 * @author ChaiMingXu, on 2026/05/17
 */

declare module '*.css';
declare module '*.less' {
  const classes: { [key: string]: string }
  export default classes
}
declare module '*.scss';
declare module '*.sass';
declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export {ReactComponent}
  const src: string
  export default src
}
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
