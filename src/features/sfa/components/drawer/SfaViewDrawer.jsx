/**
 * SFA(Sales Force Automation) 상세보기/수정 전용 Drawer 컴포넌트입니다.
 * view 모드와 edit 모드만 처리하며, 상세 정보 조회 및 수정 기능을 제공합니다.
 */

// src/features/sfa/components/drawer/SfaViewDrawer.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setDrawer } from '../../../../store/slices/uiSlice.js';
import { useSelector } from 'react-redux';

// import { selectCodebookByType } from '../../../codebook/store/codebookSlice.js';
import { selectCodebookByType } from '../../../../store/slices/codebookSlice.js';
import { useSfaDrawer } from '../../hooks/useSfaDrawer.js';
import { useUiStore } from '../../../../shared/hooks/useUiStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';
import SfaDetailTable from '../tables/SfaDetailTable.jsx';
// import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable.jsx';
import EditableSfaDetail from '../tables/EditableSfaDetail.jsx';
import SfaEditPaymentSection from '../sections/SfaEditPaymentSection.jsx';
// import SfaAddPaymentForm from '../forms/SfaAddPaymentForm.jsx';
import SfaPaymentSection from '../sections/SfaPaymentSection.jsx';

const SfaViewDrawer = React.memo(
  ({ drawer }) => {
    const dispatch = useDispatch();

    // SfaViewDrawer에서는 폼 상태가 필요없으므로 useSfaStore 제거
    // const { actions } = useSfaStore(); // 🚨 제거: 불필요한 전체 SFA 상태 구독

    const { actions: uiActions } = useUiStore();

    // Codebook 데이터 조회 제거 - SfaAddForm에서 직접 처리

    // SfaViewDrawer에서 필요한 기능들을 직접 구현 (useSfaForm 제거하여 불필요한 상태 구독 방지)
    const resetPaymentForm = () => {
      // 결제매출 폼 리셋 로직
      console.log('Payment form reset');
    };

    const selectPaymentForEdit = async (paymentSelection) => {
      // 결제매출 선택 로직 (수정용)
      console.log('Payment selected for edit:', paymentSelection);
    };

    // const { drawerState, setDrawer } = useSfa();
    const { visible, mode, featureMode, data } = drawer;
    const { setDrawerClose, handleSetDrawer } = useSfaDrawer();

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

        // 삭제 성공 후 drawer 닫기 (삭제된 데이터는 다시 조회할 필요 없음)
        uiActions.drawer.close();

        console.log('=== SFA 삭제 성공 ===');
        alert('삭제가 완료되었습니다.');

        // 삭제 후 상세 정보를 다시 가져올 필요가 있다면 여기서 처리
        // 하지만 일반적으로 삭제 후에는 drawer를 닫으므로 불필요
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
      {
        key: 'delete',
        label: 'Del',
        active: mode === 'delete',
        onClick: handleDelete,
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
              label: '결제매출추가',
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
            // {
            //   key: 'delete',
            //   label: 'SFA삭제',
            //   onClick: handleDelete,
            // },
          ]
        : [];

    // Drawer 헤더 타이틀 설정
    const getHeaderTitle = () => {
      if (mode) {
        const titles = {
          view: 'SFA 상세정보',
          edit: 'SFA 수정',
        };
        return titles[mode] || '';
      }
      return '';
    };

    // ViewContent 컴포넌트 - 조회 모드 UI
    const ViewContent = React.memo(({ data }) => (
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
          selectPaymentForEdit={selectPaymentForEdit}
        />
      </>
    ));
    ViewContent.displayName = 'ViewContent';

    // EditContent 컴포넌트 - 수정 모드 UI
    const EditContent = React.memo(({ data }) => (
      <>
        <h1>기본정보수정</h1>
        <EditableSfaDetail
          data={data}
          featureMode={featureMode}
          // sfaSalesTypeData={sfaSalesTypeData}
          // sfaClassificationData={sfaClassificationData}
          // onUpdate={handleFieldUpdate}
        />

        <SfaEditPaymentSection
          data={data}
          controlMode={mode}
          featureMode={featureMode}
        />

        <SfaPaymentSection
          data={data}
          controlMode={mode}
          featureMode={featureMode}
          selectPaymentForEdit={selectPaymentForEdit}
        />
      </>
    ));
    EditContent.displayName = 'EditContent';

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
        {mode === 'view' && <ViewContent data={data} />}
        {mode === 'edit' && <EditContent data={data} />}
      </BaseDrawer>
    );
  },
  (prevProps, nextProps) => {
    // React.memo 비교 함수 - drawer props가 실제로 변경되었을 때만 재렌더링
    const prevDrawer = prevProps.drawer;
    const nextDrawer = nextProps.drawer;

    // drawer의 중요한 props만 비교
    const isEqual =
      prevDrawer.visible === nextDrawer.visible &&
      prevDrawer.mode === nextDrawer.mode &&
      prevDrawer.featureMode === nextDrawer.featureMode &&
      prevDrawer.data === nextDrawer.data;

    return isEqual;
  },
);

SfaViewDrawer.displayName = 'SfaViewDrawer';

export default SfaViewDrawer;
