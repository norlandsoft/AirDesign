import React from "react";
import {Popover} from '@douyinfe/semi-ui';
import Icon from "../Icon";
import styles from './IconButton.less';

const IconButton = props => {

  const {
    name,
    size,
    tip,
    style,
    onClick,
    iconStyle = 'small'
  } = props;

  // iconStyle: 'small' | 'normal'
  const isSmallIcon = (iconStyle === 'small') ? true : false;

  const innerSize = size - 2;
  const iconSize = size - (isSmallIcon ? 18 : 14);

  const IconButtonContent = (
      <div className={styles.container} style={{height: innerSize, width: innerSize, ...style}} onClick={onClick}>
        <Icon name={name} size={iconSize} style={{padding: isSmallIcon ? '8px' : '6px'}}/>
      </div>
  );

  return (
      tip ? (
          <Popover position={'top'} showArrow={true}
                   style={{borderRadius: 'unset', padding: '6px 12px', fontSize: '0.825rem'}}
                   content={<div>{tip}</div>}
          >
            {IconButtonContent}
          </Popover>
      ) : IconButtonContent
  );
}

export default IconButton;