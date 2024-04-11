import {defineConfig} from "umi";

export default defineConfig({
  dva: {},
  routes: [
    {
      path: "/",
      component: "@/layouts/BasicLayout"
    }
  ],
  alias: {
    "aird": "../../aird"
  },
  outputPath: "dist",
});