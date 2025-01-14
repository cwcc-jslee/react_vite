import React from 'react';
import styled from 'styled-components';
import { Table } from 'antd';
import dayjs from 'dayjs';

const Base = styled.div`
  width: 100%;
`;

const SalesForecastForm = ({ sumValue, totalMonths, onClick }) => {
  const columns = [
    {
      title: '확률',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 80,
      fixed: 'left',
    },
    ...totalMonths.map((month, index) => ({
      title: dayjs(month[0]).format('YYYY-MM'),
      dataIndex: ['months', index, 'sales_revenue'],
      key: `sales_revenue_${index}`,
      width: 120,
      align: 'right',
      render: (text, record) => record.months[index]?.sales_revenue || '-',
      onCell: (record) => ({
        onClick: () => onClick(record, month),
      }),
    })),
  ];

  const dataSource = ['확정', '100%', '90%', '70%', '50%'].map(
    (percentage, index) => ({
      key: index,
      percentage,
      months: sumValue.map((monthData) =>
        monthData.find((item) => item.percentage === percentage),
      ),
    }),
  );

  return (
    <Base>
      <h1>**** 데이터 오류 ****</h1>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
      />
      <br></br>
      <h1>**** 데이터 오류 ****</h1>
    </Base>
  );
};

export default SalesForecastForm;
