import React from 'react';
import './MenuButton.less';
interface MenuButtonProps {
    size?: number;
    items: any;
    type?: 'horizontal' | 'vertical';
    transClickEvent?: boolean;
    innerMargin?: number;
    style?: any;
}
declare const MenuButton: React.FC<MenuButtonProps>;
export default MenuButton;
