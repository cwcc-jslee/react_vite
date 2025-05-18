// src/features/project/sections/ProjectListSection.jsx

import React, { useState, useCallback, useEffect } from 'react';
import TodoCard from '../components/cards/TodoCard';
import useTodoPageData from '../hooks/useTodoPageData';
import { Button, Switch, Alert } from '@shared/components/ui';
import WorkList from '../../work/components/tables/WorkList';
import useTodoStore from '../hooks/useTodoStore';

/**
 * ToDo 목록 테이블 섹션 컴포넌트
 * ToDo 목록과 페이지네이션을 표시
 */
const WorkListSection = () => {
  const { works, workStatus, workError, workPagination, workFilters, actions } =
    useTodoStore();

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page) => {
      actions.workPagination.setPage(page);
    },
    [actions.workPagination],
  );

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback(
    (pageSize) => {
      actions.workPagination.setPageSize(pageSize);
    },
    [actions.workPagination],
  );

  return (
    <>
      <WorkList
        items={works}
        pagination={workPagination}
        status={workStatus}
        error={workError}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
      />
    </>
  );
};

export default WorkListSection;
