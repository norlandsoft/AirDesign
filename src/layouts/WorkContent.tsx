import React from 'react';
import {connect} from "umi";

import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Wiki from "@/pages/Wiki";
import Workflow from "@/pages/Workflow";
import Skill from "@/pages/Skill";
import Jobs from "@/pages/Jobs";
import PlatformSettings from "@/pages/Platform";
import AdminPaas from "@/pages/Platform/Admin/AdminPaasPage";

import Error404 from "./Error404";

/**
 * 工作区内容组件
 *
 * 根据当前选中的菜单项（global.current.page）渲染对应的页面组件
 * 菜单ID与页面组件的映射关系通过 switch-case 实现
 *
 * @author ChaiMingXu
 */
const WorkContent: React.FC<any> = props => {

  const {
    current,
    frameSize,
    layoutSize
  } = props;

  return (
      <div style={{
        position: 'fixed',
        left: layoutSize.menuWidth,
        top: layoutSize.headerHeight,
        width: frameSize.width,
        height: frameSize.height
      }}>
        {
          (() => {
            switch (current.page) {
              case 'menu_home':
                return <Home/>
              case 'menu_chat':
                return <Chat/>
              case 'menu_workflow':
                return <Workflow/>
              case 'menu_wiki':
                return <Wiki/>
              case 'menu_jobs':
                return <Jobs/>
              case 'menu_skill':
                return <Skill/>
              case 'menu_setting':
                return <PlatformSettings/>
              case 'menu_paas':
                return <AdminPaas/>
              default:
                return <Error404/>
            }
          })()
        }
      </div>
  );
}

export default connect(({global}) => ({
  current: global.current,
  frameSize: global.frameSize,
  layoutSize: global.layoutSize
}))(WorkContent);
