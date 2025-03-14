// src/features/project/components/composes/ProjectAddSection.jsx
import React, { useEffect, useRef } from 'react';
import {
  FiPlus,
  FiSquare,
  FiCheckSquare,
  FiCalendar,
  FiUserPlus,
} from 'react-icons/fi';
import useProjectTask from '../../hooks/useProjectTask';

// 인라인 편집 필드 컴포넌트
const InlineEditField = ({
  isEditing,
  value,
  onChange,
  onSave,
  onCancel,
  type = 'text',
  className = '',
  editClassName = 'bg-white border border-indigo-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500',
  displayClassName = 'cursor-pointer hover:text-indigo-700',
  renderDisplay,
  inputProps = {},
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={handleKeyDown}
        className={`${className} ${editClassName}`}
        {...inputProps}
      />
    );
  }

  return renderDisplay ? (
    renderDisplay()
  ) : (
    <div className={`${className} ${displayClassName}`}>{value}</div>
  );
};

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

  // 해당 필드가 현재 편집 중인지 확인
  const isEditingField = (field) => {
    return (
      editState.isEditing &&
      editState.columnIndex === columnIndex &&
      editState.taskIndex === taskIndex &&
      editState.field === field
    );
  };

  return (
    <div className="w-full mb-2">
      <div className="max-w-full rounded-sm border-0 shadow-sm bg-white">
        <div className="flex-col justify-between pr-3 flex">
          <div className="text-ellipsis flex items-center overflow-hidden">
            {/* 체크박스 */}
            <span className="basis-10 h-10 flex items-center justify-center text-black">
              <button
                className="cursor-pointer justify-center flex w-8 h-8"
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

            {/* 제목 */}
            <InlineEditField
              isEditing={isEditingField('title')}
              value={isEditingField('title') ? editState.value : title}
              onChange={handleEditChange}
              onSave={saveEdit}
              onCancel={cancelEdit}
              className="inline-block overflow-hidden h-10 flex items-center"
              renderDisplay={() => (
                <div
                  className="inline-block overflow-hidden h-10 flex items-center cursor-pointer hover:text-indigo-700"
                  onClick={() =>
                    startEditing(columnIndex, taskIndex, 'title', title)
                  }
                >
                  {title}
                </div>
              )}
            />
          </div>

          {/* 일수 */}
          <div className="pl-8 text-ellipsis flex min-h-6 overflow-hidden text-xs text-zinc-600">
            <InlineEditField
              isEditing={isEditingField('days')}
              value={isEditingField('days') ? editState.value : days || ''}
              onChange={handleEditChange}
              onSave={saveEdit}
              onCancel={cancelEdit}
              type="number"
              className="pt-1 align-middle inline-block overflow-hidden m-1"
              inputProps={{ min: '0' }}
              renderDisplay={() => (
                <div
                  className="pt-1 align-middle inline-block overflow-hidden m-1 cursor-pointer hover:text-indigo-700"
                  onClick={() =>
                    startEditing(columnIndex, taskIndex, 'days', days || '')
                  }
                >
                  {days ? `${days}일` : '일수 추가'}
                </div>
              )}
            />
          </div>
        </div>

        {(dueDate || assignedUsers.length > 0) && (
          <>
            <div className="bg-gray-200 h-px mx-3 my-1" />
            <div className="justify-between flex h-9 mt-1">
              {/* 날짜 */}
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
                      <InlineEditField
                        isEditing={isEditingField('dueDate')}
                        value={
                          isEditingField('dueDate') ? editState.value : dueDate
                        }
                        onChange={handleEditChange}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        className="text-xs pl-1 pr-2"
                        renderDisplay={() => (
                          <span
                            className="text-xs pl-1 pr-2 cursor-pointer"
                            onClick={() =>
                              startEditing(
                                columnIndex,
                                taskIndex,
                                'dueDate',
                                dueDate,
                              )
                            }
                          >
                            {dueDate}
                          </span>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 사용자 */}
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

// 칸반 컬럼 컴포넌트
const KanbanColumn = ({
  column,
  columnIndex,
  startEditingColumnTitle,
  editState,
  handleEditChange,
  saveEdit,
  cancelEdit,
  onAddTask,
  startEditing,
  toggleTaskCompletion,
}) => {
  const isEditingTitle =
    editState.isEditing &&
    editState.columnIndex === columnIndex &&
    editState.field === 'columnTitle';

  // 작업 추가 버튼 클릭 핸들러
  const handleAddTaskClick = () => {
    const newTask = {
      title: '새 작업',
      days: '',
      dueDate: '',
    };

    onAddTask(columnIndex, newTask);
  };

  return (
    <div className="flex-shrink-0 w-72 h-full flex flex-col">
      <div className="flex flex-col h-full border-0 rounded-md bg-gray-50 shadow-sm mx-2">
        <div className="p-3 border-b">
          {/* 컬럼 제목 */}
          <InlineEditField
            isEditing={isEditingTitle}
            value={isEditingTitle ? editState.value : column.title}
            onChange={handleEditChange}
            onSave={saveEdit}
            onCancel={cancelEdit}
            className="font-semibold text-zinc-800 mb-3 pl-1 w-full"
            renderDisplay={() => (
              <h2
                className="font-semibold text-zinc-800 mb-3 pl-1 cursor-pointer hover:text-indigo-700"
                onClick={() => startEditingColumnTitle(columnIndex)}
              >
                {column.title}
              </h2>
            )}
          />

          {/* 작업 추가 버튼 */}
          <button
            className="w-full h-10 flex items-center justify-center text-indigo-600 border-2 border-indigo-600 rounded-sm"
            onClick={handleAddTaskClick}
          >
            <FiPlus className="mr-2" size={18} />
            <span>작업 추가</span>
          </button>
        </div>

        {/* 작업 카드 목록 */}
        <div className="flex-grow overflow-y-auto p-3">
          {column.tasks.map((task, taskIndex) => (
            <TaskCard
              key={taskIndex}
              task={task}
              columnIndex={columnIndex}
              taskIndex={taskIndex}
              startEditing={startEditing}
              editState={editState}
              handleEditChange={handleEditChange}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              toggleTaskCompletion={toggleTaskCompletion}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 초기 칸반 데이터
const initialColumns = [
  {
    title: '프로젝트 관리',
    tasks: [
      {
        title: '행정 업무',
        days: '65',
        dueDate: '05.30.',
        isDueDateRed: false,
        pjt_progress: '100',
      },
      { title: '내부 조율', days: '1', dueDate: '03.07.', isDueDateRed: true },
      { title: '미팅 및 보고' },
      { title: '품질 관리' },
    ],
  },
  {
    title: '기획 단계',
    tasks: [
      {
        title: '프로젝트 준비',
        days: '5',
        dueDate: '03.07.',
        isDueDateRed: true,
        assignedUsers: ['red-900', 'indigo-500'],
      },
      {
        title: '사이트 기획',
        days: '5',
        dueDate: '03.14.',
        isDueDateRed: false,
        pjt_progress: '100',
      },
    ],
  },
  {
    title: '디자인 단계',
    tasks: [
      {
        title: '디자인 시안',
        days: '5',
        dueDate: '03.21.',
        isDueDateRed: false,
      },
      {
        title: '그레픽 제작',
        days: '5',
        dueDate: '03.21.',
        isDueDateRed: false,
        pjt_progress: '100',
      },
      { title: '디자인 확정' },
    ],
  },
  {
    title: '퍼블리싱',
    tasks: [
      { title: '퍼블리싱' },
      { title: '그누보드 구현' },
      { title: '테스트 및 최적화' },
    ],
  },
];

const ProjectAddSection = () => {
  // 커스텀 훅 사용
  const {
    columns,
    editState,
    startEditing,
    startEditingColumnTitle,
    handleEditChange,
    saveEdit,
    cancelEdit,
    addTask,
    addColumn,
    toggleTaskCompletion,
  } = useProjectTask(initialColumns);

  // 새 버킷(컬럼) 추가 핸들러
  const handleAddColumnClick = () => {
    const newColumn = {
      title: '새 버킷',
      tasks: [],
    };

    addColumn(newColumn);
  };

  return (
    <div className="w-full h-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            .kanban-container {
              overflow-x: auto !important;
            }
          }
        `,
        }}
      />

      <div
        className="kanban-container flex h-full"
        style={{ minHeight: '600px' }}
      >
        {columns.map((column, index) => (
          <KanbanColumn
            key={index}
            column={column}
            columnIndex={index}
            startEditingColumnTitle={startEditingColumnTitle}
            editState={editState}
            handleEditChange={handleEditChange}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            onAddTask={addTask}
            startEditing={startEditing}
            toggleTaskCompletion={toggleTaskCompletion}
          />
        ))}

        <div className="flex-shrink-0 w-72 h-full flex items-start p-2">
          <button
            className="w-full h-10 bg-indigo-600 text-white border-2 border-indigo-600 rounded-sm flex items-center justify-center"
            onClick={handleAddColumnClick}
          >
            <FiPlus className="mr-2" size={18} />
            <span>버킷 추가</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAddSection;
