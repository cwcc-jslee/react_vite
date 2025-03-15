// src/shared/components/ui/TaskCard.jsx
// 칸반 보드의 개별 작업 카드를 표현하는 컴포넌트
// 작업 완료 토글, 날짜 선택, 담당자 표시, 작업 삭제 기능을 제공합니다

import React, { useState, useRef, useEffect } from 'react';
import {
  FiSquare,
  FiCheckSquare,
  FiCalendar,
  FiUserPlus,
  FiMoreVertical,
  FiTrash2,
} from 'react-icons/fi';

// 작업 카드 컴포넌트
const TaskCard = ({
  task,
  columnIndex,
  taskIndex,
  startEditing,
  editState,
  handleEditChange,
  saveEdit,
  cancelEdit,
  toggleTaskCompletion,
  deleteTask,
}) => {
  const { title, days, dueDate, assignedUsers = [], pjt_progress } = task;
  const isCompleted = pjt_progress === '100';

  // 날짜 선택 기능 제거로 상태 불필요

  // 메뉴 상태 관리
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 해당 필드가 현재 편집 중인지 확인
  const isEditingField = (field) => {
    return (
      editState.isEditing &&
      editState.columnIndex === columnIndex &&
      editState.taskIndex === taskIndex &&
      editState.field === field
    );
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 작업 삭제 핸들러
  const handleDeleteTask = () => {
    deleteTask(columnIndex, taskIndex);
    setMenuOpen(false);
  };

  // 날짜 변경 핸들러 - 기능 제거

  // 화면에 표시할 날짜 포맷팅 (MM.DD 형식)
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(
        date.getDate(),
      ).padStart(2, '0')}.`;
    } catch (e) {
      return dateString; // 파싱 실패시 원본 반환
    }
  };

  // 마감일이 지났는지 확인
  const isOverdue = () => {
    if (!dueDate) return false;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작

      const dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0); // 마감일의 시작

      return dueDateObj < today;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="w-full mb-2 relative group">
      <div className="max-w-full rounded-sm border-0 shadow-sm bg-white">
        {/* 메뉴 버튼 - 호버 시에만 표시 */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FiMoreVertical size={16} />
          </button>

          {/* 드롭다운 메뉴 */}
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-1 w-36 bg-white shadow-lg rounded-md py-1 z-20 border border-gray-200"
            >
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                onClick={handleDeleteTask}
              >
                <FiTrash2 className="mr-2" size={14} />
                작업 삭제
              </button>
            </div>
          )}
        </div>

        <div className="flex-col justify-between pr-3 flex">
          {/* 클릭 가능한 메인 영역 */}
          <div
            className="flex-1 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => {
              // TODO: 팝업 표시 로직 구현 예정
              console.log('Task clicked:', task);
            }}
          >
            <div className="text-ellipsis flex items-center overflow-hidden">
              {/* 체크박스 */}
              <span
                className="flex items-center justify-center w-10 h-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center justify-center w-8 h-8 cursor-pointer"
                  onClick={() => toggleTaskCompletion(columnIndex, taskIndex)}
                >
                  {isCompleted ? (
                    <FiCheckSquare
                      size={20}
                      className="text-indigo-600"
                      style={{ fill: '#4F46E5', stroke: 'white' }}
                    />
                  ) : (
                    <FiSquare size={20} className="text-zinc-600" />
                  )}
                </button>
              </span>

              {/* 제목 - 수정 불가능하게 변경 */}
              <div className="flex items-center min-h-[40px] select-none">
                <span className="truncate">{title}</span>
              </div>
            </div>

            {/* 일수 - 수정 불가능하게 변경 */}
            <div className="pl-8 text-ellipsis flex min-h-6 overflow-hidden text-xs text-zinc-600 select-none">
              <div className="pt-1 align-middle inline-block overflow-hidden m-1">
                {days ? `${days}일` : null}
              </div>
            </div>
          </div>
        </div>

        {(dueDate || assignedUsers.length > 0) && (
          <>
            <div className="bg-gray-200 h-px mx-3 my-1" />
            <div className="justify-between flex h-9 mt-1">
              {/* 날짜 - 달력 기능 제거, 단순 표시만 */}
              {dueDate && (
                <div className="pl-2 flex">
                  <div className="flex">
                    <div
                      className={`${
                        isOverdue()
                          ? 'bg-red-600 text-white'
                          : 'text-indigo-600'
                      } items-center flex-grow inline-flex h-6 rounded-sm`}
                    >
                      <div className="flex items-center">
                        <span className="items-center justify-center px-1 flex m-1">
                          <FiCalendar size={16} />
                        </span>
                        <span className="text-xs pl-1 pr-2">
                          {formatDisplayDate(dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 사용자 - 이벤트 전파 중지 */}
              <div
                className="items-baseline pr-3 flex"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="items-center flex w-full">
                  <div className="flex-grow float-left">
                    <div className="float-left w-auto">
                      <div className="flex">
                        {assignedUsers.length === 0 ? (
                          <button className="text-neutral-800 cursor-pointer pr-1 w-8 h-4 mr-1 rounded-full">
                            <span className="items-center justify-center flex h-full">
                              <span className="items-center justify-center flex h-4 m-1">
                                <FiUserPlus size={16} />
                              </span>
                            </span>
                          </button>
                        ) : (
                          <ul className="flex list-none overflow-hidden -m-1">
                            {assignedUsers.map((color, index) => (
                              <li key={index} className="inline-flex m-1">
                                <div className="self-center text-center rounded-full">
                                  <div className="w-6 h-6">
                                    <div
                                      className="h-6 rounded-full"
                                      style={{
                                        backgroundColor:
                                          color === 'red-900'
                                            ? 'rgb(127, 29, 29)'
                                            : 'rgb(99, 102, 241)',
                                      }}
                                    >
                                      <span className="inline-block"></span>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
