import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Avatar} from 'antd';
import {Dialog, Icon, Message, SlidePanel} from 'air-design';
import screenfull from "screenfull";
import HeadFunctionLayer from "./HeadFunctionLayer";
import SpaceDropdownMenu from "@/pages/Wiki/components/SpaceDropdownMenu";
import UserSettings from '@/pages/Platform/Users/settings';
import AdminPasswordSettings, {AdminPasswordSettingsRef} from '@/pages/Platform/Users/settings/AdminPasswordSettings';
import {UserResponse} from '@/types/user';
import './HeadBar.less';

interface HeadBarProps {
  dispatch: any;
  height: number;
  currentUser: UserResponse | null;
  current: any;
}

const HeadBar: React.FC<HeadBarProps> = props => {

  const {
    dispatch,
    height,
    currentUser,
    current
  } = props;

  const [fullScreen, setFullScreen] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const adminPasswordSettingsRef = React.useRef<AdminPasswordSettingsRef>(null);
  const adminSaveFnRef = React.useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // 页面尺寸变动事件
    window.addEventListener('resize', handleSizeChange);

    // 获取当前全屏状态
    setFullScreen(screenfull.isFullscreen);

    return () => {
      window.removeEventListener('resize', handleSizeChange)
    }
  }, []);

  const handleSizeChange = () => {
    // 改变全屏标志
    setFullScreen(screenfull.isFullscreen);
  }

  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.toggle().then();
      } else {
        screenfull.request().then();
      }
    }
  }

  const handleUserLogout = () => {
    // 确认是否退出
    Dialog({
      title: '退出',
      message: '是否退出AirMachine？',
      onConfirm: dlg => {
        dispatch({
          type: 'user/logout',
        });

        dlg.doCancel();
      }
    });
  }

  /**
   * 获取用户头像路径
   * 根据 avatar 值组合成完整的头像路径
   * 如果 avatar 为空，使用默认值 'u01'
   *
   * @param avatar 用户头像标识，如 'u01'
   * @returns 完整的头像路径，如 '/icons/avatars/u01.svg'
   */
  const getAvatarUrl = (avatar?: string): string => {
    const avatarId = avatar || 'u01';
    return `/icons/avatar/${avatarId}.svg`;
  }

  const RightPanel = () => {
    return (
        <div className={'air-layout-head-right'}>
          {/*全屏*/}
          <div className={'air-layout-head-right-function'}>
            <div className={'air-layout-head-right-function-inner'} onClick={handleFullScreen}>
              <Icon name={fullScreen ? 'full_screen_exit' : 'full_screen'} thickness={2} size={20}/>
            </div>
          </div>
          {/*Avatar*/}
          <div className={'air-layout-head-right-avatar'} style={{cursor: 'pointer'}}
               onClick={() => setShowUserPanel(true)}>
            <Avatar
                size={28}
                src={getAvatarUrl(currentUser?.avatar)}
                alt={currentUser?.name || currentUser?.id}
            >
              {currentUser?.name?.charAt(0) || currentUser?.id?.charAt(0) || 'U'}
            </Avatar>
          </div>
        </div>
    );
  }

  const UserPanel = () => {
    if (!currentUser) {
      return null;
    }

    return (
        <div className={'air-frame-user-panel'}>
          <div className={'air-frame-user-panel-info'}>
            <Avatar size={64} className={'air-frame-user-panel-info-avatar'} src={getAvatarUrl(currentUser?.avatar)}/>
            <div className={'air-frame-user-panel-info-name'}>{currentUser.name || currentUser.id}</div>
            <div className={'air-frame-user-panel-info-id'}>#{currentUser.id}</div>

            <div className={'air-frame-user-panel-info-close'} onClick={() => setShowUserPanel(false)}>
              <Icon name={'close'} size={14}/>
            </div>
          </div>

          <div className={'air-frame-user-panel-ops'} onClick={() => setShowUserPanel(false)}>
            {currentUser?.id === 'admin' ? (
                <>
                  <div className={'air-frame-user-panel-ops-item'} onClick={() => setShowPasswordPanel(true)}>
                    <Icon name={'key'} size={20}/>
                    <div className={'air-frame-user-panel-ops-item-text'}>修改密码</div>
                  </div>
                  <div className={'air-frame-user-panel-ops-hr'}/>
                </>
            ) : (
                <>
                  <div className={'air-frame-user-panel-ops-item'} onClick={() => setShowSettings(true)}>
                    <Icon name={'config'} size={20}/>
                    <div className={'air-frame-user-panel-ops-item-text'}>用户设置</div>
                  </div>
                  <div className={'air-frame-user-panel-ops-hr'}/>
                </>
            )}
            <div className={'air-frame-user-panel-ops-item'} onClick={handleUserLogout}>
              <Icon name={'exit'} size={20}/>
              <div className={'air-frame-user-panel-ops-item-text'}>退出</div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className={'air-layout-head'} style={{height, width: window.innerWidth}}>
        <div className={'air-layout-head-content'}>

          <div className={'air-layout-head-content-app'}>
            <HeadFunctionLayer/>
            <div className={'air-layout-head-content-app-title'}
                 style={{backgroundImage: `url(/icons/logo/default.svg)`}}/>
          </div>

          {/*WIKI空间*/}
          {
              current.page === 'menu_wiki' && (
                  <div className={'air-layout-head-content-project'}>
                    <SpaceDropdownMenu/>
                  </div>
              )
          }

        </div>
        <RightPanel/>

        {/*用户操作面板，小面板*/}
        <SlidePanel
            type={'small'}
            open={showUserPanel}
            maskClosable={true}
            hasButtonBar={false}
            bodyPadding={0}
            onClose={() => {
              setShowUserPanel(false);
            }}
        >
          <UserPanel/>
        </SlidePanel>

        <SlidePanel
            type={'full'}
            title={'用户设置'}
            bodyPadding={0}
            open={showSettings}
            onClose={() => {
              setShowSettings(false);
            }}
            hasCloseButton={true}
            hasButtonBar={false}
        >
          <UserSettings/>
        </SlidePanel>

        {/* 仅 admin 在头像菜单中有「修改密码」，非 admin 在用户设置页内修改密码 */}
        <SlidePanel
            type={'medium'}
            title={'修改密码'}
            open={showPasswordPanel}
            onClose={() => setShowPasswordPanel(false)}
            hasCloseButton={true}
            confirmButtonText={'保存'}
            closeButtonText={'关闭'}
            onConfirm={async () => {
              const fn = adminSaveFnRef.current ?? adminPasswordSettingsRef.current?.handleSave;
              if (fn) await fn();
              else Message.error('请稍候再试');
            }}
        >
          <AdminPasswordSettings
              ref={adminPasswordSettingsRef}
              dispatch={dispatch}
              onSuccess={() => setShowPasswordPanel(false)}
              onSaveReady={(fn) => {
                adminSaveFnRef.current = fn;
              }}
          />
        </SlidePanel>
      </div>
  );
}

export default connect(({global, user}) => ({
  frameSize: global.frameSize,
  layoutSize: global.layoutSize,
  current: global.current,
  currentUser: user.currentUser,
}))(HeadBar);
