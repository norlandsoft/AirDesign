import React, {useEffect, useRef, useState} from "react";
import {Button, GroupSplitter, IconButton, Message} from 'air-design';
import {Checkbox, Form, Input, Select} from "antd";
import {HolderOutlined} from "@ant-design/icons";
import {shortId} from '@/utils/StringUtils';
import "./CaseActionPanel.less";

// 定义条件项的数据结构
interface ConditionItem {
  id: string;
  variable: string;        // 参数变量
  operator: string;        // 条件操作符
  value: string;           // 数值
  label: string;           // 显示标签
}

// 条件操作符选项
const OPERATOR_OPTIONS = [
  {value: 'contains', label: '包含'},
  {value: 'not_contains', label: '不包含'},
  {value: 'starts_with', label: '开始为'},
  {value: 'ends_with', label: '结束为'},
  {value: 'equals', label: '等于'},
  {value: 'not_equals', label: '不等于'},
  {value: '>', label: '大于(>)'},
  {value: '>=', label: '大于等于(>=)'},
  {value: '<', label: '小于(<)'},
  {value: '<=', label: '小于等于(<=)'},
  {value: 'empty', label: '空'},
  {value: 'not_empty', label: '非空'},
];

// 可拖拽列表项组件
const DraggableListItem: React.FC<{
  item: ConditionItem;
  index: number;
  onEdit: (id: string, field: keyof ConditionItem, value: string) => void;
  onDelete: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  isIfItem?: boolean;
}> = ({item, index, onEdit, onDelete, onMove, isIfItem = false}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOver(false);
  };

  // 处理拖拽进入
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  // 处理拖拽离开
  const handleDragLeave = () => {
    setDragOver(false);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index) {
      onMove(fromIndex, index);
    }
  };

  return (
      <div
          ref={itemRef}
          draggable={!isIfItem}
          onDragStart={isIfItem ? undefined : handleDragStart}
          onDragEnd={isIfItem ? undefined : handleDragEnd}
          onDragOver={isIfItem ? undefined : handleDragOver}
          onDragLeave={isIfItem ? undefined : handleDragLeave}
          onDrop={isIfItem ? undefined : handleDrop}
          className={`draggable-list-item ${isDragging ? 'dragging' : ''} ${dragOver ? 'drag-over' : ''} ${isIfItem ? 'if-item' : ''}`}
      >
        <div className="item-content">
          {/* 拖拽手柄 - if项不显示拖拽手柄 */}
          {!isIfItem && <HolderOutlined className="drag-handle"/>}

          {/* 序号 */}
          <div className="item-index">
            {isIfItem ? 'IF' : index + 1}
          </div>

          {/* 参数变量输入 */}
          <Form.Item
              className="form-item"
              name={`variable-${item.id}`}
              rules={[{required: true, message: '请输入参数变量'}]}
          >
            <Input
                placeholder="参数变量"
                value={item.variable}
                onChange={(e) => onEdit(item.id, 'variable', e.target.value)}
            />
          </Form.Item>

          {/* 条件操作符选择 */}
          <Form.Item
              className="form-item"
              name={`operator-${item.id}`}
              rules={[{required: true, message: '请选择条件'}]}
          >
            <Select
                placeholder="选择条件"
                value={item.operator}
                onChange={(value) => onEdit(item.id, 'operator', value)}
                options={OPERATOR_OPTIONS}
            />
          </Form.Item>

          {/* 数值输入 */}
          <Form.Item
              className="form-item"
              name={`value-${item.id}`}
              rules={[{required: true, message: '请输入数值'}]}
          >
            <Input
                placeholder="输入数值"
                value={item.value}
                onChange={(e) => onEdit(item.id, 'value', e.target.value)}
                disabled={item.operator === 'empty' || item.operator === 'not_empty'}
            />
          </Form.Item>

          {/* 标签输入 - if项不显示标签输入 */}
          {!isIfItem && (
              <Form.Item
                  className="form-item"
                  name={`label-${item.id}`}
                  rules={[{required: true, message: '请输入标签'}]}
              >
                <Input
                    placeholder="显示标签"
                    value={item.label}
                    onChange={(e) => onEdit(item.id, 'label', e.target.value)}
                />
              </Form.Item>
          )}

          {/* 删除按钮 - if项不显示删除按钮 */}
          {!isIfItem && (
              <div className="delete-button">
                <IconButton icon="delete" size={28} onClick={() => onDelete(item.id)}/>
              </div>
          )}
        </div>
      </div>
  );
};


