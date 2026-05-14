/**
 * 图标数据：构建时自动加载 svg 目录下所有 SVG 文件
 * 使用 Vite 的 import.meta.glob 动态导入，无需手动维护
 *
 * @author ChaiMingXu, on 2026/05/14
 */

const svgModules = import.meta.glob('./svg/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const iconData: Record<string, string> = {}

for (const [path, content] of Object.entries(svgModules)) {
  const name = path.replace(/^\.\/svg\/(.+)\.svg$/, '$1')
  iconData[name] = content
}

export {iconData}
