/**
 * Mock 数据内存存储
 *
 * 提供简单的内存 CRUD 操作，用于 mock 接口返回数据。
 * 支持 ID 自增、列表过滤、分页等常用功能。
 *
 * @author ChaiMingXu, on 2026/05/14
 */

/** 通用内存存储 */
const stores: Record<string, { data: any[]; nextId: number }> = {};

/** 初始化一个存储 */
export function initStore(name: string, initialData: any[]) {
  if (!stores[name]) {
    let maxId = 0;
    initialData.forEach((item) => {
      if (item.id && !isNaN(Number(item.id))) {
        maxId = Math.max(maxId, Number(item.id));
      }
    });
    stores[name] = {data: [...initialData], nextId: maxId + 1};
  }
  return stores[name];
}

/** 获取存储 */
export function getStore(name: string) {
  return stores[name] || initStore(name, []);
}

/** 查询全部 */
export function listAll(name: string): any[] {
  return getStore(name).data;
}

/** 按 ID 查找 */
export function findById(name: string, id: string): any | undefined {
  return getStore(name).data.find((item) => item.id === id);
}

/** 新增记录，自动生成 ID */
export function create(name: string, record: any): any {
  const store = getStore(name);
  const id = String(store.nextId++);
  const newRecord = {...record, id};
  store.data.push(newRecord);
  return newRecord;
}

/** 更新记录 */
export function update(name: string, id: string, updates: any): any | undefined {
  const store = getStore(name);
  const index = store.data.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  store.data[index] = {...store.data[index], ...updates};
  return store.data[index];
}

/** 删除记录 */
export function remove(name: string, id: string): boolean {
  const store = getStore(name);
  const index = store.data.findIndex((item) => item.id === id);
  if (index === -1) return false;
  store.data.splice(index, 1);
  return true;
}

/** 按条件过滤 */
export function filter(name: string, predicate: (item: any) => boolean): any[] {
  return getStore(name).data.filter(predicate);
}

/** 生成简单的成功响应 */
export function ok(data?: any, message?: string) {
  return {success: true, data, message};
}

/** 生成简单的失败响应 */
export function fail(message: string) {
  return {success: false, message};
}

/** 生成分页响应 */
export function paginate(list: any[], params: any) {
  const page = Number(params?.page || params?.current || 1);
  const pageSize = Number(params?.pageSize || params?.size || 20);
  const start = (page - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    pagination: {page, pageSize, total: list.length},
  };
}
