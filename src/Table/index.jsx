import React, {useEffect, useState, useRef} from "react";
import {ConfigProvider, Pagination} from 'antd';
import {Cell, Column, HeaderCell, Table} from 'rsuite-table';
import 'rsuite-table/lib/less/index.less';
import './index.less';

const AirTable = props => {

  const {
    children,
    onRowClick,
    onPageChange,
    height = 300,
    minWidth,
    padding = 8,
    data,
    isTree = false,
    showHeader = true,
    headerHeight = 50,
    rowHeight = 50,
    headerPanel = null,
    pagination = null,
    bordered = true,
    loading,
    rowKey,
  } = props;

  const contentRef = useRef(null);
  var tableHeight = height - (headerPanel ? headerHeight : 0) - (pagination ? 40 : 0) - 1;

  if (minWidth && contentRef.current) {
    // 获取容器父级宽度
    const pnode = contentRef.current.parentNode;
    if (pnode.offsetWidth < (minWidth + padding * 2)) {
      // 如果父级宽度小于最小宽度，则设置父对象属性
      tableHeight = tableHeight - 14;
      // 设置pnode的overflowX属性
      pnode.style.overflowX = 'auto';
    }
  }

  //高亮
  const setRowClassName = record => {
    if (onRowClick && record) {
      return 'clickRowStyle';
    }
  }

  const renderEmptyTable = () => {
    return (
        <div style={{color: '#999', textAlign: 'center', verticalAlign: 'middle', paddingTop: '50px'}}>
          暂无内容
        </div>
    );
  }

  const renderRowData = (item, data) => {
    return (
        <span style={{lineHeight: rowHeight + 'px'}}>
          {item}
        </span>
    );
  }

  return (
    <ConfigProvider
      prefixCls={"air"}
    >
      <div className={'air-table'} style={{minWidth: minWidth, padding: padding}} ref={contentRef}>
        {
          headerPanel ? (
              <div className={'air-table-info'} style={{
                height: headerHeight - 1,
                lineHeight: headerHeight - 1 + 'px',
                maxHeight: headerHeight - 1,
                overflow: 'hidden'
              }}>
                {headerPanel}
              </div>
          ) : null
        }
        <Table
            virtualized={pagination ? false : true}
            locale={{emptyMessage: ('无数据'), loading: ('加载中...')}}
            style={{border: bordered ? '1px solid #d3d2d1' : 'none', borderRadius: headerPanel ? '0 0 3px 3px' : '3px'}}
            rowClassName={setRowClassName}
            renderEmpty={renderEmptyTable}
            hover={true}
            data={data}
            renderRow={renderRowData}
            isTree={isTree}
            loading={loading}
            rowKey={rowKey}
            showHeader={showHeader}
            headerHeight={headerHeight}
            rowHeight={rowHeight}
            height={tableHeight}
            onRowClick={onRowClick}
        >
          {children}
        </Table>

        {
          pagination ? (
              <div className={'air-table-pagination'}>
                <Pagination
                    showSizeChanger={false}
                    showTotal={(total) => `共 ${total} 条`}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    current={pagination.current}
                    onChange={onPageChange}
                />
              </div>
          ) : null
        }
      </div>
    </ConfigProvider>
  );
}

export {Cell, Column, HeaderCell};
export default AirTable;