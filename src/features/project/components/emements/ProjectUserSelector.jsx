// src/features/project/components/elements/ProjectUserSelector.jsx
// 프로젝트 사용자 선택 컴포넌트
// 할당 가능한 사용자 목록을 표시하고 사용자 검색 및 선택 기능을 제공합니다

import React, { useState, useRef, useEffect } from 'react';
import { FiUserPlus, FiSearch } from 'react-icons/fi';

/**
 * 프로젝트 사용자 선택 컴포넌트
 * 사용자 할당 및 검색을 위한 컴포넌트로, 독립적으로 사용 가능하도록 설계됨
 *
 * @param {Object} props
 * @param {Array} props.usersData - 사용자 데이터 배열
 * @param {Array} props.assignedUsers - 이미 할당된 사용자 배열
 * @param {Function} props.onAssignUser - 사용자 할당 시 호출될 콜백 함수
 * @param {Function} props.onRemoveUser - 사용자 제거 시 호출될 콜백 함수
 */
const ProjectUserSelector = ({
  usersData,
  assignedUsers = [],
  onAssignUser,
  onRemoveUser,
}) => {
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const selectorRef = useRef(null);
  const searchInputRef = useRef(null);

  // 검색어로 필터링된 사용자 목록
  const getFilteredUsers = () => {
    if (!usersData) return [];

    // 데이터 형식 확인
    let users = [];
    if (Array.isArray(usersData)) {
      users = usersData;
    } else if (usersData.data && Array.isArray(usersData.data)) {
      users = usersData.data;
    }

    // 유효한 사용자만 필터링
    return users.filter((user) => {
      // 유효한 사용자 객체인지 확인
      if (!user || !user.id) return false;

      // 이미 할당된 사용자인지 확인
      const isAlreadyAssigned = assignedUsers.some(
        (assigned) => assigned.id === user.id,
      );

      // 이미 할당된 사용자는 제외
      if (isAlreadyAssigned) return false;

      // 검색어가 없으면 모든 할당되지 않은 사용자 포함
      if (!userSearchTerm) return true;

      // 검색어가 있으면 username 필드에서 검색
      return user.username
        ?.toLowerCase()
        .includes(userSearchTerm.toLowerCase());
    });
  };

  // 팝업 토글
  const toggleUserPopup = () => {
    setShowUserPopup(!showUserPopup);
    setUserSearchTerm('');

    // 팝업이 열릴 때 검색 입력창에 포커스
    if (!showUserPopup) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  // 사용자 할당 처리
  const handleAssignUser = (user) => {
    onAssignUser({
      id: user.id,
      username: user.username || '',
    });
    setShowUserPopup(false);
  };

  // 사용자 제거 처리
  const handleRemoveUser = (userId) => {
    onRemoveUser(userId);
  };

  // 문서 클릭 시 팝업 닫기 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setShowUserPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 필터링된 사용자 목록
  const filteredUsers = getFilteredUsers();

  return (
    <div className="relative" ref={selectorRef}>
      {/* 사용자 선택 버튼과 할당된 사용자를 가로로 배치 */}
      <div className="flex items-center">
        {/* 사용자 선택 버튼 */}
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-md"
          onClick={toggleUserPopup}
        >
          <FiUserPlus size={20} />
        </button>

        {/* 할당된 사용자 표시 - 버튼 옆에 배치 */}
        <div className="flex gap-2 ml-2">
          {assignedUsers.map((user, index) => (
            <div
              key={user.id || index}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-indigo-600 relative group"
            >
              {user.username?.substring(1, 3) || index + 1}
              <button
                type="button"
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveUser(user.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 사용자 선택 팝업 */}
      {showUserPopup && (
        <div className="absolute z-10 bg-white border border-gray-200 shadow-lg rounded-md w-64 max-h-96 overflow-y-auto mt-2 left-0">
          {/* 검색 입력 필드 */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-gray-400" size={16} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="사용자 검색"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 할당된 사용자 목록 */}
          <div className="border-b border-gray-200">
            <div className="p-2 text-xs text-gray-600 font-medium">할당됨</div>
            <ul>
              {assignedUsers.length > 0 ? (
                assignedUsers.map((user) => (
                  <li
                    key={`assigned-${user.id}`}
                    className="flex items-center px-3 py-2 hover:bg-gray-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs mr-2">
                      {user.username?.substring(0, 1) || ''}
                    </div>
                    <span className="flex-1">{user.username}</span>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      ×
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-500 text-sm">
                  할당된 사용자가 없습니다
                </li>
              )}
            </ul>
          </div>

          {/* 할당 가능한 사용자 목록 */}
          <div>
            <div className="p-2 text-xs text-gray-600 font-medium">
              할당되지 않음
            </div>
            <ul>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <li
                    key={`unassigned-${user.id}`}
                    className="flex items-center px-3 py-2 hover:bg-gray-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs mr-2">
                      {user.username?.substring(0, 1) || ''}
                    </div>
                    <span className="flex-1 font-medium">
                      {user.username || ''}
                    </span>
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-800 px-2 py-1 text-xs bg-indigo-100 rounded"
                      onClick={() => handleAssignUser(user)}
                    >
                      추가
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-500 text-sm">
                  {userSearchTerm
                    ? '검색 결과가 없습니다'
                    : '할당할 수 있는 사용자가 없습니다'}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectUserSelector;