const CaseActionPanel: React.FC<any> = props => {
  const {
    form,
    action,
    extraProps,
    setExtraProps
  } = props;

  // 管理条件列表状态
  const [conditionItems, setConditionItems] = useState<ConditionItem[]>([]);
  const [ifItem, setIfItem] = useState<ConditionItem>({
    id: 'ifItem',
    variable: '',
    operator: '',
    value: '',
    label: '',
  });
  const [formInstance] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(action);

    // 从extraProps初始化条件列表
    if (extraProps?.conditionItems) {
      setConditionItems(extraProps.conditionItems);
    }
    if (extraProps?.ifItem) {
      setIfItem(extraProps.ifItem);
    } else {
      // 如果没有ifItem，使用默认值并保存到extraProps
      setExtraProps({
        ...extraProps,
        ifItem: ifItem
      });
    }

    // 设置表单字段值
    const formValues: any = {};

    // 设置if项表单值
    const currentIfItem = extraProps?.ifItem || ifItem;
    formValues[`variable-${currentIfItem.id}`] = currentIfItem.variable;
    formValues[`operator-${currentIfItem.id}`] = currentIfItem.operator;
    formValues[`value-${currentIfItem.id}`] = currentIfItem.value;
    formValues[`label-${currentIfItem.id}`] = currentIfItem.label;

    // 设置elseif项表单值
    if (extraProps?.conditionItems) {
      extraProps.conditionItems.forEach((item: ConditionItem) => {
        formValues[`variable-${item.id}`] = item.variable;
        formValues[`operator-${item.id}`] = item.operator;
        formValues[`value-${item.id}`] = item.value;
        formValues[`label-${item.id}`] = item.label;
      });
    }

    formInstance.setFieldsValue(formValues);
  }, []);

  // 生成唯一ID
  const generateId = () => {
    return `elseif-${shortId()}`;
  };

  // 添加新的elseif项
  const addItem = () => {
    const newItem: ConditionItem = {
      id: generateId(),
      variable: '',
      operator: '',
      value: '',
      label: '',
    };
    const newItems = [...conditionItems, newItem];
    setConditionItems(newItems);
    // 更新表单字段值
    formInstance.setFieldsValue({
      [`variable-${newItem.id}`]: newItem.variable,
      [`operator-${newItem.id}`]: newItem.operator,
      [`value-${newItem.id}`]: newItem.value,
      [`label-${newItem.id}`]: newItem.label,
    });
    // 更新extraProps中的条件列表
    setExtraProps({
      ...extraProps,
      conditionItems: newItems
    });
  };

  // 编辑项
  const editItem = (id: string, field: keyof ConditionItem, value: string) => {
    formInstance.validateFields();

    // 编辑if项
    if (id === 'ifItem') {
      const updatedIfItem = {...ifItem, [field]: value};
      setIfItem(updatedIfItem);
      setExtraProps({
        ...extraProps,
        ifItem: updatedIfItem
      });
      return;
    }

    // 编辑elseif项
    const newItems = conditionItems.map(item =>
        item.id === id ? {...item, [field]: value} : item
    );
    setConditionItems(newItems);
    // 更新extraProps中的条件列表
    setExtraProps({
      ...extraProps,
      conditionItems: newItems
    });
  };

  // 删除项
  const deleteItem = (id: string) => {
    const newItems = conditionItems.filter(item => item.id !== id);
    setConditionItems(newItems);
    // 更新表单字段值
    const formValues: any = {};
    newItems.forEach((item) => {
      formValues[`variable-${item.id}`] = item.variable;
      formValues[`operator-${item.id}`] = item.operator;
      formValues[`value-${item.id}`] = item.value;
      formValues[`label-${item.id}`] = item.label;
    });
    formInstance.setFieldsValue(formValues);
    // 更新extraProps中的条件列表
    setExtraProps({
      ...extraProps,
      conditionItems: newItems
    });
  };

  // 移动项
  const handleMove = (fromIndex: number, toIndex: number) => {
    const newItems = [...conditionItems];
    const draggedItem = newItems[fromIndex];
    newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, draggedItem);

    setConditionItems(newItems);
    // 更新表单字段值
    const formValues: any = {};
    newItems.forEach((item) => {
      formValues[`variable-${item.id}`] = item.variable;
      formValues[`operator-${item.id}`] = item.operator;
      formValues[`value-${item.id}`] = item.value;
      formValues[`label-${item.id}`] = item.label;
    });
    formInstance.setFieldsValue(formValues);
    // 更新extraProps中的条件列表
    setExtraProps({
      ...extraProps,
      conditionItems: newItems
    });
  };

  // 清空所有条件
  const handleClearAll = () => {
    setConditionItems([]);
    // 更新extraProps中的条件列表
    setExtraProps({
      ...extraProps,
      conditionItems: []
    });
    Message.info('已清空所有条件');
  };

  // 设置每一项是否忽略大小写
  const handleSetIgnoreCase = (ignoreCase: boolean) => {
    const newItems = conditionItems.map(item => ({
      ...item,
      ignoreCase: ignoreCase
    }));
    setConditionItems(newItems);

    const newIfItem = {
      ...ifItem,
      ignoreCase: ignoreCase
    };
    setIfItem(newIfItem);

    // 同步更新extraProps中的conditionItems和ifItem
    setExtraProps({
      ...extraProps,
      ignoreCase: ignoreCase,
      ifItem: newIfItem,
      conditionItems: newItems
    });
  };

  return (
      <div className="elseif-form">
        <Form form={form}>
          <Form.Item
              name={'action'}
              hidden={true}
          >
            <Input/>
          </Form.Item>
          <Form.Item
              label={'名称'}
              name={'name'}
              rules={[{required: true, message: '请输入名称'}]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
              label={'描述'}
              name={'description'}
          >
            <Input.TextArea rows={2} style={{resize: 'none'}}/>
          </Form.Item>
        </Form>

        <GroupSplitter title={"条件设置"} height={32} paddingTop={32}/>

        <Form form={formInstance} layout="vertical">
          <div className="form-header">
            <div className="header-controls">
              <Button
                  type="primary"
                  onClick={addItem}
              >
                添加条件
              </Button>
              <Button
                  type="danger"
                  onClick={handleClearAll}
                  disabled={conditionItems.length === 0}
              >
                清空
              </Button>
            </div>

            <div className="form-description">
              支持拖拽排序，每个条件包含参数变量、条件操作符、数值和显示标签
            </div>
          </div>

          <div className="form-content">
            <div className="list-container">
              {/* IF项 - 必填项，始终显示 */}
              <DraggableListItem
                  key={ifItem.id}
                  item={ifItem}
                  index={0}
                  onEdit={editItem}
                  onDelete={deleteItem}
                  onMove={handleMove}
                  isIfItem={true}
              />

              {/* ELSEIF项 */}
              {conditionItems.map((item, index) => (
                  <DraggableListItem
                      key={item.id}
                      item={item}
                      index={index}
                      onEdit={editItem}
                      onDelete={deleteItem}
                      onMove={handleMove}
                  />
              ))}

              {/* 空状态 */}
              {conditionItems.length === 0 && (
                  <div className="empty-state">
                    点击"添加"开始创建其它条件
                  </div>
              )}

              {/* ELSE说明 */}
              <div className="else-description">
                <div className="else-label">ELSE</div>
                <div className="else-text">处理所有不满足以上条件的业务逻辑</div>
              </div>
            </div>
          </div>

          <div style={{padding: '16px 4px'}}>
            <Form.Item
                name="ignoreCase"
                valuePropName="checked"
                initialValue={extraProps.ignoreCase}
            >
              <Checkbox onChange={e => handleSetIgnoreCase(e.target.checked)}>文字比对时忽略大小写</Checkbox>
            </Form.Item>
          </div>
        </Form>

      </div>
  );
}

export default CaseActionPanel;
