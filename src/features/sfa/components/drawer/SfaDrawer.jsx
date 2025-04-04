/**
 * SFA(Sales Force Automation) 전용 Drawer 컴포넌트입니다.
 * 매출, 프로젝트, 고객 관리 등 SFA 기능에 특화된 Drawer를 제공합니다.
 */

// src/features/sfa/components/drawer/SfaDrawer.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setDrawer } from '../../../../store/slices/uiSlice.js';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice.js';
import { useSfaDrawer } from '../../hooks/useSfaDrawer.js';
import { useSfa } from '../../context/SfaProvider.jsx';
import { useSfaForm } from '../../hooks/useSfaForm.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';
import SfaAddForm from '../forms/SfaAddForm/index.jsx';
import SfaDetailTable from '../tables/SfaDetailTable.jsx';
// import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable.jsx';
import EditableSfaDetail from '../tables/EditableSfaDetail.jsx';
import SfaAddPaymentForm from '../forms/SfaAddPaymentForm.jsx';
import SfaPaymentSection from '../compose/SfaPaymentSection.jsx';

const SfaDrawer = ({ drawer }) => {
  const dispatch = useDispatch();
  // Codebook 데이터 조회
  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );
  const { togglePaymentSelection, resetPaymentForm } = useSfaForm(); // Custom hook을 통한 form 관련 로직 분리

  // const { drawerState, setDrawer } = useSfa();
  const { visible, mode, featureMode, data } = drawer;
  const { setDrawerClose, handleSetDrawer } = useSfaDrawer();
  console.log(`>>Sfa Drawer : `, drawer);

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
            onClick: () => {
              dispatch(setDrawer({ featureMode: 'editBase' }));
              resetPaymentForm();
            },
          },
          {
            key: 'addPayment',
            label: '결제매출등록',
            active: featureMode === 'addPayment',
            onClick: () => {
              dispatch(setDrawer({ featureMode: 'addPayment' }));
              resetPaymentForm();
            },
          },
          {
            key: 'editPayment',
            label: '결제매출수정',
            active: featureMode === 'editPayment',
            onClick: () => {
              dispatch(setDrawer({ featureMode: 'editPayment' }));
              resetPaymentForm();
            },
          },
        ]
      : [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (mode) {
      const titles = {
        add: '매출등록',
        view: 'SFA 상세정보',
        edit: 'SFA 수정',
      };
      return titles[mode] || '';
    }
    return '';
  };

  // ViewContent 컴포넌트 - 조회 모드 UI
  const AddContent = () => (
    <SfaAddForm
      sfaSalesTypeData={sfaSalesTypeData}
      sfaClassificationData={sfaClassificationData}
    />
  );
  const ViewContent = ({ data }) => (
    <>
      <SfaDetailTable data={data} />
      {/* <SfaDetailPaymentTable
        data={data.sfa_by_payments || []}
        controlMode="view"
      /> */}
      <SfaPaymentSection
        data={data}
        controlMode={mode}
        featureMode={featureMode}
        togglePaymentSelection={togglePaymentSelection}
      />
    </>
  );

  // EditContent 컴포넌트 - 수정 모드 UI
  const EditContent = ({ data }) => (
    <>
      <h1>기본정보수정</h1>
      <EditableSfaDetail
        data={data}
        featureMode={featureMode}
        sfaSalesTypeData={sfaSalesTypeData}
        sfaClassificationData={sfaClassificationData}
        // onUpdate={handleFieldUpdate}
      />

      {mode === 'edit' && (
        <SfaAddPaymentForm
          data={data}
          controlMode={mode}
          featureMode={featureMode}
        />
      )}
      <SfaPaymentSection
        data={data}
        controlMode={mode}
        featureMode={featureMode}
        togglePaymentSelection={togglePaymentSelection}
      />
      {/* <SfaDetailPaymentTable
        data={data.sfa_by_payments || []}
        controlMode="edit"
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
      // controlMenu={renderControlMenu()}
      // featureMenu={renderFeatureMenu()}
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
      {mode === 'add' && <AddContent />}
      {mode === 'view' && <ViewContent data={data} />}
      {mode === 'edit' && <EditContent data={data} />}
    </BaseDrawer>
  );
};

export default SfaDrawer;
