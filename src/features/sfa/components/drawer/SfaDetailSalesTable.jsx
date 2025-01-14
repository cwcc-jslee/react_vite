// src/features/sfa/components/drawer/SfaDetailSalesTable.jsx
import React from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
`;

const Th = styled.th`
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
`;

const Td = styled.td`
  padding: 12px;
  border: 1px solid #e5e7eb;
  text-align: ${(props) => props.align || 'left'};
  font-size: 12px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 11px;

  &:hover {
    background: #f9fafb;
  }
`;

const TableTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #111827;
`;

const SfaSalesTable = ({ data, onEdit }) => {
  console.log('SfaSalesTable data:', data); // 데이터 확인용 로그

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <TableContainer>
        <TableTitle>매출 내역</TableTitle>
        <Table>
          <thead>
            <tr>
              <Th>구분</Th>
              <Th>확정여부</Th>
              <Th>확률</Th>
              <Th>매출액</Th>
              <Th>매출이익</Th>
              <Th>매출인식일</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td colSpan="7" style={{ textAlign: 'center' }}>
                등록된 매출 내역이 없습니다.
              </Td>
            </tr>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <TableTitle>매출 내역</TableTitle>
      <Table>
        <thead>
          <tr>
            <Th>구분</Th>
            <Th>확정여부</Th>
            <Th>확률</Th>
            <Th>매출액</Th>
            <Th>매출이익</Th>
            <Th>매출인식일</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id || index}>
              <Td>{item.re_payment_method?.name || '-'}</Td>
              <Td align="center">{item.confirmed ? 'YES' : 'NO'}</Td>
              <Td align="center">{item.sfa_percentage?.name || '-'}</Td>
              <Td align="right">
                {typeof item.sales_revenue === 'number'
                  ? item.sales_revenue.toLocaleString()
                  : '-'}
              </Td>
              <Td align="right">
                {typeof item.sales_profit === 'number'
                  ? item.sales_profit.toLocaleString()
                  : '-'}
              </Td>
              <Td align="center">{item.sales_rec_date || '-'}</Td>
              <Td align="center">
                <ActionButton onClick={() => onEdit?.(item)}>수정</ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default SfaSalesTable;
