export default SplitPane;
declare class SplitPane extends React.Component<any, any, any> {
    static getDerivedStateFromProps(nextProps: any, prevState: any): {};
    static getSizeUpdate(props: any, state: any): {};
    constructor(props: any);
    onMouseDown(event: any): void;
    onTouchStart(event: any): void;
    onMouseMove(event: any): void;
    onTouchMove(event: any): void;
    onMouseUp(): void;
    state: {
        active: boolean;
        resized: boolean;
        pane1Size: any;
        pane2Size: any;
        instanceProps: {
            size: any;
        };
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
    splitPane: HTMLDivElement | null | undefined;
    pane1: any;
    pane2: any;
}
declare namespace SplitPane {
    namespace propTypes {
        export let allowResize: PropTypes.Requireable<boolean>;
        export let children: PropTypes.Validator<PropTypes.ReactNodeLike[]>;
        export let className: PropTypes.Requireable<string>;
        export let primary: PropTypes.Requireable<string>;
        export let minSize: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
        export let maxSize: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
        export let defaultSize: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
        export let size: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
        export let split: PropTypes.Requireable<string>;
        export let onDragStarted: PropTypes.Requireable<(...args: any[]) => any>;
        export let onDragFinished: PropTypes.Requireable<(...args: any[]) => any>;
        export let onChange: PropTypes.Requireable<(...args: any[]) => any>;
        export let onResizerClick: PropTypes.Requireable<(...args: any[]) => any>;
        export let onResizerDoubleClick: PropTypes.Requireable<(...args: any[]) => any>;
        export { stylePropType as style };
        export { stylePropType as resizerStyle };
        export let paneClassName: PropTypes.Requireable<string>;
        export let pane1ClassName: PropTypes.Requireable<string>;
        export let pane2ClassName: PropTypes.Requireable<string>;
        export { stylePropType as paneStyle };
        export { stylePropType as pane1Style };
        export { stylePropType as pane2Style };
        export let resizerClassName: PropTypes.Requireable<string>;
        export let step: PropTypes.Requireable<number>;
    }
    namespace defaultProps {
        let allowResize_1: boolean;
        export { allowResize_1 as allowResize };
        let minSize_1: number;
        export { minSize_1 as minSize };
        let primary_1: string;
        export { primary_1 as primary };
        let split_1: string;
        export { split_1 as split };
        let paneClassName_1: string;
        export { paneClassName_1 as paneClassName };
        let pane1ClassName_1: string;
        export { pane1ClassName_1 as pane1ClassName };
        let pane2ClassName_1: string;
        export { pane2ClassName_1 as pane2ClassName };
    }
}
import React from 'react';
import PropTypes from 'prop-types';
