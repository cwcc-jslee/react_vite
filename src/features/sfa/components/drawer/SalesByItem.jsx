// src/features/sfa/components/drawer/SalesItems.jsx
// 사업부별 매출항목 등록 (홈페이지, 디자인 등)
import React from 'react';
import { useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
import {
  Select,
  Input,
  ErrorMessage,
} from '../../../../shared/components/drawer/styles/formStyles';

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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            padding: '0 20px',
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr) 40px',
                gap: '12px',
                alignItems: 'start',
              }}
            >
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

              <Select
                value={item.department}
                onChange={(e) => onChange(index, 'department', e.target.value)}
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
                // 표시할 때만 포맷팅 적용
                value={formatNumber(item.amount)}
                onChange={(e) => handleAmountChange(index, e.target.value)}
                placeholder="금액"
                disabled={isSubmitting}
                style={{ textAlign: 'right' }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2
                  onClick={() => onRemove(index)}
                  size={20}
                  color="#6B7280"
                  style={{
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1,
                  }}
                />
              </div>

              {errors[`salesItems.${index}.productType`] && (
                <ErrorMessage>
                  {errors[`salesItems.${index}.productType`]}
                </ErrorMessage>
              )}
              {errors[`salesItems.${index}.department`] && (
                <ErrorMessage>
                  {errors[`salesItems.${index}.department`]}
                </ErrorMessage>
              )}
              {errors[`salesItems.${index}.amount`] && (
                <ErrorMessage>
                  {errors[`salesItems.${index}.amount`]}
                </ErrorMessage>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SalesByItem;
