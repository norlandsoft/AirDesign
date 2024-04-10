import React from "react";
import { createRoot } from 'react-dom/client';
import UploadModalDialog from "./UploadModalDialog";

const UploadDialog = props => {

  const dlgId = 'air-upload-dialog';
  // 添加DOM
  const AirDlgDom = document.createElement('div');
  AirDlgDom.setAttribute('id', dlgId);
  document.body.appendChild(AirDlgDom);

  const root = createRoot(AirDlgDom);
  root.render(<UploadModalDialog {...props} />);
}

export default UploadDialog;