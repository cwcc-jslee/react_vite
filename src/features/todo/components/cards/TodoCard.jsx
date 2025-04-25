// src/features/project/components/tables/ProjectTaskList.jsx

import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Checkbox, Badge, Tooltip, Progress, Tag } from '@shared/components/ui';

/**
 * 프로젝트 작업 테이블 컴포넌트
 * 프로젝트의 작업 목록을 테이블 형태로 표시
 */
const TodoCard = ({
  task = null, // 작업 데이터 객체
}) => {
  if (!task) return null;

  // 날짜 포맷 헬퍼 함수
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 미정';

    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 우선순위 라벨 및 색상 설정
  const getPriorityBadge = (level) => {
    if (!level) return null;

    const priorityMap = {
      high: { label: '높음', className: 'bg-red-100 text-red-800' },
      medium: { label: '중간', className: 'bg-yellow-100 text-yellow-800' },
      low: { label: '낮음', className: 'bg-green-100 text-green-800' },
      normal: { label: '보통', className: 'bg-blue-100 text-blue-800' },
    };

    const priority = priorityMap[level.toLowerCase()] || {
      label: level,
      className: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={`mr-2 ${priority.className}`}>{priority.label}</Badge>
    );
  };

  return (
    <div className="w-full p-4 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {task.project && (
            <Tag color="blue" className="mr-2">
              {task.project.name || '프로젝트 없음'}
            </Tag>
          )}
          {task.projectTaskBucket && (
            <Tag color="cyan">
              {task?.projectTaskBucket?.name || '버킷 없음'}
            </Tag>
          )}
        </div>
        <div className="flex items-center">
          <Tooltip title="작업 상세 보기">
            <button className="p-2 text-blue-500 hover:text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="w-full md:w-1/4">
          <div className="flex items-center mb-2">
            {/* {getPriorityBadge(task?.priorityLevel)} */}
            <h3 className="text-lg font-bold text-gray-800">{task.name}</h3>
          </div>
          {task.task_progress && (
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <span className="text-xs font-medium text-gray-500 mr-2">
                  진행률:
                </span>
                <span className="text-xs font-bold">{task.task_progress}%</span>
              </div>
              <Progress
                percent={task.taskProgress || 0}
                size="small"
                status={task.taskProgress >= 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          )}
        </div>

        <div className="w-full md:w-1/4 mt-3 md:mt-0">
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-gray-500 mr-2">
                시작일:
              </span>
              <span className="text-sm text-gray-700">
                {formatDate(task.startDate)}
              </span>
            </div>
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-gray-500 mr-2">
                종료일:
              </span>
              <span className="text-sm text-gray-700">
                {formatDate(task.endDate)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 mr-2">
                최근 작업일:
              </span>
              <span className="text-sm text-gray-700">
                {formatDate(task.lastWorkupdateDate)}
              </span>
            </div>
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

        <div className="w-full md:w-1/4 mt-3 md:mt-0">
          {/* workDetails 참조 제거 */}
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
