import React, { FC, MouseEvent } from 'react';
import './index.less';

interface ButtonProps {
  type?: string,
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  style?: any;
}

const Button: FC<ButtonProps | any> = props => {

  const {
    children,
    onClick,
    type = 'default',
    style = {},
    ...restProps
  } = props;

  return (
    <button
      tabIndex={-1}
      className={`air-button air-button-${type}`}
      onClick={onClick}
      style={style}
      {...restProps}
    >
      <span>{children}</span>
    </button>
  );
};

export default Button;