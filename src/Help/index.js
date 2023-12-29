import React from 'react';
import Icon from '../Icon';
import {Tooltip} from 'antd';

const Help = props => {

  const {
    icon = 'help',
    size = 14,
    text = ''
  } = props;

  return (
      <Tooltip placement="top" title={text}>
        <div style={{margin: '0 4px'}}>
          <Icon name={icon} size={size}/>
        </div>
      </Tooltip>
  );
}

export default Help;