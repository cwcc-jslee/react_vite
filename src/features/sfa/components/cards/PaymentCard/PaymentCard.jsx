/**
 * PaymentCard 메인 컴포넌트
 * - 결제매출 정보를 카드 형태로 표시
 * - isNewSfa 모드와 상세보기 모드 지원
 * - 확정 상태에 따른 시각적 강조 (gradient + border)
 */
import React from 'react';
import PropTypes from 'prop-types';
import PaymentCardHeader from './PaymentCardHeader.jsx';
import PaymentCardBody from './PaymentCardBody.jsx';
import PaymentCardActions from './PaymentCardActions.jsx';
import PaymentCardTeamBadges from './PaymentCardTeamBadges.jsx';

const PaymentCard = ({
  payment,
  isNewSfa = false,
  showActions = true,
  showTeamAllocations = true,
  featureMode = 'viewPayment',
  onEdit,
  onDelete,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      {/* 매출 항목 카드 */}
      <div
        className={`
          bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200
          ${
            payment.isConfirmed
              ? 'border-l-4 border-green-500 bg-gradient-to-r from-green-50/30 to-white'
              : 'border-l-4 border-gray-300 bg-gradient-to-r from-gray-50/30 to-white'
          }
          p-4
        `}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            {/* ID 헤더 */}
            <PaymentCardHeader id={payment.id} />

            {/* 카드 본문 (Grid 6열) */}
            <PaymentCardBody payment={payment} />

            {/* 액션 버튼 */}
            {showActions && (
              <PaymentCardActions
                isNewSfa={isNewSfa}
                featureMode={featureMode}
                onEdit={onEdit}
                onDelete={onDelete}
                disabled={disabled}
              />
            )}
          </div>

          {/* 팀별 매출액 배지 */}
          {showTeamAllocations && (
            <PaymentCardTeamBadges teamAllocations={payment.teamAllocations} />
          )}
        </div>
      </div>
    </div>
  );
};

PaymentCard.propTypes = {
  payment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    documentId: PropTypes.string,
    revenueSource: PropTypes.shape({
      name: PropTypes.string,
    }),
    billingType: PropTypes.string,
    amount: PropTypes.number,
    recognitionDate: PropTypes.string,
    isConfirmed: PropTypes.bool,
    probability: PropTypes.number,
    teamAllocations: PropTypes.array,
  }).isRequired,
  isNewSfa: PropTypes.bool,
  showActions: PropTypes.bool,
  showTeamAllocations: PropTypes.bool,
  featureMode: PropTypes.oneOf(['viewPayment', 'editPayment', 'deletePayment']),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool,
};

PaymentCard.defaultProps = {
  isNewSfa: false,
  showActions: true,
  showTeamAllocations: true,
  featureMode: 'viewPayment',
  onEdit: () => {},
  onDelete: () => {},
  disabled: false,
};

export default PaymentCard;
