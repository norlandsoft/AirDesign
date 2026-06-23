/**
 * 字符串工具类
 *
 * 提供随机字符串生成、UUID 生成、短 ID 生成、JSON 数组比较等通用方法。
 *
 * @author ChaiMingXu, 2026/05/28
 */

/** 生成指定长度的随机字符串（含大小写字母和数字） */
const randomString = (len: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let r = '';
  const charactersLength = characters.length;
  for (let i = 0; i < len; i++) {
    r += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return r;
}

/** 生成 UUID v4 格式的随机标识符 */
function UUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
}

/** 基于 UUID 生成 8 位短 ID */
function shortId() {
  const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortBuffer = '';
  const uuid = UUID().replace(/-/g, '');

  for (let i = 0; i < 8; i++) {
    const str = uuid.substring(i * 4, i * 4 + 4);
    const x = parseInt(str, 16);
    shortBuffer += CHARS[x % 0x3E];
  }

  return shortBuffer;
}

/** 比较两个 JSON 数组是否相等（排序后逐元素比较） */
function equalJsonArray(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = JSON.stringify(arr1.slice().sort());
  const sortedArr2 = JSON.stringify(arr2.slice().sort());

  return sortedArr1 === sortedArr2;
}

export {randomString, UUID, shortId, equalJsonArray};
