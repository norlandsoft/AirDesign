import React, { FC, ButtonHTMLAttributes } from 'react';
import './index.less';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const Button: FC<ButtonProps> = ({ label, ...restProps }) => {
  return (
    <button className="my-button" {...restProps}>
      {label}
    </button>
  );
};

export default Button;