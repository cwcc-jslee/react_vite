/**
 * SFA 결제매출 관리 섹션 컴포넌트
 * - View/Edit 모드 전환
 * - 결제매출 추가/수정/삭제 기능 제공
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@shared/components/ui';
import { useSfaStore } from '../../../hooks/useSfaStore.js';
import SfaEditPaymentSection from '../../sections/SfaEditPaymentSection.jsx';
import SfaPaymentSection from '../../sections/SfaPaymentSection.jsx';

const SfaPaymentManagementSection = ({
  data,
  isEditing,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
  editingPaymentId,
  setEditingPaymentId,
}) => {
  const { form, actions: sfaActions } = useSfaStore();

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

  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">결제매출 내역</h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddPaymentClick}
                disabled={
                  form.isSubmitting ||
                  (form.data.sfaDraftPayments?.length || 0) >= 3 ||
                  editingPaymentId !== null
                }
                className="h-8 px-3"
              >
                + 결제매출 추가
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                className="h-8 px-3 text-gray-600 hover:text-gray-900"
              >
                완료
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartEdit}
              className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
            >
              수정하기
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-4 space-y-4">
        {/* 편집 모드일 때: 추가할 매출 섹션 */}
        {isEditing && (
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
          controlMode={isEditing ? 'edit' : 'view'}
          featureMode={isEditing ? 'editPayment' : 'viewPayment'}
          onEditComplete={onFinishEdit}
          hasAddingPayments={(form.data.sfaDraftPayments?.length || 0) > 0}
          editingPaymentId={editingPaymentId}
          setEditingPaymentId={setEditingPaymentId}
        />
      </div>
    </section>
  );
};

SfaPaymentManagementSection.propTypes = {
  data: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onStartEdit: PropTypes.func.isRequired,
  onFinishEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  editingPaymentId: PropTypes.number,
  setEditingPaymentId: PropTypes.func.isRequired,
};

export default SfaPaymentManagementSection;
