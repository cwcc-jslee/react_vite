// src/features/project/components/ProjectDetailTable.jsx
// 프로젝트 상세 정보를 표시하는 컴포넌트
// 프로젝트의 상태, 진행률, 완료여부 등 다양한 정보를 표시합니다

import React from 'react';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Progress,
  Badge,
  StatusProgressIndicator,
} from '@shared/components/ui/index';

/**
 * 완료 여부를 표시하는 Status Badge 컴포넌트
 * @param {boolean} isCompleted - 완료 여부
 * @returns {JSX.Element} - 상태 표시 UI 요소
 */
const StatusBadge = ({ isCompleted }) => {
  return isCompleted ? (
    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
      완료
    </span>
  ) : (
    <span className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">
      진행중
    </span>
  );
};

/**
 * 프로젝트 상세 정보 테이블 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - 프로젝트 상세 데이터
 * @param {Array} props.projectTasks - 프로젝트 태스크 목록
 * @param {Function} props.onStatusClick - 상태 클릭 시 호출될 함수
 */
const ProjectDetailTable = ({
  data = {},
  projectTasks = [],
  onStatusClick,
}) => {
  if (!data) return null;
  console.log('>>>>>data', data);

  // 완료된 태스크 수 계산
  const completedTasksCount = projectTasks.filter(
    (task) => task.isCompleted,
  ).length;

  // 전체 진행률 계산 (완료된 태스크 / 전체 태스크 * 100 또는 projectProgress 값 사용)
  const calculateProgress = () => {
    if (data.projectProgress !== undefined) {
      return data.projectProgress;
    }
    if (!projectTasks.length) return 0;
    return Math.round((completedTasksCount / projectTasks.length) * 100);
  };

  // 진행률에 따른 상태 계산
  const getProgressStatus = () => {
    const progress = calculateProgress();
    if (progress >= 100) return 'success';
    return 'normal';
  };

  // 프로젝트 상태 단계 정의
  const projectStatuses = ['시작전', '진행중', '검수', '완료'];

  return (
    <Description>
      {/* 기본 4칸 구조 - 너비 지정 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          진행상태
        </DescriptionItem>
        <DescriptionItem>
          <div className="w-full h-full cursor-pointer" onClick={onStatusClick}>
            <StatusProgressIndicator
              statuses={projectStatuses}
              currentStatus={data.pjtStatus?.name || '시작전'}
            />
          </div>
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          TASK
        </DescriptionItem>
        <DescriptionItem>{`${completedTasksCount}/${projectTasks.length}`}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          진행률
        </DescriptionItem>
        <DescriptionItem>
          <Progress
            percent={calculateProgress()}
            status={getProgressStatus()}
            size="small"
          />
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          완료여부
        </DescriptionItem>
        <DescriptionItem>
          <StatusBadge isCompleted={data.isCompleted} />
        </DescriptionItem>
      </DescriptionRow>

      {/* 2행:  */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          계획/투입시간
        </DescriptionItem>
        <DescriptionItem>
          {data.plannedHours || '-'} / {data.actualHours || '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          남은시간
        </DescriptionItem>
        <DescriptionItem>{data.remainingHours || '-'}</DescriptionItem>

        <DescriptionItem label width="w-[140px]">
          중요도
        </DescriptionItem>
        <DescriptionItem>{data.importanceLevel?.name || '-'}</DescriptionItem>

        <DescriptionItem label width="w-[140px]">
          담당자
        </DescriptionItem>
        <DescriptionItem>{data.manager?.name || '-'}</DescriptionItem>
      </DescriptionRow>

      {/* 3행: */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          상태변경
        </DescriptionItem>
        <DescriptionItem>
          {data.statusChangeCount ? `총 ${data.statusChangeCount}건` : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          사업부/서비스
        </DescriptionItem>
        <DescriptionItem>
          {data.team?.name || '-'} / {data.service?.name || '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          (위험도-기간)
        </DescriptionItem>
        <DescriptionItem>{data.scheduleRisk || '정상'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          (위험도-시간)
        </DescriptionItem>
        <DescriptionItem>{data.timeRisk || '정상'}</DescriptionItem>
      </DescriptionRow>

      {/* 4행:  */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          사업년도
        </DescriptionItem>
        <DescriptionItem>{data.fy?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          SFA
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {data.sfa?.name || '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          이슈사항
        </DescriptionItem>
        <DescriptionItem>{data.issueCount || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          비고
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {data.remarks || '-'}
        </DescriptionItem>
      </DescriptionRow>
    </Description>
  );
};

export default ProjectDetailTable;
