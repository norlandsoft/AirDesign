import React, {useState} from "react";
import {Typography} from "antd";
import {Button, Dropdown, Input, Tree} from '@douyinfe/semi-ui';
import Icon from "../Icon";
import './index.less';

const AirTree = props => {

  const {
    data,
    height = 200,
    showFilter = false,
    folderIcon = 'folder',
    itemIcon = 'item',
    groupMenu,
    itemMenu,
    rootButtonClick,
    menuItemClick,
    onSelect,
    defaultExpandedKeys = [],
    groupCollapsed = false
  } = props;

  const [keys, setKeys] = useState(defaultExpandedKeys);

  const handleRootButtonClick = () => {
    if (rootButtonClick) {
      rootButtonClick();
    }
  }

  const handleMenuItemClick = (info, data) => {
    if (menuItemClick) {
      menuItemClick(info, data);
    }
  }

  const randomString = (len) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let r = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < len; i++) {
      r += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    return r;
  }

  const renderMenuBar = (data, menu) => {
    return menu ? (
        <Dropdown.Menu>
          {
            menu.map(item => {
              return item.type === 'divider' ? <Dropdown.Divider key={randomString(8)}/> :
                  <Dropdown.Item style={{minWidth: '100px'}} key={item.key}
                                 onClick={e => handleMenuItemClick(item, data)}>{item.label}</Dropdown.Item>
            })
          }
        </Dropdown.Menu>
    ) : null;
  }

  const itemSelect = (key, _, node) => {
    !groupCollapsed ? (() => {
      const f = keys.find(item => item === key);
      if (!f && node.children) {
        // 展开
        const newKeys = keys.concat([key]);
        setKeys(newKeys);
      }
    })() : null

    // 事件响应
    if (onSelect) {
      onSelect(node);
    }
  }

  const itemExpand = keyArray => {
    setKeys(keyArray);
  }

  const renderLabel = (label, data) => {
    return (
        <div className={'air-tree-label'}>
          <div style={{paddingRight: '4px'}}>
            {
              data.img ? <Icon name={data.img} size={16}/> :
                  <Icon name={data.type === 'group' ? folderIcon : itemIcon} size={16}/>
            }
          </div>
          <Typography.Text
              ellipsis={{tooltip: data.label}}
          >
            {data.label}
          </Typography.Text>
          {
            (data.type === 'group' && (data.menu || groupMenu)) || (data.type === 'item' && (data.menu || itemMenu)) ? (
                <Dropdown
                    trigger={'click'}
                    position={'bottomRight'}
                    zIndex={100}
                    render={
                      data.menu ? renderMenuBar(data, data.menu) : (
                          data.type === 'group' ? renderMenuBar(data, groupMenu) : renderMenuBar(data, itemMenu)
                      )
                    }
                    clickToHide={true}
                    stopPropagation={true}
                >
                  <Button
                      onClick={e => {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                      }}
                      icon={<Icon name={'more'} size={16}/>}
                      size="small"
                  />
                </Dropdown>
            ) : null
          }
        </div>
    )
  };

  const searchRender = props => {
    return (
        <Input {...props}/>
    );
  }

  return (
      <div
          className={'air-tree-wrapper'}
          style={{height: height}}
      >
        {
          showFilter ? (
              <Button className={'air-tree-root-button'} onClick={handleRootButtonClick}>
                <Icon name={'add'} size={20}/>
              </Button>
          ) : null
        }
        <Tree
            {...props}
            treeData={data}
            className={'air-tree'}
            filterTreeNode={showFilter}
            showFilteredOnly={showFilter}
            renderLabel={renderLabel}
            searchRender={searchRender}
            onSelect={itemSelect}
            onExpand={itemExpand}
            expandedKeys={keys}
            expandAction={groupCollapsed ? 'click' : null}
            disableStrictly={true}
            emptyContent={' '}
            virtualize={{
              height: showFilter ? height - 48 : height,
              itemSize: 32
            }}
        />
      </div>
  );
}

export default AirTree;