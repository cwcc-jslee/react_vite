/**
 * 결제매출 목록 섹션 컴포넌트
 * - View/Edit 모드 전환
 * - 결제매출 추가/수정/삭제 기능 제공
 * - usePaymentActions Hook 사용으로 로직 분리
 */

import React from 'react';
import PropTypes from 'prop-types';
import { CircleDollarSign } from 'lucide-react';
import { Button } from '@shared/components/ui';
import { usePaymentActions } from '../../../hooks/usePaymentActions.js';
import SfaEditPaymentSection from '../../sections/SfaEditPaymentSection.jsx';
import SfaPaymentSection from '../../sections/SfaPaymentSection.jsx';

/**
 * 섹션 구분선 컴포넌트
 */
const SectionDivider = ({ label, variant = 'default' }) => {
  const variants = {
    default: 'border-gray-300 text-gray-700',
    primary: 'border-blue-300 text-blue-700',
  };

  const colorClass = variants[variant] || variants.default;
  const [borderColor, textColor] = colorClass.split(' ');

  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full border-t-2 border-dashed ${borderColor}`}></div>
      </div>
      <div className="relative flex justify-center">
        <span
          className={`
            bg-white px-4 py-1
            text-xs font-semibold uppercase tracking-wide
            border rounded-full
            ${colorClass}
          `}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

SectionDivider.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'primary']),
};

/**
 * 결제매출 목록 섹션
 */
const PaymentListSection = ({
  data,
  isEditing,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
  editingPaymentId,
  setEditingPaymentId,
  showBox = true,
}) => {
  const {
    addPayment,
    draftPaymentsCount,
    canAddMore,
    isSubmitting,
  } = usePaymentActions(data);

  const handleAddClick = () => {
    const success = addPayment();
    if (!success) {
      // 최대 개수 도달 시 사용자에게 알림 (이미 console.warn이 나가지만 필요시 추가 UI)
    }
  };

  // 박스 제거 모드
  if (!showBox) {
    return (
      <div>
        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">결제매출 내역</h2>
            {isEditing && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded border border-blue-300">
                수정중
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddClick}
                  disabled={
                    isSubmitting ||
                    !canAddMore ||
                    editingPaymentId !== null
                  }
                  className="h-9 px-4"
                >
                  + 추가
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEdit}
                  className="h-9 px-4 text-gray-600 hover:text-gray-900"
                >
                  완료
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartEdit}
                className="h-9 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
              >
                수정
              </Button>
            )}
          </div>
        </div>

        {/* Section Content */}
        <div className="space-y-4">
          {/* 편집 모드: 추가할 매출 섹션 */}
          {isEditing && draftPaymentsCount > 0 && (
            <>
              <div className="space-y-3">
                <SectionDivider label="추가할 매출" variant="primary" />

                <SfaEditPaymentSection
                  data={data}
                  controlMode="edit"
                  featureMode="addPayment"
                />
              </div>

              {/* 구분 여백 */}
              <div className="my-6"></div>

              {/* 기존 매출 내역 구분선 */}
              <SectionDivider label="기존 매출 내역" variant="default" />
            </>
          )}

          {/* 결제매출 내역 */}
          <SfaPaymentSection
            data={data}
            controlMode={isEditing ? 'edit' : 'view'}
            featureMode={isEditing ? 'editPayment' : 'viewPayment'}
            onEditComplete={onFinishEdit}
            hasAddingPayments={draftPaymentsCount > 0}
            editingPaymentId={editingPaymentId}
            setEditingPaymentId={setEditingPaymentId}
          />
        </div>
      </div>
    );
  }

  // 기존 박스 모드
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left: Icon + Title + Badge */}
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">결제매출 내역</h2>
            {isEditing && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                수정 중
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddClick}
                  disabled={
                    isSubmitting ||
                    !canAddMore ||
                    editingPaymentId !== null
                  }
                  className="h-9 px-4"
                >
                  + 추가
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEdit}
                  className="h-9 px-4 text-gray-600 hover:text-gray-900"
                >
                  완료
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartEdit}
                className="h-9 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
              >
                수정
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6 space-y-4">
        {/* 편집 모드: 추가할 매출 섹션 */}
        {isEditing && draftPaymentsCount > 0 && (
          <>
            <div className="space-y-3">
              <SectionDivider label="추가할 매출" variant="primary" />

              <SfaEditPaymentSection
                data={data}
                controlMode="edit"
                featureMode="addPayment"
              />
            </div>

            {/* 구분 여백 */}
            <div className="my-6"></div>

            {/* 기존 매출 내역 구분선 */}
            <SectionDivider label="기존 매출 내역" variant="default" />
          </>
        )}

        {/* 결제매출 내역 */}
        <SfaPaymentSection
          data={data}
          controlMode={isEditing ? 'edit' : 'view'}
          featureMode={isEditing ? 'editPayment' : 'viewPayment'}
          onEditComplete={onFinishEdit}
          hasAddingPayments={draftPaymentsCount > 0}
          editingPaymentId={editingPaymentId}
          setEditingPaymentId={setEditingPaymentId}
        />
      </div>
    </section>
  );
};

PaymentListSection.propTypes = {
  data: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onStartEdit: PropTypes.func.isRequired,
  onFinishEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  editingPaymentId: PropTypes.number,
  setEditingPaymentId: PropTypes.func.isRequired,
  showBox: PropTypes.bool,
};

export default PaymentListSection;
