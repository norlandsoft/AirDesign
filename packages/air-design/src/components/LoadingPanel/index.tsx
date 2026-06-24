/**
 * LoadingPanel 全屏加载面板
 *
 * loading 时以全屏遮罩显示；中间提示区带边框与略深背景，内含 Spin 动画与文案。
 *
 * @author ChaiMingXu, 2026/06/24
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted px-10 py-8 shadow-sm">
        <Spin loading size="default"/>
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    </div>,
    document.body
  )
}

export default LoadingPanel
