/**
 * Demo 页面通用容器：标题 + 描述 + 内容
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'

interface PageContainerProps {
  title: string
  description?: string
  /** 覆盖默认 max-w-4xl，表单类页面可传入 max-w-6xl 等 */
  className?: string
  children: React.ReactNode
}

const PageContainer: React.FC<PageContainerProps> = ({title, description, className, children}) => {
  return (
    <div className={className ? `mx-auto max-w-4xl ${className}` : 'mx-auto max-w-4xl'}>
      <h1 className="mb-1 text-2xl font-semibold">{title}</h1>
      {description && <p className="mb-6 text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  )
}

export default PageContainer
