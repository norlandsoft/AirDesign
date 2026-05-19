/**
 * Select 下拉选择组件
 *
 * 基于 Ant Design Select 组件封装，保留全部原生功能。
 * 通过 Less 样式覆盖，使 Select 的外观与 Input 组件保持一致：
 * - 35px 高度、3px 圆角、主色聚焦边框
 * - 禁用状态灰色背景
 * - 下拉面板统一风格
 *
 * @author ChaiMingXu, on 2026/05/19
 */
import React, {forwardRef} from 'react'
import {Select as AntSelect} from 'antd'
import type {SelectProps as AntSelectProps, RefSelectProps} from 'antd'
import './index.less'

export type SelectProps = AntSelectProps

const Select = forwardRef<RefSelectProps, SelectProps>((props, ref) => {
  const {className = '', ...rest} = props

  return (
    <AntSelect
      ref={ref}
      className={`air-select ${className}`.trim()}
      popupClassName="air-select-dropdown"
      {...rest}
    />
  )
})

Select.displayName = 'Select'

export default Select
