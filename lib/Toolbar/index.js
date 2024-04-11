import React from "react";
import Icon from "../Icons";
import './index.less';

const Toolbar = props => {

  const {
    items = []
  } = props;

  return (
      <div className={'air-toolbar'}>
        <div className={'air-toolbar-inner'}>
          {
            items.map((item, index) => {
              const {split, disabled} = item;
              return split ? (
                  <div className={'air-toolbar-split'} key={index}>
                    <Icon name={'split'} size={16}/>
                  </div>
              ) : (
                  <div className={disabled ? 'air-toolbar-disabled' : 'air-toolbar-button'} key={index} onClick={disabled ? () => {} : item.onClick}>
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