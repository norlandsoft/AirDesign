import React, {useCallback, useEffect} from 'react';
import {Dialog, error, Icon, IconButton, success, Table} from 'air-design';
import {Form, Input} from 'antd';
import {connect, useDispatch, useSelector} from 'umi';
import type {GiteaRepository} from '../models/asset';
import './index.less';

/**
 * 智能工作室 - 资产页
 *
 * 仓库列表页面，点击仓库后设置选中仓库并切换到仓库详情页。
 *
 * Created by ChaiMingXu, on 2026-02-10
 * Updated on 2026-04-08 - 仓库详情迁移至独立 repository 页面
 */
interface StudioAssetsProps {
  frameSize: { width: number; height: number };
  onOpenRepository?: () => void;
}

const TABLE_OFFSET = 100;

/**
 * 资产列表页组件
 *
 * 显示仓库列表，点击仓库项后设置选中仓库并切换到仓库详情页面。
 */
const StudioAssets: React.FC<StudioAssetsProps> = (props) => {
  const {frameSize, onOpenRepository} = props;
  const dispatch = useDispatch();

  // 从 model 获取状态
  const {
    repoList,
    loadingRepos,
    searchQ,
  } = useSelector((state: any) => state.asset);

  // 加载仓库列表（通过后端 API）
  const loadRepos = useCallback(async () => {
    dispatch({type: 'asset/setLoadingRepos', payload: true});
    try {
      const result = await dispatch({type: 'asset/fetchRepoList', payload: {}});
      if (result?.success && result?.data) {
        // 前端搜索过滤
        const list = searchQ
            ? result.data.filter((r: GiteaRepository) => {
              const q = searchQ.toLowerCase();
              return r.name?.toLowerCase().includes(q)
                  || r.full_name?.toLowerCase().includes(q)
                  || r.description?.toLowerCase().includes(q);
            })
            : result.data;
        dispatch({type: 'asset/setRepoList', payload: list});
      } else {
        error({message: result?.message || '加载仓库列表失败'});
        dispatch({type: 'asset/setRepoList', payload: []});
      }
    } catch (e: any) {
      error({message: e?.message || '加载仓库列表失败'});
      dispatch({type: 'asset/setRepoList', payload: []});
    } finally {
      dispatch({type: 'asset/setLoadingRepos', payload: false});
    }
  }, [searchQ, dispatch]);

  /**
   * 删除仓库
   * 流程：1. 判断成功标志 -> 2. 显示成功或失败消息 -> 3. 关闭对话框 -> 4. 刷新资产列表
   */
  const handleDeleteRepo = useCallback(
      (repo: GiteaRepository) => {
        const owner = repo.owner?.login || repo.full_name?.split('/')[0] || '';
        const name = repo.name || repo.full_name?.split('/')[1] || '';
        if (!owner || !name) return;

        let dialogRef: any = null;

        Dialog({
          title: '确认删除',
          message: `确定要删除仓库 "${name}" 吗？此操作不可恢复。`,
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          onConfirm: async (dlg: any) => {
            dialogRef = dlg;
            dispatch({
              type: 'asset/deleteRepo',
              payload: {owner, repo: name},
              callback: (result: { success: boolean; message: string }) => {
                if (result.success) {
                  success({message: result.message});
                } else {
                  error({message: result.message});
                }

                if (dialogRef && dialogRef.doCancel) {
                  dialogRef.doCancel();
                }

                if (result.success) {
                  loadRepos();
                }
              },
            });
          },
        });
      },
      [loadRepos, dispatch]
  );

  // 搜索框输入防抖，延迟 300ms 后自动触发加载
  useEffect(() => {
    const t = setTimeout(() => loadRepos(), 300);
    return () => clearTimeout(t);
  }, [searchQ, loadRepos]);

  // 点击仓库行，打开仓库详情页
  const handleRepoClick = useCallback(
      (repo: GiteaRepository) => {
        // 设置选中的仓库信息
        dispatch({type: 'asset/setSelectedRepo', payload: repo});
        // 触发切换到仓库详情页
        onOpenRepository?.();
      },
      [dispatch, onOpenRepository]
  );

  // 更新搜索关键词
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({type: 'asset/setSearchQ', payload: e.target.value});
  }, [dispatch]);

  return (
      <div
          className="studio-assets studio-assets-home"
          style={{width: frameSize.width, height: frameSize.height}}
      >
        {/* 首页布局：顶部工具栏 + 表格 */}
        <div className="github-toolbar">
          <div className="toolbar-left">
            <Form>
              <Form.Item style={{marginBottom: 0}}>
                <Input
                    placeholder="搜索仓库..."
                    prefix={<Icon name="search" size={16}/>}
                    value={searchQ}
                    onChange={handleSearchChange}
                    onPressEnter={loadRepos}
                    style={{minWidth: 360}}
                    allowClear
                />
              </Form.Item>
            </Form>
          </div>
        </div>
        <Table
            columns={[
              {
                title: '名称',
                key: 'name',
                render: (_: any, r: GiteaRepository) => (
                    <div
                        className="studio-assets-content-row"
                        onClick={() => handleRepoClick(r)}
                    >
                      <Icon name="folder" size={18}/>
                      <span>{r.name || r.full_name?.split('/')[1] || r.full_name}</span>
                    </div>
                ),
              },
              {
                title: '描述',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: '操作',
                key: 'action',
                width: 80,
                render: (_: any, r: GiteaRepository) => (
                    <span onClick={(e) => e.stopPropagation()}>
                      <IconButton
                          icon="delete"
                          size={24}
                          onClick={() => handleDeleteRepo(r)}
                          tooltip="删除"
                      />
                    </span>
                ),
              },
            ]}
            data={repoList}
            rowKey="id"
            height={frameSize.height ? frameSize.height - TABLE_OFFSET : 600}
            showHeader={true}
            loading={loadingRepos}
            bordered={true}
            showEmpty={true}
            emptyText="暂无资产库"
            onItemClick={(record: GiteaRepository) => handleRepoClick(record)}
        />
      </div>
  );
};

export default connect()(StudioAssets);
