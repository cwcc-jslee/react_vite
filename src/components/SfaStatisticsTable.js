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

const SfaStatisticsTable = ({ sumValue, totalMonth, onClick }) => {
  console.log('>>(sumvalue)>>', sumValue);
  return (
    <>
      <Base>
        <Row>
          <Col span={6} offset={0}>
            <Table
              pagination={false}
              // columns={columns}
              dataSource={sumValue[0]}
              size="small"
              // table OnClick 이벤트 처리
              onRow={(record, rowIndex) => {
                return {
                  onClick: () => {
                    // console.log('table click event', record);
                    onClick(record, totalMonth[0][0]);
                  },
                };
              }}
            >
              <Column
                title="확률"
                width={55}
                dataIndex="percentage"
                key="percentage"
                align="right"
              />

              <ColumnGroup
                title={`전월-${dayjs(totalMonth[0][0]).format('MM')}월`}
              >
                <Column
                  title="실제매출액"
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
          <Col span={8} offset={0}>
            <Table
              pagination={false}
              dataSource={sumValue[1]}
              size="small"
              // table OnClick 이벤트 처리
              onRow={(record, rowIndex) => {
                return {
                  onClick: () => {
                    onClick(record, totalMonth[1][0]);
                  },
                };
              }}
            >
              <ColumnGroup
                title={`당월-${dayjs(totalMonth[1][0]).format('MM')}월`}
              >
                <Column
                  title="예상매출액"
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
                <Column
                  title="실제매출액"
                  width={100}
                  dataIndex="cm_sales"
                  key="cm_sales"
                  align="right"
                />
                <Column
                  title="실제매출이익"
                  width={100}
                  dataIndex="cm_profit"
                  key="cm_profit"
                  align="right"
                />
              </ColumnGroup>
            </Table>
          </Col>
          <Col span={5} offset={0}>
            <Table
              pagination={false}
              dataSource={sumValue[2]}
              size="small"
              // table OnClick 이벤트 처리
              onRow={(record, rowIndex) => {
                return {
                  onClick: () => {
                    onClick(record, totalMonth[2][0]);
                  },
                };
              }}
            >
              <ColumnGroup
                title={`익월-${dayjs(totalMonth[2][0]).format('MM')}월`}
              >
                <Column
                  title="예상매출액"
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
          <Col span={5} offset={0}>
            <Table
              pagination={false}
              dataSource={sumValue[3]}
              size="small"
              // table OnClick 이벤트 처리
              onRow={(record, rowIndex) => {
                return {
                  onClick: () => {
                    onClick(record, totalMonth[3][0]);
                  },
                };
              }}
            >
              <ColumnGroup
                title={`익익월-${dayjs(totalMonth[3][0]).format('MM')}월`}
              >
                <Column
                  title="예상매출액"
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

export default SfaStatisticsTable;
