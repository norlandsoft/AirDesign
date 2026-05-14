/**
 * 知识库模块 mock handlers
 *
 * 模拟知识空间、文档、思维导图等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok, fail} from '../mockStore';

// 知识空间
let spaceList = [
  {id: 'space_1', name: '产品文档', description: '产品相关文档', icon: '📁', createdAt: '2026-01-15'},
  {id: 'space_2', name: '技术笔记', description: '技术学习笔记', icon: '📝', createdAt: '2026-03-01'},
];

// 最近访问
let recentSpaces = [spaceList[0]];

// 文档菜单（树形结构）
let docMenus: Record<string, any[]> = {
  space_1: [
    {id: 'doc_1', title: '项目介绍', spaceId: 'space_1', parentId: null, type: 'doc', sortOrder: 1},
    {id: 'doc_2', title: '快速开始', spaceId: 'space_1', parentId: null, type: 'doc', sortOrder: 2},
    {id: 'doc_3', title: '架构设计', spaceId: 'space_1', parentId: null, type: 'doc', sortOrder: 3, children: [
        {id: 'doc_4', title: '前端架构', spaceId: 'space_1', parentId: 'doc_3', type: 'doc', sortOrder: 1},
        {id: 'doc_5', title: '后端架构', spaceId: 'space_1', parentId: 'doc_3', type: 'doc', sortOrder: 2},
      ]},
  ],
  space_2: [
    {id: 'doc_6', title: 'Spring Boot 笔记', spaceId: 'space_2', parentId: null, type: 'doc', sortOrder: 1},
  ],
};

// 文档内容
let docContents: Record<string, any> = {
  doc_1: {id: 'doc_1', title: '项目介绍', content: '<h1>AirMachine 项目介绍</h1><p>AirMachine 是一个企业级智能中台项目。</p>', type: 'doc'},
  doc_2: {id: 'doc_2', title: '快速开始', content: '<h1>快速开始</h1><p>请参考以下步骤快速启动项目...</p>', type: 'doc'},
};

// 思维导图
let mindMaps: Record<string, any[]> = {};

export const wikiHandlers: MockHandler[] = [
  // ========== 空间 ==========
  {
    url: '/rest/wiki/space/list', method: 'POST',
    handler: () => ok(spaceList),
  },
  {
    url: '/rest/wiki/space/info', method: 'POST',
    handler: (params) => {
      const space = spaceList.find((s) => s.id === params.id);
      return space ? ok(space) : fail('空间不存在');
    },
  },
  {
    url: '/rest/wiki/space/create', method: 'POST',
    handler: (params) => {
      const space = {id: 'space_' + Date.now(), ...params, createdAt: new Date().toISOString()};
      spaceList.push(space);
      return ok(space);
    },
  },
  {
    url: '/rest/wiki/space/update', method: 'POST',
    handler: (params) => {
      const idx = spaceList.findIndex((s) => s.id === params.id);
      if (idx >= 0) spaceList[idx] = {...spaceList[idx], ...params};
      return ok(spaceList[idx]);
    },
  },

  // ========== 最近访问 ==========
  {
    url: '/rest/wiki/space/recent', method: 'POST',
    handler: () => ok(recentSpaces),
  },
  {
    url: '/rest/wiki/space/recent/add', method: 'POST',
    handler: (params) => {
      const space = spaceList.find((s) => s.id === params.id);
      if (space && !recentSpaces.find((s) => s.id === params.id)) {
        recentSpaces.unshift(space);
      }
      return ok({});
    },
  },

  // ========== 文档 ==========
  {
    url: '/rest/wiki/docs/menu', method: 'POST',
    handler: (params) => ok(docMenus[params.spaceId] || []),
  },
  {
    url: '/rest/wiki/docs/info', method: 'POST',
    handler: (params) => {
      const doc = docContents[params.id];
      return doc ? ok(doc) : ok({id: params.id, title: '新文档', content: '', type: 'doc'});
    },
  },
  {
    url: '/rest/wiki/docs/update', method: 'POST',
    handler: (params) => {
      docContents[params.id] = {...docContents[params.id], ...params};
      return ok(docContents[params.id]);
    },
  },
  {
    url: '/rest/wiki/docs/remove', method: 'POST',
    handler: (params) => {
      delete docContents[params.id];
      return ok({}, '删除成功');
    },
  },

  // ========== 思维导图 ==========
  {
    url: '/rest/wiki/mind/update', method: 'POST',
    handler: (params) => {
      mindMaps[params.spaceId] = params.items || [];
      return ok({}, '保存成功');
    },
  },
  {
    url: '/rest/wiki/mind/items', method: 'POST',
    handler: (params) => ok(mindMaps[params.spaceId] || []),
  },
];
