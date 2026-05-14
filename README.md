# AirDirector 前端项目

测试管理平台前端应用，基于 UmiJS Max + React + TypeScript + Ant Design 开发。

## 技术栈

- **框架**: UmiJS Max 4.x
- **UI组件库**: Ant Design 5.x
- **开发语言**: TypeScript
- **构建工具**: UmiJS

## 项目结构

```
frontend/
├── src/
│   ├── pages/          # 页面组件
│   │   ├── Home/       # 首页
│   │   └── User/       # 用户管理
│   ├── layouts/        # 布局组件
│   ├── app.tsx         # 应用配置
│   └── typings.d.ts    # 类型定义
├── .umirc.ts          # UmiJS配置文件
├── tsconfig.json       # TypeScript配置
└── package.json        # 项目依赖
```

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:8000

### 构建生产版本

```bash
npm run build
```

## 功能模块

- 首页：展示平台概览信息
- 用户管理：用户的增删改查功能

## 配置说明

- 代理配置：开发环境已配置代理到后端服务 `http://localhost:8080`
- 路由配置：在 `.umirc.ts` 中配置
- 主题配置：Ant Design 主题在 `.umirc.ts` 中配置

