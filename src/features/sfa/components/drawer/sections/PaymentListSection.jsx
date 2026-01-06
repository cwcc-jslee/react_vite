/**
 * 결제매출 목록 섹션 컴포넌트
 * - View/Add/Edit 모드 전환
 * - 결제매출 추가/수정/삭제 기능 제공
 * - usePaymentActions Hook 사용으로 로직 분리
 */

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
  const borderColor = colorClass.split(' ')[0];

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
 * @param {Object} props
 * @param {Object} props.data - SFA 데이터
 * @param {string} props.mode - 모드 ('view' | 'add' | 'edit' | 'delete')
 * @param {Function} props.onModeChange - 모드 변경 핸들러
 * @param {Function} props.onOpenPaymentDrawer - 결제매출 Drawer 열기 핸들러
 * @param {number} props.editingPaymentId - 수정 중인 결제매출 ID
 * @param {Function} props.setEditingPaymentId - 수정 중인 결제매출 ID 설정
 * @param {boolean} props.showBox - 박스 스타일 여부
 */
const PaymentListSection = ({
  data,
  mode = 'view', // 'view' | 'add' | 'edit' | 'delete'
  onModeChange,
  onOpenPaymentDrawer,
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

  // 모드 종료 (view로 복귀)
  const handleFinish = () => {
    onModeChange('view');
  };

  // 추가 버튼 클릭 (add 모드에서만)
  const handleAddClick = () => {
    const success = addPayment();
    if (!success) {
      // 최대 개수 도달 시 사용자에게 알림
      console.warn('최대 추가 가능 개수에 도달했습니다.');
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
            {mode === 'add' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded border border-green-300">
                추가 모드
              </span>
            )}
            {mode === 'edit' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded border border-blue-300">
                수정 모드
              </span>
            )}
            {mode === 'delete' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded border border-red-300">
                삭제 모드
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              // View 모드: 아무 버튼 없음 (헤더 메뉴에서 제어)
              null
            ) : mode === 'add' ? (
              // Add 모드: 추가 + 완료
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddClick}
                  disabled={isSubmitting || !canAddMore}
                  className="h-9 px-4"
                >
                  + 추가
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFinish}
                  className="h-9 px-4 text-gray-600 hover:text-gray-900"
                >
                  완료
                </Button>
              </>
            ) : mode === 'delete' ? (
              // Delete 모드: 완료만
              <Button
                variant="outline"
                size="sm"
                onClick={handleFinish}
                className="h-9 px-4 text-gray-600 hover:text-gray-900"
              >
                완료
              </Button>
            ) : null}
          </div>
        </div>

        {/* Section Content */}
        <div className="space-y-4">
          {/* 추가 모드: 추가할 매출 섹션 */}
          {mode === 'add' && draftPaymentsCount > 0 && (
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
            controlMode={mode === 'edit' || mode === 'delete' ? mode : 'view'}
            featureMode={
              mode === 'edit' ? 'editPayment' :
              mode === 'delete' ? 'deletePayment' :
              'viewPayment'
            }
            onEditComplete={handleFinish}
            onOpenPaymentDrawer={onOpenPaymentDrawer}
            hasAddingPayments={mode === 'add' && draftPaymentsCount > 0}
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
            {mode === 'add' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                추가 모드
              </span>
            )}
            {mode === 'edit' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                수정 모드
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              null
            ) : mode === 'add' ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddClick}
                  disabled={isSubmitting || !canAddMore}
                  className="h-9 px-4"
                >
                  + 추가
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFinish}
                  className="h-9 px-4 text-gray-600 hover:text-gray-900"
                >
                  완료
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6 space-y-4">
        {/* 추가 모드: 추가할 매출 섹션 */}
        {mode === 'add' && draftPaymentsCount > 0 && (
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
          controlMode={mode === 'edit' || mode === 'delete' ? mode : 'view'}
          featureMode={
            mode === 'edit' ? 'editPayment' :
            mode === 'delete' ? 'deletePayment' :
            'viewPayment'
          }
          onEditComplete={handleFinish}
          onOpenPaymentDrawer={onOpenPaymentDrawer}
          hasAddingPayments={mode === 'add' && draftPaymentsCount > 0}
          editingPaymentId={editingPaymentId}
          setEditingPaymentId={setEditingPaymentId}
        />
      </div>
    </section>
  );
};

PaymentListSection.propTypes = {
  data: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(['view', 'add', 'edit', 'delete']),
  onModeChange: PropTypes.func.isRequired,
  onOpenPaymentDrawer: PropTypes.func.isRequired,
  editingPaymentId: PropTypes.number,
  setEditingPaymentId: PropTypes.func.isRequired,
  showBox: PropTypes.bool,
};

export default PaymentListSection;
