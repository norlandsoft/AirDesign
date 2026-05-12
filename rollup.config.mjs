import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import less from 'rollup-plugin-less';

export default [
  {
    input: 'src/components/AirDesign/index.ts',
    output: [
      { file: 'lib/index.js', format: 'cjs', sourcemap: true, exports: 'named' },
      { file: 'lib/index.mjs', format: 'esm', sourcemap: true },
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      less({ output: 'lib/index.css', insert: false }),
      typescript({ tsconfig: './tsconfig.json', declaration: true, declarationDir: 'lib', rootDir: 'src/components/AirDesign' }),
    ],
  },
];
