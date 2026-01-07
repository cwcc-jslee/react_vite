/**
 * Drawer 액션 메뉴 컴포넌트
 * - 기본정보 수정, 결제매출 추가/수정, 삭제, 복사, 이력 보기 기능 제공
 * - Drawer Header 영역에 통합되어 사용
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Trash2, Copy, FileText, Edit3, PlusCircle, Edit, Briefcase } from 'lucide-react';
import { DrawerMenu } from '@shared/components/drawer';

const DrawerActionsMenu = ({
  onDelete,
  onCopy,
  onHistory,
  onEditBase,
  isEditingBase,
  onEditTeamSales,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  paymentMode, // 'view' | 'add' | 'edit' | 'delete'
}) => {
  const dropdownMenuItems = [
    {
      key: 'editBase',
      label: '기본정보 수정',
      icon: Edit3,
      onClick: onEditBase,
      className: isEditingBase
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'text-gray-700 hover:bg-gray-50',
    },
    {
      key: 'editTeamSales',
      label: '사업부 매출 수정',
      icon: Briefcase,
      onClick: onEditTeamSales,
      className: 'text-gray-700 hover:bg-gray-50',
    },
    { separator: true },
    {
      key: 'addPayment',
      label: '결제매출 추가',
      icon: PlusCircle,
      onClick: onAddPayment,
      className: paymentMode === 'add'
        ? 'bg-green-100 text-green-700 font-semibold'
        : 'text-green-600 hover:bg-green-50',
    },
    {
      key: 'editPayment',
      label: '결제매출 수정',
      icon: Edit,
      onClick: onEditPayment,
      className: paymentMode === 'edit'
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'text-blue-600 hover:bg-blue-50',
    },
    {
      key: 'deletePayment',
      label: '결제매출 삭제',
      icon: Trash2,
      onClick: onDeletePayment,
      className: paymentMode === 'delete'
        ? 'bg-red-100 text-red-700 font-semibold'
        : 'text-red-600 hover:bg-red-50',
    },
    { separator: true },
    {
      key: 'delete',
      label: 'SFA 삭제',
      icon: Trash2,
      onClick: onDelete,
      className: 'text-red-600 focus:text-red-700 focus:bg-red-50',
    },
    { separator: true },
    {
      key: 'copy',
      label: '복사하기',
      icon: Copy,
      onClick: onCopy,
      className: 'text-gray-700 hover:bg-gray-50',
    },
  ];

  return <DrawerMenu type="dropdown" items={dropdownMenuItems} />;
};

DrawerActionsMenu.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  // onHistory: PropTypes.func.isRequired, // Removed
  onEditBase: PropTypes.func.isRequired,
  isEditingBase: PropTypes.bool,
  onEditTeamSales: PropTypes.func.isRequired,
  onAddPayment: PropTypes.func.isRequired,
  onEditPayment: PropTypes.func.isRequired,
  onDeletePayment: PropTypes.func.isRequired,
  paymentMode: PropTypes.oneOf(['view', 'add', 'edit', 'delete']),
};

DrawerActionsMenu.defaultProps = {
  isEditingBase: false,
  paymentMode: 'view',
};

export default DrawerActionsMenu;
