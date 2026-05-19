/**
 * Select 下拉选择组件
 *
 * 基于 Ant Design Select 组件封装，保留全部原生功能。
 * 通过 Less 样式覆盖，使 Select 的外观与 Input 组件保持一致：
 * - 35px 高度、3px 圆角、主色聚焦边框
 * - 禁用状态灰色背景
 * - 下拉面板统一风格
 *
 * 支持默认前缀（ant-）和自定义前缀（air-，通过 ConfigProvider prefixCls 设置）。
 *
 * @author ChaiMingXu, on 2026/05/19
 */
import React, {forwardRef, useContext} from 'react'
import {Select as AntSelect, ConfigProvider} from 'antd'
import type {SelectProps as AntSelectProps, RefSelectProps} from 'antd'
import './index.less'

export type SelectProps = AntSelectProps

const Select = forwardRef<RefSelectProps, SelectProps>((props, ref) => {
  const {className = '', popupClassName = '', ...rest} = props
  // 获取 antd 的 prefixCls，默认为 'ant'
  const {getPrefixCls} = useContext(ConfigProvider.ConfigContext)
  const prefixCls = getPrefixCls?.('select') ?? 'ant-select'

  // 下拉面板 class：使用 antd 的 popupClassName 配合自定义 air-select-dropdown
  const dropdownClass = `${prefixCls}-dropdown air-select-dropdown ${popupClassName}`.trim()

  return (
    <AntSelect
      ref={ref}
      className={`air-select ${className}`.trim()}
      popupClassName={dropdownClass}
      {...rest}
    />
  )
})

Select.displayName = 'Select'

export default Select
