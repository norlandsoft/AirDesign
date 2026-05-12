import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/', component: '@/pages/index' },
        { path: '/table', component: '@/pages/table-demo' },
        { path: '/tree', component: '@/pages/tree-demo' },
        { path: '/form', component: '@/pages/form-demo' },
        { path: '/layout', component: '@/pages/layout-demo' },
      ],
    },
  ],
  npmClient: 'npm',
  jsMinifier: 'terser',
  lessLoader: { javascriptEnabled: true },
  hash: true,
});
