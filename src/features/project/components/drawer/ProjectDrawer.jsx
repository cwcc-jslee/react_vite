/**
 * PROJECT 전용 Drawer 컴포넌트
 */

// src/features/project/components/drawer/ProjectDrawer.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setDrawer } from '../../../../store/slices/uiSlice.js';
import { useSelector } from 'react-redux';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';

const ProjectDrawer = ({ drawer }) => {
  const dispatch = useDispatch();
  const { visible, mode, featureMode, data } = drawer;

  const controlMenus = [
    {
      key: 'view',
      label: 'View',
      active: mode === 'view',
      onClick: () => {
        // setActiveControl('view');
        handleSetDrawer({ mode: 'view', featureMode: null });
        // dispatch(setDrawer({ mode: 'view' }));
      },
    },
    {
      key: 'edit',
      label: 'Edit',
      active: mode === 'edit',
      onClick: () => {
        // setActiveControl('edit');
        dispatch(setDrawer({ mode: 'edit', featureMode: 'editBase' }));
      },
    },
  ];

  const functionMenus =
    mode === 'edit'
      ? [
          {
            key: 'editBase',
            label: '기본정보수정',
            active: featureMode === 'editBase',
            // onClick: () => {
            //   dispatch(setDrawer({ featureMode: 'editBase' }));
            //   resetPaymentForm();
            // },
          },
          {
            key: 'addPayment',
            label: '결제매출등록',
            active: featureMode === 'addPayment',
            // onClick: () => {
            //   dispatch(setDrawer({ featureMode: 'addPayment' }));
            //   resetPaymentForm();
            // },
          },
          {
            key: 'editPayment',
            label: '결제매출수정',
            active: featureMode === 'editPayment',
            // onClick: () => {
            //   dispatch(setDrawer({ featureMode: 'editPayment' }));
            //   resetPaymentForm();
            // },
          },
        ]
      : [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (mode) {
      const titles = {
        add: '매출등록',
        view: 'PROJECT 상세정보',
        edit: 'PROJECT 수정',
      };
      return titles[mode] || '';
    }
    return '';
  };

  const ViewContent = ({ data }) => (
    <>
      {/* <ProjectDetailTable data={data} />
      <ProjectPaymentSection
        data={data}
        controlMode={mode}
        featureMode={featureMode}
        togglePaymentSelection={togglePaymentSelection}
      /> */}
    </>
  );

  // EditContent 컴포넌트 - 수정 모드 UI
  const EditContent = ({ data }) => (
    <>
      <h1>기본정보수정</h1>
      {/* <EditableProjectDetail
        data={data}
        featureMode={featureMode}
        projectSalesTypeData={projectSalesTypeData}
        projectClassificationData={projectClassificationData}
        // onUpdate={handleFieldUpdate}
      />

      {mode === 'edit' && (
        <ProjectAddPaymentForm
          data={data}
          controlMode={mode}
          featureMode={featureMode}
        />
      )}
      <ProjectPaymentSection
        data={data}
        controlMode={mode}
        featureMode={featureMode}
        togglePaymentSelection={togglePaymentSelection}
      /> */}
    </>
  );

  return (
    <BaseDrawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      menu={
        <ActionMenuBar
          controlMenus={controlMenus}
          functionMenus={functionMenus}
        />
      }
      width="900px"
      enableOverlayClick={false}
      controlMode={mode}
    >
      {/* {renderDrawerContent()} */}
      {mode === 'view' && <ViewContent data={data} />}
      {mode === 'edit' && <EditContent data={data} />}
    </BaseDrawer>
  );
};

export default ProjectDrawer;
