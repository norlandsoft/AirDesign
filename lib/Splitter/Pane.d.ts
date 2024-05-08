export default Pane;
declare class Pane extends React.PureComponent<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace Pane {
    namespace propTypes {
        export let className: PropTypes.Validator<string>;
        export let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
        export let size: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
        export let split: PropTypes.Requireable<string>;
        export { stylePropType as style };
        export let eleRef: PropTypes.Requireable<(...args: any[]) => any>;
    }
    let defaultProps: {};
}
import React from 'react';
import PropTypes from 'prop-types';
