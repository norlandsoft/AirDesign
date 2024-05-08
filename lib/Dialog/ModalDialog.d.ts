export default ModalDialog;
declare class ModalDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        visible: any;
        clientWidth: number;
        clientHeight: number;
        pageX: number;
        pageY: string;
        moving: boolean;
    };
    UNSAFE_componentWillReceiveProps({ visible }: {
        visible: any;
    }): void;
    componentDidMount(): void;
    resize: () => void;
    doCancel: () => void;
    open: () => void;
    getPosition: (e: any) => {
        X: any;
        Y: any;
        mouseX: number;
        mouseY: number;
        diffX: number;
        diffY: number;
    };
    /**
     * 鼠标按下，设置modal状态为可移动，并注册鼠标移动事件
     * 计算鼠标按下时，指针所在位置与modal位置以及两者的差值
     **/
    onMouseDown: (e: any) => void;
    onMouseUp: (e: any) => void;
    onMouseMove: (e: any) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
import React from 'react';
