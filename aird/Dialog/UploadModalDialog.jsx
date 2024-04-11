import React, {useState} from 'react';
import ModalDialog from './ModalDialog';
import {Upload} from 'antd';
import {Icon, error, success, info} from '@/components/air-design';
import './UploadModalDialog.less';

const {Dragger} = Upload;

const dialogRef = React.createRef();

const UploadModalDialog = props => {

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {
    url = '/upload', // 上传文件的URL
    onFileSaved,
    type = 'file', // file, image, video, audio
    group = '',
  } = props;

  const confirmUpload = () => {
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files', file);
    });
    formData.append('type', type);
    formData.append('group', group);

    if (fileList.length === 0) {
      info({
        message: '请选择要上传的文件'
      });
      return;
    }

    setUploading(true);

    fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('air-auth-token'),
      },
      body: formData
    }).then(response => response.json()).then(resp => {
      if (resp.success) {
        setFileList([]);
        setUploading(false);
        success({
          message: '文件上传成功',
        });
        if (onFileSaved) onFileSaved();

        // 关闭对话框
        dialogRef.current.doCancel();
      } else {
        setUploading(false);
        error({
          title: '无法上传文件',
          message: resp.message
        });
      }
    }).catch(err => {
      setUploading(false);
      error({
        message: '文件上传失败',
      });
    });
  }

  const uploadProps = {
    multiple: true,
    onRemove: file => {
      setFileList(list => {
        const index = list.indexOf(file);
        const newFileList = list.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: file => {
      setFileList(list => {
        return [...list, file];
      });
      return false;
    },
    fileList,
  };

  return (
    <ModalDialog
      ref={dialogRef}
      visible={true}
      title='文件上传'
      width={600}
      onOk={confirmUpload}
      domId={'air-upload-dialog'}
      mask={uploading}
    >
      <Dragger
        {...uploadProps}
      >
        <p>
          <Icon name={'upload'} size={32} color={'#1890ff'}/>
        </p>
        <p>点击或将文件拖拽到此处上传</p>
      </Dragger>
    </ModalDialog>
  );
}

export default UploadModalDialog;