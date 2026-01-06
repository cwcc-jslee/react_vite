// src/features/sfa/components/sections/SalesItemSection.jsx
import React, { useState, useEffect } from 'react';
import { Briefcase, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Select } from '@shared/components/ui';
import SalesByItem from '../elements/SalesByItem.jsx';

/**
 * SalesItemSection Component
 * 사업부 매출 정보 섹션 - 수량 기반 단일/다중 사업부 지원
 * 드롭다운 선택 시 자동으로 항목 생성
 * 축약형 표시 지원 - 수정 아이콘 클릭 시 펼침/접기
 *
 * @param {boolean} isMultiTeam - 다중 사업부 모드 여부 (읽기 전용)
 * @param {Array} sfaByItems - 사업부 매출 아이템 배열
 * @param {Function} onAddSalesItemsByCount - 수량만큼 사업부 매출 추가 핸들러
 * @param {Function} onRemoveSalesItem - 사업부 매출 삭제 핸들러
 * @param {Function} onSalesItemChange - 사업부 매출 변경 핸들러
 * @param {boolean} isSubmitting - 제출 중 여부
 * @param {Object} errors - 에러 객체
 * @param {Array} itemsData - 매출품목 데이터
 * @param {boolean} isItemsLoading - 매출품목 로딩 여부
 * @param {boolean} hasPayments - 결제매출 존재 여부 (1개 이상이면 수정 불가)
 */
const SalesItemSection = ({
  isMultiTeam = false,
  sfaByItems = [],
  onAddSalesItemsByCount,
  onRemoveSalesItem,
  onSalesItemChange,
  isSubmitting = false,
  errors = {},
  itemsData,
  isItemsLoading = false,
  hasPayments = false,
}) => {
  const hasItems = sfaByItems.length > 0;
  const [teamCount, setTeamCount] = useState(1); // 기본값: 1개 (단일 사업부)
  const [isExpanded, setIsExpanded] = useState(true); // 축약/펼침 상태 - 기본값: 펼침

  // 컴포넌트 마운트 시 기본값 1개로 자동 생성
  useEffect(() => {
    console.log('🔍 [SalesItemSection] useEffect 실행:', {
      sfaByItemsLength: sfaByItems.length,
      hasPayments,
      onAddSalesItemsByCount: !!onAddSalesItemsByCount,
    });

    // 항목이 없고, 결제매출도 없고, 핸들러가 있을 때만 실행
    if (sfaByItems.length === 0 && !hasPayments && onAddSalesItemsByCount) {
      console.log('🔄 [SalesItemSection] 최초 자동 생성 시도: 1개');
      // 약간의 지연을 두어 Redux store가 준비될 시간을 줌
      setTimeout(() => {
        onAddSalesItemsByCount(1);
      }, 0);
    }
  }, [onAddSalesItemsByCount]); // onAddSalesItemsByCount가 준비되면 실행

  // 결제매출이 추가되면 접힌 상태로 변경
  useEffect(() => {
    if (hasPayments && isExpanded) {
      setIsExpanded(false);
    }
  }, [hasPayments]); // hasPayments가 변경되면 실행

  // 드롭다운 변경 시 자동 생성
  const handleCountChange = (e) => {
    const newCount = Number(e.target.value);
    setTeamCount(newCount);

    if (onAddSalesItemsByCount) {
      onAddSalesItemsByCount(newCount);
    }
  };

  // 축약형 요약 텍스트 생성
  const getSummaryText = () => {
    if (!hasItems || sfaByItems.length === 0) return '';

    return sfaByItems
      .map((item) => {
        const teamName = item.teamName || '미선택';
        const itemName = item.itemName || '미선택';
        return `${teamName} (${itemName})`;
      })
      .join(', ');
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      {/* 헤더: 타이틀 + 수정 아이콘 + 안내 메시지 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">사업부 매출 정보</h3>
          {hasItems && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              title={isExpanded ? '접기' : '펼치기'}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
        </div>

        {/* 안내 메시지 */}
        {hasPayments && (
          <div className="text-xs text-orange-600">
            ※ 결제매출 생성 후 사업부 매출 변경 불가
          </div>
        )}
      </div>

      {/* 축약형 표시 */}
      {hasItems && !isExpanded && (
        <div className="py-2 px-3 bg-gray-50 rounded-md border border-gray-200">
          <span className="text-sm text-gray-700">{getSummaryText()}</span>
        </div>
      )}

      {/* 펼침 모드 - 상세 입력 폼 */}
      {isExpanded && (
        <>
          {/* 수량 선택 */}
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <span className="text-sm font-semibold text-blue-900">사업부 수량:</span>
            <Select
              value={teamCount}
              onChange={handleCountChange}
              disabled={hasPayments || isSubmitting}
              className="w-16 px-3 pr-8 py-1.5 text-center font-medium border border-blue-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </Select>
            {teamCount === 1 && (
              <span className="text-sm text-blue-700 font-medium">(단일 사업부)</span>
            )}
            {teamCount > 1 && (
              <span className="text-sm text-blue-700 font-medium">(다중 사업부)</span>
            )}
          </div>

          {/* 매출 아이템 목록 */}
          {hasItems && (
            <div className="flex flex-col gap-2">
              <SalesByItem
                items={sfaByItems}
                onChange={onSalesItemChange}
                onRemove={onRemoveSalesItem}
                isSubmitting={isSubmitting}
                errors={errors}
                itemsData={itemsData}
                isItemsLoading={isItemsLoading}
                isMultiTeam={isMultiTeam}
                hasPayments={hasPayments}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesItemSection;
