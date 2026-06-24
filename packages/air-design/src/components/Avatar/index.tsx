/**
 * Avatar 头像组件（antd 兼容）
 *
 * 支持图片、字符、图标三种展示方式；图片加载失败时自动降级。
 * 底层基于 Radix Avatar 原语，默认圆形，尺寸对齐 antd（default 32 / small 24 / large 40）。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useMemo, useState} from 'react'
import {Avatar as RadixAvatarRoot, AvatarFallback, AvatarImage} from '@/primitives/avatar'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {AvatarGroupContext, useAvatarGroupContext} from './context'
import {extractAvatarText, resolveAvatarSize, stringToAvatarColor} from './utils'
import type {AvatarGroupProps, AvatarProps} from './types'

/** 渲染 icon 属性：string 走 Icon 组件，否则直接渲染 ReactNode */
function renderAvatarIcon(icon: AvatarProps['icon'], avatarSize: number) {
  if (icon == null) return null
  const iconSize = Math.max(12, Math.round(avatarSize * 0.5))
  if (typeof icon === 'string') {
    return <Icon name={icon} size={iconSize} color="var(--color-muted-foreground)"/>
  }
  return icon
}

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>((props, ref) => {
  const group = useAvatarGroupContext()
  const {
    src,
    srcSet,
    alt,
    children,
    icon,
    shape: shapeProp,
    size: sizeProp,
    gap = 4,
    crossOrigin,
    draggable,
    onError,
    onClick,
    className,
    style,
    ...rest
  } = props

  const shape = shapeProp ?? group.shape ?? 'circle'
  const size = sizeProp ?? group.size ?? 'default'
  const px = resolveAvatarSize(size)
  const [forceFallback, setForceFallback] = useState(false)

  React.useEffect(() => {
    setForceFallback(false)
  }, [src])

  const textContent = useMemo(() => extractAvatarText(children), [children])
  const textBackground = textContent ? stringToAvatarColor(textContent) : undefined
  const fontSize = Math.max(12, Math.round(px * 0.45))

  const handleImageError = () => {
    onError?.()
    setForceFallback(true)
  }

  const fallbackNode = (() => {
    if (icon) {
      return (
        <span className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {renderAvatarIcon(icon, px)}
        </span>
      )
    }
    if (children != null && children !== '') {
      return (
        <span
          className="flex h-full w-full items-center justify-center font-medium text-white"
          style={{
            backgroundColor: textBackground,
            fontSize,
            letterSpacing: gap,
          }}
        >
          {children}
        </span>
      )
    }
    return (
      <span className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <Icon name="user" size={Math.max(12, Math.round(px * 0.5))}/>
      </span>
    )
  })()

  return (
    <RadixAvatarRoot
      ref={ref}
      className={cn(
        'air-avatar relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle',
        shape === 'circle' ? 'rounded-full' : 'rounded-[4px]',
        onClick && 'cursor-pointer',
        className
      )}
      style={{width: px, height: px, ...style}}
      onClick={onClick}
      {...rest}
    >
      {src && !forceFallback ? (
        <AvatarImage
          src={src}
          srcSet={srcSet}
          alt={alt}
          draggable={draggable}
          crossOrigin={crossOrigin || undefined}
          className="absolute inset-0 block h-full w-full object-cover object-center"
          onLoadingStatusChange={(status) => {
            if (status === 'error') handleImageError()
          }}
        />
      ) : null}
      <AvatarFallback
        delayMs={0}
        className={cn(
          'flex h-full w-full items-center justify-center p-0',
          shape === 'circle' ? 'rounded-full' : 'rounded-[4px]'
        )}
      >
        {fallbackNode}
      </AvatarFallback>
    </RadixAvatarRoot>
  )
})
Avatar.displayName = 'Avatar'

/** Avatar 组：堆叠展示多个头像，支持 max.count 折叠 */
const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  size,
  shape,
  max,
  className,
  style,
  ...rest
}) => {
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const maxCount = max?.count
  const visibleItems = maxCount != null && maxCount >= 0 ? items.slice(0, maxCount) : items
  const overflowCount = maxCount != null && maxCount >= 0 ? Math.max(items.length - maxCount, 0) : 0

  return (
    <AvatarGroupContext.Provider value={{size, shape}}>
      <div
        className={cn('air-avatar-group inline-flex items-center', className)}
        style={style}
        {...rest}
      >
        {visibleItems.map((child, index) =>
          React.cloneElement(child as React.ReactElement<{className?: string}>, {
            className: cn(
              (child as React.ReactElement<{className?: string}>).props.className,
              index > 0 && 'border-2 border-background -ml-2'
            ),
          })
        )}
        {overflowCount > 0 ? (
          <Avatar
            size={size}
            shape={shape}
            className="border-2 border-background -ml-2"
            style={max?.style}
          >
            +{overflowCount}
          </Avatar>
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  )
}

type AvatarComponent = typeof Avatar & {Group: typeof AvatarGroup}

const AvatarWithGroup = Avatar as AvatarComponent
AvatarWithGroup.Group = AvatarGroup

export default AvatarWithGroup
export {AvatarGroup}
export type {AvatarProps, AvatarGroupProps, AvatarSize, AvatarShape} from './types'
