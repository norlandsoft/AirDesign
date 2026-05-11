import React from 'react';
import './ModalDialog.less';
interface ModalDialogProps {
    visible?: boolean;
    children?: React.ReactNode;
    onInit?: (ref: ModalDialog) => void;
    onCancel?: () => void;
    domId?: string;
    okText?: string;
    onOk?: () => void;
    cancelText?: string;
    confirmable?: boolean;
    closable?: boolean;
    width?: number | string;
    height?: number | string;
    title?: React.ReactNode;
    showFooter?: boolean;
    headerColor?: string;
    headerBgColor?: string;
    contentBgColor?: string;
    footerBgColor?: string;
    mask?: boolean;
    loading?: boolean;
}
interface ModalDialogState {
    visible: boolean;
    clientWidth: number;
    clientHeight: number;
    pageX: number;
    pageY: number;
    moving: boolean;
    diffX?: number;
    diffY?: number;
}
declare class ModalDialog extends React.Component<ModalDialogProps, ModalDialogState> {
    constructor(props: ModalDialogProps);
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
     * 计算鼠标按下时，指针所在位与modal位置以及两者的差值
     **/
    onMouseDown: (e: any) => void;
    onMouseUp: (e: any) => void;
    onMouseMove: (e: any) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default ModalDialog;
