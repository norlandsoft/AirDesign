/**
 * Table 数据表格
 *
 * 基于 @tanstack/react-table 重写（替代 Semi Table）。保留旧版业务 API：
 * data / columns（dataIndex+render+title，Semi/AntD 风格）/ height / padding / bordered /
 * headerHeight / rowHeight / onItemClick / showHeader / headerPanel / pagination / showEmpty / emptyText。
 *
 * 分页由内部 state 管理（pagination 为 {total,pageSize,currentPage,onChange} 或 boolean），
 * 实际分页逻辑仍由消费方控制（currentPage/onChange），Table 只负责渲染分页条。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useReactTable, getCoreRowModel, flexRender, type ColumnDef} from '@tanstack/react-table'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

/** Semi/AntD 风格列定义（消费方惯用） */
interface LegacyColumn<T = any> {
  key?: string
  dataIndex?: string
  title?: React.ReactNode
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

interface PaginationProps {
  total: number
  pageSize: number
  currentPage: number
  onChange: (page: number) => void
}

interface TableProps<T = any> {
  data: T[]
  columns: LegacyColumn<T>[]
  height: number
  padding?: number
  bordered?: boolean
  headerHeight?: number
  rowHeight?: number
  onItemClick?: (record: T, event: React.MouseEvent) => void
  showHeader?: boolean
  headerPanel?: React.ReactNode
  customStyles?: React.CSSProperties
  pagination?: boolean | PaginationProps
  showEmpty?: boolean
  emptyText?: string
}

/** 将旧式列定义转换为 TanStack column defs */
function toColumnDefs<T>(columns: LegacyColumn<T>[]): ColumnDef<T>[] {
  return columns.map((col, index) => ({
    id: col.key ?? col.dataIndex ?? `col-${index}`,
    header: () => col.title ?? '',
    size: typeof col.width === 'number' ? col.width : undefined,
    cell: ({row}) => {
      const value = col.dataIndex ? (row.original as any)[col.dataIndex] : undefined
      return col.render ? col.render(value, row.original, row.index) : (value as React.ReactNode)
    },
  }))
}

function Grid<T = any>(props: TableProps<T>) {
  const {
    data,
    columns,
    height,
    padding = 4,
    bordered = false,
    headerHeight = 40,
    rowHeight = 40,
    onItemClick,
    showHeader = true,
    headerPanel,
    customStyles = {},
    pagination = false,
    showEmpty = false,
    emptyText = '暂无数据',
  } = props

  const [innerWidth, setInnerWidth] = useState(200)
  const tableRef = useRef<HTMLDivElement>(null)

  const columnDefs = useMemo(() => toColumnDefs(columns), [columns])

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    if (!tableRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setInnerWidth(entry.contentRect.width)
    })
    observer.observe(tableRef.current)
    return () => observer.disconnect()
  }, [])

  const hasPagination = !!pagination
  const scrollY = height - (showHeader ? headerHeight : 0) - padding * 2 - (hasPagination ? 40 : 0) - (headerPanel ? 50 : 0) - (bordered ? 2 : 0)

  const paginationProps = typeof pagination === 'object' ? pagination : null

  const renderPagination = () => {
    if (!paginationProps) return null
    const {total, pageSize, currentPage, onChange} = paginationProps
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const pages: number[] = []
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    const end = Math.min(totalPages, start + 4)
    for (let i = start; i <= end; i++) pages.push(i)

    return (
      <div className="flex items-center justify-end gap-1 border-t px-3 text-sm" style={{width: innerWidth, height: 40}}>
        <span className="mr-2 text-muted-foreground">共 {total} 条</span>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onChange(currentPage - 1)}
          className="inline-flex size-7 items-center justify-center rounded hover:bg-accent disabled:opacity-40"
        >
          <Icon name="arrow_left" size={14}/>
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              'inline-flex h-7 min-w-7 items-center justify-center rounded px-2',
              p === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onChange(currentPage + 1)}
          className="inline-flex size-7 items-center justify-center rounded hover:bg-accent disabled:opacity-40"
        >
          <Icon name="arrow_right" size={14}/>
        </button>
      </div>
    )
  }

  return (
    <div ref={tableRef} className="air-table-container" style={{padding, ...customStyles}}>
      <div style={{height: height - padding * 2, border: bordered ? '1px solid var(--color-border)' : 'none', boxSizing: 'border-box', borderRadius: 2}}>
        {headerPanel && <div className="flex items-center border-b" style={{height: 50}}>{headerPanel}</div>}
        <div className="overflow-auto" style={{height: scrollY, borderTop: !bordered && showHeader ? '1px solid var(--color-border)' : undefined}}>
          <table className="w-full border-collapse text-sm">
            {showHeader && (
              <thead className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} style={{height: headerHeight}}>
                    {hg.headers.map((header) => (
                      <th key={header.id} className="border-b px-3 text-left font-medium" style={{width: header.getSize() !== 150 ? header.getSize() : undefined}}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            )}
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={(e) => onItemClick?.(row.original as T, e)}
                  className="border-b transition-colors hover:bg-accent/50"
                  style={{cursor: onItemClick ? 'pointer' : 'default', height: rowHeight}}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && showEmpty && (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">{emptyText}</div>
          )}
        </div>
        {hasPagination && renderPagination()}
      </div>
    </div>
  )
}

export default Grid
