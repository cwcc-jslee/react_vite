// src/features/project/sections/ProjectListSection.jsx

import React, { useState, useCallback, useEffect } from 'react';
import TodoCard from '../components/cards/TodoCard';
import useTodoPageData from '../hooks/useTodoPageData';
import { Button, Switch, Alert } from '@shared/components/ui';
import WorkList from '../../work/components/tables/WorkList';

/**
 * ToDo 목록 테이블 섹션 컴포넌트
 * ToDo 목록과 페이지네이션을 표시
 */
const WorkListSection = () => {
  // 필터 상태 관리

  return (
    <>
      <WorkList />
    </>
  );
};

export default WorkListSection;
