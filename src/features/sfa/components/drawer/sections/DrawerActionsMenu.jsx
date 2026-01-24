/**
 * Drawer 액션 메뉴 컴포넌트
 * - 기본정보 수정, 결제매출 추가/수정, 삭제, 복사, 이력 보기 기능 제공
 * - Drawer Header 영역에 통합되어 사용
 * - 사용자 권한에 따라 메뉴 표시/숨김 처리
 */

import React, { useMemo } from 'react';
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
  permissions, // { canCreate, canUpdate, canDelete }
}) => {
  // 권한 기본값 설정 (권한 정보가 없으면 모두 허용)
  const { canCreate = true, canUpdate = true, canDelete = true } = permissions || {};

  // 권한에 따라 필터링된 메뉴 아이템
  const dropdownMenuItems = useMemo(() => {
    const allItems = [
      // 수정 권한 필요
      {
        key: 'editBase',
        label: '기본정보 수정',
        icon: Edit3,
        onClick: onEditBase,
        className: isEditingBase
          ? 'bg-blue-100 text-blue-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-50',
        requiredPermission: 'update',
      },
      // 수정 권한 필요
      {
        key: 'editTeamSales',
        label: '사업부 매출 수정',
        icon: Briefcase,
        onClick: onEditTeamSales,
        className: 'text-gray-700 hover:bg-gray-50',
        requiredPermission: 'update',
      },
      { separator: true, group: 'update' },
      // 생성 권한 필요
      {
        key: 'addPayment',
        label: '결제매출 추가',
        icon: PlusCircle,
        onClick: onAddPayment,
        className: paymentMode === 'add'
          ? 'bg-green-100 text-green-700 font-semibold'
          : 'text-green-600 hover:bg-green-50',
        requiredPermission: 'create',
      },
      // 수정 권한 필요
      {
        key: 'editPayment',
        label: '결제매출 수정',
        icon: Edit,
        onClick: onEditPayment,
        className: paymentMode === 'edit'
          ? 'bg-blue-100 text-blue-700 font-semibold'
          : 'text-blue-600 hover:bg-blue-50',
        requiredPermission: 'update',
      },
      // 삭제 권한 필요
      {
        key: 'deletePayment',
        label: '결제매출 삭제',
        icon: Trash2,
        onClick: onDeletePayment,
        className: paymentMode === 'delete'
          ? 'bg-red-100 text-red-700 font-semibold'
          : 'text-red-600 hover:bg-red-50',
        requiredPermission: 'delete',
      },
      { separator: true, group: 'delete' },
      // 삭제 권한 필요
      {
        key: 'delete',
        label: 'SFA 삭제',
        icon: Trash2,
        onClick: onDelete,
        className: 'text-red-600 focus:text-red-700 focus:bg-red-50',
        requiredPermission: 'delete',
      },
      { separator: true, group: 'create' },
      // 생성 권한 필요
      {
        key: 'copy',
        label: '복사하기',
        icon: Copy,
        onClick: onCopy,
        className: 'text-gray-700 hover:bg-gray-50',
        requiredPermission: 'create',
      },
    ];

    // 권한에 따라 메뉴 필터링
    const checkPermission = (permission) => {
      switch (permission) {
        case 'create': return canCreate;
        case 'update': return canUpdate;
        case 'delete': return canDelete;
        default: return true;
      }
    };

    // 필터링 및 연속된 separator 제거
    const filtered = allItems.filter(item => {
      if (item.separator) {
        // separator는 해당 그룹의 권한이 있을 때만 표시
        return checkPermission(item.group);
      }
      return checkPermission(item.requiredPermission);
    });

    // 연속된 separator 및 처음/끝의 separator 제거
    return filtered.filter((item, index, arr) => {
      if (!item.separator) return true;
      // 첫 번째 아이템이 separator면 제거
      if (index === 0) return false;
      // 마지막 아이템이 separator면 제거
      if (index === arr.length - 1) return false;
      // 이전 아이템이 separator면 제거 (연속 방지)
      if (arr[index - 1]?.separator) return false;
      return true;
    });
  }, [
    canCreate, canUpdate, canDelete,
    isEditingBase, paymentMode,
    onEditBase, onEditTeamSales, onAddPayment, onEditPayment, onDeletePayment, onDelete, onCopy
  ]);

  // 표시할 메뉴가 없으면 null 반환
  if (dropdownMenuItems.length === 0) {
    return null;
  }

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
  permissions: PropTypes.shape({
    canCreate: PropTypes.bool,
    canUpdate: PropTypes.bool,
    canDelete: PropTypes.bool,
  }),
};

DrawerActionsMenu.defaultProps = {
  isEditingBase: false,
  paymentMode: 'view',
  permissions: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
};

export default DrawerActionsMenu;
