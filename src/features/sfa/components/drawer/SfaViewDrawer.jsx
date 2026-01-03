/**
 * SFA(Sales Force Automation) 상세보기/수정 전용 Drawer 컴포넌트입니다.
 * 섹션별 컨텍스트 편집 방식을 사용하여 기본정보와 결제매출을 독립적으로 수정할 수 있습니다.
 * - 기본정보 섹션: "수정하기" 버튼으로 인라인 편집 활성화
 * - 결제매출 섹션: "매출내역 추가" / "매출내역 수정" 버튼으로 기능 분리
 */

import React from 'react';
import { X } from 'lucide-react';
import { Drawer, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';

// 섹션 컴포넌트 import
import DrawerActionsMenu from './sections/DrawerActionsMenu.jsx';
import BasicInfoSection from './sections/BasicInfoSection.jsx';
import PaymentListSection from './sections/PaymentListSection.jsx';
import PaymentEditDrawer from './PaymentEditDrawer.jsx';

const SfaViewDrawer = React.memo(
  ({ drawer }) => {
    const { visible, data } = drawer;
    const { close } = useDrawer();
    const { actions: sfaActions } = useSfaStore();

    // ==================== 섹션별 편집 상태 관리 ====================
    const [editingSection, setEditingSection] = React.useState(null); // 'base' | null
    const [paymentMode, setPaymentMode] = React.useState('view'); // 'view' | 'add' | 'edit' | 'delete'
    const [editingPaymentId, setEditingPaymentId] = React.useState(null);

    // ==================== 결제매출 Drawer 상태 관리 ====================
    const [paymentDrawer, setPaymentDrawer] = React.useState({
      visible: false,
      mode: null,      // 'add' | 'edit'
      payment: null,   // 수정할 payment 데이터
    });

    // ==================== 기본정보 편집 핸들러 ====================
    const handleStartEditBase = () => {
      // 결제매출 편집 중이면 경고
      if (paymentMode !== 'view') {
        const shouldContinue = window.confirm(
          `결제매출 ${paymentMode === 'add' ? '추가' : '수정'} 모드입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?`,
        );
        if (!shouldContinue) return;

        // 결제매출 모드 초기화
        setPaymentMode('view');
        sfaActions.form.updateField('sfaDraftPayments', []);
      }

      setEditingSection('base');
    };

    const handleFinishEditBase = () => {
      setEditingSection(null);
    };

    const handleCancelEditBase = () => {
      setEditingSection(null);
    };

    // ==================== 결제매출 Drawer 핸들러 ====================
    const openPaymentDrawer = (mode, payment = null) => {
      // 기본정보 편집 중이면 경고
      if (editingSection === 'base') {
        const shouldContinue = window.confirm(
          '기본정보를 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?',
        );
        if (!shouldContinue) return;

        // 기본정보 편집 종료
        setEditingSection(null);
      }

      setPaymentDrawer({
        visible: true,
        mode,
        payment,
      });
    };

    const closePaymentDrawer = () => {
      setPaymentDrawer({
        visible: false,
        mode: null,
        payment: null,
      });
    };

    const handlePaymentDrawerSave = async () => {
      // Drawer 닫기만 수행 (모드 변경 없음)
      closePaymentDrawer();
    };

    // ==================== 결제매출 편집 핸들러 (헤더 메뉴용) ====================
    const handleStartAddPayment = () => {
      // 기본정보 편집 중이면 경고
      if (editingSection === 'base') {
        const shouldContinue = window.confirm(
          '기본정보를 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?',
        );
        if (!shouldContinue) return;

        // 기본정보 편집 종료
        setEditingSection(null);
      }

      // PaymentEditDrawer 열기 (add 모드)
      openPaymentDrawer('add', null);
    };

    const handleStartEditPayment = () => {
      setPaymentMode('edit');
    };

    const handleStartDeletePayment = () => {
      setPaymentMode('delete');
    };

    const handlePaymentModeChange = (newMode) => {
      setPaymentMode(newMode);

      // view 모드로 돌아갈 때 초안 초기화
      if (newMode === 'view') {
        sfaActions.form.updateField('sfaDraftPayments', []);
      }
    };

    // ==================== 메뉴 액션 핸들러 ====================
    const handleDelete = async () => {
      try {
        console.log('=== SFA 삭제 시작 ===');
        console.log('삭제 대상 데이터:', data);
        console.log('매출정보:', data?.sfaByPayments);

        // sfaByPayments 배열 존재 확인
        if (data?.sfaByPayments && data.sfaByPayments.length > 0) {
          window.alert(
            '⚠️ 경고\n\n모든 결제매출 정보를 먼저 삭제해야 합니다.\n\n현재 등록된 결제매출: ' +
              data.sfaByPayments.length +
              '건',
          );
          console.log('=== 삭제 취소: 매출정보 존재 ===');
          return;
        }

        // 삭제 확인 메시지
        if (
          !window.confirm(
            '🗑️ SFA 삭제 확인\n\n정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.\n\n건명: ' +
              (data.name || '-'),
          )
        ) {
          console.log('=== 삭제 취소: 사용자 취소 ===');
          return;
        }

        const sfaId = data.documentId;
        const formData = { is_deleted: true };

        console.log('삭제 요청 - ID:', sfaId);
        console.log('삭제 요청 - 데이터:', formData);

        await sfaSubmitService.updateSfaBase(sfaId, formData);

        console.log('=== SFA 삭제 성공 ===');

        close();

        setTimeout(() => {
          alert('✅ 삭제가 완료되었습니다.');
        }, 100);
      } catch (error) {
        console.error('=== SFA 삭제 실패 ===');
        console.error('에러 내용:', error);
        alert('❌ 삭제 중 오류가 발생했습니다.\n\n' + (error.message || ''));
      }
    };

    const handleCopy = () => {
      console.log('복사하기 기능 - 구현 예정');
    };

    const handleHistory = () => {
      console.log('이력 보기 기능 - 구현 예정');
    };

    // 수정 모드 취소 핸들러
    const handleCancelEditMode = () => {
      if (window.confirm('수정을 취소하시겠습니까?\n저장하지 않은 변경사항은 사라집니다.')) {
        setEditingSection(null);
      }
    };

    // ==================== 렌더링 ====================
    return (
      <Drawer
        visible={visible}
        title={
          <div className="flex items-center gap-2">
            <span>SFA 상세정보</span>
            {editingSection === 'base' && (
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded border border-blue-300">
                  기본정보 수정중
                </span>
                <button
                  onClick={handleCancelEditMode}
                  className="p-1 rounded hover:bg-red-50 transition-colors group"
                  title="수정 취소"
                >
                  <X className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            )}
          </div>
        }
        onClose={close}
        width={DRAWER_SIZES.XL}
        enableOverlayClick={false}
        mode="view"
        animationEnabled={true}
        headerActions={
          <DrawerActionsMenu
            onDelete={handleDelete}
            onCopy={handleCopy}
            onHistory={handleHistory}
            onEditBase={handleStartEditBase}
            isEditingBase={editingSection === 'base'}
            onAddPayment={handleStartAddPayment}
            onEditPayment={handleStartEditPayment}
            onDeletePayment={handleStartDeletePayment}
            paymentMode={paymentMode}
          />
        }
      >
        <div className="space-y-8">
          {/* 기본 정보 섹션 */}
          <BasicInfoSection
            data={data}
            isEditing={editingSection === 'base'}
            onStartEdit={handleStartEditBase}
            onFinishEdit={handleFinishEditBase}
            onCancelEdit={handleCancelEditBase}
            onSaveField={() => setEditingSection(null)}
            showBox={false}
          />

          {/* 섹션 구분선 */}
          <div className="border-t-2 border-gray-200" />

          {/* 결제매출 내역 섹션 */}
          <PaymentListSection
            data={data}
            mode={paymentMode}
            onModeChange={handlePaymentModeChange}
            onOpenPaymentDrawer={openPaymentDrawer}
            editingPaymentId={editingPaymentId}
            setEditingPaymentId={setEditingPaymentId}
            showBox={false}
          />
        </div>

        {/* 결제매출 추가/수정 Drawer */}
        <PaymentEditDrawer
          visible={paymentDrawer.visible}
          mode={paymentDrawer.mode}
          data={data}
          payment={paymentDrawer.payment}
          onClose={closePaymentDrawer}
          onSave={handlePaymentDrawerSave}
        />
      </Drawer>
    );
  },
  (prevProps, nextProps) => {
    // React.memo 비교 함수
    const prevDrawer = prevProps.drawer;
    const nextDrawer = nextProps.drawer;

    const isEqual =
      prevDrawer.visible === nextDrawer.visible &&
      prevDrawer.data === nextDrawer.data;

    return isEqual;
  },
);

SfaViewDrawer.displayName = 'SfaViewDrawer';

export default SfaViewDrawer;
