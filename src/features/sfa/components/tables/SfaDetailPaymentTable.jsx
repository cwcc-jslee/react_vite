// src/features/sfa/components/tables/SfaDetailPaymentTable.jsx
import React from 'react';
import { Table, Button } from '../../../../shared/components/ui/index';

const SfaDetailPaymentTable = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div>
        <Table.Title>매출 내역</Table.Title>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Th>구분</Table.Th>
              <Table.Th>확정여부</Table.Th>
              <Table.Th>확률</Table.Th>
              <Table.Th>매출액</Table.Th>
              <Table.Th>매출이익</Table.Th>
              <Table.Th>매출인식일</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Td colSpan={7} className="text-center">
                등록된 매출 내역이 없습니다.
              </Table.Td>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }

  return (
    <div>
      <Table.Title>매출 내역</Table.Title>
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Th>구분</Table.Th>
            <Table.Th>확정여부</Table.Th>
            <Table.Th>확률</Table.Th>
            <Table.Th>매출액</Table.Th>
            <Table.Th>매출이익</Table.Th>
            <Table.Th>매출인식일</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {data.map((item, index) => (
            <Table.Row key={item.id || index}>
              <Table.Td>{item.billing_type || '-'}</Table.Td>
              <Table.Td align="center">
                {item.is_confirmed ? 'YES' : 'NO'}
              </Table.Td>
              <Table.Td align="center">{item.probability || '-'}</Table.Td>
              <Table.Td align="right">
                {typeof item.amount === 'number'
                  ? item.amount.toLocaleString()
                  : '-'}
              </Table.Td>
              <Table.Td align="right">
                {typeof item.profit_amount === 'number'
                  ? item.profit_amount.toLocaleString()
                  : '-'}
              </Table.Td>
              <Table.Td align="center">{item.recognition_date || '-'}</Table.Td>
              <Table.Td align="center">
                <Button
                  size="sm"
                  variant="outline"
                  // onClick={() => onEdit?.(item)}
                >
                  수정
                </Button>
              </Table.Td>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default SfaDetailPaymentTable;
