import React, { useEffect, useRef } from "react";
import { connect } from "umi";
import { Button, ConfigProvider, Form, Input } from 'antd';
import { UserLoginRequest } from '@/types/user';
import styles from './index.less';

/**
 * 登录页面组件
 *
 * "宇宙边疆"概念背景：星野 + 星云薄雾 + 地平线 + 透视网格 + 缓升星尘，
 * 营造深邃宇宙中数字前哨站的科幻意境。
 */
const Login: React.FC = (props: any) => {
  const { dispatch, loginLoading } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // --- 静态星野（初始化一次，resize时重建） ---
    let stars: { x: number; y: number; r: number; alpha: number; twinkle: number; phase: number }[] = [];

    const initStars = () => {
      stars = [];
      const count = Math.floor(width * height / 2800);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.7, // 星星集中在上半部分
          r: Math.random() < 0.08 ? 1.2 + Math.random() * 0.6 : 0.3 + Math.random() * 0.6,
          alpha: 0.15 + Math.random() * 0.5,
          twinkle: 0.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };
    initStars();

    // --- 星云薄雾 ---
    const nebulae = [
      { baseX: 0.2, baseY: 0.25, radius: 300, phase: 0,   freq: 0.15, color: [35, 55, 130] },
      { baseX: 0.75, baseY: 0.3,  radius: 260, phase: 2.0, freq: 0.12, color: [55, 35, 110] },
      { baseX: 0.5,  baseY: 0.15, radius: 350, phase: 4.0, freq: 0.1,  color: [25, 60, 120] },
      { baseX: 0.85, baseY: 0.45, radius: 200, phase: 5.5, freq: 0.18, color: [30, 70, 100] },
    ];

    // --- 漂浮星尘 ---
    let dust: { x: number; y: number; speed: number; size: number; alpha: number; wobble: number; offset: number }[] = [];

    const initDust = () => {
      dust = Array.from({ length: 35 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.06 + Math.random() * 0.18,
        size: 0.3 + Math.random() * 1.0,
        alpha: 0.03 + Math.random() * 0.1,
        wobble: 0.3 + Math.random() * 1.0,
        offset: Math.random() * Math.PI * 2,
      }));
    };
    initDust();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
      initDust();
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const animate = () => {
      time += 0.001;
      const horizonY = height * 0.68;
      const vpx = width / 2;

      // --- 1. 深空背景 ---
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#040c1a');
      bgGrad.addColorStop(0.35, '#0a1a30');
      bgGrad.addColorStop(0.65, '#102440');
      bgGrad.addColorStop(1, '#0c1c34');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // --- 2. 星云薄雾 ---
      nebulae.forEach((n, i) => {
        const nx = n.baseX * width + Math.sin(time * n.freq + n.phase) * 40;
        const ny = n.baseY * height + Math.cos(time * n.freq * 0.7 + n.phase) * 25;
        const nr = n.radius + Math.sin(time * 0.8 + i) * 20;
        const [cr, cg, cb] = n.color;

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.16)`);
        grad.addColorStop(0.4, `rgba(${cr}, ${cg}, ${cb}, 0.06)`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // --- 3. 星野（微闪） ---
      stars.forEach(s => {
        const flicker = 0.7 + Math.sin(time * s.twinkle + s.phase) * 0.3;
        const a = s.alpha * flicker;
        ctx.fillStyle = `rgba(190, 210, 245, ${a})`;        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 4. 透视网格地面 ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, horizonY, width, height - horizonY);
      ctx.clip();

      const ga = 0.022 + Math.sin(time * 1.5) * 0.004;
      ctx.strokeStyle = `rgba(40, 80, 145, ${ga})`;
      ctx.lineWidth = 0.5;

      for (let i = -20; i <= 20; i++) {
        const bottomX = vpx + (i / 20) * width * 0.8;
        const topX = vpx + (i / 20) * 20;
        ctx.beginPath();
        ctx.moveTo(bottomX, height);
        ctx.lineTo(topX, horizonY);
        ctx.stroke();
      }

      for (let i = 1; i <= 16; i++) {
        const t = Math.pow(i / 16, 1.7);
        const y = horizonY + (height - horizonY) * t;
        const spread = t * width * 0.7;
        ctx.beginPath();
        ctx.moveTo(vpx - spread, y);
        ctx.lineTo(vpx + spread, y);
        ctx.stroke();
      }
      ctx.restore();

      // --- 5. 地平线 ---
      // 光晕
      const glowH = 100;
      const hGlow = ctx.createLinearGradient(0, horizonY - glowH, 0, horizonY + glowH);
      hGlow.addColorStop(0, 'rgba(35, 70, 140, 0)');
      hGlow.addColorStop(0.47, 'rgba(35, 70, 140, 0.02)');
      hGlow.addColorStop(0.5, 'rgba(45, 90, 170, 0.04)');
      hGlow.addColorStop(0.53, 'rgba(35, 70, 140, 0.02)');
      hGlow.addColorStop(1, 'rgba(35, 70, 140, 0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, horizonY - glowH, width, glowH * 2);

      // 发光线
      const la = 0.16 + Math.sin(time * 2) * 0.03;
      const lGrad = ctx.createLinearGradient(0, horizonY, width, horizonY);
      lGrad.addColorStop(0, 'rgba(60, 120, 200, 0)');
      lGrad.addColorStop(0.15, `rgba(60, 120, 200, ${la * 0.3})`);
      lGrad.addColorStop(0.5, `rgba(80, 145, 225, ${la})`);
      lGrad.addColorStop(0.85, `rgba(60, 120, 200, ${la * 0.3})`);
      lGrad.addColorStop(1, 'rgba(60, 120, 200, 0)');
      ctx.fillStyle = lGrad;
      ctx.fillRect(0, horizonY - 0.5, width, 1);

      // 线条柔光
      const slGrad = ctx.createLinearGradient(0, horizonY - 6, 0, horizonY + 6);
      slGrad.addColorStop(0, 'rgba(60, 120, 200, 0)');
      slGrad.addColorStop(0.5, `rgba(60, 120, 200, ${la * 0.12})`);
      slGrad.addColorStop(1, 'rgba(60, 120, 200, 0)');
      ctx.fillStyle = slGrad;
      ctx.fillRect(0, horizonY - 6, width, 12);

      // --- 6. 漂浮星尘 ---
      dust.forEach(p => {
        p.y -= p.speed;
        p.x += Math.sin(time * p.wobble + p.offset) * 0.12;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        const zone = p.y > horizonY ? 0.2 : 1;
        ctx.fillStyle = `rgba(140, 175, 225, ${p.alpha * zone})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = (values: { id: string; password: string }) => {
    const loginDTO: UserLoginRequest = {
      id: values.id,
      password: values.password
    };
    dispatch({ type: 'user/login', payload: loginDTO });
  };

  return (
    <ConfigProvider prefixCls={"air"}>
      <div className={styles.container}>
        <canvas ref={canvasRef} className={styles.canvas} />

        <div className={styles.card}>
          <div className={styles.header}>
            <img src="/icons/logo/default.svg" alt="AirMachine" className={styles.logo} />
            <div className={styles.tagline}>Enterprise AI Platform</div>
          </div>

          <div className={styles.formSection}>
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={values => { handleSubmit(values); return Promise.resolve(); }}
              onError={() => Promise.resolve()}
              autoComplete="off"
              className={styles.form}
            >
              <Form.Item name="id" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="用户名" size="large" />
              </Form.Item>

              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password placeholder="密码" size="large" />
              </Form.Item>

              <Form.Item className={styles.buttonItem}>
                <Button
                  className={styles.loginButton}
                  type="primary"
                  htmlType="submit"
                  loading={loginLoading}
                  block
                  size="large"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className={styles.footer}>
          &copy; {new Date().getFullYear()} Norlandsoft
        </div>
      </div>
    </ConfigProvider>
  );
}

export default connect(({ login, loading }) => ({
  login,
  loginLoading: loading.effects['login/login']
}))(Login);
