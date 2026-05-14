import {POST} from '@/utils/HttpRequest';

/**
 * 技能管理 Model（全局）
 *
 * 管理技能列表的增删改查，与 /api/openclaw/skills 和 /api/openclaw/skill-groups 协作。
 * 从页面级 model 提升为全局 model，供多个页面（技能页面、备份面板等）共用。
 *
 * Created by ChaiMingXu, on 2026/5/1
 */
/**
 * 将技能列表与技能组构建为树形结构
 * 有技能组时：将技能按 groupId 归入对应组，未分组技能放根级；无技能组时：所有技能作为根级 item
 * 为拖放支持，每个节点 data 中附带 parent（父 key，根级为 undefined）
 */
function buildSkillTree(skillList: any[], groupTree: any[]): any[] {
  const skills = skillList || [];
  const ungrouped = skills.filter((s) => !s.groupId || s.groupId.trim() === '');
  const toItem = (s: any, parent?: string) => ({
    key: s.id,
    label: s.name || '未命名',
    type: 'item',
    data: {...s, parent},
  });

  if (groupTree && groupTree.length > 0) {
    const addSkillsToGroup = (nodes: any[], parent?: string): any[] =>
        nodes.map((n) => {
          const copy = {...n, data: {...(n.data || {}), parent}};
          if (n.type === 'group' && n.key) {
            const groupSkills = skills.filter((s) => s.groupId === n.key);
            const childGroups = n.children ? addSkillsToGroup(n.children, n.key) : [];
            const skillItems = groupSkills.map((s) => toItem(s, n.key));
            copy.children = [...childGroups, ...skillItems];
          } else if (n.children) {
            copy.children = addSkillsToGroup(n.children, n.key);
          }
          return copy;
        });
    const rootWithSkills = addSkillsToGroup(groupTree, undefined);
    const rootItems = ungrouped.map((s) => toItem(s, undefined));
    return [...rootWithSkills, ...rootItems];
  }
  return skills.map((s) => toItem(s, undefined));
}

/**
 * 将后端返回的分组列表转换为前端树组件需要的格式
 * 后端: {id, name, parentId, sortOrder, children: [...]}
 * 前端: {key, label, type:'group', data:{...}, children: [...]}
 */
function convertGroupTree(groups: any[]): any[] {
  if (!groups) return [];
  return groups.map((g) => ({
    key: g.id,
    label: g.name || '未分组',
    type: 'group',
    data: {
      id: g.id,
      name: g.name,
      parentId: g.parentId,
      sortOrder: g.sortOrder,
    },
    children: convertGroupTree(g.children),
  }));
}

