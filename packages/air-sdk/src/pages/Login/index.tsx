/**
 * 登录页面组件
 *
 * 深空星野背景 + 透视网格地面 + 地平线光晕。
 * 居中卡片布局，顶部居中 Logo，下方表单区域。
 * 使用 air-design 组件库，密码直接传入 model 层进行 SHA256 加密。
 *
 * 支持三种主题色：blue（蓝）、teal（青碧，默认）、amber（琥珀）。
 * 应用通过 getAuthConfig().theme 指定主题，影响背景渐变、星野和网格颜色。
 *
 * 功能特性：
 * - Transfer Token 自动登录：检测 URL 中的 transferToken 参数，通过 SSO 中转 Token 接口获取真实凭证后免登进入
 * - Canvas 星野动画：星云薄雾 + 闪烁星野 + 透视网格 + 地平线光晕 + 漂浮星尘
 *
 * @author ChaiMingXu, 2026/05/27
 */
import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from '../../models/user';
import { POST } from '../../utils/HttpRequest';
import { storageKey, getSdkConfig } from '../../config';
import './index.css';

/**
 * 主题颜色映射
 * 每个主题定义：星野颜色、网格颜色、背景渐变、星云薄雾颜色、地平线光晕颜色
 */
const themeColors = {
  blue: {
    star: [190, 210, 245],
    grid: [40, 80, 145],
    bgStops: ['#04080e', '#081828', '#0e2848', '#0a1e38'],
    nebulae: [
      { color: [30, 60, 120] },
      { color: [45, 80, 140] },
      { color: [25, 50, 130] },
    ],
    horizon: [40, 100, 180],
    dust: [130, 170, 230],
  },
  teal: {
    star: [180, 225, 220],
    grid: [30, 120, 110],
    bgStops: ['#040e0c', '#081e1a', '#0e2e28', '#0a201c'],
    nebulae: [
      { color: [20, 80, 75] },
      { color: [35, 90, 70] },
      { color: [15, 70, 80] },
    ],
    horizon: [30, 110, 100],
    dust: [120, 200, 190],
  },
  amber: {
    star: [255, 210, 160],
    grid: [150, 100, 50],
    bgStops: ['#0c0804', '#1a0f08', '#24160e', '#1c120a'],
    nebulae: [
      { color: [120, 70, 30] },
      { color: [140, 85, 35] },
      { color: [100, 60, 25] },
    ],
    horizon: [140, 90, 45],
    dust: [210, 170, 120],
  },
};

