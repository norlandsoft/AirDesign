/**
 * 技能类型定义
 *
 * @author ChaiMingXu
 */

export interface SkillVO {
  id: string;
  name?: string;
  description?: string;
  metadata?: string;
  content?: string;
  groupId?: string;
}

export interface SkillGroupVO {
  id: string;
  name?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface SkillCreateRequest {
  id?: string;
  name?: string;
  description?: string;
  metadata?: string;
  content?: string;
  groupId?: string;
}

export interface SkillUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  metadata?: string;
  content?: string;
  groupId?: string;
}

export interface SkillQueryRequest {
  id?: string;
  name?: string;
  groupId?: string;
}

/** 技能树节点：group 为技能组，item 为技能 */
export interface SkillTreeNode {
  key: string;
  label: string;
  type: 'group' | 'item';
  children?: SkillTreeNode[];
  data?: SkillVO;
}
