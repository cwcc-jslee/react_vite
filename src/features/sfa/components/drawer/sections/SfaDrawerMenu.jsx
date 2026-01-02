/**
 * SFA Drawer 전용 드롭다운 메뉴 컴포넌트
 * - 삭제, 복사, 이력 보기 기능 제공
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Trash2, Copy, FileText } from 'lucide-react';
import { DrawerMenu } from '@shared/components/drawer';

const SfaDrawerMenu = ({ onDelete, onCopy, onHistory }) => {
  const dropdownMenuItems = [
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
      className: 'text-gray-700',
    },
    {
      key: 'history',
      label: '이력 보기',
      icon: FileText,
      onClick: onHistory,
      className: 'text-gray-700',
    },
  ];

  return <DrawerMenu type="dropdown" items={dropdownMenuItems} />;
};

SfaDrawerMenu.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onHistory: PropTypes.func.isRequired,
};

export default SfaDrawerMenu;
