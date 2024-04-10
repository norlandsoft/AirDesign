import React from "react";
import {Dropdown} from 'antd';
import Icon from "../Icons";
import './MenuButton.less';

const MenuButton = props => {

  const {
    size,
    items,
    transClickEvent = false,
    innerMargin = 8,
    style
  } = props;

  const menu_id = `menu-button-${Math.random()}`;

  const getContainer = () => {
    return document.getElementById(menu_id);
  };

  return (
    <Dropdown
      menu={{items}}
      trigger={['click']}
      placement={'bottomRight'}
      getPopupContainer={getContainer}
      destroyPopupOnHide={true}
      autoAdjustOverflow={true}
    >
      <div id={menu_id} className={'air-menu-button'} tabIndex={-1}
           style={{width: size, height: size, lineHeight: size, margin: innerMargin, ...style}}
           onClick={e => {
             // 阻止事件冒泡
             if (!transClickEvent) {
               e.stopPropagation();
               e.nativeEvent.stopImmediatePropagation();
             }
           }}
      >
        <Icon name={'more'} size={size}/>
      </div>
    </Dropdown>
  );
}

export default MenuButton;