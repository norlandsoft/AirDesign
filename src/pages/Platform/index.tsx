import React from 'react';
import {connect} from 'umi';

import PropertiesNaviBar from '@/components/PropertiesNaviBar'
import PlatformSettingsNaviData from "./PlatformSettingsNaviData.json";

import UserSettingsPanel from "./Settings/UserSettingsPanel";
import DictSettingsPanel from "./Settings/DictSettingsPanel";
import LangModelSettingsPanel from "./Settings/LangModelSettingsPanel";
import PromptSettingsPanel from "./Settings/PromptSettingsPanel";
import AgentPanel from "./Settings/AgentPanel";
import AgentModelPanel from "./Settings/AgentModelPanel";
import CronPanel from "./Settings/CronPanel";
import BackupPanel from "./Settings/BackupPanel";
import HarvestSettingsPanel from "./Settings/HarvestSettingsPanel";


const PlatformSetting: React.FC<any> = props => {

  const {
    frameSize,
  } = props;

  const [currentPanel, setCurrentPanel] = React.useState('user');

  return (
      <div className='air-property-page' style={{width: frameSize.width, height: frameSize.height}}>
        <PropertiesNaviBar width={220} height={frameSize.height} data={PlatformSettingsNaviData}
                           activeKey={currentPanel} onChange={setCurrentPanel}/>
        <div className='air-property-page-content' style={{width: frameSize.width - 220, height: frameSize.height}}>
          {
            (() => {
              switch (currentPanel) {
                case 'user':
                  return <UserSettingsPanel/>
                case 'llm':
                  return <LangModelSettingsPanel/>
                case 'llm-prompt':
                  return <PromptSettingsPanel/>
                case 'data-dictionary':
                  return <DictSettingsPanel/>
                case 'data-backup':
                  return <BackupPanel/>
                case 'agent':
                  return <AgentPanel/>
                case 'agent-model':
                  return <AgentModelPanel/>
                case 'cron':
                  return <CronPanel/>
                case 'crawl':
                  return <HarvestSettingsPanel/>
                default:
                  return <div>暂无内容</div>;
              }
            })()
          }
        </div>
      </div>
  );
};

export default connect(({global, platform}: any) => ({
  frameSize: global.frameSize,
  platform,
}))(PlatformSetting);
