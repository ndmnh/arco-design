import React, { useContext, useEffect, useState } from 'react';
import cs from '../_util/classNames';
import Checkbox, { CheckboxProps } from '../Checkbox';
import Button from '../Button';
import Input from '../Input';
import List from '../List';
import Item from './item';
import { TransferItem, TransferListProps } from './interface';
import IconSearch from '../../icon/react-icon/IconSearch';
import IconDelete from '../../icon/react-icon/IconDelete';
import IconHover from '../_class/icon-hover';
import { ConfigContext } from '../ConfigProvider';

export const TransferList = (props: TransferListProps, ref) => {
  const {
    style,
    prefixCls,
    className,
    listType,
    dataSource,
    selectedKeys = [],
    validKeys,
    selectedDisabledKeys,
    selectedStatus,
    title = '',
    disabled,
    draggable,
    allowClear,
    showSearch,
    showFooter,
    searchPlaceholder,
    render,
    renderList,
    pagination,
    handleSelect,
    handleRemove,
    filterOption,
    onSearch,
    onResetData,
    onDragStart,
    onDragEnd,
    onDragLeave,
    onDragOver,
    onDrop,
  } = props;

  const baseClassName = `${prefixCls}-view`;

  const { locale } = useContext(ConfigContext);
  const [dragItem, setDragItem] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [itemsToRender, setItemsToRender] = useState(dataSource);

  useEffect(() => {
    setItemsToRender(
      filterText ? dataSource.filter((item) => filterOption(filterText, item)) : dataSource
    );
  }, [dataSource, filterText, filterOption]);

  // 处理单个条目复选框改变
  const handleItemChecked = (key, checked) =>
    handleSelect(checked ? selectedKeys.concat(key) : selectedKeys.filter((_key) => _key !== key));
  // 处理全选复选框改变，始终避免操作已禁用的选项
  const handleItemAllChecked = (keys, checked) =>
    handleSelect(checked ? keys.concat(selectedDisabledKeys) : [...selectedDisabledKeys]);
  const clearItems = () => handleRemove(validKeys);

  const renderHeader = () => {
    const checkboxProps: Partial<CheckboxProps<any>> = {
      disabled,
      checked: selectedStatus === 'all',
      indeterminate: selectedStatus === 'part',
      onChange: (checked) => handleItemAllChecked(validKeys, checked),
    };

    if (typeof title === 'function') {
      return title({
        countTotal: dataSource.length,
        countSelected: selectedKeys.length,
        clear: clearItems,
        checkbox: <Checkbox {...checkboxProps} />,
      });
    }

    return allowClear ? (
      <>
        <span className={`${baseClassName}-header-title`}>{title}</span>
        {!disabled && validKeys.length ? (
          <IconHover className={`${baseClassName}-icon-clear`} onClick={clearItems}>
            <IconDelete />
          </IconHover>
        ) : null}
      </>
    ) : (
      <>
        <span className={`${baseClassName}-header-title`}>
          <Checkbox {...checkboxProps}>{title}</Checkbox>
        </span>
        <span className={`${baseClassName}-header-unit`}>
          {`${selectedKeys.length} / ${dataSource.length}`}
        </span>
      </>
    );
  };

  const renderListBody = () => {
    const customList =
      renderList &&
      renderList({
        listType,
        disabled,
        selectedKeys,
        validKeys,
        selectedDisabledKeys,
        filteredItems: itemsToRender,
        onItemRemove: (key) => handleRemove([key]),
        onItemSelect: handleItemChecked,
        onItemSelectAll: handleItemAllChecked,
      });

    return customList ? (
      <div className={`${baseClassName}-custom-list`}>{customList}</div>
    ) : (
      <List
        wrapperClassName={`${baseClassName}-list`}
        dataSource={itemsToRender}
        render={(item: TransferItem) => (
          <Item
            key={item.key}
            prefixCls={prefixCls}
            item={item}
            disabled={disabled}
            draggable={draggable}
            droppable={!!dragItem}
            allowClear={allowClear}
            render={render}
            selectedKeys={selectedKeys}
            onItemSelect={(key, selected) => handleItemChecked(key, selected)}
            onItemRemove={(key) => handleRemove([key])}
            onDragStart={(e, item) => {
              setDragItem(item);
              onDragStart && onDragStart(e, item);
            }}
            onDragEnd={(e, item) => {
              setDragItem(null);
              onDragEnd && onDragEnd(e, item);
            }}
            onDragLeave={(e, item) => onDragLeave && onDragLeave(e, item)}
            onDragOver={(e, item) => onDragOver && onDragOver(e, item)}
            onDrop={(e, dropItem, dropPosition) => {
              if (onDrop && dragItem && dragItem.key !== dropItem.key) {
                onDrop({
                  e,
                  dropItem,
                  dropPosition,
                  dragItem,
                });
              }
            }}
          />
        )}
        pagination={
          pagination
            ? {
                simple: true,
                size: 'mini',
                ...(typeof pagination === 'object' ? pagination : {}),
              }
            : undefined
        }
        bordered={false}
        paginationInFooter
        footer={
          showFooter === true ? (
            <Button size="mini" disabled={disabled} onClick={onResetData}>
              {locale.Transfer.resetText}
            </Button>
          ) : (
            showFooter || null
          )
        }
      />
    );
  };

  return (
    <div ref={ref} className={cs(baseClassName, className)} style={style}>
      <div className={`${baseClassName}-header`}>{renderHeader()}</div>

      {showSearch && (
        <div className={`${baseClassName}-search`}>
          <Input
            size="small"
            disabled={disabled}
            placeholder={searchPlaceholder}
            suffix={<IconSearch />}
            onChange={(value) => {
              setFilterText(value);
              onSearch && onSearch(value);
            }}
          />
        </div>
      )}

      {renderListBody()}
    </div>
  );
};

const TransferListComponent = React.forwardRef(TransferList);

export default TransferListComponent;
