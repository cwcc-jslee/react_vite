// src/features/project/components/tables/ProjectTaskTable.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useUiStore } from '@shared/hooks/useUiStore';
import { useTableColumns } from '@shared/hooks/useTableColumns';
import {
  Checkbox,
  Badge,
  Tooltip,
  Progress,
  Button,
  TableColumnMenu,
} from '@shared/components/ui';
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
import dayjs from 'dayjs';
import { getTaskScheduleStatus } from '../../utils/scheduleStatusUtils';
import { useProjectTaskUpdate } from '../../hooks/useProjectTaskUpdate';

// 테이블 컬럼 정의
const COLUMNS_DEF = [
  { key: 'index', title: '순번', align: 'center', width: '60px', essential: true },
  { key: 'priority', title: '우선순위', align: 'center' },
  { key: 'isCompleted', title: '완료', align: 'center', width: '60px' },
  { key: 'taskStatus', title: 'TASK상태', align: 'center', width: '80px', essential: true },
  {
    key: 'timeOverStatus',
    title: '시간초과',
    align: 'center',
    width: '80px',
  },
  { key: 'name', title: '작업명', align: 'left', essential: true },
  { key: 'bucket', title: '버킷', align: 'center' },
  { key: 'isScheduled', title: '일정구분', align: 'center' },
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
];

// 기본적으로 표시할 컬럼 (기본 모드 - XL)
const DEFAULT_COLUMNS_XL = [
  'index',
  'isCompleted',
  'taskStatus',
  'name',
  'bucket',
  'progress',
  'assignee',
  'endDate',
  'recentWorkDate',
  'totalWorkHours',
];

// 확장 모드 (WIDE) 표시 컬럼
const DEFAULT_COLUMNS_WIDE = [
  'index',
  'priority',
  'isCompleted',
  'taskStatus',
  'timeOverStatus',
  'name',
  'bucket',
  'isScheduled',
  'progress',
  'checklistProgress',
  'assignee',
  'startDate',
  'endDate',
  'recentWorkDate',
  'duration',
  'totalWorkHours',
];

