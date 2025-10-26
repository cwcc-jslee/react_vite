/**
 * SFA(Sales Force Automation) 상세보기/수정 전용 Drawer 컴포넌트입니다.
 * 섹션별 컨텍스트 편집 방식을 사용하여 기본정보와 결제매출을 독립적으로 수정할 수 있습니다.
 * - 기본정보 섹션: "수정하기" 버튼으로 인라인 편집 활성화
 * - 결제매출 섹션: "수정하기" 버튼으로 추가/수정/삭제 기능 활성화
 */

// src/features/sfa/components/drawer/SfaViewDrawer.jsx
import React from 'react';
import { MoreVertical, Trash2, Copy, FileText } from 'lucide-react';

import { useSfaDrawer } from '../../hooks/useSfaDrawer.js';
import { useUiStore } from '../../../../shared/hooks/useUiStore.js';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import SfaDetailTable from '../tables/SfaDetailTable.jsx';
import EditableSfaDetail from '../tables/EditableSfaDetail.jsx';
import SfaEditPaymentSection from '../sections/SfaEditPaymentSection.jsx';
import SfaPaymentSection from '../sections/SfaPaymentSection.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
} from '../../../../shared/components/ui/index.jsx';

const SfaViewDrawer = React.memo(
  ({ drawer }) => {
    const { actions: uiActions } = useUiStore();
    const { visible, data } = drawer;
    const { setDrawerClose } = useSfaDrawer();
    const { form, actions: sfaActions } = useSfaStore();

    // 섹션별 편집 상태 관리
    const [editingSection, setEditingSection] = React.useState(null); // 'base' | 'payment' | null

    // 기존 매출 수정 중인 항목 ID (SfaPaymentSection에서 전달받음)
    const [editingPaymentId, setEditingPaymentId] = React.useState(null);

    // 섹션 편집 시작
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

    // 섹션 편집 완료 (저장 후)
    const handleFinishEdit = () => {
      setEditingSection(null);
      // 결제매출 초안 초기화
      sfaActions.form.updateField('sfaDraftPayments', []);
    };

    // 섹션 편집 취소
    const handleCancelEdit = () => {
      setEditingSection(null);
      // 결제매출 초안 초기화
      sfaActions.form.updateField('sfaDraftPayments', []);
    };

    // 결제매출 추가 버튼 클릭 핸들러
    const handleAddPaymentClick = () => {
      const currentPayments = form.data.sfaDraftPayments || [];
      const maxLimit = 3;

      if (currentPayments.length >= maxLimit) {
        console.warn('최대 3개까지만 추가할 수 있습니다.');
        return;
      }

      // initialSfaByPayment 기본 구조
      const newPayment = {
        revenueSource: null,
        billingType: '',
        isConfirmed: false,
        probability: '',
        amount: '',
        profitAmount: '',
        isProfit: false,
        marginProfitValue: '',
        recognitionDate: '',
        scheduledDate: '',
        paymentLabel: '',
        memo: '',
      };

      // isSameBilling이 true이고 customer가 있으면 revenueSource 설정
      if (data?.isSameBilling && data?.customer?.id) {
        newPayment.revenueSource = {
          id: data.customer.id,
          name: data.customer.name,
        };
      }

      // 사업부 매출이 있으면 teamAllocations 자동 생성
      const sfaByItems = data?.sfaByItems || [];
      const isMultiTeam = data?.isMultiTeam || false;

      if (sfaByItems.length > 0) {
        if (isMultiTeam) {
          // 다중 사업부: 템플릿 생성 (금액은 0)
          newPayment.teamAllocations = sfaByItems.map((item) => ({
            teamId: item.teamId,
            teamName: item.teamName,
            itemId: item.itemId,
            itemName: item.itemName,
            allocatedAmount: 0,
            allocatedProfitAmount: 0,
          }));
        } else {
          // 단일 사업부: 단일 할당 (금액은 자동 동기화)
          if (sfaByItems[0]) {
            newPayment.teamAllocations = [
              {
                teamId: sfaByItems[0].teamId,
                teamName: sfaByItems[0].teamName,
                itemId: sfaByItems[0].itemId,
                itemName: sfaByItems[0].itemName,
                allocatedAmount: 0,
                allocatedProfitAmount: 0,
              },
            ];
          }
        }
      }

      const newPayments = [...currentPayments, newPayment];
      sfaActions.form.updateField('sfaDraftPayments', newPayments);

      console.log('결제매출 추가:', newPayments.length, '개');
      console.log('teamAllocations:', newPayment.teamAllocations);
    };

    // SFA 삭제 함수
    const handleDelete = async () => {
      try {
        console.log('=== SFA 삭제 시작 ===');
        console.log('삭제 대상 데이터:', data);
        console.log('매출정보:', data?.sfaByPayments);

        // sfaByPayments 배열 존재 확인
        if (data?.sfaByPayments && data.sfaByPayments.length > 0) {
          // 경고 메시지 표시 (개선된 UI)
          window.alert(
            '⚠️ 경고\n\n모든 결제매출 정보를 먼저 삭제해야 합니다.\n\n현재 등록된 결제매출: ' +
              data.sfaByPayments.length +
              '건',
          );
          console.log('=== 삭제 취소: 매출정보 존재 ===');
          return;
        }

        // 삭제 확인 메시지 (개선된 UI)
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

        // is_deleted를 true로 업데이트
        await sfaSubmitService.updateSfaBase(sfaId, formData);

        console.log('=== SFA 삭제 성공 ===');

        // 삭제 성공 후 drawer 닫기 (삭제된 데이터는 다시 조회할 필요 없음)
        uiActions.drawer.close();

        // 성공 메시지 표시 (Drawer가 닫힌 후 표시되도록 setTimeout 사용)
        setTimeout(() => {
          alert('✅ 삭제가 완료되었습니다.');
        }, 100);

        // 삭제 후 상세 정보를 다시 가져올 필요가 있다면 여기서 처리
        // 하지만 일반적으로 삭제 후에는 drawer를 닫으므로 불필요
      } catch (error) {
        console.error('=== SFA 삭제 실패 ===');
        console.error('에러 내용:', error);
        alert('❌ 삭제 중 오류가 발생했습니다.\n\n' + (error.message || ''));
      }
    };

    // 통합 컨텐츠 컴포넌트 - 섹션별 편집 버튼 제공
    const Content = React.memo(({ data }) => (
      <div className="space-y-6">
        {/* 기본 정보 섹션 */}
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-800">기본 정보</h2>
            <div className="flex items-center gap-2">
              {editingSection === 'base' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFinishEdit}
                  className="h-8 px-3 text-gray-600 hover:text-gray-900"
                >
                  완료
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartEdit('base')}
                  className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                >
                  수정하기
                </Button>
              )}
            </div>
          </div>
          <div className="p-4">
            {editingSection === 'base' ? (
              <EditableSfaDetail
                data={data}
                featureMode="editBase"
                onSaveComplete={handleFinishEdit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <SfaDetailTable data={data} />
            )}
          </div>
        </section>

        {/* 결제매출 내역 섹션 */}
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-800">결제매출 내역</h2>
            <div className="flex items-center gap-2">
              {editingSection === 'payment' ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddPaymentClick}
                    disabled={form.isSubmitting || (form.data.sfaDraftPayments?.length || 0) >= 3 || editingPaymentId !== null}
                    className="h-8 px-3"
                  >
                    + 결제매출 추가
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 px-3 text-gray-600 hover:text-gray-900"
                  >
                    완료
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartEdit('payment')}
                  className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                >
                  수정하기
                </Button>
              )}
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* 편집 모드일 때: 추가할 매출 섹션 */}
            {editingSection === 'payment' && (
              <>
                {/* 추가할 매출 영역 */}
                {(form.data.sfaDraftPayments?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-blue-300"></div>
                      <h3 className="text-sm font-semibold text-blue-700 px-3">
                        ━━━━━ 추가할 매출 ━━━━━
                      </h3>
                      <div className="flex-1 h-px bg-blue-300"></div>
                    </div>

                    <SfaEditPaymentSection
                      data={data}
                      controlMode="edit"
                      featureMode="addPayment"
                    />
                  </div>
                )}

                {/* 구분선 - 추가할 매출이 있을 때만 표시 */}
                {(form.data.sfaDraftPayments?.length || 0) > 0 && (
                  <div className="my-6"></div>
                )}

                {/* 기존 매출 내역 구분선 */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <h3 className="text-sm font-semibold text-gray-700 px-3">
                    ━━━━━ 기존 매출 내역 ━━━━━
                  </h3>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
              </>
            )}

            {/* 결제매출 내역 */}
            <SfaPaymentSection
              data={data}
              controlMode={editingSection === 'payment' ? 'edit' : 'view'}
              featureMode={editingSection === 'payment' ? 'editPayment' : 'viewPayment'}
              onEditComplete={handleFinishEdit}
              hasAddingPayments={(form.data.sfaDraftPayments?.length || 0) > 0}
              editingPaymentId={editingPaymentId}
              setEditingPaymentId={setEditingPaymentId}
            />
          </div>
        </section>
      </div>
    ));
    Content.displayName = 'Content';

    return (
      <BaseDrawer
        visible={visible}
        title="SFA 상세정보"
        onClose={setDrawerClose}
        menu={
          <div className="flex items-center justify-end w-full">
            {/* 더보기 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  SFA 삭제
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => console.log('복사하기')}
                  className="text-gray-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  복사하기
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => console.log('이력 보기')}
                  className="text-gray-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  이력 보기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        width="900px"
        enableOverlayClick={false}
        controlMode="view"
      >
        <Content data={data} />
      </BaseDrawer>
    );
  },
  (prevProps, nextProps) => {
    // React.memo 비교 함수 - drawer props가 실제로 변경되었을 때만 재렌더링
    const prevDrawer = prevProps.drawer;
    const nextDrawer = nextProps.drawer;

    // drawer의 visible과 data만 비교 (mode/featureMode 제거됨)
    const isEqual =
      prevDrawer.visible === nextDrawer.visible &&
      prevDrawer.data === nextDrawer.data;

    return isEqual;
  },
);

SfaViewDrawer.displayName = 'SfaViewDrawer';

export default SfaViewDrawer;
