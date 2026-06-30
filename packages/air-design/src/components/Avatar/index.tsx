/**
 * Avatar 头像组件（antd 兼容）
 *
 * 图片模式：作为固定尺寸的图片容器，按原图比例展示用户指定图片，
 * 仅通过 overflow + 圆角将外形适配为圆形或矩形，不做裁剪、遮罩或覆盖处理。
 * 非图片模式：支持字符、图标占位及加载失败降级。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useMemo, useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {AvatarGroupContext, useAvatarGroupContext} from './context'
import {extractAvatarText, resolveAvatarSize, stringToAvatarColor} from './utils'
import type {AvatarGroupProps, AvatarProps} from './types'

/** 图标/占位头像的描边色（品牌主色） */
const AVATAR_ICON_COLOR = '#123F68'

/** 根据 shape 返回容器外形 class */
function resolveShapeClass(shape: 'circle' | 'square'): string {
  return shape === 'circle' ? 'rounded-full' : 'rounded-[0.25rem]'
}

/** 渲染 icon 属性：string 走 Icon 组件，否则直接渲染 ReactNode */
function renderAvatarIcon(icon: AvatarProps['icon'], avatarSize: number) {
  if (icon == null) return null
  const iconSize = Math.max(12, Math.round(avatarSize * 0.52))
  if (typeof icon === 'string') {
    return <Icon name={icon} size={iconSize} color={AVATAR_ICON_COLOR}/>
  }
  return icon
}

/** 构建字符/图标/默认占位内容 */
function buildFallbackNode(
  props: Pick<AvatarProps, 'icon' | 'children' | 'gap'>,
  px: number,
  textBackground?: string,
  fontSize?: number,
) {
  const {icon, children, gap = 4} = props

  if (icon) {
    return (
      <span className="flex h-full w-full items-center justify-center">
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
    <span className="flex h-full w-full items-center justify-center">
      <Icon name="user" size={Math.max(12, Math.round(px * 0.52))} color={AVATAR_ICON_COLOR}/>
    </span>
  )
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
  const [imageError, setImageError] = useState(false)

  React.useEffect(() => {
    setImageError(false)
  }, [src])

  const textContent = useMemo(() => extractAvatarText(children), [children])
  const textBackground = textContent ? stringToAvatarColor(textContent) : undefined
  const fontSize = Math.max(12, Math.round(px * 0.45))
  const shapeClass = resolveShapeClass(shape)
  const showImage = Boolean(src) && !imageError

  const containerClassName = cn(
    'air-avatar relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-transparent align-middle',
    shapeClass,
    onClick && 'cursor-pointer',
    className,
  )
  const containerStyle = {width: px, height: px, ...style}

  const handleImageError = () => {
    if (onError?.() === false) return
    setImageError(true)
  }

  if (showImage) {
    return (
      <span
        ref={ref}
        className={containerClassName}
        style={containerStyle}
        onClick={onClick}
        {...rest}
      >
        <img
          src={src}
          srcSet={srcSet}
          alt={alt ?? ''}
          draggable={draggable}
          crossOrigin={crossOrigin || undefined}
          className="block h-full w-full object-contain"
          onError={handleImageError}
        />
      </span>
    )
  }

  return (
    <span
      ref={ref}
      className={containerClassName}
      style={containerStyle}
      onClick={onClick}
      {...rest}
    >
      {buildFallbackNode({icon, children, gap}, px, textBackground, fontSize)}
    </span>
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
              index > 0 && 'border-2 border-background -ml-2',
            ),
          }),
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
