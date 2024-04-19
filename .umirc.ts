import {defineConfig} from "umi";
const { resolve } = require('path');

export default defineConfig({
  dva: {},
  routes: [
    {
      path: "/",
      component: "@/layouts/BasicLayout"
    }
  ],
  alias: {
    'aird': resolve(__dirname, 'lib'),
  },
  outputPath: "dist",
});