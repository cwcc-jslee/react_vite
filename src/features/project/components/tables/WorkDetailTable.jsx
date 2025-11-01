// src/features/project/components/tables/WorkDetailTable.jsx

import React, { useState, useMemo } from 'react';
import { Card } from '@shared/components/ui/card/Card';

/**
 * 작업 상세 데이터 테이블
 * 투입률 페이지에서 work 리스트를 표시
 */
const WorkDetailTable = ({ workData = [], filters = {} }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'workDate',
    direction: 'desc', // 최신 작업일이 위로
  });
  const itemsPerPage = 20;

  // 데이터 변환 및 정렬
  const processedData = useMemo(() => {
    if (!workData || workData.length === 0) return [];

    // 1. 데이터 변환
    const transformed = workData.map((work, index) => ({
      no: index + 1,
      id: work.id,
      workDate: work.workDate || '-',
      customerName: work.projectTask?.project?.customer?.name || '-',
      projectName: work.projectTask?.project?.name || '-',
      taskName: work.projectTask?.name || '-',
      teamName: work.team?.name || work.user?.team?.name || '-',
      userName: work.user?.username || '-',
      workHours: work.workHours || 0,
      taskProgress: work.taskProgress?.name || '-',
      _raw: work, // 원본 데이터 보관
    }));

    // 2. 정렬
    const sorted = [...transformed].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // 숫자 비교
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 문자열 비교
      const aStr = String(aValue);
      const bStr = String(bValue);

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return sorted;
  }, [workData, sortConfig]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = processedData.slice(startIndex, endIndex);

  // 총 작업시간 계산
  const totalWorkHours = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.workHours, 0);
  }, [processedData]);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 정렬 핸들러
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
    setCurrentPage(1); // 정렬 시 첫 페이지로
  };

  // 정렬 아이콘
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  // 빈 데이터
  if (!workData || workData.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">작업 상세 데이터</h3>
          <div className="text-center text-gray-500 py-8">
            선택한 기간에 작업 데이터가 없습니다.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">작업 상세 데이터</h3>
            <p className="text-sm text-gray-600 mt-1">
              총 {processedData.length}건 | 총 작업시간: {totalWorkHours.toFixed(1)}h
            </p>
          </div>
          {/* 필터 정보 */}
          <div className="text-sm text-gray-600">
            {filters.startDate && filters.endDate && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md mr-2">
                {filters.startDate} ~ {filters.endDate}
              </span>
            )}
            {filters.teamId && (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md mr-2">
                팀 필터 적용
              </span>
            )}
            {filters.userId && (
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md">
                사용자 필터 적용
              </span>
            )}
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NO
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('workDate')}
                >
                  <div className="flex items-center gap-1">
                    작업일
                    {getSortIcon('workDate')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객사
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로젝트명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task명
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  팀명
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업자
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('workHours')}
                >
                  <div className="flex items-center justify-end gap-1">
                    작업시간
                    {getSortIcon('workHours')}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  진행상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {item.workDate}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={item.customerName}>
                    {item.customerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={item.projectName}>
                    {item.projectName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={item.taskName}>
                    {item.taskName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
                    {item.teamName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
                    {item.userName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {item.workHours.toFixed(1)}h
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {item.taskProgress}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(endIndex, processedData.length)} / {processedData.length}건
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                // 현재 페이지 주변만 표시
                const pageNum = i + 1;
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);

                if (!showPage) {
                  if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkDetailTable;
