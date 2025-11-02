// src/features/sfa/components/tables/SalesInformationTable.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * 매출정보 테이블 컴포넌트 (확장형)
 */
const SalesInformationTable = ({ data = [], onSort }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  // 행 확장/축소 토글
  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // 금액 포맷팅 (천원 단위)
  const formatAmount = (amount) => {
    return (amount / 1000).toLocaleString('ko-KR');
  };

  // 결제 정보 계산
  const calculatePaymentInfo = (payments = []) => {
    const total = payments.length;
    const completed = payments.filter((p) => p.payment_date).length;
    const completedAmount = payments
      .filter((p) => p.payment_date)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const rate = totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;

    return { total, completed, completedAmount, totalAmount, rate };
  };

  // 결제 상태 계산
  const getPaymentStatus = (payment) => {
    if (payment.payment_date) return 'completed';
    const expectedDate = dayjs(payment.expected_date);
    const now = dayjs();
    if (expectedDate.isBefore(now)) return 'delayed';
    return 'pending';
  };

  // 상태별 스타일
  const statusStyles = {
    completed: 'text-green-700 bg-green-100',
    pending: 'text-gray-700 bg-gray-100',
    delayed: 'text-red-700 bg-red-100',
  };

  const statusLabels = {
    completed: '완료 ✓',
    pending: '예정 ⏱',
    delayed: '지연 ⚠',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">

              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => onSort && onSort('project_name')}
              >
                매출건명
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => onSort && onSort('customer')}
              >
                고객명
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                사업부
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                매출품목
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                매출유형
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => onSort && onSort('total_amount')}
              >
                매출액
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                결제건수
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                진행률
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => onSort && onSort('created_at')}
              >
                등록일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.map((sfa) => {
                const isExpanded = expandedRows.has(sfa.id);
                const paymentInfo = calculatePaymentInfo(sfa.sfa_by_payments);

                return (
                  <React.Fragment key={sfa.id}>
                    {/* 기본 행 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => toggleRow(sfa.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {sfa.project_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {sfa.customer?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {sfa.division?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {sfa.sfa_item?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {sfa.sfa_type?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatAmount(sfa.total_amount)}천원
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">
                        {paymentInfo.completed}/{paymentInfo.total}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                paymentInfo.rate === 100
                                  ? 'bg-green-500'
                                  : paymentInfo.rate > 70
                                    ? 'bg-blue-500'
                                    : paymentInfo.rate > 30
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                              }`}
                              style={{ width: `${paymentInfo.rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {paymentInfo.rate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">
                        {dayjs(sfa.created_at).format('YYYY.MM.DD')}
                      </td>
                    </tr>

                    {/* 확장 행 - 결제 상세 내역 */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="10" className="px-4 py-4 bg-gray-50">
                          <div className="ml-8">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                              결제 상세 내역 (sfaByPayments)
                            </h4>

                            {sfa.sfa_by_payments?.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                결제 정보가 없습니다.
                              </p>
                            ) : (
                              <>
                                <table className="min-w-full border border-gray-300">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-xs font-medium text-gray-600 border-b text-center">
                                        회차
                                      </th>
                                      <th className="px-3 py-2 text-xs font-medium text-gray-600 border-b text-center">
                                        결제예정일
                                      </th>
                                      <th className="px-3 py-2 text-xs font-medium text-gray-600 border-b text-right">
                                        결제금액
                                      </th>
                                      <th className="px-3 py-2 text-xs font-medium text-gray-600 border-b text-center">
                                        결제일
                                      </th>
                                      <th className="px-3 py-2 text-xs font-medium text-gray-600 border-b text-center">
                                        결제방법
                                      </th>
                                      <th className="px-3 py-2 text-xs font-medium text-gray-600 border-b text-center">
                                        상태
                                      </th>
                                      <th className="px-3 py-2 text-xs font-medium text-gray-600 border-b text-left">
                                        비고
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white">
                                    {sfa.sfa_by_payments.map(
                                      (payment, index) => {
                                        const status = getPaymentStatus(payment);
                                        return (
                                          <tr
                                            key={payment.id || index}
                                            className="border-b"
                                          >
                                            <td className="px-3 py-2 text-sm text-center text-gray-700">
                                              {index + 1}차
                                            </td>
                                            <td className="px-3 py-2 text-sm text-center text-gray-700">
                                              {payment.expected_date
                                                ? dayjs(
                                                    payment.expected_date,
                                                  ).format('YYYY.MM.DD')
                                                : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-right text-gray-900">
                                              {formatAmount(payment.amount)}천원
                                            </td>
                                            <td className="px-3 py-2 text-sm text-center text-gray-700">
                                              {payment.payment_date
                                                ? dayjs(
                                                    payment.payment_date,
                                                  ).format('YYYY.MM.DD')
                                                : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-center text-gray-700">
                                              {payment.payment_method || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}
                                              >
                                                {statusLabels[status]}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-700">
                                              {payment.note || '-'}
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </tbody>
                                </table>

                                {/* 결제 요약 */}
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold">
                                      결제 요약:
                                    </span>{' '}
                                    완료{' '}
                                    {formatAmount(paymentInfo.completedAmount)}
                                    천원 ({paymentInfo.rate.toFixed(0)}%) |
                                    예정{' '}
                                    {formatAmount(
                                      paymentInfo.totalAmount -
                                        paymentInfo.completedAmount,
                                    )}
                                    천원 (
                                    {(100 - paymentInfo.rate).toFixed(0)}%)
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

SalesInformationTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      project_name: PropTypes.string,
      customer: PropTypes.shape({
        name: PropTypes.string,
      }),
      division: PropTypes.shape({
        name: PropTypes.string,
      }),
      sfa_item: PropTypes.shape({
        name: PropTypes.string,
      }),
      sfa_type: PropTypes.shape({
        name: PropTypes.string,
      }),
      total_amount: PropTypes.number,
      created_at: PropTypes.string,
      sfa_by_payments: PropTypes.array,
    }),
  ),
  onSort: PropTypes.func,
};

export default SalesInformationTable;