const Login: React.FC = () => {
  const loading = useUserStore((s) => s.loading);
  const login = useUserStore((s) => s.login);
  const setUser = useUserStore((s) => s.setUser);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 受控表单状态（替代 antd Form）
  const [formValues, setFormValues] = useState<{ id: string; password: string }>({ id: '', password: '' });
  const [errors, setErrors] = useState<{ id?: string; password?: string }>({});

  // Transfer Token 自动登录：检测 URL 中的 transferToken 参数，通过 SSO 中转 Token 接口获取真实凭证后免登进入
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transferToken = params.get('transferToken');
    if (!transferToken) return;

    POST('/api/v1/transfer/accept', { transferToken }).then((resp: any) => {
      if (resp?.success && resp.data?.token) {
        const { token, user } = resp.data;
        // 使用 storageKey() 生成应用级别的 storage key
        sessionStorage.setItem(storageKey('token'), token);
        if (user?.id) sessionStorage.setItem(storageKey('uid'), String(user.id));
        if (user?.loginId) sessionStorage.setItem(storageKey('user'), String(user.loginId));
        setUser(user);
        window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: true } }));
        window.location.href = '/';
      }
    });
  }, [setUser]);

  // 星野背景动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取当前主题颜色
    const theme = getSdkConfig().theme || 'teal';
    const colors = themeColors[theme] || themeColors.teal;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // 静态星野数据
    interface Star { x: number; y: number; r: number; alpha: number; twinkle: number; phase: number }
    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      const count = Math.floor(width * height / 2800);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
          r: Math.random() < 0.08 ? 1.2 + Math.random() * 0.6 : 0.3 + Math.random() * 0.6,
          alpha: 0.15 + Math.random() * 0.5,
          twinkle: 0.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };
    initStars();

    // 星云薄雾参数 — 从主题色读取
    const nebulae = [
      { baseX: 0.2, baseY: 0.25, radius: 300, phase: 0, freq: 0.15, color: colors.nebulae[0].color },
      { baseX: 0.75, baseY: 0.3, radius: 260, phase: 2.0, freq: 0.12, color: colors.nebulae[1].color },
      { baseX: 0.5, baseY: 0.15, radius: 350, phase: 4.0, freq: 0.1, color: colors.nebulae[2].color },
    ];

    // 漂浮星尘
    interface Dust { x: number; y: number; speed: number; size: number; alpha: number; wobble: number; offset: number }
    let dust: Dust[] = [];

    const initDust = () => {
      dust = Array.from({ length: 30 }, () => ({
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

      // 深空背景渐变 — 从主题色读取
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, colors.bgStops[0]);
      bgGrad.addColorStop(0.35, colors.bgStops[1]);
      bgGrad.addColorStop(0.65, colors.bgStops[2]);
      bgGrad.addColorStop(1, colors.bgStops[3]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 星云薄雾
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

      // 星野闪烁 — 从主题色读取星野颜色
      const [sr, sg, sb] = colors.star;
      stars.forEach(s => {
        const flicker = 0.7 + Math.sin(time * s.twinkle + s.phase) * 0.3;
        ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${s.alpha * flicker})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 透视网格地面 — 从主题色读取网格颜色
      const [gr, gg, gb] = colors.grid;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, horizonY, width, height - horizonY);
      ctx.clip();
      const ga = 0.022 + Math.sin(time * 1.5) * 0.004;
      ctx.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, ${ga})`;
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

      // 地平线光晕 — 从主题色读取
      const [hr, hg, hb] = colors.horizon;
      const glowH = 100;
      const hGlow = ctx.createLinearGradient(0, horizonY - glowH, 0, horizonY + glowH);
      hGlow.addColorStop(0, `rgba(${hr}, ${hg}, ${hb}, 0)`);
      hGlow.addColorStop(0.5, `rgba(${hr}, ${hg}, ${hb}, 0.04)`);
      hGlow.addColorStop(1, `rgba(${hr}, ${hg}, ${hb}, 0)`);
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, horizonY - glowH, width, glowH * 2);

      // 地平线发光线
      const la = 0.16 + Math.sin(time * 2) * 0.03;
      const lGrad = ctx.createLinearGradient(0, horizonY, width, horizonY);
      lGrad.addColorStop(0, `rgba(${hr + 10}, ${hg + 40}, ${hb + 35}, 0)`);
      lGrad.addColorStop(0.15, `rgba(${hr + 10}, ${hg + 40}, ${hb + 35}, ${la * 0.3})`);
      lGrad.addColorStop(0.5, `rgba(${hr + 20}, ${hg + 70}, ${hb + 65}, ${la})`);
      lGrad.addColorStop(0.85, `rgba(${hr + 10}, ${hg + 40}, ${hb + 35}, ${la * 0.3})`);
      lGrad.addColorStop(1, `rgba(${hr + 10}, ${hg + 40}, ${hb + 35}, 0)`);
      ctx.fillStyle = lGrad;
      ctx.fillRect(0, horizonY - 0.5, width, 1);

      // 漂浮星尘 — 从主题色读取
      const [dr, dg, db] = colors.dust;
      dust.forEach(p => {
        p.y -= p.speed;
        p.x += Math.sin(time * p.wobble + p.offset) * 0.12;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        const zone = p.y > horizonY ? 0.2 : 1;
        ctx.fillStyle = `rgba(${dr}, ${dg}, ${db}, ${p.alpha * zone})`;
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

  // 登录提交，密码直接传入 model 层进行 SHA256 加密
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 表单校验（替代 antd Form rules）
    const nextErrors: { id?: string; password?: string } = {};
    if (!formValues.id) nextErrors.id = '请输入用户名';
    if (!formValues.password) nextErrors.password = '请输入密码';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login({
      id: formValues.id,
      password: formValues.password,
    });
  };

  // 从配置中读取应用名称和副标题
  const appName = getSdkConfig().appName;
  const appTagline = getSdkConfig().appTagline || 'Intelligent Platform';

  return (
    <div className="air-login-page">
      <canvas ref={canvasRef} className="air-login-canvas" />

      <div className="air-login-card">
        <div className="air-login-header">
          <img src="/icons/logo/default.svg" alt={appName} className="air-login-logo" />
          <div className="air-login-tagline">{appTagline}</div>
        </div>

        <form onSubmit={handleLogin} className="air-login-form" autoComplete="off">
          <div className="air-login-form-item">
            <input
              type="text"
              placeholder="用户名"
              className="air-login-input"
              value={formValues.id}
              onChange={(e) => setFormValues((v) => ({ ...v, id: e.target.value }))}
            />
            {errors.id && <div className="air-login-form-error">{errors.id}</div>}
          </div>
          <div className="air-login-form-item">
            <input
              type="password"
              placeholder="密码"
              className="air-login-input"
              value={formValues.password}
              onChange={(e) => setFormValues((v) => ({ ...v, password: e.target.value }))}
            />
            {errors.password && <div className="air-login-form-error">{errors.password}</div>}
          </div>
          <div className="air-login-btn-item">
            <button type="submit" className="air-login-btn" disabled={loading}>
              {loading ? '登录中...' : '登 录'}
            </button>
          </div>
        </form>
      </div>

      <div className="air-login-footer">&copy; {new Date().getFullYear()} Norlandsoft</div>
    </div>
  );
};

export default Login;
