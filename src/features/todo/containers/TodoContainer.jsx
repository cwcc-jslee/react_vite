// src/features/todo/containers/TodoContainer.jsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Section } from '@shared/components/ui/layout/components';

// 커스텀 훅 사용

// Layout
import TodoLayout from '../layouts/TodoLayout';
import WorkListLayout from '../layouts/WorkListLayout';
import TodoDrawer from '../components/drawer/TodoDrawer';

// Redux 액션
import {
  updateFormField,
  resetForm,
} from '../../../store/slices/pageFormSlice';

// Layout
// import TodoListLayout from '../layouts/TodoListLayout';

// Components
// import TodoDrawer from '../components/drawer/TodoDrawer';

// 알림 서비스 추가
import { notification } from '@shared/services/notification';

/**
 * Todo 메인 컨테이너 컴포넌트
 * 페이지 상태 관리 및 레이아웃 조합 역할 담당
 * 프로젝트 목록 및 추가 기능을 통합 관리
 *
 * @returns {JSX.Element} 프로젝트 메인 컨테이너
 */
const TodoContainer = () => {
  const dispatch = useDispatch();

  // 프로젝트 페이지 상태 및 액션 훅

  // 레이아웃 관련 상태 가져오기
  // Redux 상태에서 현재 레이아웃 설정 가져오기
  const { layout, sections, components } = useSelector(
    (state) => state.ui.pageLayout,
  );
  const drawer = useSelector((state) => state.ui.drawer);

  // 프로젝트 상태 데이터 가져오기
  // const { state } = useTodo();

  return (
    <>
      <Section>
        {layout === 'todayTasks' && <TodoLayout />}
        {layout === 'recentWork' && <WorkListLayout />}
      </Section>

      {drawer.visible && <TodoDrawer drawer={drawer} />}
    </>
  );
};

export default TodoContainer;
