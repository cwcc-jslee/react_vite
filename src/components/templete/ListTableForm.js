import React from 'react';
import { Button, Table, Space } from 'antd';

const ListTableForm = ({ tableColumns, tableActionForm, tableData }) => {
  const columns = [...tableColumns, tableActionForm];
  // console.log('@@@', columns);

  return (
    <>
      <Table columns={columns} dataSource={tableData} />
    </>
  );
};

export default ListTableForm;
