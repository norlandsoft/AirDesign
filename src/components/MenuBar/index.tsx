import React, {useEffect} from "react";
import './index.less';
import {Icon} from 'air-design';

interface MenuBarProps {
  items: any[];
  height?: number;
  onSelect?: (id: string) => void;
  onReturn?: () => void;
  defaultSelected?: string;
}

const MenuBar: React.FC<MenuBarProps | any> = props => {

  const [currentPage, setCurrentPage] = React.useState<string>('');

  useEffect(() => {
    setCurrentPage(props.defaultSelected || '')
  }, []);

  const selectedStyle = (page: string) => {
    if (page === currentPage) {
      return {
        background: 'rgba(150, 200, 250, 0.5)'
      }
    }
    return {};
  }

  return (
      <div className="air-menu-bar" style={{height: props.height}}>
        <div className="air-menu-items">
          {
            props.items.map((item: any) => {
              const label = item.label;
              const labelCount = label.length;

              const iconName = item.icon || item.id;

              return (
                  <div key={item.id} className={'air-menu-item'} onClick={() => {
                    if (props.onSelect) {
                      props.onSelect(item.id);
                    }
                    setCurrentPage(item.id);
                  }}>
                    <div className={'air-menu-item-inner'} style={selectedStyle(item.id)}>
                      <Icon name={iconName} size={22}/><span
                        style={{letterSpacing: labelCount > 2 ? 0 : '2px'}}>{label}</span>
                    </div>
                  </div>
              );
            })
          }
        </div>
        {
            props.onReturn && (
                // 将返回按钮固定在侧边栏底部，避免随菜单项列表高度变化而位置漂移
                <div key={'air-menu-item-back'} className={'air-menu-item air-menu-item-back'} onClick={props.onReturn}>
                  <div className={'air-menu-item-inner'}>
                    <Icon name={'back'} size={22}/><span style={{letterSpacing: '2px'}}>返回</span>
                  </div>
                </div>
            )
        }
      </div>
  )
}

export default MenuBar;
