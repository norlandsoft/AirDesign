/**
 * Button 毛玻璃风格按钮，支持 default/primary/danger/text/link 五种类型
 * icon 支持 string（图标名，用 Icon 渲染）或 ReactNode
 * Created by ChaiMingxu
 */
import React, { FC, MouseEvent, ReactNode } from 'react';
import './index.less';
interface ButtonProps {
    type?: string;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    style?: React.CSSProperties;
    disabled?: boolean;
    icon?: ReactNode | string;
    loading?: boolean;
    children?: ReactNode;
    [key: string]: unknown;
}
declare const Button: FC<ButtonProps>;
export default Button;
