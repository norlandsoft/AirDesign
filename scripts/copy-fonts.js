/**
 * 构建时将 @fontsource 字体文件复制到 dist/fonts，供 base.less 的 @font-face 引用
 * Created by ChaiMingxu
 */
const fs = require('fs');
const path = require('path');

const distFonts = path.join(__dirname, '../dist/fonts');
if (!fs.existsSync(distFonts)) {
  fs.mkdirSync(distFonts, { recursive: true });
}

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
  const dest = path.join(distFonts, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied', file);
  } else {
    console.warn('Skip (not found):', src);
  }
});
