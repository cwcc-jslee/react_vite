// src/features/sfa/components/elements/SalesByItem.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { useTeam } from '../../../../shared/hooks/useTeam';
import {
  Select,
} from '../../../../shared/components/ui';

/**
 * SalesByItem Component
 * 사업부 매출 아이템 입력을 위한 컴포넌트
 * - 사업부 선택 (필수)
 * - 매출품목 선택 (필수)
 */
const SalesByItem = ({
  items = [],
  onChange,
  onRemove,
  isSubmitting,
  errors = {},
  itemsData,
  isMultiTeam = false,
  hasPayments = false,
}) => {
  // React Query를 사용하여 팀 데이터 조회
  const { data: teamsData } = useTeam();

  if (!items?.length) return null;

  // 특정 인덱스의 각 필드별 에러 확인
  const hasFieldError = (index, field) => {
    return errors[`salesItems.${index}.${field}`];
  };

  return (
    <div className="space-y-4 px-1">
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
                (items.length <= 1)
              }
              className={`flex items-center justify-center p-2 rounded hover:bg-gray-100 transition-colors h-[42px]
                ${
                  isSubmitting ||
                  hasPayments ||
                  (items.length <= 1)
                    ? 'opacity-30 cursor-not-allowed'
                    : 'opacity-100 hover:bg-red-50'
                }`}
            >
              <Trash2
                size={20}
                className={
                  isSubmitting ||
                  hasPayments ||
                  (items.length <= 1)
                    ? 'text-gray-300'
                    : 'text-gray-500'
                }
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SalesByItem;
