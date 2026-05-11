import React from 'react';
import './toggle.less';
interface SplitPaneProps {
    allowResize?: boolean;
    collapsible?: boolean;
    togglePosition?: number;
    children: React.ReactNode[];
    className?: string;
    primary?: 'first' | 'second';
    minSize?: string | number;
    maxSize?: string | number;
    defaultSize?: string | number;
    size?: string | number;
    split?: 'vertical' | 'horizontal';
    onDragStarted?: () => void;
    onDragFinished?: (draggedSize: number) => void;
    onChange?: (newSize: number) => void;
    onResize?: (newSize: number, collapsed: boolean) => void;
    onResizerClick?: (e: React.MouseEvent) => void;
    onResizerDoubleClick?: (e: React.MouseEvent) => void;
    style?: React.CSSProperties;
    resizerStyle?: React.CSSProperties;
    paneClassName?: string;
    pane1ClassName?: string;
    pane2ClassName?: string;
    paneStyle?: React.CSSProperties;
    pane1Style?: React.CSSProperties;
    pane2Style?: React.CSSProperties;
    resizerClassName?: string;
    step?: number;
}
interface SplitPaneState {
    active: boolean;
    resized: boolean;
    collapsed: boolean;
    pane1Size?: number;
    pane2Size?: number;
    position?: number;
    draggedSize?: number;
    instanceProps: {
        size?: string | number;
    };
}
declare class SplitPane extends React.Component<SplitPaneProps, SplitPaneState> {
    private splitPane;
    private pane1;
    private pane2;
    static defaultProps: {
        allowResize: boolean;
        collapsible: boolean;
        togglePosition: number;
        minSize: number;
        primary: string;
        split: string;
        paneClassName: string;
        pane1ClassName: string;
        pane2ClassName: string;
    };
    constructor(props: SplitPaneProps);
    componentDidMount(): void;
    static getDerivedStateFromProps(nextProps: SplitPaneProps, prevState: SplitPaneState): Partial<SplitPaneState>;
    componentWillUnmount(): void;
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    private onMouseMove;
    private onMouseUp;
    private onTouchMove;
    static getSizeUpdate(props: SplitPaneProps, state: SplitPaneState): Partial<SplitPaneState>;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default SplitPane;
