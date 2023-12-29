import React from "react";
import {Dropdown} from '@douyinfe/semi-ui';
import Icon from "../Icon";
import styles from './MenuButton.less';

const MenuButton = props => {

  const {
    size,
    menu,
    data,
    transClickEvent = false,
    innerMargin = 8,
    icon = 'table-more'
  } = props;

  return (
      <Dropdown
          trigger={'click'}
          position={'bottomLeft'}
          stopPropagation={true}
          clickToHide={true}
          render={
            <Dropdown.Menu style={{minWidth: '120px'}}>
              {
                menu ? (
                    menu.map(item => {
                      if (item) {
                        if (item.type === 'divider') {
                          return <Dropdown.Divider key={item.key}/>
                        } else {
                          return <Dropdown.Item key={item.key}
                                                onClick={() => item.onClick ? item.onClick(data) : {}}>{item.label}</Dropdown.Item>
                        }
                      }
                    })
                ) : null
              }
            </Dropdown.Menu>
          }
      >
        <div className={styles.container} tabIndex={-1}
             style={{width: size, height: size, lineHeight: size, margin: innerMargin}}
             onClick={e => {
               // 阻止事件冒泡
               if (!transClickEvent) {
                 e.stopPropagation();
                 e.nativeEvent.stopImmediatePropagation();
               }
             }}
        >
          <Icon name={icon} size={16}/>
        </div>
      </Dropdown>
  );
}

export default MenuButton;