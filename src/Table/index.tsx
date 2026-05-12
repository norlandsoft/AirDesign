import React, { useEffect, useRef } from 'react'
import { Table } from 'antd'
import './index.less'

const Grid: React.FC<any> = (props) => {
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

  const [innerWidth, setInnerWidth] = React.useState(200)
  const innerHeight = height - padding * 2 + 'px'

  const scrollY =
    height -
    (showHeader ? headerHeight : 0) -
    padding * 2 -
    (pagination ? 40 : 0) -
    (headerPanel ? 50 : 0) -
    (bordered ? 2 : 0)

  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tableRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        setInnerWidth(containerWidth)
      }
    })

    const tableContainer = tableRef.current.querySelector('.ant-table-container')
    if (tableContainer) {
      resizeObserver.observe(tableContainer)
    }

    const setupScrollbarStyle = () => {
      const tableBody = tableRef.current?.querySelector('.ant-table-body')
      if (tableBody) {
        ;(tableBody as HTMLElement).style.overflowY = 'auto'
        ;(tableBody as HTMLElement).style.overflowX = 'auto'
      }
    }

    setupScrollbarStyle()

    const observer = new MutationObserver(() => {
      setupScrollbarStyle()
    })

    if (tableRef.current) {
      observer.observe(tableRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      })
    }

    return () => {
      resizeObserver.disconnect()
      observer.disconnect()
    }
  }, [])

  const renderEmpty = () => {
    return showEmpty ? (
      <div className="air-table-empty">
        <div>
          <span>{emptyText}</span>
        </div>
      </div>
    ) : (
      <div></div>
    )
  }

  return (
    <div
      ref={tableRef}
      className="air-table-container"
      style={{ padding: padding, ...customStyles }}
    >
      <div
        style={{
          height: innerHeight,
          border: bordered ? '1px solid #ddd' : 'none',
          boxSizing: 'border-box',
          borderRadius: '2px',
        }}
      >
        <Table
          dataSource={data}
          columns={columns}
          scroll={{ y: scrollY }}
          title={headerPanel}
          bordered={false}
          locale={{ emptyText: renderEmpty() }}
          showHeader={showHeader}
          onHeaderRow={() => ({
            style: { height: headerHeight + 'px' },
          })}
          style={{
            borderTop: !bordered && showHeader ? '1px solid #ddd' : undefined,
            boxSizing: 'border-box',
          }}
          onRow={(record, _) => ({
            onClick: (event) => {
              onItemClick && onItemClick(record, event)
            },
            style: {
              cursor: onItemClick ? 'pointer' : 'default',
              height: rowHeight + 'px',
            },
          })}
          pagination={
            pagination
              ? typeof pagination === 'object'
                ? pagination
                : {
                    size: 'small',
                    showTotal: (total: number) => `共 ${total} 条`,
                  }
              : false
          }
        />
      </div>
    </div>
  )
}

export default Grid
