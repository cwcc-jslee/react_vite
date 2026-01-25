/**
 * ProjectDetailDrawer 헤더 메뉴 컴포넌트
 * - 기본정보 수정, 작업 추가/수정 기능 제공
 * - Drawer Header 영역에 통합되어 사용
 * - 사용자 권한에 따라 메뉴 표시/숨김 처리
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Edit3, Edit } from 'lucide-react';
import { DrawerMenu } from '@shared/components/drawer';

const ProjectDetailDrawerMenu = ({
  onEditBase,
  isEditingBase,
  onEditTask,
  permissions, // { canCreate, canUpdate, canDelete }
  isPending = false, // 승인 대기 여부
}) => {
  // 권한 기본값 설정 (권한 정보가 없으면 모두 허용)
  const { canUpdate = true } = permissions || {};

  // 권한에 따라 필터링된 메뉴 아이템
  const dropdownMenuItems = useMemo(() => {
    const allItems = [
      // 기본정보 수정 (update 권한)
      {
        key: 'editBase',
        label: '기본정보 수정',
        icon: Edit3,
        onClick: onEditBase,
        disabled: isPending,
        className: isEditingBase
          ? 'bg-blue-100 text-blue-700 font-semibold'
          : isPending
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-50',
        requiredPermission: 'update',
      },
      { separator: true, group: 'update' },
      // 작업 수정 (update 권한) - 작업 추가/수정 통합
      {
        key: 'editTask',
        label: '작업 수정',
        icon: Edit,
        onClick: onEditTask,
        disabled: isPending,
        className: isPending
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-blue-600 hover:bg-blue-50',
        requiredPermission: 'update',
      },
    ];

    // 권한에 따라 메뉴 필터링
    const checkPermission = (permission) => {
      switch (permission) {
        case 'update': return canUpdate;
        default: return true;
      }
    };

    // 필터링 및 연속된 separator 제거
    const filtered = allItems.filter(item => {
      if (item.separator) {
        return checkPermission(item.group);
      }
      return checkPermission(item.requiredPermission);
    });

    // 연속된 separator 및 처음/끝의 separator 제거
    return filtered.filter((item, index, arr) => {
      if (!item.separator) return true;
      if (index === 0) return false;
      if (index === arr.length - 1) return false;
      if (arr[index - 1]?.separator) return false;
      return true;
    });
  }, [
    canUpdate,
    isEditingBase,
    onEditBase, onEditTask
  ]);

  // 표시할 메뉴가 없으면 null 반환
  if (dropdownMenuItems.length === 0) {
    return null;
  }

  return <DrawerMenu type="dropdown" items={dropdownMenuItems} />;
};

ProjectDetailDrawerMenu.propTypes = {
  onEditBase: PropTypes.func,
  isEditingBase: PropTypes.bool,
  onEditTask: PropTypes.func,
  permissions: PropTypes.shape({
    canUpdate: PropTypes.bool,
  }),
  isPending: PropTypes.bool,
};

ProjectDetailDrawerMenu.defaultProps = {
  isEditingBase: false,
  permissions: {
    canUpdate: true,
  },
};

export default ProjectDetailDrawerMenu;