import React from "react";
import {connect} from 'umi';
import {Dropdown} from 'antd';
import {Icon} from 'air-design';
import './HeadFunctionLayer.less';

const HeadFunctionLayer: React.FC<any> = props => {

  const {
    layoutSize
  } = props;

  const popupRender = () => {
    return (
        <div className={'head-function-layer'}>

        </div>
    );
  }

  return (
      <Dropdown className={'head-function-dropdown'} popupRender={popupRender} trigger={['click']} destroyOnHidden>
        <div className={"head-function-menu"} style={{height: layoutSize.headerHeight, width: layoutSize.menuWidth}}>
          <div className={"head-function-menu-inner"}>
            <Icon name={'menu_top'} size={18}/>
          </div>
        </div>
      </Dropdown>
  )
}

export default connect(({global}: any) => ({
  layoutSize: global.layoutSize
}))(HeadFunctionLayer);
