/**
 * Table 数据表格
 *
 * 基于 @tanstack/react-table 重写（替代 Semi Table）。保留旧版业务 API：
 * data / columns（dataIndex+render+title，Semi/AntD 风格）/ height / padding / bordered /
 * headerHeight / rowHeight / onItemClick / showHeader / headerPanel / pagination / showEmpty / emptyText。
 *
 * bordered 为 true 时：外框 + 行间横线（无列边框），表头浅灰底；分页栏显示「总页数」。
 * pagination 为 false 时不渲染分页栏。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useReactTable, getCoreRowModel, flexRender, type ColumnDef} from '@tanstack/react-table'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import './Table.css'

/** Semi/AntD 风格列定义（消费方惯用） */
export interface LegacyColumn<T = any> {
  key?: string
  dataIndex?: string
  title?: React.ReactNode
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

export interface TablePaginationProps {
  total: number
  pageSize: number
  currentPage: number
  onChange: (page: number) => void
}

export interface TableProps<T = any> {
  data: T[]
  columns: LegacyColumn<T>[]
  height: number
  padding?: number
  /** 是否显示边框网格样式 */
  bordered?: boolean
  headerHeight?: number
  rowHeight?: number
  onItemClick?: (record: T, event: React.MouseEvent) => void
  showHeader?: boolean
  headerPanel?: React.ReactNode
  customStyles?: React.CSSProperties
  /** false 不分页；true 仅占位；对象时渲染分页栏 */
  pagination?: boolean | TablePaginationProps
  showEmpty?: boolean
  emptyText?: string
}

/** 列对齐 class */
function alignClass(align?: 'left' | 'center' | 'right'): string {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

/** 将旧式列定义转换为 TanStack column defs */
function toColumnDefs<T>(columns: LegacyColumn<T>[]): ColumnDef<T>[] {
  return columns.map((col, index) => ({
    id: col.key ?? col.dataIndex ?? `col-${index}`,
    meta: {align: col.align, width: col.width},
    header: () => col.title ?? '',
    size: typeof col.width === 'number' ? col.width : undefined,
    cell: ({row}) => {
      const value = col.dataIndex ? (row.original as any)[col.dataIndex] : undefined
      return col.render ? col.render(value, row.original, row.index) : (value as React.ReactNode)
    },
  }))
}

/** 计算分页页码窗口（最多 5 个） */
function buildPageWindow(currentPage: number, totalPages: number): number[] {
  const pages: number[] = []
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  for (let i = start; i <= end; i += 1) pages.push(i)
  return pages
}

function Table<T = any>(props: TableProps<T>) {
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
      for (const entry of entries) entries[0] && setInnerWidth(entry.contentRect.width)
    })
    observer.observe(tableRef.current)
    return () => observer.disconnect()
  }, [])

  const hasPagination = pagination !== false && pagination !== undefined && typeof pagination === 'object'
  const paginationProps = typeof pagination === 'object' ? pagination : null
  const shellHeight = height - padding * 2

  const renderPagination = () => {
    if (!paginationProps) return null
    const {total, pageSize, currentPage, onChange} = paginationProps
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const pages = buildPageWindow(currentPage, totalPages)

    return (
      <div
        className={cn(
          'air-table-pagination',
          bordered ? 'air-table-pagination--bordered' : 'air-table-pagination--plain'
        )}
        style={{width: bordered ? '100%' : innerWidth}}
      >
        {bordered ? (
          <span className="air-table-pagination-total">总页数: {totalPages}</span>
        ) : (
          <span className="air-table-pagination-total">共 {total} 条</span>
        )}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onChange(currentPage - 1)}
          className="air-table-pagination-btn"
          aria-label="上一页"
        >
          <Icon name="arrow_left" size={14}/>
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              'air-table-pagination-btn',
              p === currentPage && 'air-table-pagination-btn--active'
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onChange(currentPage + 1)}
          className="air-table-pagination-btn"
          aria-label="下一页"
        >
          <Icon name="arrow_right" size={14}/>
        </button>
      </div>
    )
  }

  const shellClass = cn(
    'air-table-shell',
    bordered ? 'air-table-shell--bordered' : 'air-table-shell--plain'
  )

  return (
    <div ref={tableRef} className="air-table-container" style={{padding, ...customStyles}}>
      <div className={shellClass} style={{height: shellHeight}}>
        {headerPanel ? (
          <div className="flex shrink-0 items-center border-b border-border" style={{height: 50}}>
            {headerPanel}
          </div>
        ) : null}

        <div
          className={cn('air-table-scroll', !bordered && showHeader && 'border-t border-border')}
        >
          <table className="air-table-grid">
            {showHeader ? (
              <thead className="air-table-head--sticky">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} style={{height: headerHeight}}>
                    {hg.headers.map((header) => {
                      const meta = header.column.columnDef.meta as {align?: string; width?: number | string} | undefined
                      return (
                        <th
                          key={header.id}
                          className={alignClass(meta?.align as 'left' | 'center' | 'right')}
                          style={{
                            width:
                              meta?.width != null
                                ? meta.width
                                : header.getSize() !== 150
                                  ? header.getSize()
                                  : undefined,
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
            ) : null}
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={(e) => onItemClick?.(row.original as T, e)}
                  style={{cursor: onItemClick ? 'pointer' : 'default', height: rowHeight}}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as {align?: string} | undefined
                    return (
                      <td key={cell.id} className={alignClass(meta?.align as 'left' | 'center' | 'right')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && showEmpty ? (
            <div className="air-table-empty">{emptyText}</div>
          ) : null}
        </div>

        {hasPagination ? renderPagination() : null}
      </div>
    </div>
  )
}

export default Table
