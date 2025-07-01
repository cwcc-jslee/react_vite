/**
 * SFA(Sales Force Automation) 전용 Drawer 컴포넌트입니다.
 * 매출, 프로젝트, 고객 관리 등 SFA 기능에 특화된 Drawer를 제공합니다.
 */

// src/features/sfa/components/drawer/SfaDrawer.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setDrawer } from '../../../../store/slices/uiSlice.js';
import { useSelector } from 'react-redux';
import { useCodebook } from '../../../../shared/hooks/useCodebook.js';
// import { selectCodebookByType } from '../../../codebook/store/codebookSlice.js';
import { selectCodebookByType } from '../../../../store/slices/codebookSlice.js';
import { useSfaDrawer } from '../../hooks/useSfaDrawer.js';
import { useSfa } from '../../context/SfaProvider.jsx';
import { useSfaForm } from '../../hooks/useSfaForm.js';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { useUiStore } from '../../../../shared/hooks/useUiStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';
import SfaAddForm from '../forms/SfaAddForm.jsx';
import SfaDetailTable from '../tables/SfaDetailTable.jsx';
// import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable.jsx';
import EditableSfaDetail from '../tables/EditableSfaDetail.jsx';
import SfaAddPaymentForm from '../forms/SfaAddPaymentForm.jsx';
import SfaPaymentSection from '../compose/SfaPaymentSection.jsx';

const SfaDrawer = ({ drawer }) => {
  const dispatch = useDispatch();
  const { actions } = useSfaStore();
  const { actions: uiActions } = useUiStore();

  // Codebook 데이터 조회
  const {
    data: codebooks,
    isLoading,
    error,
  } = useCodebook(['sfaSalesType', 'sfaClassification']);

  const { togglePaymentSelection, resetPaymentForm } = useSfaForm(); // Custom hook을 통한 form 관련 로직 분리

  // const { drawerState, setDrawer } = useSfa();
  const { visible, mode, featureMode, data } = drawer;
  const { setDrawerClose, handleSetDrawer } = useSfaDrawer();
  console.log(`>>Sfa Drawer : `, drawer);

  // SFA 삭제 함수
  const handleDelete = async () => {
    try {
      console.log('=== SFA 삭제 시작 ===');
      console.log('삭제 대상 데이터:', data);
      console.log('매출정보:', data?.sfaByPayments);

      // sfaByPayments 배열 존재 확인
      if (data?.sfaByPayments && data.sfaByPayments.length > 0) {
        alert('모든 매출정보를 삭제한 후 실행해주세요.');
        console.log('=== 삭제 취소: 매출정보 존재 ===');
        return;
      }

      // 삭제 확인 메시지
      if (!window.confirm('정말로 삭제하시겠습니까?')) {
        console.log('=== 삭제 취소: 사용자 취소 ===');
        return;
      }

      const sfaId = data.documentId;
      const formData = { is_deleted: true };

      console.log('삭제 요청 - ID:', sfaId);
      console.log('삭제 요청 - 데이터:', formData);

      // is_deleted를 true로 업데이트
      await sfaSubmitService.updateSfaBase(sfaId, formData);

      // 삭제 성공 후 최신 데이터 조회
      const updateAction = await actions.data.fetchSfaDetail(data.id);

      if (updateAction.meta.requestStatus === 'fulfilled') {
        const updatedData = updateAction.payload;

        // drawer 상태 업데이트 또는 닫기 (삭제된 데이터는 보통 drawer를 닫음)
        uiActions.drawer.close();

        console.log('=== SFA 삭제 성공 ===');
        console.log('업데이트된 데이터:', updatedData);
        alert('삭제가 완료되었습니다.');
      }
    } catch (error) {
      console.error('=== SFA 삭제 실패 ===');
      console.error('에러 내용:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

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
          {
            key: 'delete',
            label: 'SFA삭제',
            onClick: handleDelete,
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
      codebooks={codebooks}
      // sfaSalesTypeData={sfaSalesTypeData}
      // sfaClassificationData={sfaClassificationData}
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
        codebooks={codebooks}
        data={data}
        featureMode={featureMode}
        // sfaSalesTypeData={sfaSalesTypeData}
        // sfaClassificationData={sfaClassificationData}
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
