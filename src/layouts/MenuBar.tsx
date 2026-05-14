import React, {useEffect} from 'react';
import {connect} from 'umi';
import {Tooltip} from 'antd';
import {Icon} from 'air-design';
import './MenuBar.less';

const MenuBar: React.FC<any> = props => {

  const {
    dispatch,
    layoutSize,
    current,
    menu: {
      menuList
    }
  } = props;

  useEffect(() => {
    dispatch({
      type: 'menu/fetchMenuList',
    });
  }, []);

  const handleClickMenuItem = id => {
    if (current?.page === id) {
      return;
    }

    dispatch({
      type: 'global/changeCurrentPage',
      payload: id
    });
    // 触发窗口resize事件
    window.dispatchEvent(new Event('resize'));
  }

  return (
      <div className={'air-layout-menu'}
           style={{width: layoutSize.menuWidth, top: layoutSize.headerHeight, bottom: layoutSize.footerHeight}}>
        {
          menuList.map(item => {
            const currentUser = sessionStorage.getItem('air-user-id');
            if (currentUser !== 'admin' && item.role === 'admin') {
              return null;
            }
            return (
                <Tooltip placement="right" title={item.name} arrow={false} mouseEnterDelay={0.2} mouseLeaveDelay={0}
                         destroyOnHidden={true} styles={{body: {fontSize: 13, fontWeight: 600, borderRadius: 3}}}
                         key={item.id}
                >
                  <div key={item.id} className={'air-layout-menu-item'} onClick={() => handleClickMenuItem(item.id)}>
                    <div className={'air-layout-menu-icon'}
                         style={{backgroundColor: current.page === item.id ? 'rgb(150, 200, 250, 0.5)' : 'transparent'}}>
                      {
                        current.page === item.id ?
                            <div className={'air-layout-menu-item-selected'}/> : null
                      }
                      <Icon name={item.icon} size={20} thickness={1.5}/>
                    </div>
                  </div>
                </Tooltip>
            )
          })
        }
      </div>
  );
}

export default connect(({global, user, menu}) => ({
  current: global.current,
  layoutSize: global.layoutSize,
  user,
  menu
}))(MenuBar);
