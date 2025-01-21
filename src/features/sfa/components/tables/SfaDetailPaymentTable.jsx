// src/features/sfa/components/tables/SfaDetailPaymentTable.jsx
import React from 'react';
import { Table, Button } from '../../../../shared/components/ui/index';

/**
 * SFA 매출 상세 내역 테이블 컴포넌트
 * @param {Object} props
 * @param {Array} props.data - 매출 내역 데이터
 * @param {Function} props.onEdit - 수정 버튼 클릭 핸들러
 * @param {string} props.detailMode - 상세 보기 모드 ('view' | 'edit')
 */
const SfaDetailPaymentTable = ({ data, onEdit, detailMode = 'view' }) => {
  const renderLastColumn = () => {
    return detailMode === 'view' ? (
      <Table.Th>Memo</Table.Th>
    ) : (
      <Table.Th>Action</Table.Th>
    );
  };

  const renderLastCell = (item) => {
    return detailMode === 'view' ? (
      <Table.Td>{item.memo || '-'}</Table.Td>
    ) : (
      <Table.Td align="center">
        <Button size="sm" variant="outline" onClick={() => onEdit?.(item)}>
          수정
        </Button>
      </Table.Td>
    );
  };

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
              {renderLastColumn()}
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
            {renderLastColumn()}
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
              {renderLastCell(item)}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default SfaDetailPaymentTable;
