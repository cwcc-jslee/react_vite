// src/features/sfa/components/tables/SfaDetailTable.jsx
import React from 'react';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Badge,
} from '../../../../shared/components/ui/index';
import {
  calculatePaymentTotals,
  formatSfaByItems,
} from '../../utils/displayUtils';

/**
 * SFA 상세 정보를 표시하는 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - SFA 상세 데이터
 */
const SfaDetail = ({ data }) => {
  if (!data) return null;

  // 결제 매출/이익 합계 계산
  const paymentTotals = calculatePaymentTotals(data.sfaByPayments);

  // 사업부 매출 데이터를 Badge로 렌더링
  const renderSfaByItems = (itemsData) => {
    const formattedItems = formatSfaByItems(itemsData);

    if (!formattedItems) return '-';

    return (
      <div className="flex flex-wrap gap-2">
        {formattedItems.map((item) => (
          <Badge
            key={item.key}
            className="mr-1 mb-1 bg-blue-100 text-blue-800 px-2 py-1 text-xs"
          >
            {item.text}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Description>
      {/* 1행: 매출유형, 지원프로그램 */}
      {/* 기본 4칸 구조 - 너비 지정 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          건명
        </DescriptionItem>
        <DescriptionItem>{data.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          매출유형
        </DescriptionItem>
        <DescriptionItem>{data.sfaSalesType?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 2행: 고객사/매출처, 매출확정여부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          고객사
        </DescriptionItem>
        <DescriptionItem>{data.customer?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          매출처
        </DescriptionItem>
        <DescriptionItem>
          {data.isSameBilling === true
            ? '고객사와 동일'
            : data.isSameBilling === false
            ? '별도 매출처'
            : '-'}
        </DescriptionItem>
      </DescriptionRow>

      {/* 3행: 매출구분, 매출품목/사업부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          매출구분
        </DescriptionItem>
        <DescriptionItem>{data.sfaClassification?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          프로젝트여부
        </DescriptionItem>
        <DescriptionItem>{data.isProject ? 'YES' : 'NO'}</DescriptionItem>
      </DescriptionRow>

      {/* 4행: 매출, 매출이익 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          결제 매출/이익
        </DescriptionItem>
        <DescriptionItem>
          {paymentTotals.totalAmount > 0 || paymentTotals.totalProfit > 0
            ? `${paymentTotals.totalAmount.toLocaleString()} / ${paymentTotals.totalProfit.toLocaleString()}`
            : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          _
        </DescriptionItem>
        <DescriptionItem></DescriptionItem>
      </DescriptionRow>

      {/* 6행: 비고 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          사업부 매출
        </DescriptionItem>
        <DescriptionItem>{renderSfaByItems(data.sfaByItems)}</DescriptionItem>
      </DescriptionRow>

      {/* 6행: 비고 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          비고
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {data.description || '-'}
        </DescriptionItem>
      </DescriptionRow>
    </Description>
  );
};

export default SfaDetail;
