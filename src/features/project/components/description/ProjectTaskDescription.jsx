// src/features/sfa/components/description/ProjectTaskDescription.jsx
import React from 'react';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
} from '@shared/components/ui/index';

/**
 * SFA 상세 정보를 표시하는 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - SFA 상세 데이터
 */
const ProjectTaskDescription = ({ data }) => {
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

  // 계획 정보 포맷팅 함수
  const formatPlanningTimeData = (planningData) => {
    if (!planningData) return '-';

    const workDays = planningData.work_days || planningData.workDays || '0';
    const plannedHours =
      planningData.total_planned_hours || planningData.totalPlannedHours || '0';
    const personnelCount =
      planningData.personnel_count || planningData.personnelCount || '0';
    const allocationRate =
      Number(planningData.allocation_rate || planningData.allocationRate || 0) *
      100;

    return `${workDays}일 / ${plannedHours}시간(${personnelCount}명*${workDays}일*${allocationRate}%)`;
  };

  return (
    <Description>
      {/* 1행: 매출유형, 지원프로그램 */}
      {/* 기본 4칸 구조 - 너비 지정 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          작업명
        </DescriptionItem>
        <DescriptionItem>{data.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          진행상태
        </DescriptionItem>
        <DescriptionItem>{data?.taskProgress?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 2행: 고객사/매출처, 매출확정여부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          작업일정 구분
        </DescriptionItem>
        <DescriptionItem>{data.taskScheduleType}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          버킷
        </DescriptionItem>
        <DescriptionItem>{data.bucket || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 2행: 고객사/매출처, 매출확정여부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          우선순위
        </DescriptionItem>
        <DescriptionItem>{data?.priorityLevel?.name}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          수정횟수
        </DescriptionItem>
        <DescriptionItem>{data.revisionNumber || '0'}</DescriptionItem>
      </DescriptionRow>

      {/* 3행: 매출구분, 매출품목/사업부 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          시작일(계획/실제)
        </DescriptionItem>
        <DescriptionItem>{`${data.planStartDate} / ${
          data.startDate || '-'
        }`}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          종료일(계획/실제)
        </DescriptionItem>
        <DescriptionItem>{`${data.planEndDate} / ${
          data.endDate || '-'
        }`}</DescriptionItem>
      </DescriptionRow>

      {/* 4행: 매출, 매출이익 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          최근작업일
        </DescriptionItem>
        <DescriptionItem>{data.lastWorkupdateDate || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          기간(예정/실제)
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
          계획(인원/투입)
        </DescriptionItem>
        <DescriptionItem>
          {data.taskScheduleType === 'scheduled'
            ? formatPlanningTimeData(data.planningTimeData)
            : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          작업일
        </DescriptionItem>
        <DescriptionItem grow>
          {data.proposal?.name || '00일 / 000시간'}
        </DescriptionItem>
      </DescriptionRow>

      {/* 6행: 비고 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          작업할당
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

export default ProjectTaskDescription;
