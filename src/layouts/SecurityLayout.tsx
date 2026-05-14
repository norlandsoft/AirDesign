import {useEffect, useRef} from 'react';
import {Spin} from 'antd';
import {connect} from '@umijs/max';
import Login from '@/pages/Platform/Login';
import BasicLayout from './BasicLayout';
// 引入控制台警告屏蔽配置
import '@/setProxy';

/**
 * 安全布局组件
 *
 * 负责判断用户是否已登录，根据登录状态直接渲染对应的页面组件
 * - 未登录：渲染登录页面组件
 * - 已登录：渲染主应用布局组件（BasicLayout）
 *
 * 使用dva管理认证状态，不进行路由跳转，而是根据状态直接渲染不同的组件
 *
 * @author ChaiMingXu
 */
const SecurityLayout: React.FC<any> = props => {

  const {
    dispatch,
    user
  } = props;

  const hasCheckedRef = useRef(false); // 标记是否已执行过初始检查
  const dispatchRef = useRef(dispatch); // 保存 dispatch 引用，避免依赖变化

  // 更新 dispatch 引用
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  // 初始检查认证状态（仅执行一次）
  useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;

      // 检查 sessionStorage 中的 token
      const token = sessionStorage.getItem('air-machine-token');

      if (token) {
        // 如果有token，验证token有效性
        // validateToken 会处理验证成功或失败的情况
        dispatchRef.current({
          type: 'user/validateToken',
        });
      }
      // 如果没有token，不需要额外处理
      // 因为初始状态 isAuthenticated 已经基于 sessionStorage 设置了
    }
  }, []); // 空依赖数组，确保只执行一次

  // 监听storage变化（跨标签页同步）
  // 只在其他标签页修改token时触发，当前标签页的修改不会触发此事件
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 只处理 air-machine-token 的变化
      if (e.key === 'air-machine-token') {
        // 跨标签页同步，重新验证token
        dispatchRef.current({
          type: 'user/validateToken',
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 清理事件监听器
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // 空依赖数组，事件监听器只需要注册一次

  // 如果正在验证token，显示加载中
  if (user.validatingToken) {
    return (
        <>
          <Spin spinning={true} fullscreen={true} tip="正在验证身份..."/>
        </>
    );
  }

  // 根据登录状态直接渲染对应的组件
  if (!user.isAuthenticated) {
    // 未登录状态：渲染登录页面组件
    return <Login/>;
  }

  // 已登录状态：渲染主应用布局组件
  return <BasicLayout/>;
};

export default connect(({user}) => ({
  user,
}))(SecurityLayout);
