import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Table, Space, Row, Col } from 'antd';
// import moment from 'moment';
import dayjs from 'dayjs';

const { Column, ColumnGroup } = Table;

const Base = styled.div`
  width: 100%;
`;

const CustomerStatisticsTable = ({ totalMonth, onClick }) => {
  // console.log('>>(sumvalue)>>', sumValue);
  return (
    <>
      <Base>
        <Row>
          <Col span={5} offset={0}>
            <Table
              pagination={false}
              // columns={columns}
              // dataSource={sumValue[0]}
              size="small"
              // table OnClick 이벤트 처리
              // onRow={(record, rowIndex) => {
              //   return {
              //     onClick: () => {
              //             onClick(record, totalMonth[0][0]);
              //     },
              //   };
              // }}
            >
              <ColumnGroup
                // title={`전월-${dayjs(totalMonth[0][0]).format('MM')}월`}
                title={`기업분류`}
              >
                <Column
                  title="기업분류"
                  width={100}
                  dataIndex="sales_revenue"
                  key="sales_revenue"
                  align="right"
                />
                <Column
                  title="실제매출이익"
                  width={100}
                  dataIndex="sales_profit"
                  key="sales_profit"
                  align="right"
                />
              </ColumnGroup>
            </Table>
          </Col>
          <Col span={5} offset={1}>
            <Table
              pagination={false}
              // dataSource={sumValue[1]}
              size="small"
              // table OnClick 이벤트 처리
              // onRow={(record, rowIndex) => {
              //   return {
              //     onClick: () => {
              //       onClick(record, totalMonth[1][0]);
              //     },
              //   };
              // }}
            >
              <ColumnGroup title={`기업규모`}>
                <Column
                  title="기업규모"
                  width={100}
                  dataIndex="sales_revenue"
                  key="sales_revenue"
                  align="right"
                />
                <Column
                  title="예상매출이익"
                  width={100}
                  dataIndex="sales_profit"
                  key="sales_profit"
                  align="right"
                />
              </ColumnGroup>
            </Table>
          </Col>
          <Col span={5} offset={1}>
            <Table
              pagination={false}
              // dataSource={sumValue[2]}
              size="small"
              // table OnClick 이벤트 처리
              // onRow={(record, rowIndex) => {
              //   return {
              //     onClick: () => {
              //       onClick(record, totalMonth[2][0]);
              //     },
              //   };
              // }}
            >
              <ColumnGroup title={`신규고객`}>
                <Column
                  title="구분"
                  width={100}
                  dataIndex="sales_revenue"
                  key="sales_revenue"
                  align="right"
                />
                <Column
                  title="예상매출이익"
                  width={100}
                  dataIndex="sales_profit"
                  key="sales_profit"
                  align="right"
                />
              </ColumnGroup>
            </Table>
          </Col>
          <Col span={5} offset={1}>
            <Table
              pagination={false}
              // dataSource={sumValue[3]}
              size="small"
              // table OnClick 이벤트 처리
              // onRow={(record, rowIndex) => {
              //   return {
              //     onClick: () => {
              //       onClick(record, totalMonth[3][0]);
              //     },
              //   };
              // }}
            >
              <ColumnGroup title={`지원사업`}>
                <Column
                  title="구분"
                  width={100}
                  dataIndex="sales_revenue"
                  key="sales_revenue"
                  align="right"
                />
                <Column
                  title="예상매출이익"
                  width={100}
                  dataIndex="sales_profit"
                  key="sales_profit"
                  align="right"
                />
              </ColumnGroup>
            </Table>
          </Col>
        </Row>
      </Base>
    </>
  );
};

export default CustomerStatisticsTable;
