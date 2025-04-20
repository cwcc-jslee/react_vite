// src/features/project/components/tables/ProjectTaskList.jsx

import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setDrawer } from '../../../../store/slices/uiSlice';
import {
  Checkbox,
  Badge,
  Tooltip,
  Progress,
} from '../../../../shared/components/ui';
import { Card } from '../../../../shared/components/ui/card/Card';
import { Pagination } from '../../../../shared/components/ui/pagination/Pagination';
import { FiCheckSquare, FiClock, FiCalendar } from 'react-icons/fi';

/**
 * 프로젝트 작업 테이블 컴포넌트
 * 프로젝트의 작업 목록을 테이블 형태로 표시
 */
const ProjectTaskList = ({
  allTasks = [], // 인덱스가 포함된 모든 작업 배열 받기
  loading = false,
  error = null,

  onTaskEdit = () => {},
}) => {
  const dispatch = useDispatch();

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

  // console.log(`==== buckets `, buckets);
  console.log(`==== allTasks `, allTasks);

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

  // 테이블 컬럼 정의
  const columns = [
    { key: 'index', title: '순번', align: 'center', width: '60px' },
    { key: 'completed', title: '완료', align: 'center', width: '60px' },
    { key: 'name', title: '작업명', align: 'left' },
    { key: 'bucket', title: '버킷', align: 'center' },
    { key: 'checklistProgress', title: '체크리스트', align: 'center' },
    { key: 'assignee', title: '할당대상', align: 'center' },
    { key: 'startDate', title: '시작일', align: 'center' },
    { key: 'endDate', title: '완료일', align: 'center' },
    { key: 'duration', title: '기간', align: 'center', width: '70px' },
    { key: 'workHours', title: '작업시간', align: 'center', width: '80px' },
    { key: 'progress', title: '완료%', align: 'center', width: '80px' },
    { key: 'priority', title: '우선순위', align: 'center' },
  ];

  // 로딩 상태 표시 컴포넌트
  const LoadingState = () => (
    <tr>
      <td colSpan={columns.length} className="py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">
            데이터를 불러오는 중입니다...
          </span>
        </div>
      </td>
    </tr>
  );

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

  // 에러 상태 표시 컴포넌트
  const ErrorState = ({ message }) => (
    <tr>
      <td colSpan={columns.length} className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-red-500">
            {message || '데이터를 불러오는 중 오류가 발생했습니다'}
          </span>
        </div>
      </td>
    </tr>
  );

  // 행 클릭 핸들러
  const handleRowClick = (task) => {
    console.log(`===== handleRowClick `, task);
    // Redux drawer 상태 변경
    dispatch(
      setDrawer({
        visible: true,
        mode: 'view',
        // type: 'task',
        // data: task,
        options: {
          taskId: task.id,
          bucketIndex: task._bucketIndex,
          taskIndex: task._taskIndex,
        },
      }),
    );
  };

  // 체크박스 클릭 시 이벤트 전파 중지
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Card>
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
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : !allTasks?.length ? (
              <EmptyState />
            ) : (
              allTasks.map((task, index) => (
                <tr
                  key={task.id || index}
                  className={`hover:bg-gray-50 ${
                    task.completed ? 'bg-gray-50' : ''
                  } cursor-pointer`}
                  onClick={() => handleRowClick(task)}
                >
                  {/* 순번 */}
                  <td className="px-3 py-2 text-center text-sm">{index + 1}</td>
                  {/* 완료 체크박스 */}
                  <td className="px-3 py-2 text-center">
                    <Checkbox
                      checked={task.completed}
                      // onChange={(e) => onTaskComplete(task.id, e.target.checked)}
                    />
                  </td>

                  {/* 작업명 */}
                  <td className="px-3 py-2 text-sm">
                    <div
                      className={`${
                        task.completed ? 'line-through text-gray-400' : ''
                      }`}
                      onClick={() => onTaskEdit(task.id)}
                    >
                      {task.name}
                    </div>
                  </td>

                  {/* 버킷 */}
                  <td className="px-3 py-2 text-center text-sm">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs">
                      {task.bucket}
                    </span>
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
                    {task.assignee ? (
                      <div className="flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-800">
                          {task.assignee.name
                            ? task.assignee.name.substring(0, 2)
                            : '??'}
                        </div>
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

                  {/* 기간 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {calculateDuration(task.planStartDate, task.planEndDate)}
                  </td>

                  {/* 작업시간 */}
                  <td className="px-3 py-2 text-center text-sm">
                    {task.totalWorkHours ? (
                      <div className="flex items-center justify-center gap-1">
                        <FiClock className="text-gray-500" size={14} />
                        <span>{task.totalWorkHours}h</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 완료% */}
                  <td className="px-3 py-2">
                    <Progress
                      percent={
                        typeof task.taskProgress?.name === 'string'
                          ? parseInt(task.taskProgress.name, 10) // 10은 10진법
                          : task.taskProgress?.name || 0
                      }
                      size="sm"
                      showInfo={true}
                    />
                  </td>

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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ProjectTaskList;
