/**
 * 图标工具函数
 *
 * 统一处理各类图标编号到URL的转换，包括头像和智能体图标。
 * 所有图标资源统一放置在 /icons/{category}/ 路径下。
 *
 * @author ChaiMingXu, 2026/05/28
 */

/** 图标类别配置：每个类别对应一个子目录、默认编号、文件扩展名和非默认编号的文件名前缀 */
const ICON_CONFIGS: Record<string, { dir: string; defaultId: string; ext: string; prefix: string }> = {
  avatar: { dir: 'avatar', defaultId: 'u01', ext: 'svg', prefix: '' },
  agent: { dir: 'agent', defaultId: 'main', ext: 'png', prefix: 'agent_' },
};

/**
 * 通用图标URL生成
 *
 * @param category 图标类别（avatar / agent）
 * @param id 图标编号，为空时使用类别默认值；以 / 开头时直接返回
 */
export function getIconUrl(category: string, id?: string): string {
  const config = ICON_CONFIGS[category];
  if (!config) return '';
  const resolvedId = id || config.defaultId;
  if (resolvedId.startsWith('/')) return resolvedId;
  const filename = !config.prefix || resolvedId === config.defaultId
    ? resolvedId
    : `${config.prefix}${resolvedId}`;
  return `/icons/${config.dir}/${filename}.${config.ext}`;
}

/** 将头像编号转换为完整URL（等价于 getIconUrl('avatar', id)） */
export const getAvatarUrl = (avatarId?: string): string => getIconUrl('avatar', avatarId);

/** 将智能体图标编号转换为完整URL（等价于 getIconUrl('agent', id)） */
export const getAgentIconUrl = (iconKey?: string): string => getIconUrl('agent', iconKey);

/** 智能体默认图标编号 */
export const AGENT_ICON_DEFAULT = 'main';

/** 智能体可选图标编号列表（01~24） */
export const AGENT_ICON_OPTIONS: string[] = Array.from(
  { length: 24 },
  (_, i) => String(i + 1).padStart(2, '0'),
);

/** 从完整头像路径中提取短编号 */
export function extractAvatarId(avatar?: string): string {
  if (!avatar) return ICON_CONFIGS.avatar.defaultId;
  const match = avatar.match(/\/icons\/avatar\/(.+)\.svg/);
  return match ? match[1] : avatar;
}
