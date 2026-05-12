import { Outlet, useLocation, history } from '@umijs/max';
import './index.less';

const menuItems = [
  { path: '/', label: '首页' },
  { path: '/table', label: '表格场景' },
  { path: '/tree', label: '树形场景' },
  { path: '/form', label: '表单场景' },
  { path: '/layout', label: '布局场景' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="layout-container">
      <div className="layout-sidebar">
        <div className="sidebar-header">AirDesign</div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => history.push(item.path)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
}
