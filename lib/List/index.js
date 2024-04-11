import React, {useEffect, useState} from "react";
import {Empty} from "antd";
import MenuButton from "../Button/MenuButton";
import Icon from '../Icons';
import Help from '../Help';
import './index.less';

const AirList = props => {

  const {
    data,
    rowSelectable = true,
    onRowClick = () => {
    },
    selectedRow,
    itemIcon = 'item',
    leftRender,
    tagRender,
    menuRender,
    width = undefined,
    height = undefined,
    labelMaxWidth = 100,
  } = props;

  const [isHovered, setHovered] = useState(false);
  const [currentListItem, setCurrentListItem] = useState(null);

  useEffect(() => {
    setCurrentListItem(selectedRow);
  }, [selectedRow]);

  // 当前选中项背景颜色为深蓝，其它项无背景色
  const getRowStyle = (item) => {
    if (currentListItem && item.id === currentListItem.id) {
      return {
        backgroundColor: '#eaf5ff'
      }
    } else {
      return {
        backgroundColor: 'transparent',
      }
    }
  }

  return (
      <div className={'air-list'} style={{width: width, height: height}}>
        <div className={'air-list-inner'}>
          {
            (data && data.length > 0) ? data.map((item, index) => {
              return (
                  <div className={'air-list-item'} key={index}
                       style={rowSelectable ? {...getRowStyle(item), cursor: 'pointer'} : null}
                       onClick={() => {
                         if (rowSelectable) {
                           setCurrentListItem(item);
                           onRowClick(item);
                         }
                       }}
                  >
                    <div className={'air-list-item-left'}>
                      {
                        leftRender ? leftRender(item) : (
                            <div className={'air-list-item-icon'}>
                              <Icon name={item.icon ? item.icon : itemIcon} size={16}/>
                            </div>
                        )
                      }
                      <div className={'air-list-item-text'} style={{maxWidth: labelMaxWidth}}>
                        {item.name}
                      </div>
                      <div>
                        {
                            item.description && (
                                <Help icon='tags' text={item.description}/>
                            )
                        }
                      </div>
                    </div>

                    <div className={'air-list-item-right'}>
                      {
                          tagRender && tagRender(item)
                      }
                      {
                          menuRender &&
                          <MenuButton size={22} menu={menuRender(item)} icon={'menu-more'}/>
                      }
                    </div>
                  </div>
              )
            }) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
            )
          }
        </div>
      </div>
  );
}

export default AirList;