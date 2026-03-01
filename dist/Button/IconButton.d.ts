import React, { ReactNode } from 'react';
import './IconButton.less';
type DropdownPlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'leftTop' | 'leftBottom' | 'right' | 'rightTop' | 'rightBottom';
interface IconButtonProps {
    icon?: string;
    customIcon?: ReactNode;
    size?: number;
    items?: any[];
    onClick?: () => void;
    tooltip?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** 有 items 时下拉菜单展开方向，默认 bottomLeft */
    dropdownPlacement?: DropdownPlacement;
    disabled?: boolean;
    bordered?: boolean;
    shape?: 'circle' | 'square' | 'default';
    style?: any;
}
declare const IconButton: React.FC<IconButtonProps>;
export default IconButton;
