// src/features/sfa/components/drawer/SalesByItem.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
// import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
// import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { useTeam } from '../../../../shared/hooks/useTeam';
import { QUERY_KEYS } from '../../../../shared/utils/queryKeys';
import {
  Group,
  Select,
  Message,
} from '../../../../shared/components/ui';

/**
 * SalesByItem Component
 * 사업부 매출 아이템 입력을 위한 컴포넌트
 * - 사업부 선택 (필수)
 * - 매출품목 선택 (필수)
 */
const SalesByItemForm = ({
  items = [],
  onChange,
  onRemove,
  isSubmitting,
  errors = {},
  itemsData,
  isItemsLoading,
  isMultiTeam = false,
  hasPayments = false,
}) => {
  // React Query를 사용하여 팀 데이터와 매출품목 데이터 조회
  const { data: teamsData, isLoading: isTeamsLoading } = useTeam();
  console.log('>>> itemsData ', itemsData);
  console.log('>>> teamsData ', teamsData);
  if (!items?.length) return null;

  // 특정 인덱스의 각 필드별 에러 확인
  const hasFieldError = (index, field) => {
    return errors[`salesItems.${index}.${field}`];
  };

  return (
    <div className="space-y-4 px-5">
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="grid grid-cols-[1fr,1fr,40px] gap-3 items-start">
            {/* 사업부 선택 */}
            <Select
              value={item.teamId || ''}
              onChange={(e) => {
                const selectedTeamId = e.target.value;
                const selectedTeam = teamsData?.data?.find(
                  (team) => team.id === parseInt(selectedTeamId),
                );
                if (selectedTeam) {
                  onChange(index, {
                    teamId: selectedTeam.id,
                    teamName: selectedTeam.name,
                  });
                }
              }}
              disabled={isSubmitting || hasPayments}
              className={
                hasFieldError(index, 'teamName') ? 'border-red-300' : ''
              }
            >
              <option value="">사업부 선택</option>
              {teamsData?.data?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>

            {/* 매출품목 선택 */}
            <Select
              value={item.itemId || ''}
              onChange={(e) => {
                const selectedItemId = e.target.value;
                const selectedItem = itemsData?.data?.find(
                  (type) => type.id === parseInt(selectedItemId),
                );
                if (selectedItem) {
                  onChange(index, {
                    itemId: selectedItem.id,
                    itemName: selectedItem.name,
                  });
                }
              }}
              disabled={isSubmitting || hasPayments}
              className={
                hasFieldError(index, 'itemName') ? 'border-red-300' : ''
              }
            >
              <option value="">매출품목 선택</option>
              {itemsData?.data?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>

            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={
                isSubmitting ||
                hasPayments ||
                (!isMultiTeam && items.length === 1) ||
                (isMultiTeam && items.length <= 2)
              }
              className={`flex items-center justify-center p-2 rounded hover:bg-gray-100 transition-colors
                ${
                  isSubmitting ||
                  hasPayments ||
                  (!isMultiTeam && items.length === 1) ||
                  (isMultiTeam && items.length <= 2)
                    ? 'opacity-30 cursor-not-allowed'
                    : 'opacity-100 hover:bg-red-50'
                }`}
              title={
                hasPayments
                  ? '결제매출이 생성된 후에는 사업부 매출 정보를 수정할 수 없습니다'
                  : !isMultiTeam && items.length === 1
                    ? '단일 사업부 모드에서는 최소 1개 항목이 필요합니다'
                    : isMultiTeam && items.length <= 2
                      ? '다중 사업부 모드에서는 최소 2개 항목이 필요합니다'
                      : ''
              }
            >
              <Trash2
                size={20}
                className={
                  isSubmitting ||
                  hasPayments ||
                  (!isMultiTeam && items.length === 1) ||
                  (isMultiTeam && items.length <= 2)
                    ? 'text-gray-300'
                    : 'text-gray-500'
                }
              />
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

export default SalesByItemForm;
