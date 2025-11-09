// src/features/project/components/modals/ProjectWorkDetailModal.jsx
/**
 * 프로젝트 Work 상세 정보 모달
 */

import React from 'react';
import { X, Clock, User, Calendar } from 'lucide-react';

const ProjectWorkDetailModal = ({ isOpen, onClose, projectName, works }) => {
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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{projectName}</h2>
            <p className="text-sm text-gray-600 mt-1">금주 작업 Work 목록 ({works.length}개)</p>
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
          {works.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              금주 작업된 Work가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      작업일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Task 이름
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      작업자
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      작업시간
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      비과금시간
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      초과근무
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      합계
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      작업내용
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {works.map((work, index) => (
                    <tr key={work.workId || index} className="hover:bg-gray-50 transition-colors">
                      {/* 작업일 */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatDate(work.workDate)}</span>
                        </div>
                      </td>

                      {/* Task 이름 */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{work.taskName}</div>
                      </td>

                      {/* 작업자 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">{work.userName}</span>
                        </div>
                      </td>

                      {/* 작업시간 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="font-semibold text-blue-700">{work.workHours}h</span>
                        </div>
                      </td>

                      {/* 비과금시간 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="font-semibold text-orange-700">{work.nonBillableHours}h</span>
                        </div>
                      </td>

                      {/* 초과근무 */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-red-400" />
                          <span className="font-semibold text-red-700">{work.overtimeHours}h</span>
                        </div>
                      </td>

                      {/* 합계 */}
                      <td className="px-4 py-4 text-center">
                        <div className="font-bold text-purple-700">{work.totalHours}h</div>
                      </td>

                      {/* 작업내용 */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate" title={work.description}>
                          {work.description || '-'}
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
            총 {works.length}개 Work |
            작업시간: {works.reduce((sum, w) => sum + (w.workHours || 0), 0).toFixed(1)}h |
            비과금: {works.reduce((sum, w) => sum + (w.nonBillableHours || 0), 0).toFixed(1)}h |
            초과근무: {works.reduce((sum, w) => sum + (w.overtimeHours || 0), 0).toFixed(1)}h |
            총합계: {works.reduce((sum, w) => sum + (w.totalHours || 0), 0).toFixed(1)}h
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkDetailModal;
