import { FC, MouseEvent } from 'react';
import './index.less';
interface ButtonProps {
    type?: string;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    style?: any;
}
declare const Button: FC<ButtonProps | any>;
export default Button;
