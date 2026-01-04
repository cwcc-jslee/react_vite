/**
 * PaymentCardList 컴포넌트
 * - PaymentCard 배열 렌더링
 * - 매출인식일 기준 정렬
 * - 로딩 상태 및 빈 상태 처리
 */
import React from 'react';
import PropTypes from 'prop-types';
import PaymentCard from '../PaymentCard';
import PaymentCardEmpty from './PaymentCardEmpty.jsx';
import PaymentCardSkeleton from './PaymentCardSkeleton.jsx';

const PaymentCardList = ({
  payments = [],
  isNewSfa = false,
  showActions = true,
  showTeamAllocations = true,
  featureMode = 'viewPayment',
  onEdit,
  onDelete,
  disabled = false,
  isLoading = false,
  emptyMessage = '등록된 결제매출이 없습니다.',
  sortByRecognitionDate = true,
}) => {
  // 로딩 상태
  if (isLoading) {
    return <PaymentCardSkeleton count={3} />;
  }

  // 빈 상태
  if (!payments || payments.length === 0) {
    return <PaymentCardEmpty message={emptyMessage} />;
  }

  // 정렬 (매출인식일 기준 오름차순)
  const sortedPayments = React.useMemo(() => {
    if (!sortByRecognitionDate) {
      return payments;
    }

    return [...payments].sort((a, b) => {
      // recognitionDate가 없는 경우 맨 뒤로
      if (!a.recognitionDate && !b.recognitionDate) return 0;
      if (!a.recognitionDate) return 1;
      if (!b.recognitionDate) return -1;

      // 날짜 문자열 비교 (YYYY-MM-DD 형식)
      return a.recognitionDate.localeCompare(b.recognitionDate);
    });
  }, [payments, sortByRecognitionDate]);

  return (
    <div className="space-y-4">
      {sortedPayments.map((payment) => (
        <PaymentCard
          key={payment.documentId || payment.no || payment.id}
          payment={payment}
          isNewSfa={isNewSfa}
          showActions={showActions}
          showTeamAllocations={showTeamAllocations}
          featureMode={featureMode}
          onEdit={() => onEdit && onEdit(payment)}
          onDelete={() => onDelete && onDelete(payment)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

PaymentCardList.propTypes = {
  payments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      documentId: PropTypes.string,
      recognitionDate: PropTypes.string,
    }),
  ),
  isNewSfa: PropTypes.bool,
  showActions: PropTypes.bool,
  showTeamAllocations: PropTypes.bool,
  featureMode: PropTypes.oneOf(['viewPayment', 'editPayment', 'deletePayment']),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  sortByRecognitionDate: PropTypes.bool,
};

PaymentCardList.defaultProps = {
  payments: [],
  isNewSfa: false,
  showActions: true,
  showTeamAllocations: true,
  featureMode: 'viewPayment',
  onEdit: null,
  onDelete: null,
  disabled: false,
  isLoading: false,
  emptyMessage: '등록된 결제매출이 없습니다.',
  sortByRecognitionDate: true,
};

export default PaymentCardList;
