// src/features/project/components/ui/TaskCard.jsx
import React from 'react';
// react-icons 라이브러리에서 필요한 아이콘 import
import { FiSquare, FiCheckSquare } from 'react-icons/fi'; // 체크박스 아이콘
import { FiCalendar } from 'react-icons/fi'; // 캘린더 아이콘
import { FiUserPlus } from 'react-icons/fi'; // 사용자 추가 아이콘

/**
 * TaskCard 컴포넌트
 * 프로젝트 작업을 표시하는 카드 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.title - 작업 제목
 * @param {string} [props.days] - 작업 소요 일수
 * @param {string} [props.dueDate] - 마감일
 * @param {boolean} [props.isDueDateRed] - 마감일 표시 강조 여부
 * @param {Array} [props.assignedUsers=[]] - 할당된 사용자 배열
 * @param {string} [props.pjt_progress] - 프로젝트 진행도 (100인 경우 완료 표시)
 * @param {Function} [props.onClick] - 카드 클릭 핸들러
 * @param {string} [props.className] - 추가 클래스명
 */
const TaskCard = ({
  title,
  days,
  dueDate,
  isDueDateRed,
  assignedUsers = [],
  pjt_progress,
  onClick,
  className = '',
}) => {
  // 프로젝트 진행도가 100인 경우 체크박스 체크
  const isCompleted = pjt_progress === '100';

  return (
    <div className={`w-full mb-2 ${className}`} onClick={onClick}>
      <div className="max-w-full rounded-sm border-0 shadow-sm bg-white">
        <div className="flex-col justify-between pr-3 flex">
          <div className="text-ellipsis flex items-center overflow-hidden">
            {/* 체크박스 - react-icons 사용 */}
            <span className="basis-10 h-10 flex items-center justify-center text-black">
              <button className="cursor-pointer justify-center flex w-8 h-8">
                <span className="text-zinc-600 self-center flex items-center">
                  {isCompleted ? (
                    <FiCheckSquare
                      size={20}
                      className="text-indigo-600"
                      style={{
                        fill: '#4F46E5',
                        stroke: 'white',
                        strokeWidth: 1.5,
                      }}
                    />
                  ) : (
                    <FiSquare size={20} className="text-zinc-600" />
                  )}
                </span>
              </button>
            </span>
            {/* title 수직 중앙 정렬 */}
            <div className="inline-block overflow-hidden h-10 flex items-center">
              {title}
            </div>
          </div>

          {days && (
            <div className="pl-8 text-ellipsis flex min-h-6 overflow-hidden text-xs text-zinc-600">
              <div className="pt-1 align-middle inline-block overflow-hidden m-1">
                {days}일
              </div>
            </div>
          )}
        </div>

        {(dueDate || assignedUsers.length > 0) && (
          <>
            <div className="bg-gray-200 h-px mx-3 my-1" />
            <div className="justify-between flex h-9 mt-1">
              {dueDate && (
                <div className="pl-2 flex">
                  <div className="flex">
                    <div
                      className={`${
                        isDueDateRed
                          ? 'bg-red-600 text-white'
                          : 'text-indigo-600'
                      } items-center cursor-pointer flex-grow inline-flex h-6 rounded-sm`}
                    >
                      <span className="items-center justify-center px-1 flex m-1">
                        <FiCalendar size={16} />
                      </span>
                      <span className="text-xs pl-1 pr-2">{dueDate}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="items-baseline pr-3 flex">
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
