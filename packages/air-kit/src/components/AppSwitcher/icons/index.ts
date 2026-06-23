/**
 * 应用图标映射表
 *
 * key: 应用的appName（即 application.id），作为图标匹配的标识符
 * value: SVG 字符串（24x24 viewBox）
 *
 * 新增应用图标时，在此映射表中以appName为key添加对应条目即可
 *
 * Author: ChaiMingXu, 2026/05/27
 */
const icons: Record<string, string> = {
  'air-machine': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#2563EB"/>
    <path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="18" cy="16" r="2.5" fill="#93C5FD"/>
  </svg>`,

  'air-director': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#0D9488"/>
    <path d="M8 6l5 6-5 6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 6l5 6-5 6" stroke="#99F6E4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

export default icons;