export default {
  namespace: 'skill',

  state: {
    skillList: [] as any[],
    skillGroupTree: [] as any[],
    loading: false,
  },

  effects: {
    * fetchSkillList({payload, callback}: { payload?: any; callback?: (r: any) => void }, {call, put}) {
      yield put({type: 'setLoading', payload: true});
      const resp = yield call(POST, '/api/openclaw/skills/list', payload || {});
      if (resp?.success) {
        yield put({type: 'setSkillList', payload: resp.data || []});
      }
      yield put({type: 'setLoading', payload: false});
      if (callback) callback(resp);
    },

    * fetchSkillGroupTree({payload, callback}: { payload?: any; callback?: (r: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/skill-groups/list', payload || {});
        if (resp?.success && Array.isArray(resp?.data)) {
          const tree = convertGroupTree(resp.data);
          yield put({type: 'setSkillGroupTree', payload: tree});
        }
        if (callback) callback(resp);
      } catch {
        if (callback) callback({success: false});
      }
    },

    * createSkillGroup({payload, callback}: { payload: any; callback?: (r: any) => void }, {call, put}) {
      const resp = yield call(POST, '/api/openclaw/skill-groups/create', payload);
      if (resp?.success) {
        yield put({type: 'fetchSkillGroupTree', payload: {}});
      }
      if (callback) callback(resp);
    },

    * updateSkillGroup({payload, callback}: { payload: any; callback?: (r: any) => void }, {call, put}) {
      const resp = yield call(POST, '/api/openclaw/skill-groups/update', payload);
      if (resp?.success) {
        yield put({type: 'fetchSkillGroupTree', payload: {}});
      }
      if (callback) callback(resp);
    },

    * deleteSkillGroup({payload, callback}: { payload: { id: string }; callback?: (r: any) => void }, {call, put}) {
      const resp = yield call(POST, '/api/openclaw/skill-groups/delete', {id: payload.id});
      if (resp?.success) {
        yield put({type: 'fetchSkillGroupTree', payload: {}});
      }
      if (callback) callback(resp);
    },

    * createSkill({payload, callback}: { payload: any; callback?: (r: any) => void }, {call, put}) {
      const resp = yield call(POST, '/api/openclaw/skills/create', payload);
      if (resp?.success) {
        yield put({type: 'fetchSkillList', payload: {}});
      }
      if (callback) callback(resp);
    },

    * fetchSkillInfo({payload, callback}: { payload: { id: string }; callback?: (r: any) => void }, {call}) {
      const resp = yield call(POST, '/api/openclaw/skills/get', payload);
      if (callback) callback(resp);
    },

    * updateSkill({payload, callback}: { payload: any; callback?: (r: any) => void }, {call, put}) {
      const resp = yield call(POST, '/api/openclaw/skills/update', payload);
      if (resp?.success) {
        yield put({type: 'fetchSkillList', payload: {}});
      }
      if (callback) callback(resp);
    },

    * deleteSkill(
        {payload, callback}: { payload: { id: string }; callback?: (r: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/api/openclaw/skills/delete', {id: payload.id});
      if (resp?.success) {
        yield put({type: 'fetchSkillList', payload: {}});
      }
      if (callback) callback(resp);
    },

    * syncSkillsToOpenClaw({callback}: { callback?: (r: any) => void }, {call}) {
      const resp = yield call(POST, '/api/openclaw/skills/sync', {});
      if (callback) callback(resp);
    },

    // ==================== 技能附件文件 ====================

    * fetchSkillFiles({payload, callback}: { payload: { skillId: string }; callback?: (r: any) => void }, {call}) {
      const resp = yield call(POST, '/api/openclaw/skill-files/list', payload);
      if (callback) callback(resp);
    },

    * fetchSkillFile({payload, callback}: { payload: { id: string }; callback?: (r: any) => void }, {call}) {
      const resp = yield call(POST, '/api/openclaw/skill-files/get', payload);
      if (callback) callback(resp);
    },

    * createSkillFolder({payload, callback}: { payload: { skillId: string; path: string; name: string }; callback?: (r: any) => void }, {call}) {
      const resp = yield call(POST, '/api/openclaw/skill-files/create-folder', payload);
      if (callback) callback(resp);
    },

    * deleteSkillFile({payload, callback}: { payload: { id: string; skillId: string }; callback?: (r: any) => void }, {call}) {
      const resp = yield call(POST, '/api/openclaw/skill-files/delete', payload);
      if (callback) callback(resp);
    },

    /**
     * 获取所有技能的附件文件（含 content），用于数据备份导出
     */
    * fetchAllSkillFilesWithContent({callback}: { callback?: (r: any) => void }, {call}) {
      const resp = yield call(POST, '/api/openclaw/skill-files/all-with-content', {});
      if (callback) callback(resp);
    },
  },

  reducers: {
    setSkillList(state: any, {payload}: any) {
      return {...state, skillList: payload ?? []};
    },
    setSkillGroupTree(state: any, {payload}: any) {
      return {...state, skillGroupTree: payload ?? []};
    },
    setLoading(state: any, {payload}: any) {
      return {...state, loading: payload};
    },
  },
};

export {buildSkillTree};
