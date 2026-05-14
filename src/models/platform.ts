import {GET, POST} from '@/utils/HttpRequest';
import {
  DictItemCreateRequest,
  DictItemQueryRequest,
  DictItemResponse,
  DictItemUpdateRequest,
  DictTypeCreateRequest,
  DictTypeQueryRequest,
  DictTypeResponse,
  DictTypeUpdateRequest
} from '@/types/dict';
import {
  CustomFieldCreateRequest,
  CustomFieldQueryRequest,
  CustomFieldResponse,
  CustomFieldUpdateRequest
} from '@/types/customField';
import {
  DatabaseConfigResponse,
  DatabaseConfigSaveRequest,
  GiteaConfigResponse,
  GiteaConfigSaveRequest,
  LibreOfficeConfigResponse,
  LibreOfficeConfigSaveRequest,
  RedisConfigResponse,
  RedisConfigSaveRequest,
  StorageConfigResponse,
  StorageConfigSaveRequest,
  CrawlConfigResponse,
  CrawlConfigSaveRequest,
  SearXNGConfigResponse,
  SearXNGConfigSaveRequest,
  MinerUConfigResponse,
  MinerUConfigSaveRequest
} from '@/types/paas';

/**
 * 平台Model
 *
 * 管理平台相关的状态和业务逻辑，包括数据字典的增删改查等
 *
 * Created by ChaiMingXu, on 2026/1/8
 */
