import React from 'react';
import ReactDOM from 'react-dom';
import {ConfigProvider} from 'antd';
import ModalDialog from './ModalDialog';

const Dialog = props => {
  const {title, content, width, message, onConfirm} = props;

  const domId = 'air-modal-dialog';
  const dialogRef = React.createRef();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(dialogRef.current);
    }
  }

  const DialogContent = (
      <ConfigProvider
          prefixCls={"air"}
      >
        <ModalDialog
            {...props}
            ref={dialogRef}
            visible={true}
            domId={domId}
            onOk={handleConfirm}
        >
          <div>{message}</div>
          <div>{content}</div>
        </ModalDialog>
      </ConfigProvider>
  );


  // 创建DOM，并在DOM上渲染对话框
  const AirDlgDom = document.createElement('div');
  AirDlgDom.setAttribute('id', domId);
  document.body.appendChild(AirDlgDom);

  ReactDOM.render(DialogContent, AirDlgDom);
}

export default Dialog;
