// src/features/customer/components/tables/CustomerDetailTable.jsx
import React from 'react';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Badge,
} from '../../../../shared/components/ui/index';
import { displayBusinessNumber } from '../../../../shared/services/businessNumberUtils';

/**
 * 고객사 상세 정보를 표시하는 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - 고객사 상세 데이터
 */
const CustomerDetailTable = ({ data }) => {
  console.log(`CustomerDetailTable data `, data);
  if (!data) return null;

  return (
    <Description>
      {/* 1행: 고객명, 기업분류 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          고객명
        </DescriptionItem>
        <DescriptionItem>{data.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          기업분류
        </DescriptionItem>
        <DescriptionItem>{data.co_classification?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 2행: 기업규모, 사업자번호 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          기업규모
        </DescriptionItem>
        <DescriptionItem>{data.business_scale?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          사업자번호
        </DescriptionItem>
        <DescriptionItem>
          {data.businessNumber
            ? displayBusinessNumber(data.business_number)
            : '-'}
        </DescriptionItem>
      </DescriptionRow>

      {/* 3행: 유입경로 (Badge 컴포넌트 사용) */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          유입경로
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {data.funnel && data.funnel.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.funnel.map((funnel, index) => (
                <Badge
                  key={index}
                  variant="info"
                  size="md"
                  className="flex items-center gap-1"
                >
                  <span className="font-medium">{funnel.name}</span>
                  {funnel.suffix && (
                    <span className="text-blue-700">- {funnel.suffix}</span>
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            '-'
          )}
        </DescriptionItem>
      </DescriptionRow>

      {/* 4행: 업태, 종업원 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          업태
        </DescriptionItem>
        <DescriptionItem>
          {data.businessType && data.business_type.length > 0
            ? data.business_type.map((type) => type.name).join(', ')
            : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          종업원
        </DescriptionItem>
        <DescriptionItem>{data.employee?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 5행: 설립일, 대표자 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          설립일
        </DescriptionItem>
        <DescriptionItem>
          {data.commencementDate
            ? new Date(data.commencement_date).toLocaleDateString()
            : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          대표자
        </DescriptionItem>
        <DescriptionItem>{data.representative_name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 6행: 홈페이지, 지역 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          홈페이지
        </DescriptionItem>
        <DescriptionItem>
          {data.homepage ? (
            <a
              href={data.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {data.homepage}
            </a>
          ) : (
            '-'
          )}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          지역
        </DescriptionItem>
        <DescriptionItem>{data.region?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 7행: 시/군/구, 상세주소 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          시/군/구
        </DescriptionItem>
        <DescriptionItem>{data.city || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          상세주소
        </DescriptionItem>
        <DescriptionItem>{data.address || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 8행: 지원사업 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          지원사업
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {data.support_program && data.support_program.length > 0
            ? data.support_program.map((program) => program.name).join(', ')
            : '-'}
        </DescriptionItem>
      </DescriptionRow>

      {/* 9행: 비고 */}
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

export default CustomerDetailTable;
