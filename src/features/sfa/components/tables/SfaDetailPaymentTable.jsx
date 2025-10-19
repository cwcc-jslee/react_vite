// src/features/sfa/components/tables/SfaDetailPaymentTable.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Table, Button, Badge } from '../../../../shared/components/ui/index';

/**
 * SFA 매출 상세 내역 테이블 컴포넌트
 * @param {Object} props
 * @param {Array} props.data - 매출 내역 데이터
 * @param {boolean} props.isMultiTeam - 다중 사업부 여부
 * @param {Function} props.onEdit - 수정 버튼 클릭 핸들러
 * @param {string} props.controlMode - 상세 보기 모드 ('view' | 'edit')
 */
const SfaDetailPaymentTable = ({
  data,
  isMultiTeam = false,
  onView,
  // onEdit,
  controlMode = 'view',
  featureMode,
  handlePaymentSelection,
  handleDeletePayment,
}) => {
  // 확장/축소 상태 관리
  const [expandedRows, setExpandedRows] = useState({});

  // Row 확장/축소 토글
  const toggleRow = (paymentId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }));
  };
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
      <Table.Td align="center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView?.({ documentId, id })}
          className="text-gray-600 hover:text-gray-900"
        >
          view
        </Button>
      </Table.Td>
    ) : featureMode === 'editPayment' ? (
      <Table.Td align="center">
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePaymentSelection?.(documentId)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            수정
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeletePayment?.({ documentId, id })}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            삭제
          </Button>
        </div>
      </Table.Td>
    ) : (
      <Table.Td></Table.Td>
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
              {isMultiTeam ? (
                <Table.Th>
                  <div className="flex flex-col items-center">
                    <span>사업부</span>
                    <span>매출</span>
                  </div>
                </Table.Th>
              ) : (
                <Table.Th>매출이익</Table.Th>
              )}
              <Table.Th>매출인식일</Table.Th>
              {renderLastColumn()}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Td colSpan={isMultiTeam ? 9 : 9} className="text-center">
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
            {isMultiTeam ? (
              <Table.Th>
                <div className="flex flex-col items-center">
                  <span>사업부</span>
                  <span>매출</span>
                </div>
              </Table.Th>
            ) : (
              <Table.Th>매출이익</Table.Th>
            )}
            <Table.Th>매출인식일</Table.Th>
            <Table.Th>매출라벨</Table.Th>
            {renderLastColumn()}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {data.map((item, index) => {
            const isExpanded = expandedRows[item.id];
            const teamCount = item.teamAllocations?.length || 0;

            return (
              <React.Fragment key={item.id || index}>
                {/* 메인 Row */}
                <Table.Row>
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

                  {/* 다중 사업부: 배분 버튼, 단일 사업부: 매출이익 */}
                  {isMultiTeam ? (
                    <Table.Td align="center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleRow(item.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {teamCount}개
                      </Button>
                    </Table.Td>
                  ) : (
                    <Table.Td align="right">
                      {typeof item.profitAmount === 'number'
                        ? item.profitAmount.toLocaleString()
                        : '-'}
                    </Table.Td>
                  )}

                  <Table.Td align="center">{item.recognitionDate || '-'}</Table.Td>
                  <Table.Td align="center">{item.paymentLabel || '-'}</Table.Td>
                  {renderLastCell(item.documentId, item.id)}
                </Table.Row>

                {/* 확장된 사업부별 배분 내역 Row */}
                {isExpanded && isMultiTeam && item.teamAllocations && (
                  <tr className="bg-gray-50">
                    <td colSpan="10" className="p-0" style={{ width: '100%' }}>
                      <div className="w-full">
                        <div className="px-4 py-3 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="text-blue-600">📌</span> 사업부별 배분 내역
                          </p>
                          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    사업부
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    항목
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    매출액
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    이익액
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {item.teamAllocations.map((alloc, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      <Badge className="bg-blue-500 text-white px-2 py-1">
                                        {alloc.teamName || '-'}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {alloc.itemName || '-'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                                      {typeof alloc.allocatedAmount === 'number'
                                        ? alloc.allocatedAmount.toLocaleString()
                                        : '0'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700 text-right">
                                      {typeof alloc.allocatedProfitAmount === 'number'
                                        ? alloc.allocatedProfitAmount.toLocaleString()
                                        : '0'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default SfaDetailPaymentTable;
