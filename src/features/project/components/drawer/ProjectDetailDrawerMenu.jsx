/**
 * ProjectDetailDrawer 헤더 메뉴 컴포넌트
 * SFA Drawer 메뉴 구조 참고
 */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MoreVertical, Edit2, Trash2, History } from 'lucide-react';

const ProjectDetailDrawerMenu = ({ onEdit, onDelete, onHistory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (callback) => {
    setIsOpen(false);
    if (callback) callback();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 더보기 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="더보기"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            {/* 수정 */}
            <button
              onClick={() => handleMenuClick(onEdit)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              수정하기
            </button>

            {/* 삭제 */}
            <button
              onClick={() => handleMenuClick(onDelete)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제하기
            </button>

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-1" />

            {/* 이력 */}
            <button
              onClick={() => handleMenuClick(onHistory)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              변경 이력
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ProjectDetailDrawerMenu.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onHistory: PropTypes.func,
};

export default ProjectDetailDrawerMenu;
