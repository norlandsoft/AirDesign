import React from 'react';
import './index.less';
interface ListProps {
    title?: string;
    buttonPanel?: React.ReactNode;
    data?: any[];
    rowSelectable?: boolean;
    onRowClick?: (item: any) => void;
    selectedRow?: any;
    itemIcon?: string;
    leftRender?: (item: any) => React.ReactNode;
    tagRender?: (item: any) => React.ReactNode;
    itemMenu?: (item: any) => any;
    width?: number;
    height?: number;
    labelMaxWidth?: number;
}
declare const List: React.FC<ListProps>;
export default List;
