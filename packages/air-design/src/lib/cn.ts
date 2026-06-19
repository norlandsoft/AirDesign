/**
 * className 合并工具
 *
 * 结合 clsx（条件拼接）与 tailwind-merge（解决 Tailwind class 冲突，
 * 如 `px-2 px-4` → `px-4`）。shadcn/ui 风格组件统一通过 cn 合并外部传入的 className。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
