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
 */
const SalesByItem = ({
  items = [],
  onChange,
  onRemove,
  isSubmitting,
  errors = {},
}) => {
  // Redux에서 코드북 데이터 조회
  const productTypeData = useSelector(selectCodebookByType('sfa_sales_type'));

  // React Query를 사용하여 팀 데이터 조회
  const { data: teamsData, isLoading: isTeamsLoading } = useSelectData(
    QUERY_KEYS.TEAMS,
  );

  // 금액 입력 처리 - 숫자만 허용
  const handleAmountChange = (index, value) => {
    const numberOnly = value.replace(/[^\d]/g, '');
    if (numberOnly === '' || !isNaN(numberOnly)) {
      onChange(index, 'amount', numberOnly);
    }
  };

  // 화면 표시용 숫자 포맷팅
  const formatNumber = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString();
  };

  if (!items?.length) return null;

  return (
    <div className="px-5">
      <Group className="grid grid-cols-2 gap-5">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="grid grid-cols-[1fr,1fr,1fr,40px] gap-3 items-start">
              {/* 매출품목 선택 */}
              <Select
                value={item.productType}
                onChange={(e) => onChange(index, 'productType', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">매출품목 선택</option>
                {productTypeData?.data?.map((type) => (
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
                value={formatNumber(item.amount)}
                onChange={(e) => handleAmountChange(index, e.target.value)}
                placeholder="금액"
                disabled={isSubmitting}
                className="text-right"
              />

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={isSubmitting}
                className={`flex items-center justify-center transition-opacity
                  ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'opacity-100 hover:opacity-70'
                  }`}
              >
                <Trash2 size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 에러 메시지 표시 */}
            <div className="space-y-1">
              {errors[`salesItems.${index}.productType`] && (
                <Message type="error">
                  {errors[`salesItems.${index}.productType`]}
                </Message>
              )}
              {errors[`salesItems.${index}.department`] && (
                <Message type="error">
                  {errors[`salesItems.${index}.department`]}
                </Message>
              )}
              {errors[`salesItems.${index}.amount`] && (
                <Message type="error">
                  {errors[`salesItems.${index}.amount`]}
                </Message>
              )}
            </div>
          </div>
        ))}
      </Group>
    </div>
  );
};

export default SalesByItem;
