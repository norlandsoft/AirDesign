/**
 * Splitter 分割面板（antd 兼容）
 *
 * 分割条以绝对定位浮于面板接缝，不占用面板布局空间；面板尺寸按容器全尺寸分配。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import SplitterBar from './SplitterBar'
import SplitterPanel from './SplitterPanel'
import type {NormalizedPanelConfig, SplitterProps, SplitterRef} from './types'
import {
  buildInitialSizes,
  extractPanelConfigs,
  getBarCenterOffset,
  isSplitterPanelElement,
  mergeControlledSizes,
  parseSizeValue,
  resolveSplitterLayout,
  clampPanelSize,
  resizeAdjacentPanels,
  SPLIT_BAR_SIZE,
} from './utils'
import {cn} from '../../lib/cn'
import './Splitter.css'

interface DragState {
  barIndex: number
  startPos: number
  startSizes: number[]
}

/** 从指针事件读取主轴坐标 */
function getPointerPos(event: MouseEvent | TouchEvent, isHorizontal: boolean): number {
  if ('touches' in event && event.touches.length > 0) {
    return isHorizontal ? event.touches[0].clientX : event.touches[0].clientY
  }
  if ('clientX' in event) {
    return isHorizontal ? event.clientX : event.clientY
  }
  return 0
}

