// src/features/project/components/tables/ProjectTaskList.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useUiStore } from '../../../../shared/hooks/useUiStore';
import {
  Checkbox,
  Badge,
  Tooltip,
  Progress,
  Button,
} from '../../../../shared/components/ui';
import {
  FiCheckSquare,
  FiClock,
  FiCalendar,
  FiCheck,
  FiX,
  FiMoreVertical,
  FiEye,
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getTaskScheduleStatus } from '../../utils/scheduleStatusUtils';
import { useProjectTaskUpdate } from '../../hooks/useProjectTaskUpdate';

/**
 * 프로젝트 작업 테이블 컴포넌트
 * 프로젝트의 작업 목록을 테이블 형태로 표시
 */
const ProjectTaskList = ({ projectTasks = [] }) => {
  console.log(`>>>> project task list  실행`);
  const dispatch = useDispatch();
  const { actions } = useUiStore();
  const { isUpdating, completeTask } = useProjectTaskUpdate();

  // 완료 처리 상태 관리
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completionDate, setCompletionDate] = useState(new Date());

  // 액션 메뉴 상태 관리
  const [openMenuId, setOpenMenuId] = useState(null);

  // 메뉴 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  // 우선순위에 따른 배지 색상 결정
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case '높음':
      case '긴급':
        return 'bg-red-500';
      case 'medium':
      case '중간':
        return 'bg-amber-500';
      case 'low':
      case '낮음':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  console.log(`==== projectTasks `, projectTasks);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  // 기간 계산 함수 (시작일과 완료일 사이의 일 수)
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '-';

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays}일`;
    } catch (e) {
      return '-';
    }
  };

  // 태스크 상태 계산 및 표시 함수 (ProjectList와 동일한 스타일)
  const formatTaskStatus = (task) => {
    const status = getTaskScheduleStatus(task);
    switch (status) {
      case 'normal':
        return <span className="text-xs text-green-600 font-medium">정상</span>;
      case 'imminent':
        return (
          <span className="text-xs text-orange-500 font-medium">임박</span>
        );
      case 'delayed':
        return <span className="text-xs text-red-500 font-bold">지연</span>;
      default:
        return <span className="text-xs text-green-600 font-medium">정상</span>;
    }
  };

  // 개별 태스크의 시간초과 상태 계산 함수
  const formatTaskTimeOverStatus = (task) => {
    if (!task.planningTimeData?.totalPlannedHours) return '-';

    const totalPlannedHours = task.planningTimeData.totalPlannedHours || 0;
    const totalActualHours = task.totalWorkHours || 0;

    if (totalActualHours <= totalPlannedHours) {
      // 계획시간 내
      return <span className="text-xs text-green-600 font-medium">정상</span>;
    } else {
      // 계획시간 초과
      const overHours = totalActualHours - totalPlannedHours;
      return (
        <span className="text-xs text-red-500 font-bold">+{overHours}h</span>
      );
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    { key: 'index', title: '순번', align: 'center', width: '60px' },
    { key: 'priority', title: '우선순위', align: 'center' },
    { key: 'completed', title: '완료', align: 'center', width: '60px' },
    { key: 'taskStatus', title: 'TASK상태', align: 'center', width: '80px' },
    {
      key: 'timeOverStatus',
      title: '시간초과',
      align: 'center',
      width: '80px',
    },
    { key: 'name', title: '작업명', align: 'left' },
    { key: 'bucket', title: '버킷', align: 'center' },
    { key: 'taskScheduleType', title: '일정구분', align: 'center' },
    { key: 'progress', title: '진행률', align: 'center', width: '80px' },
    { key: 'checklistProgress', title: '체크리스트', align: 'center' },
    { key: 'assignee', title: '할당대상', align: 'center' },
    { key: 'startDate', title: '시작일', align: 'center' },
    { key: 'endDate', title: '완료일', align: 'center' },
    { key: 'recentWorkDate', title: '최근작업일', align: 'center' },
    { key: 'duration', title: '기간', align: 'center', width: '70px' },
    {
      key: 'totalWorkHours',
      title: '작업/계획',
      align: 'left',
      width: '80px',
    },
    { key: 'actions', title: 'ACTION', align: 'center', width: '80px' },
  ];

  // 빈 데이터 상태 표시 컴포넌트
  const EmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-gray-500">등록된 작업이 없습니다</span>
        </div>
      </td>
    </tr>
  );

  // 액션 메뉴 토글
  const toggleActionMenu = (taskId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  // 액션 메뉴 항목 클릭 핸들러
  const handleActionClick = (action, task, event) => {
    event.stopPropagation();
    setOpenMenuId(null);

    switch (action) {
      case 'detail':
        handleTaskRowClick(task);
        break;
      case 'complete':
        if (!task.isCompleted) {
          setCompletingTaskId(task.id);
          // 최근작업일이 있으면 사용, 없으면 오늘 날짜
          const defaultDate = task.lastWorkupdateDate
            ? new Date(task.lastWorkupdateDate)
            : new Date();
          setCompletionDate(defaultDate);
        }
        break;
      default:
        break;
    }
  };

  // 완료 처리 확인
  const handleConfirmComplete = async () => {
    const task = projectTasks.find((t) => t.id === completingTaskId);
    const taskDocumentId = task?.documentId || completingTaskId;
    const taskName = task?.name || '';
    const formattedDate = completionDate.toISOString().split('T')[0];

    const result = await completeTask(taskDocumentId, formattedDate, taskName);

    if (result.success) {
      setCompletingTaskId(null);
    }
  };

  // 완료 처리 취소
  const handleCancelComplete = () => {
    setCompletingTaskId(null);
  };

  // 행 클릭 핸들러
  const handleTaskRowClick = (task) => {
    // Redux drawer 상태 변경
    actions.drawer.open({
      mode: 'view',
      data: task,
      width: '900px',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-y border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap
                    ${column.align === 'center' && 'text-center'}
                    ${column.align === 'right' && 'text-right'}
                  `}
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {!projectTasks?.length ? (
            <EmptyState />
          ) : (
            projectTasks.map((task, index) => (
              <React.Fragment key={task.id || index}>
                <tr
                  className={`hover:bg-gray-50 ${
                    task.isCompleted ? 'bg-gray-50' : ''
                  } ${
                    completingTaskId === task.id ? 'bg-blue-50' : ''
                  } cursor-pointer`}
                  onClick={() => handleTaskRowClick(task)}
                >
                  {/* 순번 */}
                  <td className="px-3 py-2 text-center text-sm">{index + 1}</td>

                  {/* 우선순위 */}
                  <td className="px-3 py-2 text-center">
                    {task.priorityLevel ? (
                      <Badge
                        className={`${getPriorityColor(
                          task.priority,
                        )} text-white`}
                        label={task.priorityLevel}
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 완료 체크박스 */}
                  <td className="px-3 py-2 text-center">
                    <Checkbox checked={task.isCompleted} disabled={true} />
                  </td>

                  {/* TASK상태 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {formatTaskStatus(task)}
                  </td>

                  {/* 시간초과 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {formatTaskTimeOverStatus(task)}
                  </td>

                  {/* 작업명 */}
                  <td className="px-3 py-2 text-sm">
                    <div
                      className={`${
                        task.isCompleted ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {task.name}
                    </div>
                  </td>

                  {/* 버킷 */}
                  <td className="px-3 py-2 text-center text-sm">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs">
                      {task?.projectTaskBucket?.name}
                    </span>
                  </td>

                  {/* 스케줄 타입 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {task.taskScheduleType === 'ongoing' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                        ONGOING
                      </span>
                    ) : task.taskScheduleType === 'scheduled' ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                        SCHEDULED
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 진행률 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {task.isProgress ? (
                      <span className="text-gray-900 font-medium">
                        {typeof task.taskProgress?.name === 'string'
                          ? parseInt(task.taskProgress.name, 10)
                          : task.taskProgress?.name || 0}
                        %
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 체크리스트 */}
                  <td className="px-3 py-2 text-center">
                    {task.checklist?.length > 0 ? (
                      <Tooltip
                        content={`${
                          task.checklist.filter((item) => item.checked).length
                        }/${task.checklist.length} 완료`}
                      >
                        <div className="flex items-center gap-1">
                          <FiCheckSquare className="text-indigo-500" />
                          <span className="text-xs">
                            {
                              task.checklist.filter((item) => item.checked)
                                .length
                            }
                            /{task.checklist.length}
                          </span>
                        </div>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 할당대상 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {task.users && task.users.length > 0 ? (
                      <div className="flex items-center justify-center">
                        {task.users.slice(0, 2).map((user, index) => (
                          <div
                            key={user.id || index}
                            className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-800 -ml-1 first:ml-0"
                          >
                            {user.username
                              ? user.username.substring(1, 3)
                              : '??'}
                          </div>
                        ))}
                        {task.users.length > 2 && (
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 -ml-1">
                            +{task.users.length - 2}
                          </div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 시작일 */}
                  <td className="px-3 py-2 text-center text-sm">
                    <Tooltip
                      content={
                        <>
                          {task.startDate && (
                            <div>확정: {formatDate(task.startDate)}</div>
                          )}
                          {task.planStartDate && (
                            <div>예정: {formatDate(task.planStartDate)}</div>
                          )}
                        </>
                      }
                    >
                      <span
                        className={`inline-flex items-center ${
                          task.startDate
                            ? 'text-gray-900'
                            : 'text-gray-500 italic'
                        }`}
                      >
                        {formatDate(task.startDate || task.planStartDate)}
                        {!task.startDate && task.planStartDate && (
                          <span className="ml-1 text-xs text-gray-500">
                            (예)
                          </span>
                        )}
                      </span>
                    </Tooltip>
                  </td>

                  {/* 완료일 */}
                  <td className="px-3 py-2 text-center text-sm">
                    <Tooltip
                      content={
                        <>
                          {task.endDate && (
                            <div>확정: {formatDate(task.endDate)}</div>
                          )}
                          {task.plannedEndDate && (
                            <div>예정: {formatDate(task.planEndDate)}</div>
                          )}
                        </>
                      }
                    >
                      <span
                        className={`inline-flex items-center ${
                          task.endDate
                            ? 'text-gray-900'
                            : 'text-gray-500 italic'
                        }`}
                      >
                        {formatDate(task.endDate || task.planEndDate)}
                        {!task.endDate && task.planEndDate && (
                          <span className="ml-1 text-xs text-gray-500">
                            (예)
                          </span>
                        )}
                      </span>
                    </Tooltip>
                  </td>

                  {/* 최근작업일 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {task.lastWorkupdateDate ? (
                      <span className="text-gray-900">
                        {formatDate(task.lastWorkupdateDate)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 기간 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {calculateDuration(task.planStartDate, task.planEndDate)}
                  </td>

                  {/* 작업시간 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {task.totalWorkHours ||
                    task.planningTimeData?.totalPlannedHours ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">작업</span>
                          <span
                            className={`font-medium ${
                              task.totalWorkHours >
                              (task.planningTimeData?.totalPlannedHours || 0)
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {task.totalWorkHours
                              ? `${task.totalWorkHours}h`
                              : '0h'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">계획</span>
                          <span className="text-gray-700">
                            {task.planningTimeData?.totalPlannedHours || 0}h
                          </span>
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="px-3 py-2 text-center relative">
                    <div className="relative">
                      <button
                        onClick={(event) => toggleActionMenu(task.id, event)}
                        className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <FiMoreVertical size={16} className="text-gray-600" />
                      </button>

                      {/* 드롭다운 메뉴 */}
                      {openMenuId === task.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(event) =>
                              handleActionClick('detail', task, event)
                            }
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiEye size={14} />
                            TASK 상세
                          </button>
                          {!task.isCompleted && (
                            <button
                              onClick={(event) =>
                                handleActionClick('complete', task, event)
                              }
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                            >
                              <FiCheck size={14} />
                              완료처리
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

                {/* 완료 처리 입력 행 - 해당 작업 바로 아래 표시 */}
                {completingTaskId === task.id && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={columns.length} className="px-3 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-blue-700">
                            "{task.name}" 작업 완료 처리
                          </span>
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-blue-600" />
                            <span className="text-sm text-gray-600">
                              완료일:
                            </span>
                            <DatePicker
                              selected={completionDate}
                              onChange={(date) => setCompletionDate(date)}
                              dateFormat="yyyy-MM-dd"
                              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              maxDate={new Date()}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={handleConfirmComplete}
                            disabled={isUpdating}
                            className="flex items-center gap-1"
                          >
                            <FiCheck size={14} />
                            {isUpdating ? '처리 중...' : '완료'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelComplete}
                            className="flex items-center gap-1"
                          >
                            <FiX size={14} />
                            취소
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTaskList;
