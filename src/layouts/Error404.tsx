import {Button, Result} from 'antd';
import {useNavigate} from '@umijs/max';

/**
 * 404错误页面组件
 *
 * 当访问不存在的路由时显示此页面
 *
 * @author AirDirector Team
 */
const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
      <Result
          status="404"
          title="404"
          subTitle="抱歉，您访问的页面不存在。"
          extra={
            <Button type="primary" onClick={() => navigate('/home')}>
              返回首页
            </Button>
          }
      />
  );
};

export default Error404;

