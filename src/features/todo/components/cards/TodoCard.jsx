// src/features/project/components/tables/ProjectTaskList.jsx
// 프로젝트 작업 카드 컴포넌트 - 작업 정보를 직관적인 카드 형태로 표시
// 작업 일정 상태(정상, 지연)를 시각적으로 표시하고 남은 일수/경과 일수를 계산하여 보여줌

import React, { useMemo } from 'react';
import {
  Checkbox,
  Badge,
  Tooltip,
  Progress,
  Tag,
  Dropdown,
} from '@shared/components/ui';
import {
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiMenu,
  FiEdit,
  FiEye,
} from 'react-icons/fi';
import dayjs from 'dayjs';

const TodoCard = ({
  task = null, // 작업 데이터 객체
  onCardMenuClick = () => {}, // 작업 메뉴 클릭 핸들러
  isSelected = false, // 현재 선택된 작업인지 여부
}) => {
  if (!task) return null;

  // 날짜 포맷 헬퍼 함수 (dayjs 사용)
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 미정';
    return dayjs(dateString).format('YYYY-MM-DD');
  };

  // 일정 상태 계산 함수
  const getScheduleStatus = useMemo(() => {
    // ongoing 타입인 경우 별도 처리
    if (task.taskScheduleType === 'ongoing') {
      return {
        status: 'ongoing',
        daysText: 'ongoing',
        statusClass: 'text-purple-600 font-bold',
      };
    }

    // 오늘 날짜 (시간 제외)
    const today = dayjs().startOf('day');

    // 종료일 (확정 또는 예정)
    const endDateStr = task.endDate || task.planEndDate;
    if (!endDateStr)
      return {
        status: 'normal',
        daysText: '기한 미정',
        statusClass: 'text-gray-500',
      };

    const endDate = dayjs(endDateStr).startOf('day');

    // 남은 일수 또는 지연된 일수 계산
    const diffDays = endDate.diff(today, 'day');

    if (diffDays < 0) {
      // 지연: 종료일이 지남
      return {
        status: 'delayed',
        daysText: `${Math.abs(diffDays)}일 지연`,
        statusClass: 'text-red-600 font-bold',
      };
    } else if (diffDays === 0) {
      // 오늘이 마감일
      return {
        status: 'today',
        daysText: '오늘 마감',
        statusClass: 'text-orange-500 font-bold',
      };
    } else if (diffDays <= 3) {
      // 임박: 3일 이하 남음
      return {
        status: 'urgent',
        daysText: `${diffDays}일 남음`,
        statusClass: 'text-amber-500 font-bold',
      };
    } else {
      // 정상: 여유 있음
      return {
        status: 'normal',
        daysText: `${diffDays}일 남음`,
        statusClass: 'text-green-600',
      };
    }
  }, [task.endDate, task.planEndDate, task.taskScheduleType]);

  // 우선순위 라벨 및 색상 설정
  const getPriorityBadge = (priority) => {
    if (!priority) return null;

    // priority가 객체인지 확인하고 code 값을 추출
    const priorityCode = priority?.code || priority;

    // 디버깅용 콘솔 로그 추가
    // console.log('Priority Object:', priority);
    // console.log('Priority Code:', priorityCode);

    // priorityCode가 문자열인지 확인
    const priorityKey =
      typeof priorityCode === 'string'
        ? priorityCode.toLowerCase()
        : String(priorityCode).toLowerCase();
    // console.log('Priority Key for Map:', priorityKey);

    // 우선순위 코드별 색상 매핑
    const priorityColorMap = {
      urgent: 'bg-red-400 text-red-800',
      high: 'bg-orange-400 text-orange-800',
      medium: 'bg-yellow-400 text-yellow-800',
      low: 'bg-green-400 text-green-800',
      normal: 'bg-blue-400 text-blue-800',
    };

    // priorityCode로 색상 매핑
    const colorClass =
      priorityColorMap[priorityKey] || 'bg-gray-400 text-gray-800';

    // 라벨은 항상 객체의 name 속성을 사용
    const label = priority?.name || String(priorityCode);

    // console.log('Selected Color:', colorClass);
    // console.log('Selected Label:', label);

    return <Badge className={`mr-2 ${colorClass}`}>{label}</Badge>;
  };

  // task_schedule_type이 ongoing인지 확인
  const isOngoing = task.taskScheduleType === 'ongoing';

  // 카드 테두리 색상 (일정 상태에 따라 변경)
  const cardBorderClass = useMemo(() => {
    // 선택된 상태일 때 다른 테두리 스타일 적용
    if (isSelected) return 'border-blue-500 border-2 shadow-lg';

    switch (getScheduleStatus.status) {
      case 'ongoing':
        return 'border-purple-300 border-2';
      case 'delayed':
        return 'border-red-300 border-2';
      case 'today':
        return 'border-orange-300 border-2';
      case 'urgent':
        return 'border-amber-300 border-2';
      default:
        return 'border-gray-200';
    }
  }, [getScheduleStatus, isSelected]);

  // 원형 진행률 컴포넌트
  const CircularProgress = ({ progress, revisionNumber }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    // progress 값에서 %를 제거하고 숫자로 변환
    const progressValue = parseInt(progress.replace('%', ''));
    const progressOffset =
      circumference - (progressValue / 100) * circumference;

    return (
      <div className="relative w-12 h-12">
        <svg className="w-full h-full transform -rotate-90">
          {/* 배경 원 */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-gray-200"
            strokeWidth="4"
            fill="none"
          />
          {/* 진행률 원 */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-blue-500"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
          />
        </svg>
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">
            {revisionNumber}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full p-4 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border ${cardBorderClass}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {/* 일정 상태 배지 */}
          <div className="mr-3">
            <Badge
              className={`px-2 py-1 rounded-md flex items-center ${
                getScheduleStatus.status === 'ongoing'
                  ? 'bg-purple-400 text-purple-800'
                  : getScheduleStatus.status === 'delayed'
                  ? 'bg-red-400 text-red-800'
                  : getScheduleStatus.status === 'today'
                  ? 'bg-orange-400 text-orange-800'
                  : getScheduleStatus.status === 'urgent'
                  ? 'bg-amber-400 text-amber-800'
                  : 'bg-green-400 text-green-800'
              }`}
            >
              {getScheduleStatus.status === 'ongoing' && (
                <FiClock className="mr-1" size={14} />
              )}
              {getScheduleStatus.status === 'delayed' && (
                <FiAlertCircle className="mr-1" size={14} />
              )}
              {getScheduleStatus.status === 'today' && (
                <FiClock className="mr-1" size={14} />
              )}
              {getScheduleStatus.status === 'urgent' && (
                <FiClock className="mr-1" size={14} />
              )}
              {getScheduleStatus.status === 'normal' && (
                <FiCheckCircle className="mr-1" size={14} />
              )}
              <span>
                {getScheduleStatus.status === 'ongoing'
                  ? 'ongoing'
                  : getScheduleStatus.status === 'delayed'
                  ? '지연'
                  : getScheduleStatus.status === 'today'
                  ? '오늘 마감'
                  : getScheduleStatus.status === 'urgent'
                  ? '임박'
                  : '정상'}
              </span>
            </Badge>
          </div>
          {/* 고객사 정보 추가 */}
          {task.project.sfa?.customer && (
            <Tag color="orange" className="mr-2">
              {typeof task.project.sfa.customer === 'object'
                ? task.project.sfa.customer.name || '고객사 없음'
                : String(task.sfa.customer)}
            </Tag>
          )}
          {task.taskScheduleType && (
            <Tag color="purple" className="mr-2">
              {task.project.workType}
            </Tag>
          )}
          {task.project && (
            <Tag color="blue" className="mr-2">
              {typeof task.project === 'object'
                ? task.project.name || '프로젝트 없음'
                : String(task.project)}
            </Tag>
          )}
          {task.projectTaskBucket && (
            <Tag color="cyan">
              {typeof task.projectTaskBucket === 'object'
                ? task.projectTaskBucket.name || '버킷 없음'
                : String(task.projectTaskBucket)}
            </Tag>
          )}
        </div>
        <div className="flex items-center">
          <Tooltip title="작업 메뉴">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'view',
                    icon: <FiEye size={14} />,
                    label: '작업보기',
                  },
                  {
                    key: 'add',
                    icon: <FiEdit size={14} />,
                    label: '작업등록',
                  },
                ],
                onClick: (item) => onCardMenuClick(item, task),
              }}
              trigger={['click']}
            >
              <button className="p-2 text-blue-500 hover:text-blue-700">
                <FiMenu size={18} />
              </button>
            </Dropdown>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="w-full md:w-1/4">
          <div className="flex items-center mb-2">
            {getPriorityBadge(task?.priorityLevel)}
            <h3 className="text-lg font-bold text-gray-800">{task.name}</h3>
          </div>
          {task.taskProgress && (
            <div className="mt-2 flex items-center">
              <CircularProgress
                progress={task.taskProgress?.name || '0%'}
                revisionNumber={task.revisionNumber || 0}
              />
              <div className="ml-3">
                {/* <div className="flex items-center mb-1">
                  <span className="text-xs font-medium text-gray-500 mr-2">
                    진행률:
                  </span>
                  <span className="text-xs font-bold">
                    {task.taskProgress?.name || '0%'}
                  </span>
                </div> */}
                <Progress
                  percent={parseInt(
                    task.taskProgress?.name?.replace('%', '') || '0',
                  )}
                  size="small"
                  status={
                    task.taskProgress?.name === '100%' ? 'success' : 'active'
                  }
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/4 mt-3 md:mt-0">
          <div className="flex flex-col">
            {isOngoing ? (
              <>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    프로젝트 시작일:
                  </span>
                  <span
                    className={`text-sm inline-flex items-center ${
                      task.project?.startDate
                        ? 'text-gray-700'
                        : 'text-gray-500 italic'
                    }`}
                  >
                    <FiCalendar className="mr-1" size={14} />
                    {formatDate(
                      task.project?.startDate || task.project?.planStartDate,
                    )}
                    {!task.project?.startDate &&
                      task.project?.planStartDate && (
                        <span className="ml-1 text-xs text-gray-500">(예)</span>
                      )}
                  </span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    프로젝트 종료일:
                  </span>
                  <span
                    className={`text-sm inline-flex items-center ${
                      task.project?.endDate
                        ? 'text-gray-700'
                        : 'text-gray-500 italic'
                    }`}
                  >
                    <FiCalendar className="mr-1" size={14} />
                    {formatDate(
                      task.project?.endDate || task.project?.planEndDate,
                    )}
                    {!task.project?.endDate && task.project?.planEndDate && (
                      <span className="ml-1 text-xs text-gray-500">(예)</span>
                    )}
                  </span>
                </div>
                {/* 일정 상태 표시 */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    일정 상태:
                  </span>
                  <span
                    className={`text-sm inline-flex items-center ${getScheduleStatus.statusClass}`}
                  >
                    <FiClock className="mr-1" size={16} />
                    {getScheduleStatus.daysText}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    TASK 시작일:
                  </span>
                  <span
                    className={`text-sm inline-flex items-center ${
                      task.startDate ? 'text-gray-700' : 'text-gray-500 italic'
                    }`}
                  >
                    <FiCalendar className="mr-1" size={14} />
                    {formatDate(task.startDate || task.planStartDate)}
                    {!task.startDate && task.planStartDate && (
                      <span className="ml-1 text-xs text-gray-500">(예)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    TASK 종료일:
                  </span>
                  <span
                    className={`text-sm inline-flex items-center ${
                      task.endDate ? 'text-gray-700' : 'text-gray-500 italic'
                    }`}
                  >
                    <FiCalendar className="mr-1" size={14} />
                    {formatDate(task.endDate || task.planEndDate)}
                    {!task.endDate && task.planEndDate && (
                      <span className="ml-1 text-xs text-gray-500">(예)</span>
                    )}
                  </span>
                </div>
                {/* 일정 상태 표시 */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    일정 상태:
                  </span>
                  <span
                    className={`text-sm inline-flex items-center ${getScheduleStatus.statusClass}`}
                  >
                    {/* JSX 요소를 직접 사용하지 않고 조건부 렌더링으로 변경 */}
                    {getScheduleStatus.status === 'delayed' && (
                      <FiAlertCircle className="mr-1" size={16} />
                    )}
                    {getScheduleStatus.status === 'today' && (
                      <FiClock className="mr-1" size={16} />
                    )}
                    {getScheduleStatus.status === 'urgent' && (
                      <FiClock className="mr-1" size={16} />
                    )}
                    {getScheduleStatus.status === 'normal' && (
                      <FiCheckCircle className="mr-1" size={16} />
                    )}
                    {getScheduleStatus.daysText}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/4 mt-3 md:mt-0">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-500 mr-2">
              총 작업시간:
            </span>
            <span className="text-sm font-bold text-gray-700">
              {task.totalWorkHours ? `${task.totalWorkHours}시간` : '기록 없음'}
            </span>
          </div>
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-500 mr-2">
              최근 작업일:
            </span>
            <span className="text-sm text-gray-700">
              {formatDate(task.lastWorkupdateDate)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 mr-2">
              담당자:
            </span>
            <div className="flex flex-wrap">
              {task.users && task.users.length > 0 ? (
                task.users.map((user, index) => (
                  <Badge
                    key={index}
                    className="mr-1 mb-1 bg-blue-100 text-blue-800"
                  >
                    {user.username || `사용자 ${index + 1}`}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">
                  배정된 담당자 없음
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
