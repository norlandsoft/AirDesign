export const AllItems = [
  {key: 'start', split: false, name: '开始', action: 'start', type: 'default'},
  {key: 'stop', split: false, name: '结束', action: 'stop', type: 'default'},
  {key: 'split-1', split: true, name: '', action: '', type: ''},
  {key: 'llm', split: false, name: '模型请求', action: 'llm', type: 'default'},
  {key: 'agent', split: false, name: '智能体', action: 'agent', type: 'default'},
  {key: 'split-2', split: true, name: '', action: '', type: ''},
  {key: 'loop', split: false, name: '循环', action: 'loop', type: 'group'},
  {key: 'forEach', split: false, name: '任务列表', action: 'forEach', type: 'group'},
  {key: 'case', split: false, name: '条件选择', action: 'case', type: 'default'},
  {key: 'split-3', split: true, name: '', action: '', type: ''},
  {key: 'http', split: false, name: 'HTTP请求', action: 'http', type: 'default'},
];

export const SubItems = [
  {key: 'llm', split: false, name: '模型请求', action: 'llm', type: 'default'},
  {key: 'agent', split: false, name: '智能体', action: 'agent', type: 'default'},
  {key: 'split-1', split: true, name: '', action: '', type: ''},
  {key: 'case', split: false, name: '条件选择', action: 'case', type: 'default'},
  {key: 'split-2', split: true, name: '', action: '', type: ''},
  {key: 'http', split: false, name: 'HTTP请求', action: 'http', type: 'default'},
  {key: 'split-3', split: true, name: '', action: '', type: ''},
  {key: 'continue', split: false, name: '下一循环', action: 'continue', type: 'default'},
  {key: 'break', split: false, name: '退出循环', action: 'break', type: 'default'}
];
