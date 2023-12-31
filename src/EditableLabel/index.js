import React, {useEffect, useState} from "react";
import {Input, Form} from 'antd';
import Icon from '../Icon';
import styles from './index.less';

const EditableLabel = props => {

  const {
    text,
    onSave,
    style
  } = props;

  const [labelForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);

  useEffect(() => {

    setCurrentText(text);

    if (editing) {
      setEditing(false);
    }

    return () => {
      setCurrentText('');
    }
  }, [text]);

  const handleSaveText = () => {
    labelForm.validateFields().then(values => {
      const {label} = values;
      if (label === currentText) {
        setEditing(false);
        return;
      }

      if (values) {
        if (onSave) onSave(label);
        setEditing(false);
      }
    }).catch(err => {
    });
  }

  return (
      <div className={styles.container} style={style}>
        {
          editing ? (
              <div className={styles.editor}>
                <Form form={labelForm}>
                  <Form.Item
                      name={'label'}
                      rules={[{required: true, message: ''}]}
                  >
                    <Input addonAfter={
                      <div style={{display: 'flex'}}>
                        <div style={{margin: '0 8px 0 4px'}} onClick={handleSaveText}>
                          <Icon name={'ok'} size={20}/>
                        </div>
                        <div onClick={() => {
                          labelForm.setFieldsValue({label: currentText});
                          setEditing(false);
                        }}>
                          <Icon name={'cancel'} size={20}/>
                        </div>
                      </div>
                    }/>
                  </Form.Item>
                </Form>
              </div>
          ) : (
              <div className={styles.label}>
                {currentText}
                <div onClick={() => {
                  labelForm.setFieldsValue({label: currentText});
                  setEditing(true);
                }}>
                  <Icon name={'edit'} size={14} style={{marginLeft: '8px'}}/>
                </div>
              </div>
          )
        }
      </div>
  );
}

export default EditableLabel;