/**
 * SFA(Sales Force Automation) 상세보기/수정 전용 Drawer 컴포넌트입니다.
 * 섹션별 컨텍스트 편집 방식을 사용하여 기본정보와 결제매출을 독립적으로 수정할 수 있습니다.
 * - 기본정보 섹션: "수정하기" 버튼으로 인라인 편집 활성화
 * - 결제매출 섹션: "수정하기" 버튼으로 추가/수정/삭제 기능 활성화
 */

import React from 'react';
import { Drawer, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';

// 섹션 컴포넌트 import
import SfaDrawerMenu from './sections/SfaDrawerMenu.jsx';
import SfaBasicInfoSection from './sections/SfaBasicInfoSection.jsx';
import SfaPaymentManagementSection from './sections/SfaPaymentManagementSection.jsx';

const SfaViewDrawer = React.memo(
  ({ drawer }) => {
    const { visible, data } = drawer;
    const { close } = useDrawer();
    const { actions: sfaActions } = useSfaStore();

    // ==================== 섹션별 편집 상태 관리 ====================
    const [editingSection, setEditingSection] = React.useState(null); // 'base' | 'payment' | null
    const [editingPaymentId, setEditingPaymentId] = React.useState(null);

    // ==================== 섹션 편집 핸들러 ====================
    const handleStartEdit = (section) => {
      // 다른 섹션을 편집 중이면 경고
      if (editingSection && editingSection !== section) {
        const shouldContinue = window.confirm(
          `${editingSection === 'base' ? '기본정보' : '결제매출'} 섹션을 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?`,
        );
        if (!shouldContinue) return;
      }
      setEditingSection(section);
    };

    const handleFinishEdit = () => {
      setEditingSection(null);
      sfaActions.form.updateField('sfaDraftPayments', []);
    };

    const handleCancelEdit = () => {
      setEditingSection(null);
      sfaActions.form.updateField('sfaDraftPayments', []);
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

    // ==================== 렌더링 ====================
    return (
      <Drawer
        visible={visible}
        title="SFA 상세정보"
        onClose={close}
        width={DRAWER_SIZES.XL}
        enableOverlayClick={false}
        mode="view"
        animationEnabled={true}
        menu={
          <SfaDrawerMenu
            onDelete={handleDelete}
            onCopy={handleCopy}
            onHistory={handleHistory}
          />
        }
      >
        <div className="space-y-6">
          {/* 기본 정보 섹션 */}
          <SfaBasicInfoSection
            data={data}
            isEditing={editingSection === 'base'}
            onStartEdit={() => handleStartEdit('base')}
            onFinishEdit={handleFinishEdit}
            onCancelEdit={handleCancelEdit}
          />

          {/* 결제매출 내역 섹션 */}
          <SfaPaymentManagementSection
            data={data}
            isEditing={editingSection === 'payment'}
            onStartEdit={() => handleStartEdit('payment')}
            onFinishEdit={handleFinishEdit}
            onCancelEdit={handleCancelEdit}
            editingPaymentId={editingPaymentId}
            setEditingPaymentId={setEditingPaymentId}
          />
        </div>
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
