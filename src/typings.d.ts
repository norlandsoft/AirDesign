/**
 * 全局类型定义文件
 *
 * @author AirDirector Team
 */

declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

/**
 * require.context 类型声明（Webpack 特有 API）
 */
interface RequireContext {
  keys(): string[];
  (id: string): string;
  <T>(id: string): T;
  resolve(id: string): string;
  id: string;
}

declare namespace NodeJS {
  interface Require {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ): RequireContext;
  }
}

