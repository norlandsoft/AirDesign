import React from 'react';
import {connect} from 'umi';

import PropertiesNaviBar from '@/components/PropertiesNaviBar';
import AdminPaasNaviData from './AdminPaasNaviData.json';
import './AdminPaasPage.less';

import DatabaseSettingsPanel from './Settings/DatabaseSettingsPanel';
import RedisSettingsPanel from './Settings/RedisSettingsPanel';
import GiteaSettingsPanel from './Settings/GiteaSettingsPanel';
import StorageSettingsPanel from './Settings/StorageSettingsPanel';
import LibreOfficeSettingsPanel from './Settings/LibreOfficeSettingsPanel';
import MinerUSettingsPanel from './Settings/MinerUSettingsPanel';
import OpenClawSettingsPanel from './Settings/OpenClawSettingsPanel';
import SearXNGSettingsPanel from './Settings/SearXNGSettingsPanel';


/**
 * 渲染右侧配置面板
 *
 * 根据面板标识渲染对应服务的配置组件
 */
const renderPanel = (key: string) => {
  switch (key) {
    case 'database':
      return <DatabaseSettingsPanel/>;
    case 'redis':
      return <RedisSettingsPanel/>;
    case 'gitea':
      return <GiteaSettingsPanel/>;
    case 'storage':
      return <StorageSettingsPanel/>;
    case 'libreoffice':
      return <LibreOfficeSettingsPanel/>;
    case 'searxng':
      return <SearXNGSettingsPanel/>;
    case 'mineru':
      return <MinerUSettingsPanel/>;
    case 'openclaw':
      return <OpenClawSettingsPanel/>;
    default:
      return <div>暂无内容</div>;
  }
};

/**
 * Admin 基础设施维护页面
 *
 * 单层左右布局：左侧 PropertiesNaviBar 导航（三个分组：数据存储、智能体管理、工具服务），
 * 点击导航项直接在右侧展示对应配置面板，无二级子导航。
 *
 * Created by ChaiMingXu, on 2026/04/04
 */
const AdminPaasPage: React.FC<any> = (props) => {
  const {frameSize} = props;

  const [activeKey, setActiveKey] = React.useState('database');

  return (
      <div
          className="air-admin-paas"
          style={{width: frameSize.width, height: frameSize.height}}
      >
        {/* 左侧导航 */}
        <PropertiesNaviBar
            width={220}
            height={frameSize.height}
            data={AdminPaasNaviData}
            activeKey={activeKey}
            onChange={setActiveKey}
        />

        {/* 右侧配置面板 */}
        <div
            className="air-admin-paas-content"
            style={{
              width: frameSize.width - 220,
              height: frameSize.height,
            }}
        >
          <div className="air-admin-paas-panel">
            {renderPanel(activeKey)}
          </div>
        </div>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(AdminPaasPage);
