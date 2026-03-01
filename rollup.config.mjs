import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import less from 'rollup-plugin-less';
/**
 * AirDesign 组件库 Rollup 构建配置
 * 输出 ESM + CJS，生成 .d.ts，Less 编译为 CSS
 * Icon 通过 manifest + basePath 加载 SVG（构建时 copy-icons.js 复制到 dist/icons）
 * Created by ChaiMingxu
 */

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.js', format: 'cjs', sourcemap: true, exports: 'named' },
      { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      less({ output: 'dist/index.css', insert: false }),
      typescript({ tsconfig: './tsconfig.json', declaration: true, declarationDir: 'dist', rootDir: 'src' }),
    ],
  },
];
