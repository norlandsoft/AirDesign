import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {Form, Input, Select, Switch} from 'antd';
import {Button, Dialog, error, Message} from 'air-design';
import {GroupSplitter} from 'air-design';
import {Dispatch} from '@umijs/max';
import {WorkflowPropsCreateRequest, WorkflowPropsResponse} from '@/types/workflowProps';

interface WorkflowInfo {
  id?: string;
  name?: string;
  description?: string;
}

interface WorkflowSettingsPanelProps {
  workflowId: string | null;
  workflowName?: string;
  workflowInfo?: WorkflowInfo; // 工作流基本信息
  dispatch: Dispatch;
  onClose?: () => void;
  onDelete?: () => void;
}

export interface WorkflowSettingsPanelRef {
  validateAndGetValues: () => Promise<{
    basicInfo: { id?: string; name?: string; description?: string } | null;
    runtimeSettings: WorkflowPropsCreateRequest | null;
  } | null>;
}

/**
 * 工作流执行设置面板
 *
 * 用于配置工作流的执行设置，包括：
 * 1. 日志配置：是否输出日志、日志级别
 * 2. 错误处理：节点失败后继续还是停止流程
 *
 * Created by ChaiMingXu, on 2026/1/21
 */
const WorkflowSettingsPanel = forwardRef<WorkflowSettingsPanelRef, WorkflowSettingsPanelProps>(({
                                                                                                  workflowId,
                                                                                                  workflowName,
                                                                                                  workflowInfo,
                                                                                                  dispatch,
                                                                                                  onClose,
                                                                                                  onDelete
                                                                                                }, ref) => {
  const [form] = Form.useForm();
  const saveLogValue = Form.useWatch('saveLog', form) as boolean | undefined;

  // 使用 ref 跟踪是否已经初始化过运行时设置，避免重复加载导致覆盖用户正在编辑的内容
  const runtimeSettingsInitializedRef = useRef<string | null>(null);

  // 暴露表单验证和获取值的方法给父组件
  useImperativeHandle(ref, () => ({
    validateAndGetValues: async () => {
      try {
        const values = await form.validateFields();
        if (!workflowId) {
          throw new Error('工作流ID不能为空');
        }

        // 返回基本信息和运行时设置两部分
        return {
          basicInfo: {
            id: workflowId,
            name: values.name,
            description: values.description,
          },
          runtimeSettings: {
            workflowId,
            saveLog: values.saveLog ?? true,
            logLevel: values.logLevel || 'INFO',
            errorHandling: values.errorHandling || 'STOP',
          },
        };
      } catch (error) {
        return null;
      }
    }
  }));

  // 加载工作流运行时设置（只在 workflowId 变化时执行，避免覆盖用户正在编辑的内容）
  useEffect(() => {
    if (workflowId) {
      // 如果 workflowId 发生变化，重置初始化标志并加载运行时设置
      if (runtimeSettingsInitializedRef.current !== workflowId) {
        runtimeSettingsInitializedRef.current = workflowId;
        loadWorkflowProps();
      }
    } else {
      // 如果 workflowId 为空，重置表单和初始化标志
      form.resetFields();
      runtimeSettingsInitializedRef.current = null;
    }
  }, [workflowId]);

  // 单独处理基本信息的更新（不重新加载运行时设置）
  // 只在 workflowInfo 变化时更新基本信息字段，不会触发运行时设置的重新加载
  useEffect(() => {
    if (workflowId && workflowInfo) {
      // 只更新基本信息字段，不影响运行时设置
      form.setFieldsValue({
        name: workflowInfo.name || '',
        description: workflowInfo.description || '',
      });
    }
  }, [workflowInfo?.id, workflowInfo?.name, workflowInfo?.description, workflowId]);

  const loadWorkflowProps = () => {
    if (!workflowId) return;

    dispatch({
      type: 'workflow/fetchWorkflowProps',
      payload: {workflowId},
      callback: (resp: any) => {
        if (resp?.success && resp?.data) {
          const data: WorkflowPropsResponse = resp.data;
          form.setFieldsValue({
            saveLog: data.saveLog ?? true,
            logLevel: data.logLevel || 'INFO',
            errorHandling: data.errorHandling || 'STOP',
          });
        } else {
          // 如果不存在，使用默认值
          form.setFieldsValue({
            saveLog: true,
            logLevel: 'INFO',
            errorHandling: 'STOP',
          });
        }
      },
    });
  };

  return (
      <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: '',
            description: '',
            saveLog: true,
            logLevel: 'INFO',
            errorHandling: 'STOP',
          }}
      >
        {/* 基本信息部分 */}
        <Form.Item
            label="工作流名称"
            name="name"
            rules={[{required: true, message: '请输入工作流名称'}]}
        >
          <Input placeholder="请输入工作流名称"/>
        </Form.Item>
        <Form.Item
            label="描述"
            name="description"
        >
          <Input.TextArea
              rows={3}
              placeholder="请输入工作流描述（可选）"
              style={{resize: 'none'}}
          />
        </Form.Item>

        <GroupSplitter title="运行时设置" height={40} paddingTop={32}/>

        {/* 运行时设置部分 */}
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span>输出日志</span>
          <Form.Item
              name="saveLog"
              valuePropName="checked"
              tooltip="控制工作流执行时是否输出日志"
              style={{margin: 0}}
              layout={'horizontal'}
          >
            <Switch/>
          </Form.Item>
        </div>

        <Form.Item
            label="日志级别"
            name="logLevel"
            tooltip="设置日志输出的级别，只有达到或超过该级别的日志才会被输出"
        >
          <Select disabled={saveLogValue === false}>
            <Select.Option value="DEBUG">调试 (DEBUG)</Select.Option>
            <Select.Option value="INFO">信息 (INFO)</Select.Option>
            <Select.Option value="WARN">警告 (WARN)</Select.Option>
            <Select.Option value="ERROR">错误 (ERROR)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
            label="节点错误时"
            name="errorHandling"
            tooltip="当工作流节点执行失败时的处理方式"
        >
          <Select>
            <Select.Option value="CONTINUE">继续执行 - 节点失败后继续执行后续节点</Select.Option>
            <Select.Option value="STOP">停止流程 - 节点失败后停止整个流程</Select.Option>
          </Select>
        </Form.Item>

        {/* 删除区域 */}
        <div style={{marginTop: 32, borderTop: '1px solid #f0f0f0', paddingTop: 16}}>
          <Button type="danger" onClick={() => {
            Dialog({
              title: '删除工作流',
              content: `确定删除工作流"${workflowName || ''}"吗？删除后将无法恢复，所有节点和执行记录将被清除。`,
              width: 400,
              onConfirm: dlg => {
                dispatch({
                  type: 'workflow/deleteWorkflow',
                  payload: {id: workflowId},
                  callback: resp => {
                    if (resp?.success) {
                      Message.success('工作流已删除');
                      onClose?.();
                      onDelete?.();
                    } else {
                      error({title: '删除失败', message: resp?.message || '删除工作流失败'});
                    }
                    dlg.doCancel();
                  }
                });
              }
            });
          }}>删除工作流</Button>
        </div>
      </Form>
  );
});

WorkflowSettingsPanel.displayName = 'WorkflowSettingsPanel';

export default WorkflowSettingsPanel;
