import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Space } from 'antd';
import dayjs from 'dayjs';

const CustomerListTable = ({ lists, handleDrawer }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
    },
    {
      title: '기업분류',
      dataIndex: 'classification',
      key: 'classification',
    },
    {
      title: '고객명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '업태',
      dataIndex: 'bu_type',
      key: 'bu_type',
    },
    {
      title: '업종',
      dataIndex: 'bu_item',
      key: 'bu_item',
    },
    {
      title: '유입경로',
      dataIndex: 'funnel',
      key: 'funnel',
    },
    {
      title: '담당자',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          {/* handleDrawer : /명령-add, view, edit / id */}
          <Button onClick={() => handleDrawer('view', record.key)}>View</Button>
        </Space>
      ),
    },
  ];

  // const onClick = (id) => {
  //   console.log('키..', id);
  //   // project..view..코드 작성
  //   navigate(`/companies/${id}`);
  // };

  const tableData = [];
  const tableList = lists.map((list) => {
    const array = {
      key: list.id,
      id: list.id,
      name: list.name,
      classification: list.cb_classification
        ? list.cb_classification.code
        : null,
      funnel: list.cb_funnel ? list.cb_funnel.code : null,
      bu_type: list.cb_bu_type ? list.cb_bu_type[0].attributes.code : null,
      bu_item: list.cb_bu_item ? list.cb_bu_item[0].attributes.code : null,
      createdAt: dayjs(list.createdAt).format('YY-MM-DD'),
      action: 'View',
    };
    tableData.push(array);
  });
  return (
    <>
      <Table columns={columns} dataSource={tableData} />
    </>
  );
};

export default CustomerListTable;
