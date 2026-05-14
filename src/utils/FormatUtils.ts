/**
 * 格式化工具类
 *
 * 提供常用的格式化方法，包括时间格式化、文件大小格式化等
 *
 * Created by ChaiMingXu, on 2026/1/13
 */

/**
 * 格式化日期时间
 * 将日期时间字符串格式化为相对时间（如：刚刚、5分钟前、2小时前等）
 * 超过30天则显示具体日期
 *
 * @param dateTime 日期时间字符串（ISO格式）
 * @returns 格式化后的时间字符串
 */
export function formatDateTime(dateTime: string | undefined): string {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }
  // 小于1天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  // 小于30天
  if (diff < 2592000000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }

  // 超过30天显示日期
  return date.toLocaleDateString('zh-CN');
}

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
