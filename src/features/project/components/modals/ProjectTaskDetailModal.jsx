// src/features/project/components/modals/ProjectTaskDetailModal.jsx
/**
 * 프로젝트 Task 상세 정보 모달
 */

import React from 'react';
import { X, CheckCircle, Circle, Clock, User } from 'lucide-react';

const ProjectTaskDetailModal = ({ isOpen, onClose, projectName, tasks }) => {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      done: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      in_progress: { label: '진행중', color: 'bg-blue-100 text-blue-800', icon: Circle },
      pending: { label: '대기', color: 'bg-gray-100 text-gray-800', icon: Circle },
      default: { label: status || '-', color: 'bg-gray-100 text-gray-800', icon: Circle },
    };

    const config = statusConfig[status] || statusConfig.default;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getProgressBarColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{projectName}</h2>
            <p className="text-sm text-gray-600 mt-1">금주 작업 Task 목록 ({tasks.length}개)</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 바디 */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              금주 작업된 Task가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Task 이름
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      작업 인원
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      계획 시간
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      금주 투입
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      진행률
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task, index) => (
                    <tr key={task.taskId || index} className="hover:bg-gray-50 transition-colors">
                      {/* Task 이름 */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{task.taskName}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                        )}
                      </td>

                      {/* 상태 */}
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(task.status)}
                      </td>

                      {/* 작업 인원 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">{task.userCount}명</span>
                        </div>
                        {task.users && task.users.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {task.users.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* 계획 시간 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">{task.planningHours}h</span>
                        </div>
                      </td>

                      {/* 금주 투입 */}
                      <td className="px-4 py-4 text-center">
                        <div className="font-semibold text-blue-700">{task.actualHours}h</div>
                        {task.planningHours > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round((task.actualHours / task.planningHours) * 100)}%)
                          </div>
                        )}
                      </td>

                      {/* 진행률 */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full max-w-[120px] bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressBarColor(task.progress)}`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <div className="text-xs font-medium text-gray-700">
                            {task.progress}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            총 {tasks.length}개 Task |
            총 계획: {tasks.reduce((sum, t) => sum + (t.planningHours || 0), 0)}h |
            총 투입: {tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)}h
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskDetailModal;
