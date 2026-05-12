import { useNavigate } from '@umijs/max';
import './index.less';

const categories = [
  {
    title: '数据展示',
    items: ['Table', 'Tree', 'List'],
    demo: '/table',
  },
  {
    title: '按钮系',
    items: ['Button', 'IconButton', 'MenuButton', 'ToggleButton'],
    demo: '/form',
  },
  {
    title: '布局容器',
    items: ['Splitter', 'SlidePanel', 'TabPanel', 'GroupSplitter'],
    demo: '/layout',
  },
  {
    title: '基础组件',
    items: ['Icon', 'ColorPicker', 'Message', 'Notification', 'EditableLabel', 'Help'],
    demo: '/form',
  },
  {
    title: '对话框',
    items: ['Dialog', 'UploadDialog', 'LoadingPanel'],
    demo: '/form',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>AirDesign</h1>
        <p>毛玻璃风格 React 组件库 — 场景模拟展示</p>
      </div>
      <div className="home-grid">
        {categories.map((cat) => (
          <div key={cat.title} className="home-card" onClick={() => navigate(cat.demo)}>
            <div className="card-title">{cat.title}</div>
            <div className="card-tags">
              {cat.items.map((item) => (
                <span key={item} className="card-tag">{item}</span>
              ))}
            </div>
            <div className="card-action">查看场景 →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
