/**
 * 构建时将 @fontsource 字体文件复制到 public/fonts，供 base.less 的 @font-face 引用
 * 同时复制到 lib/fonts 供 npm 包使用
 * Created by ChaiMingxu
 */
const fs = require('fs');
const path = require('path');

const publicFonts = path.join(__dirname, '../public/fonts');
const libFonts = path.join(__dirname, '../lib/fonts');

[publicFonts, libFonts].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const copies = [
  ['@fontsource/space-grotesk/files', 'space-grotesk-latin-400-normal.woff2'],
  ['@fontsource/space-grotesk/files', 'space-grotesk-latin-500-normal.woff2'],
  ['@fontsource/space-grotesk/files', 'space-grotesk-latin-600-normal.woff2'],
  ['@fontsource/space-grotesk/files', 'space-grotesk-latin-700-normal.woff2'],
  ['@fontsource/jetbrains-mono/files', 'jetbrains-mono-latin-400-normal.woff2'],
  ['@fontsource/jetbrains-mono/files', 'jetbrains-mono-latin-500-normal.woff2'],
];

copies.forEach(([pkg, file]) => {
  const src = path.join(__dirname, '../node_modules', pkg, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicFonts, file));
    fs.copyFileSync(src, path.join(libFonts, file));
    console.log('Copied', file);
  } else {
    console.warn('Skip (not found):', src);
  }
});
