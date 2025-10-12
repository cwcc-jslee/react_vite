// src/features/sfa/components/sections/SalesItemSection.jsx
import React from 'react';
import { Plus, Briefcase } from 'lucide-react';
import SalesByItem from '../elements/SalesByItem.jsx';

/**
 * SalesItemSection Component
 * 사업부 매출 정보 섹션 - 단일/다중 사업부 모드 지원
 *
 * @param {boolean} isMultiTeam - 다중 사업부 모드 여부
 * @param {Function} onTeamModeToggle - 팀 모드 토글 핸들러
 * @param {Array} sfaByItems - 사업부 매출 아이템 배열
 * @param {Function} onAddSalesItem - 사업부 매출 추가 핸들러
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
  onTeamModeToggle,
  sfaByItems = [],
  onAddSalesItem,
  onRemoveSalesItem,
  onSalesItemChange,
  isSubmitting = false,
  errors = {},
  itemsData,
  isItemsLoading = false,
  hasPayments = false,
}) => {
  const hasItems = sfaByItems.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      {/* 헤더: 타이틀 + 단일/다중 토글 + 추가 버튼 */}
      <div className="mb-4 space-y-3">
        {/* 타이틀과 추가 버튼 */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">사업부 매출 정보</h3>
          <button
            type="button"
            onClick={onAddSalesItem}
            className="flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isSubmitting ||
              hasPayments ||
              (!isMultiTeam && sfaByItems.length >= 1) ||
              (isMultiTeam && sfaByItems.length >= 3)
            }
            title={
              hasPayments
                ? '결제매출이 생성된 후에는 사업부 매출 정보를 수정할 수 없습니다'
                : !isMultiTeam && sfaByItems.length >= 1
                  ? '단일 사업부 모드에서는 1개만 추가 가능합니다'
                  : isMultiTeam && sfaByItems.length >= 3
                    ? '다중 사업부 모드에서는 최대 3개까지만 추가 가능합니다'
                    : ''
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            사업부매출 추가
          </button>
        </div>

        {/* 단일/다중 사업부 라디오 버튼 */}
        <div className="flex items-center space-x-4 rounded-lg bg-gray-50 p-3">
          <span className="text-sm font-medium text-gray-700">매출 유형:</span>
          <label className={`flex items-center ${hasPayments ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name="teamMode"
              className="text-blue-600 focus:ring-blue-500"
              checked={!isMultiTeam}
              onChange={() => onTeamModeToggle(false)}
              disabled={isSubmitting || hasPayments}
            />
            <span className="ml-2 text-sm text-gray-700">단일 사업부</span>
          </label>
          <label className={`flex items-center ${hasPayments ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name="teamMode"
              className="text-blue-600 focus:ring-blue-500"
              checked={isMultiTeam}
              onChange={() => onTeamModeToggle(true)}
              disabled={isSubmitting || hasPayments}
            />
            <span className="ml-2 text-sm text-gray-700">다중 사업부 (최대 3개)</span>
          </label>
          {hasPayments && (
            <span className="ml-2 text-xs text-orange-600">
              ※ 결제매출 생성 후 변경 불가
            </span>
          )}
        </div>
      </div>

      {/* 매출 아이템 목록 or 안내 메시지 */}
      {!hasItems ? (
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <Briefcase className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isMultiTeam
              ? '사업부 매출을 추가해주세요 (최대 3개)'
              : '단일 사업부 매출을 추가해주세요'
            }
          </p>
        </div>
      ) : (
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

      {/* 사업부 매출 요약 */}
      {hasItems && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-green-700">
              {`총 사업부매출 : ${sfaByItems.length}건`}
              {!isMultiTeam && <span className="ml-2 text-gray-500">(단일 사업부)</span>}
            </span>
            {Array.isArray(sfaByItems) && (
              <span className="text-blue-700">
                총 금액:{' '}
                {sfaByItems
                  .reduce((sum, item) => {
                    const amount = parseFloat(
                      String(item.amount || 0).replace(/,/g, ''),
                    );
                    return sum + amount;
                  }, 0)
                  .toLocaleString()}
                원
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesItemSection;
