import React from 'react';
import { Button, Table, Space } from 'antd';
import columnsProgramList from '../../config/columnsProgramList';

const ProgramListTable = ({ tableColumns, data, handleOnclick }) => {
  const columns = [
    ...tableColumns,
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <>
          <Space size="middle">
            {/* handleDrawer : /명령-add, view, edit / id */}
            <Button onClick={() => handleOnclick(record.key)}>View</Button>
          </Space>
          <Space size="middle">
            <Button onClick={() => handleOnclick(record.key)}>제안</Button>
          </Space>
        </>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={data} />
    </>
  );
};

export default ProgramListTable;
