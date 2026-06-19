/**
 * 安全布局组件
 *
 * 未登录时渲染 Login 页面，已登录时渲染 children。
 * 增强功能：检测 URL 中的 transferToken 参数，自动兑换为正式 Token 实现免登录跳转。
 * transferToken 兑换失败时不阻断，降级为正常登录流程。
 *
 * @author ChaiMingXu, 2026/05/27
 */
import { useEffect, useRef } from 'react';
import { Spin } from 'air-design';
import { connect } from 'umi';
import Login from '../pages/Login';
import { POST } from '../utils/HttpRequest';
import { storageKey } from '../config';

interface SecurityLayoutProps {
  dispatch: any;
  user: any;
  children?: React.ReactNode;
}

const SecurityLayout: React.FC<SecurityLayoutProps> = ({ dispatch, user, children }) => {
  const hasCheckedRef = useRef(false);
  const dispatchRef = useRef(dispatch);

  // 保持 dispatch 引用最新
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  // 处理 URL 中的 transferToken（跨应用免登录跳转）
  useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const transferToken = params.get('transferToken');

      if (transferToken) {
        // 清除 URL 中的 transferToken 参数，避免刷新重复消费
        params.delete('transferToken');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);

        // 兑换 transferToken 为正式 Token
        POST('/api/v1/transfer/accept', { transferToken }).then((resp: any) => {
          if (resp?.success && resp.data) {
            const data = resp.data;
            const token = data.token || '';
            if (token) sessionStorage.setItem(storageKey('token'), token);

            const userData = data.user || data || null;
            if (userData?.id) sessionStorage.setItem(storageKey('uid'), String(userData.id));
            if (userData?.loginId) sessionStorage.setItem(storageKey('user'), String(userData.loginId));

            if (token) {
              dispatchRef.current({ type: 'user/setUser', payload: userData });
              window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: true } }));
              return;
            }
          }
          // 兑换失败，走正常流程
          checkExistingToken();
        }).catch(() => {
          checkExistingToken();
        });
        return;
      }

      // 无 transferToken，检查已有 Token
      checkExistingToken();
    }
  }, []);

  const checkExistingToken = () => {
    const token = sessionStorage.getItem(storageKey('token'));
    if (token) {
      dispatchRef.current({ type: 'user/validateToken' });
    }
  };

  // 监听认证状态变化事件（登录/登出）
  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && !detail.authenticated) {
        dispatchRef.current({ type: 'user/clearUser' });
      }
    };
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);

  // 监听 storage 变化（跨标签页同步 token）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey('token')) {
        dispatchRef.current({ type: 'user/validateToken' });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 正在验证 token 时显示全屏加载
  if (user.validatingToken) {
    return <Spin spinning={true} fullscreen={true} description="正在验证身份..." />;
  }

  // 未认证则显示登录页
  if (!user.isAuthenticated) {
    return <Login />;
  }

  // 已认证则渲染子组件
  return <>{children}</>;
};

export default connect(({ user }: any) => ({ user }))(SecurityLayout);
