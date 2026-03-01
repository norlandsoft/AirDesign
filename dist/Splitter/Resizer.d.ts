import React from 'react';
export declare const RESIZER_DEFAULT_CLASSNAME = "Resizer";
interface ResizerProps {
    className: string;
    onClick?: (event: React.MouseEvent) => void;
    onDoubleClick?: (event: React.MouseEvent) => void;
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
    split?: 'vertical' | 'horizontal';
    style?: React.CSSProperties;
    resizerClassName: string;
}
declare class Resizer extends React.Component<ResizerProps> {
    static defaultProps: {
        resizerClassName: string;
    };
    render(): import("react/jsx-runtime").JSX.Element;
}
export default Resizer;
