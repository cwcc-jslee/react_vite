// src/features/sfa/layouts/SfaViewEditLayout.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SfaViewDrawer from '../components/drawer/SfaViewDrawer.jsx';
import ProjectDetailDrawer from '@features/project/components/drawer/ProjectDetailDrawer.jsx';
import { useSfaStore } from '../hooks/useSfaStore.js';
import { setDrawer } from '../../../store/slices/uiSlice';

/**
 * SFA 상세보기/수정 전용 레이아웃 컴포넌트
 * view 모드와 edit 모드일 때만 렌더링되며, 상세 정보 조회 및 수정에 특화된 UI/UX를 제공합니다.
 * 
 * * 수정: SFA 상세에서 연계 프로젝트 클릭 시 ProjectDetailDrawer도 렌더링할 수 있도록 확장
 */
const SfaViewEditLayout = React.memo(() => {
  const dispatch = useDispatch();
  const drawer = useSelector((state) => state.ui.drawer);
  const { actions } = useSfaStore();

  // Drawer 닫기 핸들러
  const handleClose = () => {
    dispatch(setDrawer({ visible: false, mode: null, data: null }));
  };

  // 🔄 Edit/View 모드 진입 시 데이터 설정, 레이아웃 종료 시 빈값으로 초기화
  React.useEffect(() => {
    // SFA 데이터인 경우에만 폼 리셋 (프로젝트 데이터일 때는 스킵)
    // 데이터 타입 체크: sfaByPayments가 있으면 SFA 데이터로 간주
    const isSfaData = drawer.data && (drawer.data.sfaByPayments || drawer.data.sfaClassification);
    
    if (isSfaData) {
      actions.form.reset(drawer.data);
    }

    return () => {
      actions.form.clear();
    };
  }, [drawer.data]); // 데이터 변경 시마다 체크

  // view 또는 edit 모드가 아닐 때는 렌더링하지 않음
  if (!['view', 'edit'].includes(drawer.mode)) {
    return null;
  }

  // 데이터 타입에 따른 분기 렌더링
  // 프로젝트 데이터 특징: pjtStatus, projectTasks 등이 존재
  const isProjectData = drawer.data && (drawer.data.pjtStatus || drawer.data.projectTasks);

  if (isProjectData) {
    return (
      <ProjectDetailDrawer 
        visible={drawer.visible} 
        data={drawer.data} 
        onClose={handleClose} 
      />
    );
  }

  return <SfaViewDrawer drawer={drawer} />;
});

SfaViewEditLayout.displayName = 'SfaViewEditLayout';

export default SfaViewEditLayout;
