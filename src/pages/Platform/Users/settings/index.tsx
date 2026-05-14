/**
 * 用户设置整合页面
 *
 * 采用左右分栏布局：左侧为功能列表，右侧为设置区域
 * 整合所有设置页面，统一管理导航和内容切换
 *
 * Created by ChaiMingXu, on 2026/1/3
 */

import React, {useEffect, useRef, useState} from 'react';
import {connect} from 'umi';
import {Avatar} from 'antd';
import {Button} from 'air-design';
import {UserResponse} from '@/types/user';
import BasicInfo, {BasicInfoRef} from './BasicInfo';
import PasswordSettings, {PasswordSettingsRef} from './PasswordSettings';
import DisplaySettings, {DisplaySettingsRef} from './DisplaySettings';
import './index.less';

interface UserSettingsIndexProps {
  dispatch: any;
  currentUser: UserResponse | null;
  frameSize: {
    width: number;
    height: number;
  };
}

type SettingsTab = 'basic' | 'password' | 'display';

/**
 * 设置页面配置
 */
interface SettingsPageConfig {
  id: SettingsTab;
  label: string;
  component: React.ComponentType<any>;
}

const UserSettingsIndex: React.FC<UserSettingsIndexProps> = (props) => {
  const {dispatch, currentUser, frameSize} = props;

  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');
  const [loading, setLoading] = useState(false);
  const [childLoading, setChildLoading] = useState(false);
  const basicInfoRef = useRef<BasicInfoRef>(null);
  const passwordSettingsRef = useRef<PasswordSettingsRef>(null);
  const displaySettingsRef = useRef<DisplaySettingsRef>(null);

  // 监听子组件的 loading 状态变化，确保按钮文字能够实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      const currentLoading = getCurrentLoading();
      setChildLoading(prev => {
        if (prev !== currentLoading) {
          return currentLoading;
        }
        return prev;
      });
    }, 50); // 每50ms检查一次，确保响应及时

    return () => clearInterval(interval);
  }, [activeTab]);

  /**
   * 获取头像路径
   */
  const getAvatarUrl = (avatar?: string): string => {
    const avatarId = avatar || 'u01';
    return `/icons/avatar/${avatarId}.svg`;
  };

  /**
   * 设置页面配置列表
   */
  const settingsPages: SettingsPageConfig[] = [
    {
      id: 'basic',
      label: '基本信息',
      component: BasicInfo,
    },
    {
      id: 'password',
      label: '密码设置',
      component: PasswordSettings,
    },
    {
      id: 'display',
      label: '显示设置',
      component: DisplaySettings,
    },
  ];

  /**
   * 处理保存操作
   */
  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'basic' && basicInfoRef.current) {
        await basicInfoRef.current.handleSave();
      } else if (activeTab === 'password' && passwordSettingsRef.current) {
        await passwordSettingsRef.current.handleSave();
      } else if (activeTab === 'display' && displaySettingsRef.current) {
        await displaySettingsRef.current.handleSave();
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取当前加载状态
   */
  const getCurrentLoading = (): boolean => {
    if (activeTab === 'basic' && basicInfoRef.current) {
      return basicInfoRef.current.loading;
    } else if (activeTab === 'password' && passwordSettingsRef.current) {
      return passwordSettingsRef.current.loading;
    } else if (activeTab === 'display' && displaySettingsRef.current) {
      return displaySettingsRef.current.loading;
    }
    return false;
  };

  // 计算最终的加载状态
  const isButtonLoading = loading || childLoading;

  /**
   * 获取按钮文字
   */
  const getButtonText = (): string => {
    if (activeTab === 'password') {
      return '修改密码';
    } else {
      return '保存';
    }
  };

  /**
   * 渲染右侧内容区域
   */
  const renderContent = () => {
    const currentPage = settingsPages.find((page) => page.id === activeTab);
    if (!currentPage) return null;

    const Component = currentPage.component;
    if (activeTab === 'basic') {
      return <Component ref={basicInfoRef} dispatch={dispatch} currentUser={currentUser}/>;
    } else if (activeTab === 'password') {
      return <Component ref={passwordSettingsRef} dispatch={dispatch} currentUser={currentUser}/>;
    } else if (activeTab === 'display') {
      return <Component ref={displaySettingsRef} dispatch={dispatch} currentUser={currentUser}/>;
    }
    return <Component dispatch={dispatch} currentUser={currentUser}/>;
  };

  if (!currentUser) {
    return (
        <div
            className="user-settings-container"
            style={{height: frameSize?.height || '100%'}}
        >
          <div className="user-settings-empty">未获取到用户信息</div>
        </div>
    );
  }

  return (
      <div
          className="user-settings-container"
          style={{height: frameSize?.height || '100%'}}
      >
        {/* 左侧导航菜单 */}
        <div className="user-settings-sidebar">
          <div className="user-settings-sidebar-header">
            <Avatar
                size={40}
                src={getAvatarUrl(currentUser.avatar)}
                style={{marginBottom: 8}}
            />
            <div className="user-settings-sidebar-user-name">
              {currentUser.name || currentUser.id}
            </div>
            <div className="user-settings-sidebar-user-id">
              {currentUser.id}
            </div>
          </div>

          {/* 账户信息 */}
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
              {currentUser.status === 'A' ? '启用' : currentUser.status === 'F' ? '禁用' : '未知'}
            </span>
            </div>
            {currentUser.createTime && (
                <div className="user-settings-account-item">
                  <span className="user-settings-account-label">创建：</span>
                  <span className="user-settings-account-value">
                {new Date(currentUser.createTime).toLocaleDateString('zh-CN')}
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
            {renderContent()}
          </div>
          {/* 底部按钮栏 */}
          <div className="user-settings-button-bar">
            <Button
                type="primary"
                onClick={handleSave}
                disabled={isButtonLoading}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
  );
};

export default connect(({global, user}) => ({
  frameSize: global.frameSize,
  currentUser: user.currentUser,
}))(UserSettingsIndex);
