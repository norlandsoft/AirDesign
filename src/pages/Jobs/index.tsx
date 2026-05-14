import React, {useState} from 'react';
import {connect} from 'umi';
import MenuBar from '@/components/MenuBar';
import JobsOverview from './overview';
import JobsKanban from './kanban';
import JobsAssets from './assets';
import JobsRepository from './assets/repo';
import './index.less';

/**
 * 智能任务页面
 *
 * 布局与智能工作室一致：左侧 MenuBar + 右侧工作区。
 * 左侧菜单：概览、看板、资产。
 * 概览页展示工作列表与运行状态；看板页支持拖拽排序与跨列移动；资产页管理 Gitea 仓库与文件。
 *
 * @author ChaiMingXu, on 2026/3/29
 */
const Jobs: React.FC<any> = (props) => {
  const {frameSize} = props;
  const [activeMenu, setActiveMenu] = useState<string>('jobs_overview');

  /** 左侧菜单项配置：概览、看板、资产（仓库详情从资产列表进入） */
  const menuItems = [
    {id: 'jobs_overview', label: '概览', icon: 'team_office'},
    {id: 'jobs_kanban', label: '看板', icon: 'kanban'},
    {id: 'jobs_assets', label: '资产', icon: 'assets'},
  ];

  const workAreaSize = {width: frameSize.width - 60, height: frameSize.height};

  /** 根据当前选中菜单渲染对应的工作区内容 */
  const renderWorkContent = () => {
    switch (activeMenu) {
      case 'jobs_overview':
        return <JobsOverview frameSize={workAreaSize}/>;
      case 'jobs_kanban':
        return <JobsKanban frameSize={workAreaSize}/>;
      case 'jobs_assets':
        return <JobsAssets frameSize={workAreaSize} onOpenRepository={handleOpenRepository}/>;
      case 'jobs_repository':
        return <JobsRepository frameSize={workAreaSize} onBack={handleBackToAssets}/>;
      default:
        return null;
    }
  };

  /** 打开仓库详情页 */
  const handleOpenRepository = () => {
    setActiveMenu('jobs_repository');
  };

  /** 从仓库详情页返回资产列表 */
  const handleBackToAssets = () => {
    setActiveMenu('jobs_assets');
  };

  return (
      <div className="jobs-page">
        <MenuBar
            items={menuItems}
            height={frameSize.height}
            defaultSelected="jobs_overview"
            onSelect={(id: string) => setActiveMenu(id)}
        />
        <div className="work-area" style={{width: frameSize.width - 60, height: frameSize.height}}>
          {renderWorkContent()}
        </div>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(Jobs);
