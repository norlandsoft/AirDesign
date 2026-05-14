import {defineConfig} from "umi";
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import path from 'path';

/**
 * UmiJS配置文件
 * 
 * 配置UmiJS Max框架，集成Ant Design和TypeScript支持
 * 
 * @author ChaiMingXu, on 2025/12/13
 */
export default defineConfig({
  dva: {},
  mfsu: false,
  title: 'AirMachine',
  links: [
    {id: 'theme', rel: 'stylesheet', type: 'text/css'},
    {rel: 'shortcut icon', href: '/favicon.svg'}
  ],
  alias: {
    "air-design": path.resolve(__dirname, "src/components/AirDesign"),
  },
  // 路由配置
  routes: [
    {
      path: "/",
      component: "@/layouts/SecurityLayout"
    },
    {
      path: "*",
      component: "@/layouts/Error404"
    }
  ],
  
  // 代理配置（开发环境）
  proxy: {
    "/ws": {
      target: "http://localhost:8000",
      changeOrigin: true,
      ws: true,
    },
    /** 平台服务：REST API，统一以 /rest 开头（已迁移到平台服务本地处理） */
    "/rest": {
      target: "http://localhost:8000",
      changeOrigin: true,
      pathRewrite: {"^": ""},
      'onProxyRes': function (proxyRes, req, res) {
        proxyRes.headers['Content-Encoding'] = 'chunked';
      }
    },
    /** admin 接口：已迁移到平台服务本地处理 */
    "/admin": {
      target: "http://localhost:8000",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
    /** 特殊请求：初始化 admin 密码，已迁移到平台服务本地处理 */
    "/initialAdminPassword": {
      target: "http://localhost:8000",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
    /** /api 通用转发：网关根据 /api/{service_name} 动态路由到对应后端服务 */
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
      // SSE 流式响应支持：与 /rest 代理配置一致，防止 http-proxy-middleware 缓冲 SSE 响应
      'onProxyRes': function (proxyRes, req, res) {
        proxyRes.headers['Content-Encoding'] = 'chunked';
      }
    }
  },
  
  // 代码分割
  codeSplitting: {
    jsStrategy: 'granularChunks',
  },
  
  // 构建配置
  hash: true,
  esbuildMinifyIIFE: true,
  base: "/",
  extraBabelIncludes: [
    'react-monaco-editor',
  ],
  chainWebpack: config => {
    config.plugin('monaco-editor')
      .use(MonacoEditorWebpackPlugin, [{
        languages: [
          'java',
          'xml',
          'json',
          'yaml',
          'html',
          'shell',
          'python',
          'markdown'
        ]
      }]);

    // 配置SVG文件作为原始字符串导入（用于Icon组件）
    // 从默认svg规则中排除Icon/svg目录
    config.module.rule('svg').exclude.add(path.resolve(__dirname, 'src/components/AirDesign/Icon/svg')).end();
    // 新增规则：Icon/svg目录下的SVG作为原始字符串导入
    config.module
      .rule('svg-raw')
      .test(/\.svg$/)
      .include.add(path.resolve(__dirname, 'src/components/AirDesign/Icon/svg')).end()
      .type('asset/source');
  }
});

