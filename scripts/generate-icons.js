/**
 * 构建时生成 icons-data.ts，将 SVG 内容内联为字符串，供 Icon 组件使用
 * Created by ChaiMingxu
 */
const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '../src/Icon/svg');
const splitterDir = path.join(__dirname, '../src/Splitter');
const outFile = path.join(__dirname, '../src/Icon/icons-data.ts');

const icons = {};

function addSvg(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const name = e.name.replace(/\.svg$/, '');
    if (e.isDirectory()) {
      addSvg(path.join(dir, e.name), prefix + e.name + '/');
    } else if (e.name.endsWith('.svg')) {
      const content = fs.readFileSync(path.join(dir, e.name), 'utf8');
      icons[name] = content.replace(/[\r\n]+/g, ' ').replace(/\\/g, '\\\\').replace(/`/g, '\\`');
    }
  }
}

addSvg(svgDir);
['icon_expand', 'icon_collapse'].forEach((n) => {
  const p = path.join(splitterDir, n + '.svg');
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    icons[n] = content.replace(/[\r\n]+/g, ' ').replace(/'/g, "\\'");
  }
});

const lines = [
  '/** 构建时自动生成，请勿手动编辑 */',
  'export const iconData: Record<string, string> = {',
  ...Object.entries(icons).map(([k, v]) => `  '${k}': \`${v}\`,`),
  '};',
  '',
  'export const iconNames = ' + JSON.stringify(Object.keys(icons)) + ';',
];

fs.writeFileSync(outFile, lines.join('\n'));
console.log('Generated icons-data.ts with', Object.keys(icons).length, 'icons');
