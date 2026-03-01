import React from 'react';
interface PaneProps {
    className: string;
    children: React.ReactNode;
    size?: string | number;
    split?: 'vertical' | 'horizontal';
    style?: React.CSSProperties;
    eleRef?: (ref: HTMLDivElement) => void;
}
declare class Pane extends React.PureComponent<PaneProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export default Pane;
