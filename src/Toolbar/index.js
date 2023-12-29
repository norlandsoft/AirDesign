import React from "react";
import Icon from "../Icon";
import styles from './index.less';

const Toolbar = props => {

  const {
    items = []
  } = props;

  return (
      <div className={styles.container}>
        <div className={styles.toolbar}>
          {
            items.map((item, index) => {
              const {split, disabled} = item;
              return split ? (
                  <div className={styles.split} key={index}>
                    <Icon name={'split'} size={16}/>
                  </div>
              ) : (
                  <div className={disabled ? styles.disabled : styles.button} key={index} onClick={disabled ? () => {} : item.onClick}>
                    <Icon name={item.icon} size={16}/>
                    {item.label}
                  </div>
              );
            })
          }
        </div>
      </div>
  );
}

export default Toolbar;