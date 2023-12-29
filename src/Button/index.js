import React from "react";
import styles from './index.less';

const Button = props => {

  const {children, onClick, type = 'default', style} = props;

  return (
      <button
          tabIndex={-1}
          className={`${styles.container} ${styles[`${type}`]}`}
          style={style}
          onClick={onClick}
      >
        <div>{children}</div>
      </button>
  );

}

export default Button;