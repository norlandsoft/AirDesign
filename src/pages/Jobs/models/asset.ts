import {GET, POST} from '@/utils/HttpRequest';

/**
 * 资产管理 Model（智能工作室）
 *
 * 管理工作室资产仓库的增删改查，与 /rest/platform/job/asset 协作。
 * 通过 Gitea 存储，使用 /git 代理访问 Gitea 服务。
 *
 * @author ChaiMingXu
 * Updated on 2026-03-28 - 重命名为 Job
 */

// ==================== 类型定义 ====================

/** 仓库信息 */
export interface GiteaRepository {
  id: number;
  full_name: string;
  name: string;
  description?: string;
  default_branch?: string;
  owner?: { login: string; full_name?: string };
  private?: boolean;
  html_url?: string;
}

/** 分支信息 */
export interface GiteaBranch {
  name: string;
  commit?: { id: string };
}

/** 文件/目录内容条目 */
export interface GiteaContentEntry {
  name: string;
  path: string;
  sha: string;
  type: 'dir' | 'file' | 'symlink';
  size?: number;
  content?: string;
  encoding?: string;
}

/** 文件树节点 */
export interface FileTreeNode {
  key: string;
  label: string;
  name?: string;
  children?: FileTreeNode[];
  isLeaf?: boolean;
}

/** 删除仓库请求参数 */
export interface DeleteRepoRequest {
  owner: string;
  repo: string;
}

// ==================== Gitea API 配置 ====================

const GITEA_BASE = '/git/api/v1';

/** 请求头：可选 token（Gitea 管理 token，用于私有仓库） */
function giteaHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    h['Authorization'] = `token ${token}`;
  }
  return h;
}

// ==================== Model 定义 ====================

