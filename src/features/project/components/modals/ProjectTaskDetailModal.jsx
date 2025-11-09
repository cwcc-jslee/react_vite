// src/features/project/components/modals/ProjectTaskDetailModal.jsx
/**
 * 프로젝트 Task 상세 정보 모달
 */

import React from 'react';
import { X, Clock, User, Calendar } from 'lucide-react';

const ProjectTaskDetailModal = ({ isOpen, onClose, projectName, tasks }) => {
  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
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
                      시작일
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      종료 예정일
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
                      누적 투입시간
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
                      </td>

                      {/* 시작일 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatDate(task.startDate)}</span>
                        </div>
                      </td>

                      {/* 종료 예정일 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatDate(task.planEndDate)}</span>
                        </div>
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
                        <div className="font-semibold text-blue-700">{task.thisWeekHours}h</div>
                        {task.planningHours > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round((task.thisWeekHours / task.planningHours) * 100)}%)
                          </div>
                        )}
                      </td>

                      {/* 누적 투입시간 */}
                      <td className="px-4 py-4 text-center">
                        <div className="font-semibold text-purple-700">{task.accumulatedHours}h</div>
                        {task.planningHours > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round((task.accumulatedHours / task.planningHours) * 100)}%)
                          </div>
                        )}
                      </td>

                      {/* 진행률 (task_progress.code 기반) */}
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm font-medium text-gray-700">
                          {task.taskProgressName}
                        </div>
                        {task.taskProgressCode && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({task.taskProgressCode})
                          </div>
                        )}
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
            총 계획: {tasks.reduce((sum, t) => sum + (t.planningHours || 0), 0).toFixed(1)}h |
            금주 투입: {tasks.reduce((sum, t) => sum + (t.thisWeekHours || 0), 0).toFixed(1)}h |
            누적 투입: {tasks.reduce((sum, t) => sum + (t.accumulatedHours || 0), 0).toFixed(1)}h
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
