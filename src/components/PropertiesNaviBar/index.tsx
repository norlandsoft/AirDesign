import React from 'react'
import {Icon} from 'air-design';
import './index.less';

type PropertiesNaviBarProps = {
  width?: number | string;
  height?: number | string;
  padding?: number | string;
  data: any;
  activeKey: string;
  onChange: (key: string) => void;
}

const PropertiesNaviBar: React.FC<PropertiesNaviBarProps> = props => {

  const {
    width,
    height,
    padding,
    data,
    activeKey,
    onChange
  } = props;

  const activeStyle = {
    background: 'rgba(18, 63, 104, 0.12)',
    color: '#123F68',
    fontWeight: '600',
  }

  const handleChange = (key: string) => {
    if (onChange) {
      onChange(key);
    }
  }

  const renderItem = (item: any) => {
    return (
        <div className='air-property-tree-item' key={item.key}
             style={item.key === activeKey ? activeStyle : {}}
             onClick={() => handleChange(item.key)}>
          <Icon name={'write'} size={16}/>
          {item.label}
        </div>
    );
  }

  return (
      <div className='air-property-tree-wrapper' style={{width, height}}>
        <div className='air-property-tree' style={{height, padding}}>
          {
            data.map((sub, index) => {
              if (sub.type === 'group') {
                return (
                    <div className='air-property-tree-group' key={sub.key}>
                      <span>{sub.label}</span>
                      {
                        sub.children.map((item, index) => {
                          return renderItem(item);
                        })
                      }
                    </div>
                )
              } else {
                return renderItem(sub);
              }

            })
          }
        </div>
      </div>
  );
}

export default PropertiesNaviBar;
