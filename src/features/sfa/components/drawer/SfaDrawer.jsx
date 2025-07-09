/**
 * SFA(Sales Force Automation) 전용 Drawer 컴포넌트입니다.
 * 매출, 프로젝트, 고객 관리 등 SFA 기능에 특화된 Drawer를 제공합니다.
 */

// src/features/sfa/components/drawer/SfaDrawer.jsx
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
import SfaAddForm from '../forms/SfaAddForm.jsx';
import SfaDetailTable from '../tables/SfaDetailTable.jsx';
// import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable.jsx';
import EditableSfaDetail from '../tables/EditableSfaDetail.jsx';
import SfaAddPaymentForm from '../forms/SfaAddPaymentForm.jsx';
import SfaPaymentSection from '../compose/SfaPaymentSection.jsx';

const SfaDrawer = React.memo(
  ({ drawer }) => {
    const dispatch = useDispatch();

    // SfaDrawer에서는 폼 상태가 필요없으므로 useSfaStore 제거
    // const { actions } = useSfaStore(); // 🚨 제거: 불필요한 전체 SFA 상태 구독

    const { actions: uiActions } = useUiStore();

    // Codebook 데이터 조회 제거 - SfaAddForm에서 직접 처리

    // SfaDrawer에서 필요한 기능들을 직접 구현 (useSfaForm 제거하여 불필요한 상태 구독 방지)
    const resetPaymentForm = () => {
      // 결제매출 폼 리셋 로직
      console.log('Payment form reset');
    };

    const togglePaymentSelection = async (item) => {
      // 결제매출 선택 토글 로직
      console.log('Payment selection toggled:', item);
    };

    // const { drawerState, setDrawer } = useSfa();
    const { visible, mode, featureMode, data } = drawer;
    const { setDrawerClose, handleSetDrawer } = useSfaDrawer();

    // codebooks 메모이제이션 제거 - SfaAddForm에서 직접 처리

    // drawer 메모이제이션하여 불필요한 리렌더링 방지
    const memoizedDrawer = React.useMemo(
      () => ({
        visible,
        mode,
        featureMode,
        data,
      }),
      [visible, mode, featureMode, data],
    );

    // 렌더링 추적을 위한 로그 (필요시 제거)
    console.log(`>>Sfa Drawer 렌더링 : `, memoizedDrawer);

    // 재렌더링 원인 추적용 상세 로그
    const renderCount = React.useRef(0);
    renderCount.current += 1;

    console.log(`🔄 [SfaDrawer] 렌더링 횟수: ${renderCount.current}`);
    console.log(`🔄 [SfaDrawer] drawer props:`, {
      visible: drawer.visible,
      mode: drawer.mode,
      featureMode: drawer.featureMode,
      hasData: !!drawer.data,
    });

    // drawer 변경 감지
    React.useEffect(() => {
      console.log(`🔄 [SfaDrawer] drawer.visible 변경:`, drawer.visible);
    }, [drawer.visible]);

    React.useEffect(() => {
      console.log(`🔄 [SfaDrawer] drawer.mode 변경:`, drawer.mode);
    }, [drawer.mode]);

    React.useEffect(() => {
      console.log(
        `🔄 [SfaDrawer] drawer.featureMode 변경:`,
        drawer.featureMode,
      );
    }, [drawer.featureMode]);

    React.useEffect(() => {
      console.log(`🔄 [SfaDrawer] drawer.data 변경:`, !!drawer.data);
    }, [drawer.data]);

    // codebooks 변경 감지 제거 - SfaAddForm에서 직접 처리

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
          console.log('🚨 [SfaDrawer] Edit 버튼 클릭 - setDrawer 호출됨');
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
                console.log(
                  '🚨 [SfaDrawer] 기본정보수정 버튼 클릭 - setDrawer 호출됨',
                );
                dispatch(setDrawer({ featureMode: 'editBase' }));
                resetPaymentForm();
              },
            },
            {
              key: 'addPayment',
              label: '결제매출등록',
              active: featureMode === 'addPayment',
              onClick: () => {
                console.log(
                  '🚨 [SfaDrawer] 결제매출등록 버튼 클릭 - setDrawer 호출됨',
                );
                dispatch(setDrawer({ featureMode: 'addPayment' }));
                resetPaymentForm();
              },
            },
            {
              key: 'editPayment',
              label: '결제매출수정',
              active: featureMode === 'editPayment',
              onClick: () => {
                console.log(
                  '🚨 [SfaDrawer] 결제매출수정 버튼 클릭 - setDrawer 호출됨',
                );
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
    const AddContent = React.memo(() => <SfaAddForm />);
    AddContent.displayName = 'AddContent';

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
          togglePaymentSelection={togglePaymentSelection}
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
        {mode === 'add' && <AddContent />}
        {mode === 'view' && <ViewContent data={data} />}
        {mode === 'edit' && <EditContent data={data} />}
      </BaseDrawer>
    );
  },
  (prevProps, nextProps) => {
    // React.memo 비교 함수 - drawer props가 실제로 변경되었을 때만 재렌더링
    const prevDrawer = prevProps.drawer;
    const nextDrawer = nextProps.drawer;

    console.log('🚨 [SfaDrawer] memo 비교 함수 실행');
    console.log('🚨 [SfaDrawer] prevDrawer 전체:', prevDrawer);
    console.log('🚨 [SfaDrawer] nextDrawer 전체:', nextDrawer);

    // 각 속성별 상세 비교
    console.log('🚨 [SfaDrawer] 속성별 비교:');
    console.log(
      '  - visible:',
      prevDrawer.visible,
      '→',
      nextDrawer.visible,
      '일치:',
      prevDrawer.visible === nextDrawer.visible,
    );
    console.log(
      '  - mode:',
      prevDrawer.mode,
      '→',
      nextDrawer.mode,
      '일치:',
      prevDrawer.mode === nextDrawer.mode,
    );
    console.log(
      '  - featureMode:',
      prevDrawer.featureMode,
      '→',
      nextDrawer.featureMode,
      '일치:',
      prevDrawer.featureMode === nextDrawer.featureMode,
    );
    console.log(
      '  - data 참조:',
      prevDrawer.data === nextDrawer.data,
      '같은 객체:',
      prevDrawer.data === nextDrawer.data,
    );

    // drawer 객체 자체의 참조 비교
    console.log(
      '🚨 [SfaDrawer] drawer 객체 참조 비교:',
      prevDrawer === nextDrawer,
    );

    // 깊은 비교를 위해 JSON.stringify 사용
    const prevDrawerStr = JSON.stringify(prevDrawer);
    const nextDrawerStr = JSON.stringify(nextDrawer);
    console.log('🚨 [SfaDrawer] JSON 비교:', prevDrawerStr === nextDrawerStr);

    if (prevDrawerStr !== nextDrawerStr) {
      console.log('🚨 [SfaDrawer] 변경된 내용:');
      console.log('  - 이전:', prevDrawerStr);
      console.log('  - 현재:', nextDrawerStr);
    }

    // drawer의 중요한 props만 비교
    const isEqual =
      prevDrawer.visible === nextDrawer.visible &&
      prevDrawer.mode === nextDrawer.mode &&
      prevDrawer.featureMode === nextDrawer.featureMode &&
      prevDrawer.data === nextDrawer.data;

    console.log(
      '🚨 [SfaDrawer] 최종 비교 결과:',
      isEqual ? '동일 (재렌더링 안함)' : '다름 (재렌더링 함)',
    );

    return isEqual;
  },
);

SfaDrawer.displayName = 'SfaDrawer';

export default SfaDrawer;
