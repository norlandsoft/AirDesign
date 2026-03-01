import React from 'react';
import './index.less';
interface TreeProps {
    data: any[];
    height?: number;
    showFilter?: boolean;
    folderIcon?: string;
    itemIcon?: string;
    groupMenu?: any[];
    itemMenu?: any[];
    rootButtonClick?: () => void;
    menuItemClick?: (info: any, data: any) => void;
    onSelect?: (info: any) => void;
    onChange?: (info: any) => void;
    value?: string;
    defaultValue?: string | string[];
    defaultExpandedKeys?: string[];
    expandedKeys?: string[];
    onExpand?: (expandedKeys: string[]) => void;
    clickToCollapse?: boolean;
    draggable?: boolean;
    onDrop?: (info: any) => void;
    autoExpandParent?: boolean;
    stopMenuEventPropagation?: boolean;
    checkable?: boolean;
}
declare const AirTree: React.FC<TreeProps>;
export default AirTree;
