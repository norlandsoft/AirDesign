import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, Dialog, error, Table, TableRowMenu} from 'air-design';
import {Form, Input} from 'antd';
import './DictSettingsPanel.less';

/**
 * 数据字典设置面板
 *
 * 左侧显示字典类型列表（从数据库获取所有字典类型）
 * 右侧显示选中字典类型下的字典项列表
 * 支持字典类型和字典项的增删改查操作
 *
 * Created by ChaiMingXu, on 2026/1/9
 */
interface DictSettingsPanelProps {
  frameSize?: {
    width: number;
    height: number;
  };
  dispatch?: any;
}

const DictSettingsPanel: React.FC<DictSettingsPanelProps> = (props) => {
  const {
    frameSize,
    dispatch,
  } = props;

  const tableHeight = (frameSize?.height || 600) - 60;
  const [form] = Form.useForm();
  const [emptyText, setEmptyText] = useState('暂无数据');
  const [dictTypeList, setDictTypeList] = useState<any[]>([]);
  const [dictItemList, setDictItemList] = useState<any[]>([]);
  const [selectedDictTypeId, setSelectedDictTypeId] = useState<string>('');
  const [selectedDictType, setSelectedDictType] = useState<any>(null);

  useEffect(() => {
    // 获取所有字典类型列表
    fetchDictTypeList();
  }, []);

  /**
   * 获取字典类型列表
   * 获取所有字典类型，不进行过滤
   */
  const fetchDictTypeList = () => {
    dispatch({
      type: 'platform/fetchDictTypeList',
      payload: {},
      callback: (resp: any) => {
        if (resp?.success) {
          // 按排序顺序排序
          const sortedList = (resp.data || [])
              .sort((a: any, b: any) => {
                const sortA = a.sortOrder || 0;
                const sortB = b.sortOrder || 0;
                return sortA - sortB;
              });
          setDictTypeList(sortedList);

          // 如果有字典类型，默认选中第一个
          if (sortedList.length > 0 && !selectedDictTypeId) {
            const firstType = sortedList[0];
            setSelectedDictTypeId(firstType.id);
            setSelectedDictType(firstType);
            fetchDictItemList(firstType.id);
          }
        } else {
          error({
            title: '获取字典类型列表失败',
            message: resp?.message || '未知错误'
          });
        }
      }
    });
  };

  /**
   * 获取字典项列表
   * 根据字典类型ID获取该类型下的所有字典项
   */
  const fetchDictItemList = (typeId: string) => {
    dispatch({
      type: 'platform/fetchDictItemListByTypeId',
      payload: {typeId},
      callback: (resp: any) => {
        if (resp?.success) {
          // 按排序顺序排序字典项列表
          const sortedList = (resp.data || []).sort((a: any, b: any) => {
            const sortA = a.sortOrder || 0;
            const sortB = b.sortOrder || 0;
            return sortA - sortB;
          });
          setDictItemList(sortedList);
        } else {
          if (resp?.code?.startsWith('91000')) {
            setEmptyText(resp.message);
          } else {
            error({
              title: '获取字典项列表失败',
              message: resp?.message || '未知错误'
            });
          }
        }
      }
    });
  };

  /**
   * 处理选择字典类型
   */
  const handleSelectDictType = (dictType: any) => {
    setSelectedDictTypeId(dictType.id);
    setSelectedDictType(dictType);
    fetchDictItemList(dictType.id);
  };

  /**
   * 处理新建字典项
   */
  const handleShowNewDialog = () => {
    if (!selectedDictTypeId) {
      error({
        title: '提示',
        message: '请先选择一个字典类型'
      });
      return;
    }

    form.resetFields();
    Dialog({
      title: `新建${selectedDictType?.name || '字典项'}`,
      width: 500,
      content: (
          <Form form={form} layout="horizontal" labelCol={{span: 5}} wrapperCol={{span: 18}}>
            <Form.Item
                name="code"
                label="编码"
                rules={[{required: true, message: '请输入编码'}]}
            >
              <Input placeholder="请输入编码"/>
            </Form.Item>
            <Form.Item
                name="name"
                label="名称"
                rules={[{required: true, message: '请输入名称'}]}
            >
              <Input placeholder="请输入名称"/>
            </Form.Item>
            <Form.Item
                name="value"
                label="值"
                rules={[{required: true, message: '请输入值'}]}
            >
              <Input placeholder="请输入值"/>
            </Form.Item>
            <Form.Item
                name="description"
                label="描述"
            >
              <Input.TextArea placeholder="请输入描述" rows={3}/>
            </Form.Item>
          </Form>
      ),
      onConfirm: (dlg: any) => {
        form.validateFields().then((values: any) => {
          // 自动设置sortOrder为列表长度+1（不显示在表单中，但需要传递给后端）
          values.sortOrder = dictItemList.length + 1;
          dispatch({
            type: 'platform/createDictItem',
            payload: {
              ...values,
              typeId: selectedDictTypeId
            },
            callback: (resp: any) => {
              if (resp?.success) {
                fetchDictItemList(selectedDictTypeId);
                dlg.doCancel();
              } else {
                error({
                  title: '新建字典项失败',
                  message: resp?.message || '未知错误'
                });
              }
            }
          });
        });
      }
    });
  };

  /**
   * 处理编辑字典项
   */
  const handleEdit = (record: any) => {
    // 只设置表单字段，不包含sortOrder（排序字段不显示但保留原值）
    const {sortOrder, ...formFields} = record;
    form.setFieldsValue(formFields);
    Dialog({
      title: `编辑${selectedDictType?.name || '字典项'}`,
      width: 500,
      content: (
          <Form form={form} layout="horizontal" labelCol={{span: 5}} wrapperCol={{span: 18}}>
            <Form.Item
                name="code"
                label="编码"
                rules={[{required: true, message: '请输入编码'}]}
            >
              <Input placeholder="请输入编码"/>
            </Form.Item>
            <Form.Item
                name="name"
                label="名称"
                rules={[{required: true, message: '请输入名称'}]}
            >
              <Input placeholder="请输入名称"/>
            </Form.Item>
            <Form.Item
                name="value"
                label="值"
                rules={[{required: true, message: '请输入值'}]}
            >
              <Input placeholder="请输入值"/>
            </Form.Item>
            <Form.Item
                name="description"
                label="描述"
            >
              <Input.TextArea placeholder="请输入描述" rows={3}/>
            </Form.Item>
          </Form>
      ),
      onConfirm: (dlg: any) => {
        form.validateFields().then((values: any) => {
          // 保留原有的sortOrder值（不显示在表单中，但更新时需要保留）
          values.sortOrder = record.sortOrder;
          dispatch({
            type: 'platform/updateDictItem',
            payload: {
              ...values,
              id: record.id
            },
            callback: (resp: any) => {
              if (resp?.success) {
                fetchDictItemList(selectedDictTypeId);
                dlg.doCancel();
              } else {
                error({
                  title: '更新字典项失败',
                  message: resp?.message || '未知错误'
                });
              }
            }
          });
        });
      }
    });
  };

  /**
   * 处理删除字典项
   */
  const handleDelete = (record: any) => {
    Dialog({
      title: '确认删除',
      width: 400,
      content: `确定要删除字典项"${record.name}"吗？`,
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'platform/deleteDictItem',
          payload: {id: record.id},
          callback: (resp: any) => {
            if (resp?.success) {
              fetchDictItemList(selectedDictTypeId);
              dlg.doCancel();
            } else {
              error({
                title: '删除字典项失败',
                message: resp?.message || '未知错误'
              });
            }
          }
        });
      }
    });
  };

  const columns = [
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      flex: 1,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        if (status === 'A') {
          return <span className="status-text status-enabled">启用</span>;
        } else if (status === 'F') {
          return <span className="status-text status-disabled">禁用</span>;
        } else {
          return <span className="status-text status-deleted">已删除</span>;
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 50,
      render: (_: any, record: any) => (
          <TableRowMenu
              items={[
                {
                  label: '编辑',
                  onClick: () => handleEdit(record)
                },
                {
                  label: '删除',
                  onClick: () => handleDelete(record),
                  danger: true
                }
              ]}
          />
      )
    }
  ];

  return (
      <div className="dict-settings-panel">
        <div className="dict-type-list">
          {dictTypeList.length === 0 ? (
              <div className="empty-tip">暂无字典类型</div>
          ) : (
              dictTypeList.map((type) => (
                  <div
                      key={type.id}
                      className={`dict-type-item ${selectedDictTypeId === type.id ? 'active' : ''}`}
                      onClick={() => handleSelectDictType(type)}
                  >
                    {type.name}
                  </div>
              ))
          )}
        </div>
        <div className="dict-item-content">
          {selectedDictType ? (
              <>
                <div className="dict-item-header">
                  <div className="header-content">
                    <span className="header-title">{selectedDictType.name}</span>
                    <Button
                        type="primary"
                        onClick={handleShowNewDialog}
                    >
                      新建
                    </Button>
                  </div>
                </div>
                <Table
                    data={dictItemList}
                    columns={columns}
                    height={tableHeight}
                    showHeader={true}
                    showEmpty={true}
                    emptyText={emptyText}
                    bordered={true}
                />
              </>
          ) : (
              <div className="empty-state">请选择一个字典类型</div>
          )}
        </div>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(DictSettingsPanel);
