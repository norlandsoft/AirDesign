/**
 * 外部模块类型声明
 *
 * air-design 在 workspace 下通过 file: 链接，本身带有完整 .d.ts；
 * 此处仅为 dts 插件兜底声明少数会被外部化的组件，避免类型解析失败。
 *
 * @author ChaiMingXu, 2026/06/19
 */
declare module 'air-design' {
  export const Notice: {
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
  }

  export const Spin: React.FC<any>
  export const Icon: React.FC<{name: string; size?: number; color?: string}>
  export const Button: React.FC<any>
  export const SlidePanel: React.FC<any>
  export const Avatar: React.FC<any>
  export const AvatarImage: React.FC<any>
  export const DropdownMenu: any
  export const DropdownMenuTrigger: any
  export const DropdownMenuContent: any
}

declare module 'umi' {
  export function connect(mapStateToProps: any): (Component: React.ComponentType<any>) => React.ComponentType<any>
}
