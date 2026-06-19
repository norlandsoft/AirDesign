/**
 * LoadingPanel 全屏加载面板
 *
 * loading 时以全屏遮罩显示加载动画与提示文字。基于 Spin。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {createPortal} from 'react-dom'
import Spin from '@/components/Spin'

interface LoadingPanelProps {
  loading?: boolean
  message?: string
}

const LoadingPanel = ({loading = false, message = 'Loading ...'}: LoadingPanelProps) => {
  if (!loading) return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80">
      <Spin loading={true} indicator={<></>}/>
      <div className="mt-2 text-sm text-muted-foreground">{message}</div>
    </div>,
    document.body
  )
}

export default LoadingPanel
