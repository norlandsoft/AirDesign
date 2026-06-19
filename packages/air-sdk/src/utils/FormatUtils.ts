/**
 * 格式化工具类
 *
 * 提供常用的格式化方法，包括文件大小格式化等。
 *
 * @author ChaiMingXu, 2026/05/28
 */

/**
 * 格式化文件大小
 * 将字节数转换为可读的文件大小格式（如：1.5 KB、2.3 MB等）
 *
 * @param bytes 文件大小（字节数）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
