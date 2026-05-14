/**
 * 技能管理模块 mock handlers
 *
 * 模拟技能、技能组、技能文件等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok} from '../mockStore';

// 技能列表
let skillList = [
  {id: 'skill_1', name: '网络搜索', description: '使用搜索引擎搜索网络信息', groupId: 'group_1', type: 'builtin'},
  {id: 'skill_2', name: '代码执行', description: '执行Python代码', groupId: 'group_1', type: 'builtin'},
  {id: 'skill_3', name: '文档解析', description: '解析PDF、Word等文档', groupId: 'group_2', type: 'builtin'},
  {id: 'skill_4', name: '图片生成', description: '使用AI生成图片', groupId: '', type: 'custom'},
];

// 技能组（树形结构）
let skillGroups = [
  {id: 'group_1', name: '信息获取', parentId: null, sortOrder: 1, children: []},
  {id: 'group_2', name: '内容处理', parentId: null, sortOrder: 2, children: []},
];

// 技能文件
let skillFiles: Record<string, any[]> = {
  skill_1: [
    {id: 'sf_1', skillId: 'skill_1', name: 'search.py', path: 'search.py', type: 'file', size: 1024},
    {id: 'sf_2', skillId: 'skill_1', name: 'config.json', path: 'config.json', type: 'file', size: 256},
  ],
};

export const skillHandlers: MockHandler[] = [
  // ========== 技能 CRUD ==========
  {
    url: '/api/openclaw/skills/list', method: 'POST',
    handler: () => ok(skillList),
  },
  {
    url: '/api/openclaw/skills/create', method: 'POST',
    handler: (params) => {
      const skill = {id: 'skill_' + Date.now(), ...params};
      skillList.push(skill);
      return ok(skill);
    },
  },
  {
    url: '/api/openclaw/skills/get', method: 'POST',
    handler: (params) => {
      const skill = skillList.find((s) => s.id === params.id);
      return skill ? ok(skill) : ok(null);
    },
  },
  {
    url: '/api/openclaw/skills/update', method: 'POST',
    handler: (params) => {
      const idx = skillList.findIndex((s) => s.id === params.id);
      if (idx >= 0) skillList[idx] = {...skillList[idx], ...params};
      return ok(skillList[idx]);
    },
  },
  {
    url: '/api/openclaw/skills/delete', method: 'POST',
    handler: (params) => {
      skillList = skillList.filter((s) => s.id !== params.id);
      return ok({}, '删除成功');
    },
  },
  {
    url: '/api/openclaw/skills/sync', method: 'POST',
    handler: () => ok({}, '同步成功'),
  },

  // ========== 技能导入 ==========
  {
    url: '/api/openclaw/skills/import/preview', method: 'POST',
    handler: () => ok({skills: [], groups: []}),
  },
  {
    url: '/api/openclaw/skills/import/execute', method: 'POST',
    handler: () => ok({}, '导入成功'),
  },

  // ========== 技能组 ==========
  {
    url: '/api/openclaw/skill-groups/list', method: 'POST',
    handler: () => ok(skillGroups),
  },
  {
    url: '/api/openclaw/skill-groups/create', method: 'POST',
    handler: (params) => {
      const group = {id: 'group_' + Date.now(), ...params, children: []};
      skillGroups.push(group);
      return ok(group);
    },
  },
  {
    url: '/api/openclaw/skill-groups/update', method: 'POST',
    handler: (params) => {
      const idx = skillGroups.findIndex((g) => g.id === params.id);
      if (idx >= 0) skillGroups[idx] = {...skillGroups[idx], ...params};
      return ok(skillGroups[idx]);
    },
  },
  {
    url: '/api/openclaw/skill-groups/delete', method: 'POST',
    handler: (params) => {
      skillGroups = skillGroups.filter((g) => g.id !== params.id);
      return ok({}, '删除成功');
    },
  },

  // ========== 技能文件 ==========
  {
    url: '/api/openclaw/skill-files/list', method: 'POST',
    handler: (params) => ok(skillFiles[params.skillId] || []),
  },
  {
    url: '/api/openclaw/skill-files/get', method: 'POST',
    handler: (params) => {
      const files = Object.values(skillFiles).flat();
      const file = files.find((f: any) => f.id === params.id);
      return file ? ok({...file, content: '# 示例文件内容\nprint("hello")'}) : ok(null);
    },
  },
  {
    url: '/api/openclaw/skill-files/create-folder', method: 'POST',
    handler: (params) => {
      const files = skillFiles[params.skillId] || [];
      files.push({id: 'sf_' + Date.now(), ...params, type: 'dir'});
      skillFiles[params.skillId] = files;
      return ok({}, '创建成功');
    },
  },
  {
    url: '/api/openclaw/skill-files/delete', method: 'POST',
    handler: (params) => {
      const files = skillFiles[params.skillId] || [];
      skillFiles[params.skillId] = files.filter((f: any) => f.id !== params.id);
      return ok({}, '删除成功');
    },
  },
  {
    url: '/api/openclaw/skill-files/save', method: 'POST',
    handler: () => ok({}, '保存成功'),
  },
  {
    url: '/api/openclaw/skill-files/all-with-content', method: 'POST',
    handler: () => ok([]),
  },
];
