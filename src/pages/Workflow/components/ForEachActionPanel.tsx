import React, {useEffect} from 'react';
import {connect} from 'umi';
import {Form, Input, Select} from 'antd';
import CodeEditor from '@/components/CodeEditor';

/**
 * forEach（任务列表）节点配置面板
 *
 * 用于配置任务列表节点的参数：
 * - listPrompt：生成列表的提示词，运行时由LLM根据此提示词生成待处理的列表
 * - modelId：生成列表所使用的模型
 * - itemVar：迭代项自定义变量名（可选），不填时使用 {{loop.item}} 标准别名
 *
 * 运行流程：
 * 1. 使用提示词调用LLM，生成结构化列表
 * 2. 自动按顺序迭代列表中的每一项，执行子节点
 * 3. 所有列表项处理完毕后，整个节点结束
 *
 * 可用循环变量：
 * - {{loop.current}} 当前轮次（1-based）
 * - {{loop.count}} 总轮数
 * - {{loop.item}} 当前迭代项
 * - {{loop.index}} 当前迭代索引（0-based）
 *
 * Created by ChaiMingXu, on 2026/05/03
 */
const ForEachActionPanel: React.FC<any> = props => {

  const {
    dispatch,
    frameSize,
    form,
    action,
    extraProps,
    setExtraProps
  } = props;

  const [modelList, setModelList] = React.useState([]);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(action);

    // 将 extraProps（存储在 props JSON 中）的值同步到表单
    if (extraProps.modelId) {
      form.setFieldValue('modelId', extraProps.modelId);
    }
    if (extraProps.itemVar) {
      form.setFieldValue('itemVar', extraProps.itemVar);
    }

    // 获取可用模型列表
    dispatch({
      type: 'llm/fetchActiveModels',
      payload: {},
      callback: (resp: any) => {
        if (resp.success) {
          setModelList((resp.data || [])
            .filter((item: any) => item.type !== 'embedding')
            .map((item: any) => ({
              value: item.id,
              label: item.name
            })));
        }
      }
    });
  }, []);

  return (
    <div>
      <Form form={form} layout={'vertical'}>
        <Form.Item
          label={'模型'}
          name={'modelId'}
          initialValue={extraProps.modelId}
          rules={[{required: true, message: '请选择模型'}]}
        >
          <Select
            placeholder={'请选择模型'}
            options={modelList}
            onChange={(_: any, data: any) => {
              setExtraProps({
                ...extraProps,
                modelId: data.value,
                modelName: data.label
              });
            }}
          />
        </Form.Item>
        <Form.Item
          name={'listPrompt'}
          hidden={true}
          initialValue={extraProps.listPrompt}
        >
          <Input/>
        </Form.Item>
        <Form.Item
          label={'生成列表提示词'}
        >
          <CodeEditor
            width={'100%'}
            height={frameSize.height - 280}
            border={true}
            language={'markdown'}
            content={extraProps.listPrompt || ''}
            showMap={false}
            onChange={(content: string) => {
              setExtraProps({
                ...extraProps,
                listPrompt: content
              });
            }}
          />
        </Form.Item>
        <Form.Item
          label={'迭代项自定义变量名（可选，不填则使用 {{loop.item}}）'}
          name={'itemVar'}
        >
          <Input
            placeholder={'loop.item'}
            onChange={(e) => {
              setExtraProps({
                ...extraProps,
                itemVar: e.target.value || ''
              });
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default connect(({global, llm}: any) => ({
  frameSize: global.frameSize,
  llm
}))(ForEachActionPanel);
