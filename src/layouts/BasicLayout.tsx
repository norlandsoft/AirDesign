import React, {useEffect} from "react";
import {connect} from 'umi';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import HeadBar from "@/layouts/HeadBar";
import MenuBar from "@/layouts/MenuBar";
import WorkContent from "@/layouts/WorkContent";
import type {DisplaySettings} from '@/types/userSettings';

// 配置 dayjs 为中文
dayjs.locale('zh-cn');
/**
 * 基础布局组件
 *
 * 提供主应用布局，包括侧边栏、顶部导航等
 * 包含所有需要登录后才能访问的页面
 * 自动加载并应用当前用户的显示设置（如字体大小）
 *
 * @author ChaiMingXu, on 2025/12/14
 */
const BasicLayout: React.FC<any> = props => {

  const {
    dispatch,
    frameSize,
    layoutSize,
    currentUser,
    userSettings,
    userSettingsLoading
  } = props;

  // 获取平台信息

  const handleWindowResize = () => {
    dispatch({
      type: 'global/changeFrameSize'
    });
  }

  /**
   * 加载用户显示设置（admin 暂不获取用户设置）
   */
  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'admin') {
      dispatch({
        type: 'user/fetchUserSettings',
        payload: {userId: currentUser.id},
      });
    }
  }, [currentUser?.id, dispatch]);

  /**
   * 应用用户显示设置（字体大小等）
   */
  useEffect(() => {
    if (userSettings && !userSettingsLoading && userSettings.displaySettings) {
      try {
        const displaySettings: DisplaySettings = JSON.parse(userSettings.displaySettings);
        // 应用字体大小，默认 18px
        const fontSize = displaySettings.fontSize || 16;
        document.documentElement.style.fontSize = `${fontSize}px`;
      } catch (e) {
        // 解析失败时使用默认值
        document.documentElement.style.fontSize = '16px';
      }
    } else if (!userSettingsLoading) {
      // 没有设置时使用默认值
      document.documentElement.style.fontSize = '16px';
    }
  }, [userSettings, userSettingsLoading]);

  useEffect(() => {
    handleWindowResize();

    // 监听窗口尺寸变化事件
    window.addEventListener('resize', handleWindowResize);

    return () => {
      // 移除监听
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [])

  return (
      <ConfigProvider
          prefixCls="air"
          locale={zhCN}
      >
        <HeadBar height={layoutSize.headerHeight}/>
        <MenuBar/>
        <WorkContent/>
      </ConfigProvider>
  );
};

export default connect(({global, user}) => ({
  frameSize: global.frameSize,
  layoutSize: global.layoutSize,
  currentUser: user.currentUser,
  userSettings: user.userSettings,
  userSettingsLoading: user.userSettingsLoading
}))(BasicLayout);
