/**
 * 智能体图标工具函数
 *
 * 将 emoji 字段中存储的图标序号（"main" / "01"~"24"）
 * 转换为 /icons/agent/ 下的图片路径。
 * emoji 字段存储规则：
 *   - main 智能体：值为 "main"，对应 main.png
 *   - 其它智能体：值为 "01"~"24"，对应 agent_01.png ~ agent_24.png
 *
 * Created by ChaiMingXu, on 2026-04-12
 */

/** main 智能体的默认图标值 */
export const AGENT_ICON_DEFAULT = 'main';

/** 可选图标序号列表（供非 main 智能体选择，共 24 个） */
export const AGENT_ICON_OPTIONS: string[] = Array.from(
  { length: 24 },
  (_, i) => String(i + 1).padStart(2, '0'),
);

/**
 * 将图标序号转换为图片路径
 *
 * @param iconKey 图标序号，如 "main"、"01"~"24"；为空时回退到 main.png
 * @returns 图片路径，如 "/icons/agent/main.png"、"/icons/agent/agent_01.png"
 */
export function getAgentIconUrl(iconKey?: string): string {
  if (!iconKey || iconKey === 'main') return '/icons/agent/main.png';
  return `/icons/agent/agent_${iconKey}.png`;
}