export default {
  namespace: 'asset',

  state: {
    /** 仓库列表 */
    repoList: [] as GiteaRepository[],
    /** 仓库列表加载状态 */
    loadingRepos: false,
    /** 当前选中的仓库 */
    selectedRepo: null as GiteaRepository | null,
    /** 分支列表 */
    branches: [] as GiteaBranch[],
    /** 当前分支 */
    currentBranch: '',
    /** 当前路径 */
    currentPath: '',
    /** 文件树数据 */
    fileTreeData: [] as FileTreeNode[],
    /** 目录条目列表 */
    treeEntries: [] as GiteaContentEntry[],
    /** 文件内容 */
    fileContent: null as string | null,
    /** 是否为二进制文件 */
    isBinary: false,
    /** 内容加载状态 */
    loadingContent: false,
    /** 展开的树节点 */
    expandedKeys: [] as string[],
    /** 搜索关键词 */
    searchQ: '',
  },

  effects: {
    /**
     * 获取仓库列表（通过后端 API）
     */
    * fetchRepoList(
        {callback}: {callback?: (resp: { success: boolean; message: string; data?: any[] }) => void},
        {call}
    ) {
      try {
        const resp = yield call(POST, '/rest/platform/job/asset/list', {});
        if (resp?.success && resp?.data) {
          if (callback) callback({success: true, message: '获取成功', data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '获取仓库列表失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '获取仓库列表失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },
    /**
     * 删除仓库（通过后端 API）
     */
    * deleteRepo(
        {payload, callback}: {
          payload: DeleteRepoRequest;
          callback?: (resp: { success: boolean; message: string }) => void
        },
        {call}
    ) {
      try {
        const resp = yield call(POST, '/rest/platform/job/asset/delete', payload);
        const result = {
          success: !!resp?.success,
          message: resp?.message || (resp?.success ? '删除成功' : '删除仓库失败'),
        };
        if (callback) callback(result);
        return result;
      } catch (err: any) {
        const result = {success: false, message: err?.message || '删除仓库失败'};
        if (callback) callback(result);
        return result;
      }
    },
  },

  reducers: {
    setRepoList(state: any, {payload}: { payload: GiteaRepository[] }) {
      return {...state, repoList: payload || []};
    },
    setLoadingRepos(state: any, {payload}: { payload: boolean }) {
      return {...state, loadingRepos: payload};
    },
    setSelectedRepo(state: any, {payload}: { payload: GiteaRepository | null }) {
      return {...state, selectedRepo: payload};
    },
    setBranches(state: any, {payload}: { payload: GiteaBranch[] }) {
      return {...state, branches: payload || []};
    },
    setCurrentBranch(state: any, {payload}: { payload: string }) {
      return {...state, currentBranch: payload};
    },
    setCurrentPath(state: any, {payload}: { payload: string }) {
      return {...state, currentPath: payload};
    },
    setFileTreeData(state: any, {payload}: { payload: FileTreeNode[] }) {
      return {...state, fileTreeData: payload || []};
    },
    setTreeEntries(state: any, {payload}: { payload: GiteaContentEntry[] }) {
      return {...state, treeEntries: payload || []};
    },
    setFileContent(state: any, {payload}: { payload: string | null }) {
      return {...state, fileContent: payload};
    },
    setIsBinary(state: any, {payload}: { payload: boolean }) {
      return {...state, isBinary: payload};
    },
    setLoadingContent(state: any, {payload}: { payload: boolean }) {
      return {...state, loadingContent: payload};
    },
    setExpandedKeys(state: any, {payload}: { payload: string[] }) {
      return {...state, expandedKeys: payload || []};
    },
    setSearchQ(state: any, {payload}: { payload: string }) {
      return {...state, searchQ: payload};
    },
    /** 清除选中仓库及相关状态 */
    clearSelectedRepo(state: any) {
      return {
        ...state,
        selectedRepo: null,
        currentPath: '',
        fileContent: null,
        isBinary: false,
        treeEntries: [],
        fileTreeData: [],
        branches: [],
        expandedKeys: [],
      };
    },
    /** 更新文件树子节点 */
    updateTreeChildren(state: any, {payload}: { payload: { path: string; children: FileTreeNode[] } }) {
      const updatedTreeData = updateNodeChildren(state.fileTreeData, payload.path, payload.children);
      return {...state, fileTreeData: updatedTreeData};
    },
  },
};

/**
 * 递归更新树中 key 为 path 的节点的 children
 */
function updateNodeChildren(nodes: FileTreeNode[], path: string, children: FileTreeNode[]): FileTreeNode[] {
  return nodes.map((n) => {
    if (n.key === path) return {...n, children};
    if (n.children) return {...n, children: updateNodeChildren(n.children, path, children)};
    return n;
  });
}

// ==================== Gitea API 工具函数 ====================

/** 获取仓库详情（通过后端 API） */
export async function getRepo(owner: string, repo: string): Promise<GiteaRepository> {
  const resp = await GET('/rest/platform/job/asset/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo));
  if (resp?.success && resp?.data) {
    return resp.data as GiteaRepository;
  }
  throw new Error(resp?.message || '获取仓库详情失败');
}

/** 获取分支列表（通过后端 API） */
export async function getBranches(owner: string, repo: string): Promise<GiteaBranch[]> {
  const resp = await GET('/rest/platform/job/asset/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/branches');
  if (resp?.success && resp?.data) {
    return resp.data as GiteaBranch[];
  }
  throw new Error(resp?.message || '获取分支列表失败');
}

/** 获取路径下的内容（目录列表或文件内容，通过后端 API） */
export async function getContents(
    owner: string,
    repo: string,
    path: string,
    ref: string
): Promise<GiteaContentEntry | GiteaContentEntry[]> {
  const params = new URLSearchParams({path, ref});
  const resp = await GET('/rest/platform/job/asset/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/contents?' + params.toString());
  if (resp?.success && resp?.data) {
    return resp.data;
  }
  throw new Error(resp?.message || '获取内容失败');
}

/** 获取仓库归档下载链接（tar.gz 格式） */
export function getArchiveUrl(owner: string, repo: string, ref: string): string {
  return `${GITEA_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/archive/${encodeURIComponent(ref)}.tar.gz`;
}
