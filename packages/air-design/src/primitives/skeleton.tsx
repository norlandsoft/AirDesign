/**
 * Skeleton 原语：骨架屏占位
 *
 * 加载态占位，配合脉动动画。业务 LoadingPanel / 表格加载态使用。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import * as React from 'react'
import {cn} from '../lib/cn'

function Skeleton({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export {Skeleton}
