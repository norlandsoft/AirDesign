import React, {useCallback, useEffect, useState} from 'react';
import {connect} from 'umi';
import {IconButton} from 'air-design';
import CodeEditor from '@/components/CodeEditor';
import './ConfigCenterPanel.less';

/**
 * 配置中心面板
 *
 * 左右分栏布局，参考 Nacos 配置管理页面：
 * - 左栏（固定 280px）：配置项列表（名称 + configKey + 状态点）
 * - 右栏（自适应剩余宽度）：配置内容展示区（名称、Key、值编辑器）
 *
 * 布局要点：
 * - 左栏固定宽度 280px，右栏 flex:1 自适应填充剩余空间
 * - 配置值使用 CodeEditor（Monaco）只读展示 JSON 内容
 * - 表单高度自适应，不出现垂直滚动条
 *
 * 数据来源：
 * - 配置列表: POST /admin/paas/config/all
 *
 * Created by ChaiMingXu, on 2026/4/4
 * 更新时间: 2026/4/8 - 改为列表展示 + 只读表单
 */

/** 配置项数据结构 */
interface ConfigItem {
  configKey: string;
  label: string;
  config: Record<string, any>;
}

/** 左栏固定宽度 */
const LEFT_WIDTH = 280;

const ConfigCenterPanel: React.FC<any> = (props) => {
  const {frameSize, dispatch} = props;

  const [configList, setConfigList] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  /** 面板总尺寸 */
  const panelHeight = frameSize?.height || 600;

  /** 左栏列表区域高度 */
  const listHeight = panelHeight - 48;

  /** 右栏编辑器高度 = 总高 - 标题栏 - 表单行高度 */
  const editorHeight = panelHeight - 48 - 36 - 16 - 36 - 16 - 36;

  /**
   * 获取所有运行时配置
   */
  const fetchConfigs = useCallback(() => {
    if (!dispatch) return;
    setLoading(true);
    dispatch({
      type: 'platform/fetchAllConfigs',
      callback: (resp: any) => {
        setLoading(false);
        if (resp?.success) {
          setConfigList(resp.data || []);
        }
      },
    });
  }, [dispatch]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  /** 当前选中的配置项 */
  const selectedItem = configList.find((item) => item.configKey === selectedKey);

  /** 配置 JSON 字符串 */
  const configJson = selectedItem?.config
      ? JSON.stringify(selectedItem.config, null, 2)
      : '';

  return (
      <div className="cc-root" style={{height: panelHeight}}>
        {/* 左栏：配置项列表 */}
        <div className="cc-left">
          <div className="cc-left-header">
            <span className="cc-left-header-title">配置项</span>
            <IconButton icon="reload" tooltip="刷新" size={20} bordered onClick={fetchConfigs}/>
          </div>
          <div className="cc-left-list" style={{height: listHeight}}>
            {loading && <div className="cc-left-empty">加载中...</div>}
            {!loading && configList.length === 0 && (
                <div className="cc-left-empty">暂无配置数据</div>
            )}
            {configList.map((item) => {
              const hasConfig = item.config && Object.keys(item.config).length > 0;
              const isActive = selectedKey === item.configKey;
              return (
                  <div
                      key={item.configKey}
                      className={`cc-left-item ${isActive ? 'cc-left-item-active' : ''}`}
                      onClick={() => setSelectedKey(item.configKey)}
                  >
                    <div className="cc-left-item-top">
                      <span className="cc-left-item-name">{item.label || item.configKey}</span>
                      {hasConfig
                          ? <span className="cc-left-item-dot cc-left-item-dot-on"/>
                          : <span className="cc-left-item-dot cc-left-item-dot-off"/>
                      }
                    </div>
                    <div className="cc-left-item-key">{item.configKey}</div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* 右栏：配置内容展示 */}
        <div className="cc-right">
          <div className="cc-right-header">
            <span className="cc-right-header-title">
              {selectedItem ? (selectedItem.label || selectedItem.configKey) : '配置内容'}
            </span>
          </div>

          <div className="cc-right-form">
            {selectedItem ? (
                <>
                  <div className="cc-form-row">
                    <label className="cc-form-label">配置Key</label>
                    <div className="cc-form-value">{selectedItem.configKey}</div>
                  </div>

                  <div className="cc-form-row cc-form-row-editor">
                    <label className="cc-form-label">配置值</label>
                    <div className="cc-form-editor">
                      <CodeEditor
                          content={configJson}
                          language="json"
                          width="100%"
                          height={Math.max(editorHeight, 200)}
                          readOnly={true}
                          wordWrap="on"
                          border={false}
                          lineNumbers={true}
                      />
                    </div>
                  </div>
                </>
            ) : (
                <div className="cc-right-empty">请在左侧选择配置项</div>
            )}
          </div>
        </div>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(ConfigCenterPanel);
