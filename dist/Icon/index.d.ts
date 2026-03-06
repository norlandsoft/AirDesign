/**
 * Icon 组件：按 name 渲染 SVG 图标，使用构建时生成的 icons-data
 * 优化：使用 useMemo + 全局缓存，避免 useState + useEffect 的额外渲染
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
