// src/features/sfa/components/tables/SfaDetailTable.jsx
import React from 'react';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
} from '../../../../shared/components/ui/index';

/**
 * SFA 상세 정보를 표시하는 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - SFA 상세 데이터
 */
const SfaDetail = ({ data }) => {
  if (!data) return null;

  // 매출품목과 사업부 문자열 생성
  const itemsAndTeams =
    data.sfa_item_price
      ?.map(
        (item) =>
          `${item.sfa_item_name}${
            item.team_name ? ` (${item.team_name})` : ''
          }`,
      )
      .join(', ') || '-';

  return (
    <Description>
      {/* 1행: 매출유형, 지원프로그램 */}
      {/* 기본 4칸 구조 - 너비 지정 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          건명
        </DescriptionItem>
        <DescriptionItem>{data.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 2행: 고객사/매출처, 매출확정여부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          고객사/매출처
        </DescriptionItem>
        <DescriptionItem>{data.customer?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          매출유형
        </DescriptionItem>
        <DescriptionItem>{data.sfa_sales_type?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 3행: 매출구분, 매출품목/사업부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          매출구분
        </DescriptionItem>
        <DescriptionItem>
          {data.sfa_classification?.name || '-'}
        </DescriptionItem>
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
          {typeof data.total_price === 'number'
            ? data.total_price.toLocaleString()
            : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          사업부 매출
        </DescriptionItem>
        <DescriptionItem>
          {typeof data.sales_profit === 'number'
            ? data.sales_profit.toLocaleString()
            : '-'}
        </DescriptionItem>
      </DescriptionRow>

      {/* 5행: 건명, 프로젝트여부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          매출확정여부
        </DescriptionItem>
        <DescriptionItem>{data.confirmed ? 'YES' : 'NO'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          지원프로그램
        </DescriptionItem>
        <DescriptionItem grow>{data.proposal?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 6행: 비고 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          매출품목
        </DescriptionItem>
        <DescriptionItem>{itemsAndTeams}</DescriptionItem>
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
