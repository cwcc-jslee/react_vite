// src/features/project/sections/ProjectOneoffTaskSection.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useProject } from '../context/ProjectProvider';
import { Table, Button, Spinner, Alert } from '@shared/components/ui';

/**
 * 일회성 작업 목록 섹션 컴포넌트
 * 프로젝트에 속하지 않은 단일 작업 목록을 표시
 */
const ProjectSingleTaskSection = () => {
  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  // 프로젝트 컨텍스트 사용
  const { state, fetchOneoffTasks } = useProject();
  const {
    items,
    loading,
    error,
    pagination: apiPagination,
  } = state.oneoffTasks;

  // 초기 데이터 로드
  useEffect(() => {
    fetchOneoffTasks(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize, fetchOneoffTasks]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination({
      page: 1, // 페이지 크기 변경 시 첫 페이지로 리셋
      pageSize: newPageSize,
    });
  }, []);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    fetchOneoffTasks(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize, fetchOneoffTasks]);

  // 테이블 열 정의
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '80px',
    },
    {
      header: '작업명',
      accessor: 'name',
      cell: (row) => (
        <div className="font-medium">{row.name || '(제목 없음)'}</div>
      ),
    },
    {
      header: '상태',
      accessor: 'status',
      width: '120px',
      cell: (row) => {
        const statusMap = {
          todo: { label: '할일', className: 'bg-blue-100 text-blue-800' },
          in_progress: {
            label: '진행중',
            className: 'bg-yellow-100 text-yellow-800',
          },
          done: { label: '완료', className: 'bg-green-100 text-green-800' },
          pending: { label: '보류', className: 'bg-gray-100 text-gray-800' },
        };

        const status = statusMap[row.status] || {
          label: row.status,
          className: 'bg-gray-100',
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${status.className}`}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      header: '담당자',
      accessor: 'assignee',
      width: '120px',
      cell: (row) => {
        const assignee = row.assignee || {};
        return assignee.name ? (
          <div className="flex items-center">
            {assignee.avatar && (
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <span>{assignee.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">미배정</span>
        );
      },
    },
    {
      header: '마감일',
      accessor: 'dueDate',
      width: '120px',
      cell: (row) => {
        if (!row.dueDate) return <span className="text-gray-400">-</span>;

        const dueDate = new Date(row.dueDate);
        const today = new Date();
        const isOverdue = dueDate < today && row.status !== 'done';

        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {dueDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      header: '작업',
      width: '100px',
      cell: (row) => (
        <div className="flex space-x-1">
          <Button
            onClick={() => console.log('상세보기', row.id)}
            variant="outline"
            size="sm"
            className="!py-1 !px-2"
          >
            상세
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">일회성 작업</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          새로고침
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="error" className="mb-4">
          <p className="font-bold">데이터 로드 오류</p>
          <p>{error}</p>
        </Alert>
      )}

      {/* 테이블 */}
      <Table
        columns={columns}
        data={items}
        loading={loading}
        pagination={{
          page: apiPagination.page,
          pageSize: apiPagination.pageSize,
          total: apiPagination.total,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        emptyMessage="일회성 작업이 없습니다."
      />
    </div>
  );
};

export default ProjectSingleTaskSection;