/** 多面板 Splitter */
const SplitterRoot = forwardRef<SplitterRef, SplitterProps>((props, ref) => {
  const {
    children,
    className,
    style,
    lazy = false,
    onResize,
    onResizeStart,
    onResizeEnd,
    onCollapse,
    onDraggerDoubleClick,
  } = props

  const layout = resolveSplitterLayout(props)
  const isHorizontal = layout === 'horizontal'
  const panels = useMemo(() => extractPanelConfigs(children), [children])

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState(0)
  const [collapsed, setCollapsed] = useState<boolean[]>([])
  const [sizes, setSizes] = useState<number[]>([])
  const [lazySizes, setLazySizes] = useState<number[] | null>(null)
  const [activeBar, setActiveBar] = useState<number | null>(null)

  const dragRef = useRef<DragState | null>(null)
  const savedSizesRef = useRef<Record<number, number>>({})
  const defaultSizesRef = useRef<number[]>([])

  const isControlled = panels.some((panel) => panel.size != null)

  /** 监听容器主轴尺寸 */
  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const measure = () => {
      setContainerSize(isHorizontal ? element.clientWidth : element.clientHeight)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [isHorizontal])

  /** 面板数量变化时同步折叠状态 */
  useEffect(() => {
    setCollapsed((prev) => {
      if (prev.length === panels.length) return prev
      return panels.map((_, index) => prev[index] ?? false)
    })
  }, [panels.length])

  /** 初始化默认尺寸（面板数量或容器变化时） */
  useEffect(() => {
    if (containerSize <= 0 || panels.length === 0) return

    const initialCollapsed = panels.map((_, index) => collapsed[index] ?? false)
    const initial = buildInitialSizes(panels, containerSize, initialCollapsed)
    defaultSizesRef.current = initial

    if (!isControlled) {
      setSizes((prev) => (prev.length === panels.length ? prev : initial))
    }
  }, [containerSize, panels, isControlled])

  const resolvedSizes = useMemo(() => {
    const base = lazy && lazySizes ? lazySizes : sizes
    return mergeControlledSizes(panels, base, containerSize, collapsed)
  }, [lazy, lazySizes, sizes, panels, containerSize, collapsed])

  const emitResize = useCallback(
    (nextSizes: number[]) => {
      onResize?.(nextSizes)
    },
    [onResize]
  )

  const applySizes = useCallback(
    (nextSizes: number[], options?: {lazyOnly?: boolean}) => {
      const normalized = panels.map((panel, index) =>
        collapsed[index]
          ? 0
          : clampPanelSize(nextSizes[index] ?? 0, panel.minRaw, panel.maxRaw, containerSize)
      )

      if (lazy && options?.lazyOnly) {
        setLazySizes(normalized)
      } else {
        setLazySizes(null)
        if (!isControlled) setSizes(normalized)
        emitResize(normalized)
      }
      return normalized
    },
    [panels, collapsed, containerSize, lazy, isControlled, emitResize]
  )

  const startDrag = useCallback(
    (barIndex: number, clientPos: number) => {
      if (collapsed[barIndex] || collapsed[barIndex + 1]) return

      const leftPanel = panels[barIndex]
      const rightPanel = panels[barIndex + 1]
      if (!leftPanel?.resizable || !rightPanel?.resizable) return

      dragRef.current = {
        barIndex,
        startPos: clientPos,
        startSizes: [...resolvedSizes],
      }
      setActiveBar(barIndex)
      onResizeStart?.(resolvedSizes)
    },
    [panels, resolvedSizes, onResizeStart, collapsed]
  )

  const moveDrag = useCallback(
    (clientPos: number) => {
      const drag = dragRef.current
      if (!drag) return

      const delta = clientPos - drag.startPos
      const next = [...drag.startSizes]
      const leftIndex = drag.barIndex
      const rightIndex = drag.barIndex + 1

      const leftPanel = panels[leftIndex]
      const rightPanel = panels[rightIndex]

      const [leftSize, rightSize] = resizeAdjacentPanels(
        drag.startSizes[leftIndex],
        drag.startSizes[rightIndex],
        delta,
        leftPanel.minRaw,
        leftPanel.maxRaw,
        rightPanel.minRaw,
        rightPanel.maxRaw,
        containerSize
      )

      next[leftIndex] = leftSize
      next[rightIndex] = rightSize
      applySizes(next, {lazyOnly: lazy})
    },
    [panels, containerSize, applySizes, lazy]
  )

  const endDrag = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    setActiveBar(null)

    if (lazy && lazySizes) {
      applySizes(lazySizes)
    }
    onResizeEnd?.(resolvedSizes)
  }, [lazy, lazySizes, applySizes, onResizeEnd, resolvedSizes])

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => moveDrag(getPointerPos(event, isHorizontal))
    const onMouseUp = () => endDrag()
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      moveDrag(getPointerPos(event, isHorizontal))
    }
    const onTouchEnd = () => endDrag()

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onTouchMove, {passive: false})
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [moveDrag, endDrag, isHorizontal])

  /** 设置面板折叠状态（仅 collapsible 面板生效） */
  const setPanelCollapsed = useCallback(
    (panelIndex: number, willCollapse: boolean) => {
      if (!panels[panelIndex]?.collapsible) return

      setCollapsed((prev) => {
        if (prev[panelIndex] === willCollapse) return prev

        const nextCollapsed = [...prev]
        nextCollapsed[panelIndex] = willCollapse

        setSizes((prevSizes) => {
          const nextSizes = [...prevSizes]
          if (willCollapse) {
            savedSizesRef.current[panelIndex] = nextSizes[panelIndex]
            const freed = nextSizes[panelIndex]
            nextSizes[panelIndex] = 0
            const neighbor = panelIndex < panels.length - 1 ? panelIndex + 1 : panelIndex - 1
            if (neighbor >= 0) nextSizes[neighbor] += freed
          } else {
            const restore =
              savedSizesRef.current[panelIndex] ??
              defaultSizesRef.current[panelIndex] ??
              parseSizeValue(panels[panelIndex].defaultSize, containerSize) ??
              120
            const neighbor = panelIndex < panels.length - 1 ? panelIndex + 1 : panelIndex - 1
            if (neighbor >= 0) nextSizes[neighbor] = Math.max(0, nextSizes[neighbor] - restore)
            nextSizes[panelIndex] = restore
          }
          emitResize(nextSizes)
          onCollapse?.(nextCollapsed, nextSizes)
          return nextSizes
        })

        return nextCollapsed
      })
    },
    [panels, containerSize, emitResize, onCollapse]
  )

  useImperativeHandle(
    ref,
    () => ({
      collapsePanel: (panelIndex: number) => setPanelCollapsed(panelIndex, true),
      expandPanel: (panelIndex: number) => setPanelCollapsed(panelIndex, false),
    }),
    [setPanelCollapsed]
  )

  const resetBarPanels = useCallback(
    (barIndex: number) => {
      onDraggerDoubleClick?.(barIndex)
      setSizes((prev) => {
        const next = [...prev]
        const leftDefault =
          parseSizeValue(panels[barIndex].defaultSize, containerSize) ??
          defaultSizesRef.current[barIndex]
        const rightDefault =
          parseSizeValue(panels[barIndex + 1].defaultSize, containerSize) ??
          defaultSizesRef.current[barIndex + 1]
        if (leftDefault != null) next[barIndex] = leftDefault
        if (rightDefault != null) next[barIndex + 1] = rightDefault
        emitResize(next)
        return next
      })
      setCollapsed((prev) => {
        const next = [...prev]
        next[barIndex] = false
        next[barIndex + 1] = false
        return next
      })
    },
    [panels, containerSize, emitResize, onDraggerDoubleClick]
  )

  if (panels.length < 2) {
    return (
      <div ref={containerRef} className={cn('air-splitter', className)} style={style}>
        {Children.map(children, (child) => (isSplitterPanelElement(child) ? child.props.children : child))}
      </div>
    )
  }

  const nodes: React.ReactNode[] = []
  const barNodes: React.ReactNode[] = []

  panels.forEach((panel: NormalizedPanelConfig, index: number) => {
    const panelSize = resolvedSizes[index] ?? 0
    const panelStyle: React.CSSProperties = {
      ...panel.style,
      flex: 'none',
      ...(isHorizontal ? {width: panelSize, height: '100%'} : {height: panelSize, width: '100%'}),
    }

    nodes.push(
      <div
        key={panel.key}
        className={cn(
          'air-splitter-panel',
          collapsed[index] && 'air-splitter-panel-collapsed',
          panel.className
        )}
        style={panelStyle}
      >
        {!collapsed[index] && panel.children}
      </div>
    )

    if (index < panels.length - 1 && !collapsed[index] && !collapsed[index + 1]) {
      const leftPanel = panel
      const rightPanel = panels[index + 1]
      const barDisabled = !leftPanel.resizable && !rightPanel.resizable
      const center = getBarCenterOffset(resolvedSizes, index)
      const halfBar = SPLIT_BAR_SIZE / 2

      barNodes.push(
        <SplitterBar
          key={`bar-${panel.key}`}
          layout={layout}
          active={activeBar === index}
          disabled={barDisabled}
          style={
            isHorizontal
              ? {left: center - halfBar, top: 0, bottom: 0}
              : {top: center - halfBar, left: 0, right: 0}
          }
          onMouseDown={(event) => startDrag(index, getPointerPos(event.nativeEvent, isHorizontal))}
          onTouchStart={(event) => startDrag(index, getPointerPos(event.nativeEvent, isHorizontal))}
          onDoubleClick={() => resetBarPanels(index)}
        />
      )
    }
  })

  return (
    <div
      ref={containerRef}
      className={cn('air-splitter', isHorizontal ? 'air-splitter-horizontal' : 'air-splitter-vertical', className)}
      style={style}
    >
      {nodes}
      {barNodes}
    </div>
  )
})

SplitterRoot.displayName = 'Splitter'

type SplitterComponent = React.ForwardRefExoticComponent<SplitterProps & React.RefAttributes<SplitterRef>> & {
  Panel: typeof SplitterPanel
}

const Splitter = SplitterRoot as SplitterComponent

Splitter.Panel = SplitterPanel

export default Splitter
