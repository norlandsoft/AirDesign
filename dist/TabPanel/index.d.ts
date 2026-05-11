import React from 'react';
import './index.less';
interface TabItemProps {
    key: string;
    label: string;
    icon?: any;
    closable: boolean;
    children: React.ReactNode;
}
interface TabPanelProps {
    height: number;
    width: number;
    items: TabItemProps[];
    currentTab: TabItemProps;
    onChangeTab?: (tab: any) => void;
    onRemoveTab?: (tab: any) => void;
    tabHeight?: number;
}
declare const TabPanel: React.FC<TabPanelProps>;
export default TabPanel;