/**
 * 프로젝트 작업 테이블 컴포넌트
 * 프로젝트의 작업 목록을 테이블 형태로 표시
 */
  const ProjectTaskTable = ({ projectTasks = [], isExpanded = false, onTaskClick }) => {
  console.log(`>>>> project task table 실행`);
  const dispatch = useDispatch();
  // const { actions } = useUiStore(); // 더 이상 사용하지 않음
  const { isUpdating, completeTask } = useProjectTaskUpdate();

  // 태스크 완료 여부 판단 함수
  const isTaskCompleted = (task) => {
    return task.isCompleted === true || task.taskProgress?.code === '100';
  };

  // 컬럼 표시 상태 관리
  const { visibleColumns, toggleColumn, resetColumns, showAllColumns, setVisibleColumns } =
    useTableColumns(isExpanded ? DEFAULT_COLUMNS_WIDE : DEFAULT_COLUMNS_XL);

  // 확장 상태 변경 시 컬럼 자동 조정
  useEffect(() => {
    setVisibleColumns(isExpanded ? DEFAULT_COLUMNS_WIDE : DEFAULT_COLUMNS_XL);
  }, [isExpanded, setVisibleColumns]);

  const isColumnVisible = (key) => visibleColumns.includes(key);

  // 완료 처리 상태 관리
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completionDate, setCompletionDate] = useState(new Date());

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

  // 빈 데이터 상태 표시 컴포넌트
  const EmptyState = () => (
    <tr>
      <td colSpan={visibleColumns.length} className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-gray-500">등록된 작업이 없습니다</span>
        </div>
      </td>
    </tr>
  );

  // 체크박스 클릭 핸들러 (완료 처리)
  const handleCheckboxComplete = (task, event) => {
    // 체크박스 기본 동작(체크 표시) 방지
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    // event가 있으면 전파 중지 (테이블 행 클릭 방지)
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    
    // 이미 완료된 태스크는 처리하지 않음 (또는 해제 로직 추가 가능)
    if (!isTaskCompleted(task)) {
      setCompletingTaskId(task.id);
      // 최근작업일이 있으면 사용, 없으면 오늘 날짜
      const defaultDate = task.lastWorkupdateDate
        ? new Date(task.lastWorkupdateDate)
        : new Date();
      setCompletionDate(defaultDate);
    }
  };

  // 완료 처리 확인
  const handleConfirmComplete = async () => {
    const task = projectTasks.find((t) => t.id === completingTaskId);
    const taskDocumentId = task?.documentId || completingTaskId;
    const taskName = task?.name || '';
    // dayjs를 사용하여 날짜 포맷팅 (타임존 이슈 방지)
    const formattedDate = dayjs(completionDate).format('YYYY-MM-DD');

    const result = await completeTask(taskDocumentId, formattedDate, taskName);

    if (result.success) {
      setCompletingTaskId(null);
    }
  };

  // 완료 처리 취소
  const handleCancelComplete = () => {
    setCompletingTaskId(null);
  };

  // 행 클릭 핸들러 (기능 삭제됨)
  // const handleTaskRowClick = (task) => { ... };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-y border-gray-200">
            {COLUMNS_DEF.filter((col) => isColumnVisible(col.key)).map((column, index, array) => (
              <th
                key={column.key}
                className={`px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap
                    ${column.align === 'center' && 'text-center'}
                    ${column.align === 'right' && 'text-right'}
                  `}
                style={{ width: column.width }}
              >
                {index === array.length - 1 ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>{column.title}</span>
                    <TableColumnMenu
                      columns={COLUMNS_DEF}
                      visibleColumns={visibleColumns}
                      onToggleColumn={toggleColumn}
                      onReset={resetColumns}
                      onShowAll={showAllColumns}
                      essentialColumns={COLUMNS_DEF.filter(c => c.essential).map(c => c.key)}
                      defaultVisibleColumns={isExpanded ? DEFAULT_COLUMNS_WIDE : DEFAULT_COLUMNS_XL}
                    />
                  </div>
                ) : (
                  column.title
                )}
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
                  className={`hover:bg-gray-100 transition-colors ${
                    isTaskCompleted(task) ? 'bg-zinc-50' : ''
                  } ${
                    completingTaskId === task.id ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* 순번 */}
                  {isColumnVisible('index') && (
                    <td className="px-3 py-2 text-center text-sm">{index + 1}</td>
                  )}

                  {/* 우선순위 */}
                  {isColumnVisible('priority') && (
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
                  )}

                  {/* 완료 체크박스 */}
                  {isColumnVisible('isCompleted') && (
                    <td className="px-3 py-2 text-center">
                      <Checkbox 
                        checked={isTaskCompleted(task)} 
                        onChange={(e) => handleCheckboxComplete(task, e)}
                        disabled={isTaskCompleted(task)} // 이미 완료된 건은 비활성화 (기존 로직 유지)
                      />
                    </td>
                  )}

                  {/* TASK상태 */}
                  {isColumnVisible('taskStatus') && (
                    <td className="px-3 py-2 text-center text-sm">
                      {formatTaskStatus(task)}
                    </td>
                  )}

                  {/* 시간초과 */}
                  {isColumnVisible('timeOverStatus') && (
                    <td className="px-3 py-2 text-center text-sm">
                      {formatTaskTimeOverStatus(task)}
                    </td>
                  )}

                  {/* 작업명 */}
                  {isColumnVisible('name') && (
                    <td className="px-3 py-2 text-sm">
                      <div
                        className={`${
                          isTaskCompleted(task) ? 'text-gray-500' : ''
                        }`}
                      >
                        {task.name}
                      </div>
                    </td>
                  )}

                  {/* 버킷 */}
                  {isColumnVisible('bucket') && (
                    <td className="px-3 py-2 text-center text-sm">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs">
                        {task.bucket || task?.projectTaskBucket?.name || '-'}
                      </span>
                    </td>
                  )}

                  {/* 스케줄 타입 */}
                  {isColumnVisible('isScheduled') && (
                    <td className="px-3 py-2 text-center text-sm">
                      {task.isScheduled ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                          SCHEDULED
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                          ONGOING
                        </span>
                      )}
                    </td>
                  )}

                  {/* 진행률 */}
                  {isColumnVisible('progress') && (
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
                  )}

                  {/* 체크리스트 */}
                  {isColumnVisible('checklistProgress') && (
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
                  )}

                  {/* 할당대상 */}
                  {isColumnVisible('assignee') && (
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
                  )}

                  {/* 시작일 */}
                  {isColumnVisible('startDate') && (
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
                  )}

                  {/* 완료일 */}
                  {isColumnVisible('endDate') && (
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
                  )}

                  {/* 최근작업일 */}
                  {isColumnVisible('recentWorkDate') && (
                    <td className="px-3 py-2 text-center text-sm">
                      {task.lastWorkupdateDate ? (
                        <span className="text-gray-900">
                          {formatDate(task.lastWorkupdateDate)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}

                  {/* 기간 */}
                  {isColumnVisible('duration') && (
                    <td className="px-3 py-2 text-center text-sm">
                      {calculateDuration(task.planStartDate, task.planEndDate)}
                    </td>
                  )}

                  {/* 작업시간 */}
                  {isColumnVisible('totalWorkHours') && (
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
                  )}

                  {/* ACTION - 삭제됨 */}
                </tr>

                {/* 완료 처리 입력 행 - 해당 작업 바로 아래 표시 */}
                {completingTaskId === task.id && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={visibleColumns.length} className="px-3 py-4">
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

export default ProjectTaskTable;