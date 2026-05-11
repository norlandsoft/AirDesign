import React from 'react';
import './index.less';
/**
 * 可编辑标签组件
 * 功能：当鼠标悬停在标签上时显示编辑按钮，点击后可以编辑标签内容
 * 作者：ChaiMingxu
 */
interface EditableLabelProps {
    /** 标签文本内容 */
    text: string;
    /** 保存回调函数，参数为修改后的文本 */
    onSave?: (value: string) => void;
    /** 自定义样式 */
    style?: React.CSSProperties;
}
declare const EditableLabel: React.FC<EditableLabelProps>;
export default EditableLabel;
