// TaskCard 컴포넌트 수정 - 메뉴 추가
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FiSquare,
  FiCheckSquare,
  FiCalendar,
  FiUserPlus,
  FiMoreVertical,
  FiTrash2,
} from 'react-icons/fi';
import { ko } from 'date-fns/locale';

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
  deleteTask, // 작업 삭제 함수 추가
}) => {
  const {
    title,
    days,
    dueDate,
    isDueDateRed,
    assignedUsers = [],
    pjt_progress,
  } = task;
  const isCompleted = pjt_progress === '100';
  const [selectedDate, setSelectedDate] = useState(null);

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

  // 날짜 변경 핸들러
  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = date
      ? `${String(date.getMonth() + 1).padStart(2, '0')}.${String(
          date.getDate(),
        ).padStart(2, '0')}.`
      : '';
    handleEditChange(formattedDate);
    saveEdit();
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
              {/* 날짜 - 이벤트 전파 중지 */}
              {dueDate && (
                <div className="pl-2 flex" onClick={(e) => e.stopPropagation()}>
                  <div className="flex">
                    <div
                      className={`${
                        isDueDateRed
                          ? 'bg-red-600 text-white'
                          : 'text-indigo-600'
                      } items-center cursor-pointer flex-grow inline-flex h-6 rounded-sm`}
                    >
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="MM.dd."
                        locale={ko}
                        customInput={
                          <div className="flex items-center cursor-pointer">
                            <span className="items-center justify-center px-1 flex m-1">
                              <FiCalendar size={16} />
                            </span>
                            <span className="text-xs pl-1 pr-2">{dueDate}</span>
                          </div>
                        }
                        popperClassName="react-datepicker-popper z-50"
                        className="react-datepicker-input"
                        popperPlacement="auto"
                        usePopper={true}
                        popperModifiers={[
                          {
                            name: 'preventOverflow',
                            options: {
                              boundary: 'viewport',
                              padding: 8,
                            },
                          },
                          {
                            name: 'offset',
                            options: {
                              offset: [0, 8],
                            },
                          },
                          {
                            name: 'computeStyles',
                            options: {
                              gpuAcceleration: false,
                              adaptive: false,
                            },
                          },
                        ]}
                        container={document.body}
                      />
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
