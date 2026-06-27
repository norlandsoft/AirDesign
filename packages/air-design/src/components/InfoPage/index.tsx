/**
 * InfoPage 全页信息展示
 *
 * 模仿 antd Result：用于整页居中展示操作结果或异常信息，含状态图标、标题、副标题、
 * 操作区（extra）与附加内容（children）。预设 status 与 antd 一致。
 *
 * @author ChaiMingXu, 2026/06/25
 */
import React from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import './index.css'

/** 预设状态，与 antd Result 对齐 */
export type InfoPageStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'

export interface InfoPageProps {
  /** 预设状态，决定默认图标与配色 */
  status?: InfoPageStatus
  /** 标题 */
  title?: React.ReactNode
  /** 副标题 */
  subTitle?: React.ReactNode
  /** 操作区，通常放置按钮 */
  extra?: React.ReactNode
  /** 自定义图标，覆盖 status 默认图标 */
  icon?: React.ReactNode
  /** 附加内容 */
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/** 图标类 status 的图标与颜色配置 */
const ICON_STATUS_MAP: Record<
  'success' | 'error' | 'info' | 'warning',
  {icon: string; color: string}
> = {
  success: {icon: 'ok', color: '#16a34a'},
  error: {icon: 'no', color: 'var(--color-destructive)'},
  info: {icon: 'info', color: 'var(--color-primary)'},
  warning: {icon: 'issue', color: '#f59e0b'},
}

/** 渲染预设状态图标 */
const StatusIcon: React.FC<{status: InfoPageStatus}> = ({status}) => {
  if (status === '404' || status === '403' || status === '500') {
    return (
      <div className={cn('air-info-page-status-code', `air-info-page-status-code--${status}`)}>
        {status}
      </div>
    )
  }

  const cfg = ICON_STATUS_MAP[status]
  return (
    <div className={cn('air-info-page-icon-wrap', `air-info-page-icon-wrap--${status}`)}>
      <Icon name={cfg.icon} size={32} color={cfg.color}/>
    </div>
  )
}

const InfoPage: React.FC<InfoPageProps> = ({
  status = 'info',
  title,
  subTitle,
  extra,
  icon,
  children,
  className,
  style,
}) => {
  const iconNode = icon ?? <StatusIcon status={status}/>

  return (
    <div className={cn('air-info-page', className)} style={style}>
      <div className="air-info-page-body">
        <div className="air-info-page-icon">{iconNode}</div>

        {title != null && title !== '' ? (
          <h2 className="air-info-page-title">{title}</h2>
        ) : null}

        {subTitle != null && subTitle !== '' ? (
          <div className="air-info-page-subtitle">{subTitle}</div>
        ) : null}

        {extra ? <div className="air-info-page-extra">{extra}</div> : null}

        {children ? <div className="air-info-page-content">{children}</div> : null}
      </div>
    </div>
  )
}

export default InfoPage
