import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Divider,
  message,
  Radio,
  Drawer,
  Popconfirm,
} from 'antd';
//templete import
import DescriptionItemTemp from './templete/DescriptionItemTemp';
import FormItemTempSfa from './templete/FormItemTempSfa';
import setDayjsFormat from '../modules/common/setDayjsFormat';

const SfaDrawerForm = (args) => {
  const [moreinfoArrNo, setMoreinfoArrNo] = useState(0);
  const {
    drawer,
    selectBook,
    drawerTableData,
    moreinfoColumns,
    handleOnChange,
    handleOnSubmit,
    initialValues,
    recordColumns,
    drMoreFormItems,
    formItems,
    handleDfSubAction,
  } = args;

  let moreinfoColumns2;

  useEffect(() => {}, []);

  //
  // if (!initialValues) {
  //   return <h2>로딩중</h2>;
  // }

  // console.log('(selectBook)>>>>>>>>>>>>>>>>>>>>', selectBook);
  const tempTableData = drawerTableData ? drawerTableData : [];

  const tableData = tempTableData.map((data, index) => {
    console.log('***************************', data);
    const _data = data.sfa_change_records
      ? data.sfa_change_records[0].attributes
      : null;
    if (_data) {
      return {
        key: index,
        id: data.id,
        no: index + 1,
        re_payment_method: _data.re_payment_method.data.attributes.name,
        confirmed: _data.confirmed ? 'Yes' : 'No',
        sfa_percentage: _data.sfa_percentage.data.attributes.name,
        sales_revenue: _data.sales_revenue.toLocaleString(),
        sales_profit: _data.sales_profit.toLocaleString(),
        sales_rec_date: _data.sales_rec_date,
      };
    } else {
      return null;
    }
  });

  const subArrNo = drawer.sub ? drawer.sub.arrNo : 0;
  const subAction = drawer.sub ? drawer.sub.action : '';

  const changeRecords = drawerTableData
    ? drawerTableData[subArrNo].sfa_change_records
    : [];
  const recordTableData = changeRecords.map((data, index) => {
    console.log('>>>>', data.attributes);
    const _data = data.attributes;
    if (_data)
      return {
        key: data.id,
        id: data.id,
        // re_payment_method:
        confirmed: _data.confirmed ? 'Yes' : 'No',
        sfa_percentage: _data.sfa_percentage.data.attributes.name,
        sales_revenue: _data.sales_revenue.toLocaleString(),
        sfa_profit_margin: _data.sfa_profit_margin.data.attributes.name,
        profitMargin_value: _data.profitMargin_value.toLocaleString(),
        sales_profit: _data.sales_profit,
        sales_rec_date: _data.sales_rec_date,
      };
  });
  console.log('>>>(drawerTableData)>>', drawerTableData);
  //매출현황 sub button > edit 시..initvalus 설정
  const recordInitValues = () => {
    const _data = drawerTableData[subArrNo].sfa_change_records[0].attributes;
    return {
      // key: data.id,
      // id: data.id,
      re_payment_method: _data.re_payment_method.data.id,
      confirmed: _data.confirmed ? true : false,
      sfa_percentage: _data.sfa_percentage.data.id,
      sales_revenue: _data.sales_revenue,
      sfa_profit_margin: _data.sfa_profit_margin.data.id,
      profitMargin_value: _data.profitMargin_value,
      // sales_profit: _data.sales_profit,
      sales_rec_date: setDayjsFormat(_data.sales_rec_date),
      payment_date: setDayjsFormat(_data.payment_date),
    };
  };

  // drawer form > list > action 컬럼 추가
  const drSubAction = {
    title: 'Action',
    key: 'action',
    align: 'center',
    render: (_, record) => (
      <Space size="middle">
        <Button
          onClick={() => handleDfSubAction('view', record)}
          size={'small'}
        >
          View
        </Button>
        <Button
          onClick={() => handleDfSubAction('edit', record)}
          size={'small'}
        >
          Edit
        </Button>
        <Popconfirm
          title="삭제"
          placement="topLeft"
          // description="Are you sure to delete this task?"
          onConfirm={() => handleDfSubAction('del', record)}
          // onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button danger size={'small'}>
            Delete
          </Button>
        </Popconfirm>
      </Space>
    ),
  };
  moreinfoColumns2 = [...moreinfoColumns, drSubAction];

  return (
    <>
      {drawer.action === 'add' && selectBook ? (
        <>
          <FormItemTempSfa
            handleOnChange={handleOnChange}
            selectBook={selectBook}
            formItems={formItems}
            handleOnSubmit={handleOnSubmit}
          />
          {/* formItems */}
        </>
      ) : (
        ''
      )}

      {drawer.action === 'edit' && selectBook ? (
        <>
          <FormItemTempSfa
            handleOnChange={handleOnChange}
            selectBook={selectBook}
            formItems={formItems}
            handleOnSubmit={handleOnSubmit}
            initialValues={initialValues}
          />
          {/* formItems */}
        </>
      ) : (
        ''
      )}

      {(drawer.action === 'view' || drawer.action === 'sfa-add') &&
      selectBook ? (
        <>
          {initialValues ? (
            <DescriptionItemTemp
              initialValues={initialValues}
              drawer={drawer}
            />
          ) : (
            ''
          )}
          <Divider />
        </>
      ) : (
        ''
      )}

      {drawer.action === 'view' && selectBook ? (
        <>
          <Divider />
          <Table columns={moreinfoColumns2} dataSource={tableData} />
          {/* formItems */}
        </>
      ) : (
        ''
      )}

      {subAction === 'view' ? (
        <>
          <span>{`변경내용 - 결제구분 : `}</span>
          <Table columns={recordColumns} dataSource={recordTableData} />
        </>
      ) : (
        ''
      )}
      {drawer.action === 'view' && subAction === 'edit' ? (
        <>
          <span>{`수정 - 결제구분 : `}</span>
          <FormItemTempSfa
            selectBook={selectBook}
            formItems={drMoreFormItems}
            handleOnChange={handleOnChange}
            handleOnSubmit={handleOnSubmit}
            initialValues={recordInitValues()}
          />
          {/* formItems */}
        </>
      ) : (
        ''
      )}
      {drawer.action === 'sfa-add' && selectBook ? (
        <>
          <span>{`매출항목 추가 : `}</span>
          <FormItemTempSfa
            selectBook={selectBook}
            formItems={drMoreFormItems}
            handleOnChange={handleOnChange}
            handleOnSubmit={handleOnSubmit}
          />
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default SfaDrawerForm;
