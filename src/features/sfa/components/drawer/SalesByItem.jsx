// src/features/sfa/components/drawer/SalesByItem.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
import {
  Group,
  Select,
  Input,
  Message,
} from '../../../../shared/components/ui';

const SalesByItem = ({
  items,
  onChange,
  onAdd,
  onRemove,
  isSubmitting,
  errors = {},
}) => {
  const productTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const departmentData = useSelector(selectCodebookByType('sfa_sales_type'));

  // 금액 입력 처리
  const handleAmountChange = (index, value) => {
    // 숫자만 추출하여 데이터로 저장
    const numberOnly = value.replace(/[^\d]/g, '');

    if (numberOnly === '' || !isNaN(numberOnly)) {
      // 실제 데이터는 숫자로만 저장
      onChange(index, 'amount', numberOnly);
    }
  };

  // 화면 표시용 포맷팅 함수
  const formatNumber = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString();
  };

  if (!items?.length && !isSubmitting) return null;

  return (
    <>
      {items.length > 0 && (
        <div className="px-5">
          <Group className="grid grid-cols-2 gap-5">
            {items.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="grid grid-cols-[1fr,1fr,1fr,40px] gap-3 items-start">
                  <Select
                    value={item.productType}
                    onChange={(e) =>
                      onChange(index, 'productType', e.target.value)
                    }
                    disabled={isSubmitting}
                  >
                    <option value="">매출품목 선택</option>
                    {productTypeData?.data?.map((type) => (
                      <option key={type.id} value={type.code}>
                        {type.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    value={item.department}
                    onChange={(e) =>
                      onChange(index, 'department', e.target.value)
                    }
                    disabled={isSubmitting}
                  >
                    <option value="">사업부 선택</option>
                    {departmentData?.data?.map((dept) => (
                      <option key={dept.id} value={dept.code}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    type="text"
                    value={formatNumber(item.amount)}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    placeholder="금액"
                    disabled={isSubmitting}
                    className="text-right"
                  />

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

                {/* Error Messages */}
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
      )}
    </>
  );
};

export default SalesByItem;
