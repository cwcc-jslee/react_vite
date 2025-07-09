// src/features/sfa/components/tables/SfaDetailPaymentTable.jsx
import React from 'react';
import { Table, Button } from '../../../../shared/components/ui/index';

/**
 * SFA 매출 상세 내역 테이블 컴포넌트
 * @param {Object} props
 * @param {Array} props.data - 매출 내역 데이터
 * @param {Function} props.onEdit - 수정 버튼 클릭 핸들러
 * @param {string} props.controlMode - 상세 보기 모드 ('view' | 'edit')
 */
const SfaDetailPaymentTable = ({
  data,
  onView,
  // onEdit,
  controlMode = 'view',
  featureMode,
  handlePaymentSelection,
  handleDeletePayment,
}) => {
  const renderLastColumn = () => {
    return controlMode === 'view' ? (
      // <Table.Th>Memo</Table.Th>
      <Table.Th>Action</Table.Th>
    ) : (
      <Table.Th>Action</Table.Th>
    );
  };

  const renderLastCell = (documentId, id) => {
    return controlMode === 'view' ? (
      // <Table.Td>{item.memo || '-'}</Table.Td>
      <Table.Td align="center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView?.({ documentId, id })}
        >
          view
        </Button>
      </Table.Td>
    ) : featureMode === 'editPayment' ? (
      <Table.Td align="center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handlePaymentSelection?.({ documentId, id })}
        >
          edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDeletePayment?.({ documentId, id })}
        >
          del
        </Button>
      </Table.Td>
    ) : (
      ''
    );
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div>
        <Table.Title>매출 내역</Table.Title>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Th>ID</Table.Th>
              <Table.Th>구분</Table.Th>
              <Table.Th>매출처</Table.Th>
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
            <Table.Th>ID</Table.Th>
            <Table.Th>매출구분</Table.Th>
            <Table.Th>매출처</Table.Th>
            <Table.Th>확정여부</Table.Th>
            <Table.Th>확률</Table.Th>
            <Table.Th>매출액</Table.Th>
            <Table.Th>매출이익</Table.Th>
            <Table.Th>매출인식일</Table.Th>
            <Table.Th>매출라벨</Table.Th>
            {renderLastColumn()}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {data.map((item, index) => (
            <Table.Row key={item.id || index}>
              <Table.Td align="center">{item.id || '-'}</Table.Td>
              <Table.Td align="center">{item.billingType || '-'}</Table.Td>
              <Table.Td align="center">
                {item?.revenueSource?.name || '-'}
              </Table.Td>
              <Table.Td align="center">
                {item.isConfirmed ? 'YES' : 'NO'}
              </Table.Td>
              <Table.Td align="center">{item.probability || '-'}</Table.Td>
              <Table.Td align="right">
                {typeof item.amount === 'number'
                  ? item.amount.toLocaleString()
                  : '-'}
              </Table.Td>
              <Table.Td align="right">
                {typeof item.profitAmount === 'number'
                  ? item.profitAmount.toLocaleString()
                  : '-'}
              </Table.Td>
              <Table.Td align="center">{item.recognitionDate || '-'}</Table.Td>
              <Table.Td align="center">{item.paymentLabel || '-'}</Table.Td>
              {renderLastCell(item.documentId, item.id)}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default SfaDetailPaymentTable;
