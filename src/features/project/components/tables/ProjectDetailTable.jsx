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
const ProjectDetailTable = ({ data = {} }) => {
  if (!data) return null;
  console.log(`>>>>> data : `, data);

  return (
    <Description>
      {/* ID-고객사-프로젝트명 : 제목영역으로  */}
      {/* 기본 4칸 구조 - 너비 지정 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          진행상태
        </DescriptionItem>
        <DescriptionItem>{'(시작)-(진행중)-(검수)-(종료)'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          TASK
        </DescriptionItem>
        <DescriptionItem>{'5/10'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          진행률
        </DescriptionItem>
        <DescriptionItem>
          {typeof data.sales_profit === 'number'
            ? data.sales_profit.toLocaleString()
            : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          완료여부
        </DescriptionItem>
        <DescriptionItem>{'진행중'}</DescriptionItem>
      </DescriptionRow>

      {/* 2행: 건명, 프로젝트여부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          계획/투입시간
        </DescriptionItem>
        <DescriptionItem>{data.sfa_sales_type?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          남은시간
        </DescriptionItem>
        <DescriptionItem>{data.sfa_sales_type?.name || '-'}</DescriptionItem>

        <DescriptionItem label width="w-[140px]">
          중요도
        </DescriptionItem>
        <DescriptionItem>{data.sfa_sales_type?.name || '-'}</DescriptionItem>

        <DescriptionItem label width="w-[140px]">
          계획/투입시간
        </DescriptionItem>
        <DescriptionItem>
          {data.customer?.name}
          {data.selling_partner && `/${data.selling_partner.name}`}
        </DescriptionItem>
      </DescriptionRow>

      {/* 2행: 매출, 매출이익 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          상태변경
        </DescriptionItem>
        <DescriptionItem>{'총 10건'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          이슈사항
        </DescriptionItem>
        <DescriptionItem>{'10 / 30'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          사업부/서비스
        </DescriptionItem>
        <DescriptionItem>
          {data.customer?.name}
          {data.selling_partner && `/${data.selling_partner.name}`}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          (위험도-기간)
        </DescriptionItem>
        <DescriptionItem>{'정상/지연/경고'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          (위험도-시간)
        </DescriptionItem>
        <DescriptionItem>{'정상/지연/경고'}</DescriptionItem>
      </DescriptionRow>

      {/* 6행: 비고 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          사업년도
        </DescriptionItem>
        <DescriptionItem width="w-[140px]">
          {data.sfa_classification?.name || '25년'}
        </DescriptionItem>

        <DescriptionItem label width="w-[140px]">
          SFA
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {'캠코마루 음향/영상 환경 개선 작업'}
        </DescriptionItem>
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

export default ProjectDetailTable;
