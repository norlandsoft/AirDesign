import React from 'react';
import './index.less';
/**
 * 预设颜色配置接口
 */
export interface PresetColorConfig {
    red?: string[];
    blue?: string[];
    green?: string[];
    primary?: string[];
    yellow?: string[];
    [key: string]: string[] | undefined;
}
/**
 * 自定义颜色选择器组件属性
 */
export interface CustomColorPickerProps {
    /** 当前颜色值 */
    value?: string | null;
    /** 颜色变化完成时的回调函数 */
    onChangeComplete?: (color: any) => void;
    /** 触发方式，默认为 'click' */
    trigger?: 'click' | 'hover';
    /** 自定义预设颜色配置 */
    presetColors?: PresetColorConfig;
    /** 弹窗宽度，默认 480px */
    popupWidth?: number;
    /** 触发元素 */
    children: React.ReactNode;
    /** 其他 ColorPicker 属性 */
    [key: string]: any;
}
/**
 * 自定义颜色选择器组件
 *
 * 功能特点：
 * - 支持预设颜色配置
 * - 水平布局：左侧显示预设颜色，右侧显示颜色选择器
 * - 可自定义弹窗宽度
 * - 可自定义触发方式和回调函数
 *
 * @example
 * ```tsx
 * <CustomColorPicker
 *   value={color}
 *   onChangeComplete={(color) => {
 *     console.log(color.toHexString());
 *   }}
 * >
 *   <button>选择颜色</button>
 * </CustomColorPicker>
 * ```
 */
declare const AirColorPicker: React.FC<CustomColorPickerProps>;
export default AirColorPicker;