export default {
  namespace: 'platform',

  state: {
    dictTypeList: [] as DictTypeResponse[],
    dictItemList: [] as DictItemResponse[],
    /** 所有 PaaS 运行时配置（配置中心面板使用） */
    allConfigs: [] as any[],
    loading: false,
  },

  effects: {
    /**
     * 获取字典类型列表
     */
    * fetchDictTypeList({payload, callback}: { payload?: DictTypeQueryRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictType/list', payload || {});

        if (resp?.success) {
          const dictTypeList: DictTypeResponse[] = resp.data || [];
          yield put({
            type: 'setDictTypeList',
            payload: dictTypeList,
          });

          if (callback) {
            callback({success: true, data: dictTypeList});
          }
          return {success: true, data: dictTypeList};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '获取字典类型列表失败'});
          }
          return {success: false, message: resp?.message || '获取字典类型列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取字典类型列表失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 创建字典类型
     */
    * createDictType({payload, callback}: { payload: DictTypeCreateRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictType/create', payload);

        if (resp?.success) {
          // 刷新字典类型列表
          yield put({
            type: 'fetchDictTypeList',
            payload: {},
          });

          if (callback) {
            callback({success: true, data: resp.data});
          }
          return {success: true, data: resp.data};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '创建字典类型失败'});
          }
          return {success: false, message: resp?.message || '创建字典类型失败'};
        }
      } catch (err: any) {
        const message = err?.message || '创建字典类型失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 更新字典类型
     */
    * updateDictType({payload, callback}: { payload: DictTypeUpdateRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictType/update', payload);

        if (resp?.success) {
          // 刷新字典类型列表
          yield put({
            type: 'fetchDictTypeList',
            payload: {},
          });

          if (callback) {
            callback({success: true, data: resp.data});
          }
          return {success: true, data: resp.data};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '更新字典类型失败'});
          }
          return {success: false, message: resp?.message || '更新字典类型失败'};
        }
      } catch (err: any) {
        const message = err?.message || '更新字典类型失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 删除字典类型
     */
    * deleteDictType({payload, callback}: { payload: DictTypeQueryRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictType/delete', payload);

        if (resp?.success) {
          // 刷新字典类型列表
          yield put({
            type: 'fetchDictTypeList',
            payload: {},
          });

          if (callback) {
            callback({success: true});
          }
          return {success: true};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '删除字典类型失败'});
          }
          return {success: false, message: resp?.message || '删除字典类型失败'};
        }
      } catch (err: any) {
        const message = err?.message || '删除字典类型失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 获取字典项列表
     */
    * fetchDictItemList({payload, callback}: { payload?: DictItemQueryRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictItem/list', payload || {});

        if (resp?.success) {
          const dictItemList: DictItemResponse[] = resp.data || [];
          yield put({
            type: 'setDictItemList',
            payload: dictItemList,
          });

          if (callback) {
            callback({success: true, data: dictItemList});
          }
          return {success: true, data: dictItemList};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '获取字典项列表失败'});
          }
          return {success: false, message: resp?.message || '获取字典项列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取字典项列表失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 根据字典类型ID获取字典项列表
     */
    * fetchDictItemListByTypeId({payload, callback}: {
      payload: DictItemQueryRequest,
      callback?: (resp: any) => void
    }, {call, put}) {
      try {
        const resp = yield call(POST, '/rest/platform/dictItem/listByTypeId', payload);

        if (resp?.success) {
          const dictItemList: DictItemResponse[] = resp.data || [];
          yield put({
            type: 'setDictItemList',
            payload: dictItemList,
          });

          if (callback) {
            callback({success: true, data: dictItemList});
          }
          return {success: true, data: dictItemList};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '获取字典项列表失败'});
          }
          return {success: false, message: resp?.message || '获取字典项列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取字典项列表失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 创建字典项
     */
    * createDictItem({payload, callback}: { payload: DictItemCreateRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictItem/create', payload);

        if (resp?.success) {
          // 刷新字典项列表
          yield put({
            type: 'fetchDictItemList',
            payload: {},
          });

          if (callback) {
            callback({success: true, data: resp.data});
          }
          return {success: true, data: resp.data};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '创建字典项失败'});
          }
          return {success: false, message: resp?.message || '创建字典项失败'};
        }
      } catch (err: any) {
        const message = err?.message || '创建字典项失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 更新字典项
     */
    * updateDictItem({payload, callback}: { payload: DictItemUpdateRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictItem/update', payload);

        if (resp?.success) {
          // 刷新字典项列表
          yield put({
            type: 'fetchDictItemList',
            payload: {},
          });

          if (callback) {
            callback({success: true, data: resp.data});
          }
          return {success: true, data: resp.data};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '更新字典项失败'});
          }
          return {success: false, message: resp?.message || '更新字典项失败'};
        }
      } catch (err: any) {
        const message = err?.message || '更新字典项失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 删除字典项
     */
    * deleteDictItem({payload, callback}: { payload: DictItemQueryRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      try {
        const resp = yield call(POST, '/rest/platform/dictItem/delete', payload);

        if (resp?.success) {
          // 刷新字典项列表
          yield put({
            type: 'fetchDictItemList',
            payload: {},
          });

          if (callback) {
            callback({success: true});
          }
          return {success: true};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '删除字典项失败'});
          }
          return {success: false, message: resp?.message || '删除字典项失败'};
        }
      } catch (err: any) {
        const message = err?.message || '删除字典项失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 获取自定义字段列表
     */
    * fetchCustomFieldList({payload, callback}: {
      payload?: CustomFieldQueryRequest,
      callback?: (resp: any) => void
    }, {call, put}) {
      try {
        const resp = yield call(POST, '/rest/platform/customField/list', payload || {});

        if (resp?.success) {
          const fieldList: CustomFieldResponse[] = resp.data || [];

          if (callback) {
            callback({success: true, data: fieldList});
          }
          return {success: true, data: fieldList};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '获取自定义字段列表失败'});
          }
          return {success: false, message: resp?.message || '获取自定义字段列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取自定义字段列表失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 创建自定义字段
     */
    * createCustomField({payload, callback}: {
      payload: CustomFieldCreateRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/rest/platform/customField/create', payload);

        if (resp?.success) {
          if (callback) {
            callback({success: true, data: resp.data});
          }
          return {success: true, data: resp.data};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '创建自定义字段失败'});
          }
          return {success: false, message: resp?.message || '创建自定义字段失败'};
        }
      } catch (err: any) {
        const message = err?.message || '创建自定义字段失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 更新自定义字段
     */
    * updateCustomField({payload, callback}: {
      payload: CustomFieldUpdateRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/rest/platform/customField/update', payload);

        if (resp?.success) {
          if (callback) {
            callback({success: true, data: resp.data});
          }
          return {success: true, data: resp.data};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '更新自定义字段失败'});
          }
          return {success: false, message: resp?.message || '更新自定义字段失败'};
        }
      } catch (err: any) {
        const message = err?.message || '更新自定义字段失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 删除自定义字段
     */
    * deleteCustomField({payload, callback}: {
      payload: CustomFieldQueryRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/rest/platform/customField/delete', payload);

        if (resp?.success) {
          if (callback) {
            callback({success: true});
          }
          return {success: true};
        } else {
          if (callback) {
            callback({success: false, message: resp?.message || '删除自定义字段失败'});
          }
          return {success: false, message: resp?.message || '删除自定义字段失败'};
        }
      } catch (err: any) {
        const message = err?.message || '删除自定义字段失败';
        if (callback) {
          callback({success: false, message});
        }
        return {success: false, message};
      }
    },

    /**
     * 获取数据库配置（POST /admin/paas/database/get）
     */
    * fetchDatabaseConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/database/get', {});
        if (resp?.success) {
          const data: DatabaseConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          const message = resp?.message || '获取数据库配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '获取数据库配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存数据库配置（POST /admin/paas/database/save）
     */
    * saveDatabaseConfig({payload, callback}: {
      payload: DatabaseConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/database/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存数据库配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存数据库配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取 Redis 配置（POST /admin/paas/redis/get）
     */
    * fetchRedisConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/redis/get', {});
        if (resp?.success) {
          const data: RedisConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          const message = resp?.message || '获取 Redis 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 Redis 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 Redis 配置（POST /admin/paas/redis/save）
     */
    * saveRedisConfig({payload, callback}: {
      payload: RedisConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/redis/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存 Redis 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存 Redis 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取 LibreOffice 配置（POST /admin/paas/libreoffice/get）
     */
    * fetchLibreOfficeConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/libreoffice/get', {});
        if (resp?.success) {
          const data: LibreOfficeConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          if (callback) callback({success: false, message: resp?.message});
          return {success: false, message: resp?.message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 LibreOffice 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 LibreOffice 配置（POST /admin/paas/libreoffice/save）
     */
    * saveLibreOfficeConfig({payload, callback}: {
      payload: LibreOfficeConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/libreoffice/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存 LibreOffice 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存 LibreOffice 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取 MinerU 配置（POST /admin/paas/mineru/get）
     */
    * fetchMinerUConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/mineru/get', {});
        if (resp?.success) {
          const data: MinerUConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          if (callback) callback({success: false, message: resp?.message});
          return {success: false, message: resp?.message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 MinerU 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 MinerU 配置（POST /admin/paas/mineru/save）
     */
    * saveMinerUConfig({payload, callback}: {
      payload: MinerUConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/mineru/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存 MinerU 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存 MinerU 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取 SearXNG 配置（POST /admin/paas/searxng/get）
     */
    * fetchSearXNGConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/searxng/get', {});
        if (resp?.success) {
          const data: SearXNGConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          if (callback) callback({success: false, message: resp?.message});
          return {success: false, message: resp?.message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 SearXNG 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 SearXNG 配置（POST /admin/paas/searxng/save）
     */
    * saveSearXNGConfig({payload, callback}: {
      payload: SearXNGConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/searxng/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存 SearXNG 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存 SearXNG 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取 Gitea 配置（POST /admin/paas/gitea/get）
     */
    * fetchGiteaConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/gitea/get', {});
        if (resp?.success) {
          const data: GiteaConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          const message = resp?.message || '获取 Gitea 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 Gitea 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 Gitea 配置（POST /admin/paas/gitea/save）
     */
    * saveGiteaConfig({payload, callback}: {
      payload: GiteaConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/gitea/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存 Gitea 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存 Gitea 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取 Storage 配置（POST /admin/paas/storage/get）
     */
    * fetchStorageConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/storage/get', {});
        if (resp?.success) {
          const data: StorageConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          const message = resp?.message || '获取 Storage 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 Storage 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 Storage 配置（POST /admin/paas/storage/save）
     */
    * saveStorageConfig({payload, callback}: {
      payload: StorageConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/storage/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存 Storage 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存 Storage 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== 网页爬虫配置 ====================

    /**
     * 获取网页爬虫配置（POST /admin/paas/webcrawler/get）
     */
    * fetchCrawlConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/webcrawler/get', {});
        if (resp?.success) {
          const data: CrawlConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          if (callback) callback({success: false, message: resp?.message});
          return {success: false, message: resp?.message};
        }
      } catch (err: any) {
        const message = err?.message || '获取爬虫配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存网页爬虫配置（POST /admin/paas/webcrawler/save）
     */
    * saveCrawlConfig({payload, callback}: {
      payload: CrawlConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/webcrawler/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存爬虫配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存爬虫配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== 配置中心相关 ====================

    /**
     * 获取所有 PaaS 运行时配置（配置中心面板使用）
     */
    * fetchAllConfigs({callback}: { callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/admin/paas/config/all', {});
        if (resp?.success) {
          const allConfigs = resp.data || [];
          yield put({type: 'setAllConfigs', payload: allConfigs});
          if (callback) callback({success: true, data: allConfigs});
          return {success: true, data: allConfigs};
        } else {
          if (callback) callback({success: false, message: resp?.message || '获取配置列表失败'});
          return {success: false, message: resp?.message || '获取配置列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取配置列表失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

  },

  reducers: {
    /**
     * 设置字典类型列表
     */
    setDictTypeList(state: any, {payload}: { payload: DictTypeResponse[] }) {
      return {
        ...state,
        dictTypeList: payload || [],
      };
    },

    /**
     * 设置字典项列表
     */
    setDictItemList(state: any, {payload}: { payload: DictItemResponse[] }) {
      return {
        ...state,
        dictItemList: payload || [],
      };
    },

    /**
     * 设置加载状态
     */
    setLoading(state: any, {payload}: { payload: boolean }) {
      return {
        ...state,
        loading: payload,
      };
    },

    /**
     * 设置所有 PaaS 运行时配置
     */
    setAllConfigs(state: any, {payload}: { payload: any[] }) {
      return {
        ...state,
        allConfigs: payload || [],
      };
    },
  },
};
