/**
 * 用户设置整合页面
 *
 * 采用左右分栏布局：左侧为导航菜单，右侧为设置区域
 * 包含基本信息（只读）、显示设置、修改密码三个功能tab
 *
 * Author: ChaiMingXu, 2026/05/28
 */
import React, {useEffect, useRef, useState} from 'react';
import {Avatar, AvatarImage, Button, SlidePanel} from 'air-design';
import type {UserResponse} from '../../types/user';
import {getAvatarUrl} from '../../utils/IconUtils';
import {useUserStore} from '../../models/user';
import BasicInfo, {type BasicInfoRef} from './BasicInfo';
import DisplaySettings, {type DisplaySettingsRef} from './DisplaySettings';
import ChangePassword, {type ChangePasswordRef} from './ChangePassword';
import './index.css';

export interface UserSettingsProps {
  visible: boolean;
  onClose: () => void;
}

type SettingsTab = 'basic' | 'display' | 'password';

interface SettingsPageConfig {
  id: SettingsTab;
  label: string;
}

const UserSettings: React.FC<UserSettingsProps> = ({visible, onClose}) => {
  const currentUser = useUserStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');
  const [loading, setLoading] = useState(false);
  const [childLoading, setChildLoading] = useState(false);
  const basicInfoRef = useRef<BasicInfoRef>(null);
  const displaySettingsRef = useRef<DisplaySettingsRef>(null);
  const changePasswordRef = useRef<ChangePasswordRef>(null);

  // 面板关闭时重置到基本信息tab
  useEffect(() => {
    if (!visible) {
      setActiveTab('basic');
    }
  }, [visible]);

  // 轮询子组件loading状态
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const currentLoading = getCurrentLoading();
      setChildLoading(prev => {
        if (prev !== currentLoading) {
          return currentLoading;
        }
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [visible, activeTab]);

  const settingsPages: SettingsPageConfig[] = [
    {id: 'basic', label: '基本信息'},
    {id: 'display', label: '显示设置'},
    {id: 'password', label: '修改密码'},
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'basic' && basicInfoRef.current) {
        await basicInfoRef.current.handleSave();
      } else if (activeTab === 'display' && displaySettingsRef.current) {
        await displaySettingsRef.current.handleSave();
      } else if (activeTab === 'password' && changePasswordRef.current) {
        await changePasswordRef.current.handleSave();
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLoading = (): boolean => {
    if (activeTab === 'basic' && basicInfoRef.current) {
      return basicInfoRef.current.loading;
    } else if (activeTab === 'display' && displaySettingsRef.current) {
      return displaySettingsRef.current.loading;
    } else if (activeTab === 'password' && changePasswordRef.current) {
      return changePasswordRef.current.loading;
    }
    return false;
  };

  const isButtonLoading = loading || childLoading;

  if (!currentUser) {
    return (
      <SlidePanel type="full" title="用户设置" bodyPadding={0} hasCloseButton open={visible} onClose={onClose} hasButtonBar={false}>
        <div className="user-settings-container">
          <div className="user-settings-empty">未获取到用户信息</div>
        </div>
      </SlidePanel>
    );
  }

  return (
    <SlidePanel type="full" title="用户设置" bodyPadding={0} hasCloseButton open={visible} onClose={onClose} hasButtonBar={false}>
      <div className="user-settings-container">
        {/* 左侧导航菜单 */}
        <div className="user-settings-sidebar">
          <div className="user-settings-sidebar-header">
            <Avatar className="!size-10 !mb-2">
              <AvatarImage src={getAvatarUrl(currentUser.avatar)}/>
            </Avatar>
            <div className="user-settings-sidebar-user-name">
              {currentUser.name || currentUser.id}
            </div>
            <div className="user-settings-sidebar-user-id">
              {currentUser.loginId || currentUser.id}
            </div>
          </div>

          <div className="user-settings-sidebar-account">
            {currentUser.role === 'admin' && (
              <div className="user-settings-account-item">
                <span className="user-settings-account-label">角色：</span>
                <span className="user-settings-account-value">管理员</span>
              </div>
            )}
            <div className="user-settings-account-item">
              <span className="user-settings-account-label">状态：</span>
              <span className="user-settings-account-value">
                {currentUser.status === 'A' || String(currentUser.status) === '1' ? '启用' : currentUser.status === 'F' ? '禁用' : '正常'}
              </span>
            </div>
            {currentUser.createTime && (
              <div className="user-settings-account-item">
                <span className="user-settings-account-label">创建：</span>
                <span className="user-settings-account-value">
                  {currentUser.createTime}
                </span>
              </div>
            )}
          </div>

          <div className="user-settings-sidebar-nav">
            <div className="user-settings-nav-section">
              {settingsPages.map((page) => (
                <div
                  key={page.id}
                  className={`user-settings-nav-item ${activeTab === page.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(page.id)}
                >
                  {page.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="user-settings-main">
          <div className="user-settings-main-content">
            {activeTab === 'basic' && <BasicInfo ref={basicInfoRef} currentUser={currentUser}/>}
            {activeTab === 'display' && <DisplaySettings ref={displaySettingsRef} currentUser={currentUser}/>}
            {activeTab === 'password' && <ChangePassword ref={changePasswordRef} currentUser={currentUser}/>}
          </div>
          <div className="user-settings-button-bar">
            <Button
              type="primary"
              onClick={handleSave}
              disabled={isButtonLoading}
            >
              保存
            </Button>
          </div>
        </div>
      </div>
    </SlidePanel>
  );
};

export default UserSettings;
