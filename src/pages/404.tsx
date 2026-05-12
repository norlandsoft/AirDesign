import { useNavigate } from '@umijs/max';
import { Button } from '@/components/AirDesign';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 16,
    }}>
      <h1 style={{ fontSize: '4rem', color: '#ccc', margin: 0 }}>404</h1>
      <p style={{ color: '#888', margin: 0 }}>页面不存在</p>
      <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
    </div>
  );
}
