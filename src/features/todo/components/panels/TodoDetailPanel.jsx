import React from 'react';

/**
 * 할일 상세 정보를 표시하는 패널 컴포넌트
 * TodoPanelSection의 children으로 사용
 */
const TodoDetailPanel = ({ task }) => {
  if (!task) return null;

  return (
    <div className="divide-y divide-gray-200">
      {/* 기본 정보 */}
      <div className="py-3">
        <h3 className="font-bold text-lg mb-1">{task.name}</h3>
        <div className="flex space-x-2 text-sm text-gray-500">
          <span>ID: {task.id}</span>
          <span>•</span>
          <span>상태: {task.status || '진행 중'}</span>
        </div>
      </div>

      {/* 설명 */}
      <div className="py-3">
        <h4 className="font-semibold mb-2">설명</h4>
        <p className="text-sm whitespace-pre-line">
          {task.description || '설명이 없습니다.'}
        </p>
      </div>

      {/* 담당자 정보 */}
      {task.assignee && (
        <div className="py-3">
          <h4 className="font-semibold mb-2">담당자</h4>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              {task.assignee.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {task.assignee.name?.substring(0, 2).toUpperCase() || '??'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">{task.assignee.name}</p>
              <p className="text-xs text-gray-500">{task.assignee.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* 일정 정보 */}
      <div className="py-3">
        <h4 className="font-semibold mb-2">일정</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">시작일:</span>{' '}
            {task.startDate
              ? new Date(task.startDate).toLocaleDateString()
              : '-'}
          </div>
          <div>
            <span className="text-gray-500">종료일:</span>{' '}
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
          </div>
        </div>
      </div>

      {/* 프로젝트 정보 */}
      {task.project && (
        <div className="py-3">
          <h4 className="font-semibold mb-2">프로젝트</h4>
          <div className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: task.project.color || '#CBD5E0' }}
            ></span>
            <p>{task.project.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoDetailPanel;
