/**
 * RevenueSummaryCard Component
 * 매출정보 요약 - 1라인 간결 표시
 * - 매출액, 매출이익, 매출정보(건수), 사업부별 매출액
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, DollarSign, Briefcase, FileText } from 'lucide-react';
import {
  calculateTotalAmount,
  calculateTotalProfit,
  calculateProfitRate,
  calculateTeamRevenues,
} from '../../utils/summaryCalculations';

const RevenueSummaryCard = ({ sfaByPayments = [], sfaByItems = [] }) => {
  // 계산값들을 useMemo로 캐싱
  const totalAmount = useMemo(
    () => calculateTotalAmount(sfaByPayments),
    [sfaByPayments]
  );

  const totalProfit = useMemo(
    () => calculateTotalProfit(sfaByPayments),
    [sfaByPayments]
  );

  const profitRate = useMemo(
    () => calculateProfitRate(totalProfit, totalAmount),
    [totalProfit, totalAmount]
  );

  const teamRevenues = useMemo(
    () => calculateTeamRevenues(sfaByPayments, sfaByItems),
    [sfaByPayments, sfaByItems]
  );

  // 결제매출이 없으면 렌더링하지 않음
  if (!sfaByPayments || sfaByPayments.length === 0) {
    return null;
  }

  const formatAmount = (amount) => {
    return amount.toLocaleString('ko-KR');
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center justify-between">
        {/* 매출액 */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">매출액</span>
          </div>
          <span className="text-base font-bold text-gray-900">
            {formatAmount(totalAmount)}
          </span>
        </div>

        {/* 구분선 */}
        <div className="h-10 w-px bg-blue-300 mx-4"></div>

        {/* 매출이익 */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">매출이익</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatAmount(totalProfit)}
            </span>
            <span className="text-xs font-semibold text-blue-600">
              ({profitRate.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-10 w-px bg-blue-300 mx-4"></div>

        {/* 매출정보 건수 */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">매출정보</span>
          </div>
          <span className="text-base font-bold text-gray-900">
            {sfaByPayments.length}
            <span className="ml-1 text-xs font-normal text-gray-500">건</span>
          </span>
        </div>

        {/* 구분선 */}
        <div className="h-10 w-px bg-blue-300 mx-4"></div>

        {/* 사업부별 매출액 */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">사업부별 매출액</span>
          </div>
          {teamRevenues.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {teamRevenues.map((team) => (
                <div key={`${team.teamId}-${team.itemId}`} className="text-xs">
                  <span className="font-medium text-gray-700">{team.teamName}</span>
                  <span className="text-gray-500"> ({team.itemName})</span>
                  <span className="ml-1 font-semibold text-purple-700">
                    {formatAmount(team.totalAmount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      </div>
    </div>
  );
};

RevenueSummaryCard.propTypes = {
  sfaByPayments: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      isProfit: PropTypes.bool,
      marginProfitValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      teamAllocations: PropTypes.arrayOf(
        PropTypes.shape({
          teamId: PropTypes.number,
          teamName: PropTypes.string,
          itemId: PropTypes.number,
          itemName: PropTypes.string,
          allocatedAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
      ),
    })
  ),
  sfaByItems: PropTypes.arrayOf(
    PropTypes.shape({
      teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      teamName: PropTypes.string,
      itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      itemName: PropTypes.string,
    })
  ),
};

export default RevenueSummaryCard;
