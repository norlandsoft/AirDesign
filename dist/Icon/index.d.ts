/**
 * Icon 组件：按 name 渲染 SVG 图标，使用构建时生成的 icons-data
 * Created by ChaiMingxu
 */
import React from 'react';
interface IconsProps {
    name: string;
    size?: number;
    color?: string;
    thickness?: number;
    className?: string;
}
declare const Icon: React.FC<IconsProps>;
export default Icon;
