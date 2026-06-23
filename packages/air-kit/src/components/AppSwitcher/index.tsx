/**
 * 跨应用免登录跳转组件
 *
 * 点击菜单图标弹出下拉浮层，展示所有在线可用服务。
 * 点击目标服务后，申请SSO中转Token，通过URL参数传递到目标应用，
 * 目标应用的SecurityLayout自动兑换Token完成免登录。
 *
 * 图标通过icons映射表解析，使用appName（application.id）作为图标键进行匹配。
 *
 * Author: ChaiMingXu, 2026/05/27
 */
import React, {useCallback, useState} from 'react';
import {Icon, Spin, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent} from 'air-design';
import {POST} from '../../utils/HttpRequest';
import icons from './icons';
import {isAdminPlatform} from '../../config';
import './index.css';

/** 平台服务信息 */
interface ServiceInfo {
  /** 服务名称（对应 application.id），同时作为图标匹配键 */
  appName: string;
  /** 服务展示名称 */
  displayName: string;
  /** 服务外部访问地址 */
  serviceUrl: string;
  /** 服务描述 */
  description: string;
}

/** API 通用响应结构 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  code?: string;
  message?: string;
}

/** transferToken 响应数据 */
interface TransferData {
  transferToken: string;
}

/** 解析图标：优先匹配映射表中的SVG，未匹配则使用air-design的app图标 */
const resolveIcon = (iconKey: string): { type: 'svg'; svg: string } | { type: 'icon'; name: string } => {
  if (iconKey && icons[iconKey]) {
    return { type: 'svg', svg: icons[iconKey] };
  }
  return { type: 'icon', name: 'app' };
};

/** 默认布局尺寸（与历史 global.layoutSize 一致） */
const DEFAULT_LAYOUT_SIZE = {headerHeight: 40, menuWidth: 40}

interface AppSwitcherProps {
  /** 布局尺寸，宿主可覆盖；默认 {headerHeight:40, menuWidth:40} */
  layoutSize?: {headerHeight: number; menuWidth: number}
}

const AppSwitcher: React.FC<AppSwitcherProps> = ({layoutSize = DEFAULT_LAYOUT_SIZE}) => {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  /** 当前服务的 origin，用于过滤自身 */
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  /** 加载服务列表（过滤掉自身） */
  const fetchServices = useCallback(async () => {
    if (services.length > 0) return;
    setLoading(true);
    try {
      const listUrl = isAdminPlatform() ? '/admin/sso/app/services' : '/api/v1/service/list';
      const resp = await POST(listUrl, {}) as ApiResponse<ServiceInfo[]>;
      if (resp?.success && Array.isArray(resp.data)) {
        setServices(
          resp.data.filter((s: ServiceInfo) => {
            if (!s.serviceUrl) return false;
            try {
              return new URL(s.serviceUrl).origin !== currentOrigin;
            } catch {
              return false;
            }
          })
        );
      }
    } catch {
      // 接口不可用时静默处理
    } finally {
      setLoading(false);
    }
  }, [services.length, currentOrigin]);

  /** 下拉展开时加载 */
  const handleOpenChange = (visible: boolean) => {
    setOpen(visible);
    if (visible) {
      fetchServices();
    }
  };

  /** 点击服务项，申请中转Token后免登跳转 */
  const handleServiceClick = async (service: ServiceInfo) => {
    if (!service.serviceUrl) return;
    try {
      const resp = await POST('/api/v1/transfer/apply', {}) as ApiResponse<TransferData>;
      if (resp?.success && resp.data?.transferToken) {
        const url = new URL(service.serviceUrl);
        url.searchParams.set('transferToken', resp.data.transferToken);
        window.open(url.toString(), '_blank');
      } else {
        window.open(service.serviceUrl, '_blank');
      }
    } catch {
      window.open(service.serviceUrl, '_blank');
    }
    setOpen(false);
  };

  const popupRender = () => {
    return (
      <div className="air-app-switcher">
        {loading ? (
          <div className="air-app-switcher-loading">
            <Spin />
          </div>
        ) : services.length === 0 ? (
          <div className="air-app-switcher-empty">暂无可用的平台服务</div>
        ) : (
          <div className="air-app-switcher-list">
            {services.map(service => {
              const iconResult = resolveIcon(service.appName);
              return (
                <div
                  key={service.appName}
                  className="air-app-switcher-item"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="air-app-switcher-item-icon">
                    {iconResult.type === 'svg' ? (
                      <img
                        src={`data:image/svg+xml,${encodeURIComponent(iconResult.svg)}`}
                        alt={service.displayName || service.appName}
                      />
                    ) : (
                      <Icon name={iconResult.name} size={20} />
                    )}
                  </div>
                  <div className="air-app-switcher-item-info">
                    <div className="air-app-switcher-item-name">
                      {service.displayName || service.appName}
                    </div>
                    {service.description && (
                      <div className="air-app-switcher-item-desc">{service.description}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div
          className="air-app-switcher-menu"
          style={{height: layoutSize.headerHeight, width: layoutSize.menuWidth}}
        >
          <div className="air-app-switcher-menu-inner">
            <Icon name="menu_top" size={18}/>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="air-app-switcher-content">
        {popupRender()}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AppSwitcher;
