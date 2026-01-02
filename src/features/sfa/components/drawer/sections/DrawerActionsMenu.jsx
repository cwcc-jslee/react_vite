/**
 * Drawer 액션 메뉴 컴포넌트
 * - 기본정보 수정, 삭제, 복사, 이력 보기 기능 제공
 * - Drawer Header 영역에 통합되어 사용
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Trash2, Copy, FileText, Edit3 } from 'lucide-react';
import { DrawerMenu } from '@shared/components/drawer';

const DrawerActionsMenu = ({ onDelete, onCopy, onHistory, onEditBase, isEditingBase }) => {
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
    {
      key: 'history',
      label: '이력 보기',
      icon: FileText,
      onClick: onHistory,
      className: 'text-gray-700 hover:bg-gray-50',
    },
  ];

  return <DrawerMenu type="dropdown" items={dropdownMenuItems} />;
};

DrawerActionsMenu.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onHistory: PropTypes.func.isRequired,
  onEditBase: PropTypes.func.isRequired,
  isEditingBase: PropTypes.bool,
};

DrawerActionsMenu.defaultProps = {
  isEditingBase: false,
};

export default DrawerActionsMenu;
