// src/features/sfa/components/drawer/SalesByItem.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
import { useSelectData } from '../../../../shared/hooks/useSelectData';
import { QUERY_KEYS } from '../../../../shared/utils/queryKeys';
import {
  Group,
  Select,
  Input,
  Message,
} from '../../../../shared/components/ui';
import {
  formatDisplayNumber,
  ensureNumericAmount,
} from '../../../../shared/utils/format/number';

/**
 * SalesByItem Component
 * 매출 아이템 입력을 위한 컴포넌트
 * 각 필드(매출품목, 사업부, 금액)가 동일한 너비를 가지도록 수정
 */

/**
 * SalesByItem Component
 * 매출 아이템 입력을 위한 컴포넌트
 *
 * @param {Object} props
 * @param {Array} props.items - 매출 아이템 목록
 * @param {Function} props.onChange - 아이템 변경 핸들러
 * @param {Function} props.onRemove - 아이템 삭제 핸들러
 * @param {boolean} props.isSubmitting - 제출 중 여부
 * @param {Object} props.errors - 유효성 검사 에러
 * @param {Object} props.itemsData - 매출품목 데이터
 * @param {boolean} props.isItemsLoading - 매출품목 로딩 상태
 */
const SalesByItem = ({
  items = [],
  onChange,
  onRemove,
  isSubmitting,
  errors = {},
  itemsData,
  isItemsLoading,
}) => {
  // Redux에서 코드북 데이터 조회
  const productTypeData = useSelector(selectCodebookByType('sfa_sales_type'));

  // React Query를 사용하여 팀 데이터와 매출품목 데이터 조회
  const { data: teamsData, isLoading: isTeamsLoading } = useSelectData(
    QUERY_KEYS.TEAMS,
  );
  if (!items?.length) return null;

  // 특정 인덱스의 각 필드별 에러 확인
  const hasFieldError = (index, field) => {
    return errors[`salesItems.${index}.${field}`];
  };

  return (
    <div className="space-y-4 px-5">
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="grid grid-cols-[3fr,3fr,2fr,40px] gap-3 items-start">
            {/* 매출품목 선택 */}
            <Select
              value={item.productType}
              onChange={(e) => onChange(index, 'productType', e.target.value)}
              disabled={isSubmitting}
              className={
                hasFieldError(index, 'department') ? 'border-red-300' : ''
              }
            >
              <option value="">매출품목 선택</option>
              {itemsData?.data?.map((type) => (
                <option key={type.id} value={type.code}>
                  {type.name}
                </option>
              ))}
            </Select>

            {/* 사업부 선택 */}
            <Select
              value={item.department}
              onChange={(e) => onChange(index, 'department', e.target.value)}
              disabled={isSubmitting}
              className={
                hasFieldError(index, 'department') ? 'border-red-300' : ''
              }
            >
              <option value="">사업부 선택</option>
              {teamsData?.data?.map((team) => (
                <option key={team.id} value={team.code}>
                  {team.name}
                </option>
              ))}
            </Select>

            {/* 금액 입력 */}
            <Input
              type="text"
              value={formatDisplayNumber(item.amount)}
              onChange={(e) => {
                const numericValue = ensureNumericAmount(e.target.value);
                onChange(index, 'amount', numericValue);
              }}
              placeholder="금액"
              disabled={isSubmitting}
              className={`text-right ${
                hasFieldError(index, 'amount') ? 'border-red-300' : ''
              }`}
            />

            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={isSubmitting}
              className={`flex items-center justify-center p-2 rounded hover:bg-gray-100 transition-colors
                ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
            >
              <Trash2 size={20} className="text-gray-500" />
            </button>
          </div>

          {/* 에러 메시지 표시 */}
          {/* <div className="space-y-1">
            {(hasFieldError(index, 'productType') ||
              hasFieldError(index, 'department') ||
              hasFieldError(index, 'amount')) && (
              <Message type="error" className="mt-2">
                매출품목과 사업부를 선택해주세요.
              </Message>
            )}
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default SalesByItem;
