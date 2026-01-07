// src/features/sfa/components/elements/TeamAllocationSection.jsx
import React from 'react';
import { formatDisplayNumber } from '../../../../shared/utils/format/number';
import { Input } from '../../../../shared/components/ui';

/**
 * TeamAllocationSection Component
 * 결제매출 입력 시 사업부별 매출 할당 금액을 조정하는 섹션
 */
const TeamAllocationSection = ({
  isMultiTeam,
  payment,
  index,
  onAllocationChange,
  isSubmitting,
  allocationDisplayValues,
  handleAllocationFocus,
  handleAllocationBlur,
  handleAllocationInputChange,
  onAutoAllocateByRatio,
  onEqualDistribute,
}) => {
  // teamAllocations가 없거나 비어있을 때
  if (!payment.teamAllocations || payment.teamAllocations.length === 0) {
    return (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          사업부별 매출 할당 정보를 생성하는 중입니다...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">
          사업부별 매출 할당
          {!isMultiTeam && <span className="ml-2 text-xs text-gray-500">(단일 사업부 - 자동 할당)</span>}
        </h4>
        {isMultiTeam && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAutoAllocateByRatio && onAutoAllocateByRatio(index)}
              disabled={true}
              className="text-xs px-2 py-1 bg-gray-400 text-white rounded cursor-not-allowed opacity-50"
              title="향후 구현 예정"
            >
              비율 배분
            </button>
            <button
              type="button"
              onClick={() => onEqualDistribute && onEqualDistribute(index)}
              disabled={true}
              className="text-xs px-2 py-1 bg-gray-400 text-white rounded cursor-not-allowed opacity-50"
              title="향후 구현 예정"
            >
              균등 배분
            </button>
          </div>
        )}
      </div>

      {/* 단일 사업부 - 읽기 전용 표시 */}
      {!isMultiTeam && payment.teamAllocations.length > 0 && payment.teamAllocations[0] && (
        <div className="grid grid-cols-[1.5fr,1.5fr,1fr] gap-2 items-center bg-white p-2 rounded border border-blue-100">
          <div className="text-sm">
            <span className="text-gray-500">사업부:</span>{' '}
            <span className="font-medium text-gray-800">{payment.teamAllocations[0].teamName}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">매출품목:</span>{' '}
            <span className="font-medium text-gray-800">{payment.teamAllocations[0].itemName}</span>
          </div>
          <div className="text-sm text-right">
            <span className="text-gray-500">할당액:</span>{' '}
            <span className="font-medium text-blue-600">
              {formatDisplayNumber(payment.teamAllocations[0].allocatedAmount || 0)}원
            </span>
          </div>
        </div>
      )}

      {/* 다중 사업부 - 수정 모드 (단일 모드와 동일한 구조) */}
      {isMultiTeam && payment.teamAllocations.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-2">
            {payment.teamAllocations.map((allocation, teamIndex) => {
              if (!allocation) return null; // 안전장치 추가
              
              return (
              <div key={teamIndex} className="grid grid-cols-[1.5fr,1.5fr,1fr] gap-2 items-center py-1 border-b border-gray-100 last:border-0">
                 <div className="text-sm truncate">
                    <span className="text-gray-500 mr-1">사업부:</span>
                    <span className="font-medium text-gray-800" title={allocation?.teamName}>
                        {allocation?.teamName || '미선택'}
                    </span>
                 </div>
                 <div className="text-sm truncate">
                    <span className="text-gray-500 mr-1">매출품목:</span>
                    <span className="font-medium text-gray-800" title={allocation?.itemName}>
                        {allocation?.itemName || '-'}
                    </span>
                 </div>
                 <div className="flex items-center justify-end gap-1">
                    <span className="text-sm text-gray-500 whitespace-nowrap">할당액:</span>
                    <Input
                        type="text"
                        name={`allocation-${index}-${teamIndex}`}
                        value={
                          allocationDisplayValues[teamIndex] !== undefined
                            ? formatDisplayNumber(allocationDisplayValues[teamIndex])
                            : formatDisplayNumber(allocation.allocatedAmount || 0)
                        }
                        onChange={(e) => handleAllocationInputChange(teamIndex, e.target.value)}
                        onFocus={() => handleAllocationFocus(teamIndex)}
                        onBlur={() => handleAllocationBlur(teamIndex)}
                        placeholder="0"
                        disabled={isSubmitting}
                        className="text-right h-8 w-24 font-medium"
                    />
                 </div>
              </div>
            )})}
          </div>

          {/* 할당 합계 표시 */}
          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
            <span className="text-sm text-gray-600 font-medium">할당 합계</span>
            <span className={`text-sm font-bold ${
              Math.abs(payment.teamAllocations.reduce((sum, a) => sum + (a ? parseFloat(a.allocatedAmount || 0) : 0), 0) - parseFloat(payment.amount || 0)) < 1
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {formatDisplayNumber(
                payment.teamAllocations.reduce((sum, a) => sum + (a ? parseFloat(a.allocatedAmount || 0) : 0), 0)
              )}원
              {payment.amount && Math.abs(payment.teamAllocations.reduce((sum, a) => sum + (a ? parseFloat(a.allocatedAmount || 0) : 0), 0) - parseFloat(payment.amount || 0)) >= 1 && (
                <span className="ml-2 text-xs font-normal">
                  (차이: {formatDisplayNumber(
                    Math.abs(parseFloat(payment.amount || 0) - payment.teamAllocations.reduce((sum, a) => sum + (a ? parseFloat(a.allocatedAmount || 0) : 0), 0))
                  )}원)
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAllocationSection;
