/**
 * PaymentCard 액션 버튼 컴포넌트
 * - isNewSfa에 따라 아이콘/텍스트 버튼 표시
 * - featureMode에 따라 조건부 렌더링
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@shared/components/ui';

const PaymentCardActions = ({
  isNewSfa,
  featureMode,
  onEdit,
  onDelete,
  disabled,
}) => {
  // isNewSfa인 경우 항상 아이콘 버튼 표시
  if (isNewSfa) {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          disabled={disabled}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="수정"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // isNewSfa가 아닌 경우 featureMode에 따라 텍스트 버튼 표시
  if (featureMode === 'editPayment') {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          disabled={disabled}
          className="h-9 px-3 min-w-[60px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          수정
        </Button>
      </div>
    );
  }

  if (featureMode === 'deletePayment') {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          disabled={disabled}
          className="h-9 px-3 min-w-[60px] text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          삭제
        </Button>
      </div>
    );
  }

  // viewPayment 모드 또는 기타 경우 버튼 미표시
  return null;
};

PaymentCardActions.propTypes = {
  isNewSfa: PropTypes.bool,
  featureMode: PropTypes.oneOf(['viewPayment', 'editPayment', 'deletePayment']),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool,
};

PaymentCardActions.defaultProps = {
  isNewSfa: false,
  featureMode: 'viewPayment',
  onEdit: () => {},
  onDelete: () => {},
  disabled: false,
};

export default PaymentCardActions;
