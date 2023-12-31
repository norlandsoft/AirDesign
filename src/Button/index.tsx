import { FC, MouseEvent } from 'react';
import './index.less';

interface ButtonProps {
  children: React.ReactNode,
  type?: string,
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const Button: FC<ButtonProps> = ({children, onClick, type = 'default', ...restProps}) => {
  return (
    <button
      tabIndex={-1}
      className={`air-button air-button-${type}`}
      onClick={onClick}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default Button;