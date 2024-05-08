export const RESIZER_DEFAULT_CLASSNAME: "Resizer";
export default Resizer;
declare class Resizer extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace Resizer {
    namespace propTypes {
        export let className: PropTypes.Validator<string>;
        export let onClick: PropTypes.Requireable<(...args: any[]) => any>;
        export let onDoubleClick: PropTypes.Requireable<(...args: any[]) => any>;
        export let onMouseDown: PropTypes.Validator<(...args: any[]) => any>;
        export let onTouchStart: PropTypes.Validator<(...args: any[]) => any>;
        export let onTouchEnd: PropTypes.Validator<(...args: any[]) => any>;
        export let split: PropTypes.Requireable<string>;
        export { stylePropType as style };
        export let resizerClassName: PropTypes.Validator<string>;
    }
    namespace defaultProps {
        export { RESIZER_DEFAULT_CLASSNAME as resizerClassName };
    }
}
import React from 'react';
import PropTypes from 'prop-types';
