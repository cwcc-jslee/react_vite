// src/features/project/components/emements/ProjectTaskForm.jsx
// 프로젝트 작업 정보 수정을 위한 폼 컴포넌트
// 작업 기본 정보 및 상세 옵션을 입력받는 폼을 제공합니다

import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  FormItem,
  Group,
  Stack,
  Label,
  Input,
  Select,
  Button,
  Checkbox,
  TextArea,
  Switch,
} from '../../../../shared/components/ui';
import { FiChevronUp, FiChevronDown, FiPlus, FiUserPlus } from 'react-icons/fi';
import useTaskEditor from '../../hooks/useTaskEditor';
import useModal from '../../../../shared/hooks/useModal';

/**
 * 프로젝트 작업 수정 폼 컴포넌트
 *
 */
const ProjectTaskForm = ({ codebooks, task, onSave, onCancel, usersData }) => {
  const {
    taskFormData,
    checklists,
    assignedUsers,
    errors,
    handleSwitchChange,
    handleInputChange,
    getEditedTask,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    assignUser,
    removeAssignedUser,
    validateTask,
    setTaskFormData,
  } = useTaskEditor(task);

  // 모달 관련 커스텀 훅 사용
  const { modalState, openModal, closeModal } = useModal();

  // 새 체크리스트 항목을 위한 상태
  const [newChecklistItem, setNewChecklistItem] = useState('');
  // 체크리스트 입력 필드 활성화 상태
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  // 체크리스트 섹션 펼침/접기 상태
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);
  // 사용자 선택 팝업 상태
  const [showUserPopup, setShowUserPopup] = useState(false);

  // 사용자 팝업 위치 관련 참조
  const userIconRef = useRef(null);
  // 사용자 검색 입력창 상태
  const [userSearchTerm, setUserSearchTerm] = useState('');
  // 사용자 검색 입력창 참조
  const searchInputRef = useRef(null);

  const isScheduled = taskFormData.taskScheduleType;

  // 체크리스트 입력 핸들러
  const handleNewChecklistItemKeyDown = (e) => {
    if (e.key === 'Enter' && newChecklistItem.trim()) {
      addChecklistItem(newChecklistItem.trim());
      setNewChecklistItem('');
      setIsAddingChecklist(false);
    }
  };

  // 체크리스트 추가 영역 클릭 핸들러
  const handleAddChecklistClick = () => {
    setIsAddingChecklist(true);
  };

  // 체크리스트 아이템 변경 핸들러
  const handleChecklistItemChange = (id, isChecked) => {
    toggleChecklistItem(id);
  };

  // 체크리스트 아이템 삭제 핸들러
  const handleDeleteChecklistItem = (id) => {
    deleteChecklistItem(id);
  };

  // 사용자 선택 팝업 토글
  const toggleUserPopup = () => {
    setShowUserPopup(!showUserPopup);
    // 팝업이 열릴 때 검색어 초기화
    setUserSearchTerm('');

    // 팝업이 열린 후에 검색 입력창에 포커스
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // 문서 클릭 시 팝업 닫기 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 검색 입력창 클릭 시 팝업이 닫히지 않도록 예외 처리
      if (
        searchInputRef.current &&
        searchInputRef.current.contains(event.target)
      ) {
        return;
      }

      if (userIconRef.current && !userIconRef.current.contains(event.target)) {
        setShowUserPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 사용자 검색 처리
  const handleUserSearch = (e) => {
    setUserSearchTerm(e.target.value);
  };

  // 사용자 필터링 함수
  function filterUser(user) {
    // 유효한 사용자 객체인지 확인
    if (!user || !user.id) {
      return false;
    }

    // 이미 할당된 사용자인지 확인
    const isAlreadyAssigned = assignedUsers.some(
      (assigned) => assigned.id === user.id,
    );

    // 이미 할당된 사용자는 제외
    if (isAlreadyAssigned) return false;

    // 검색어가 없으면 모든 할당되지 않은 사용자 포함
    if (!userSearchTerm) return true;

    // 검색어가 있으면 username 필드에서 검색
    const matchesSearch = user.username
      ?.toLowerCase()
      .includes(userSearchTerm.toLowerCase());
    return matchesSearch;
  }

  // 계획 시간 계산 함수
  const calculatePlannedHours = () => {
    const personnelCount = parseInt(taskFormData.personnelCount) || 0;
    const allocationRate = parseFloat(taskFormData.allocationRate) || 0;
    const workDays = parseInt(taskFormData.workDays) || 0;

    // 각 작업일은 8시간으로 가정 (기본 업무 시간)
    const hoursPerDay = 8;

    // 계산: 인원 * 투입률 * 작업일 * 일일 작업 시간
    const totalHours = personnelCount * allocationRate * workDays * hoursPerDay;

    // 반올림하여 정수로 변환
    return Math.round(totalHours);
  };

  // 인원, 투입률, 작업일 변경 시 계획 시간 자동 계산
  useEffect(() => {
    if (isScheduled) {
      const totalPlannedHours = calculatePlannedHours();

      setTaskFormData((prev) => ({
        ...prev,
        totalPlannedHours,
      }));
    }
  }, [
    taskFormData.personnelCount,
    taskFormData.allocationRate,
    taskFormData.workDays,
    isScheduled,
  ]);

  // 폼 유효성 검사 함수
  const validateForm = () => {
    // 기본 유효성 검사 오류
    let validationErrors = [];

    // 작업명 검사
    if (!taskFormData.name || taskFormData.name.trim() === '') {
      validationErrors.push('작업명은 필수입니다.');
    }

    // isScheduled가 true일 때 추가 검사
    if (isScheduled) {
      // 계획 시작일, 계획 종료일 검사
      if (!taskFormData.planStartDate) {
        validationErrors.push('계획 시작일은 필수입니다.');
      }

      if (!taskFormData.planEndDate) {
        validationErrors.push('계획 종료일은 필수입니다.');
      }

      // 날짜 순서 검사
      if (taskFormData.planStartDate && taskFormData.planEndDate) {
        const startDate = new Date(taskFormData.planStartDate);
        const endDate = new Date(taskFormData.planEndDate);

        if (startDate > endDate) {
          validationErrors.push(
            '계획 종료일은 계획 시작일보다 이후여야 합니다.',
          );
        }
      }

      // 인원 검사 (1~10 사이의 정수)
      const personnelCount = parseInt(taskFormData.personnelCount);
      if (isNaN(personnelCount) || personnelCount < 1 || personnelCount > 10) {
        validationErrors.push('인원은 1에서 10 사이의 정수여야 합니다.');
      }

      // 투입률 검사 (0~1 사이의 소수, 소수점 첫째 자리까지)
      const allocationRate = parseFloat(taskFormData.allocationRate);
      if (isNaN(allocationRate) || allocationRate <= 0 || allocationRate > 1) {
        validationErrors.push('투입률은 0보다 크고 1 이하의 값이어야 합니다.');
      } else {
        // 소수점 첫째 자리까지만 허용
        const decimalPlaces = (allocationRate.toString().split('.')[1] || '')
          .length;
        if (decimalPlaces > 1) {
          validationErrors.push(
            '투입률은 소수점 첫째 자리까지만 입력 가능합니다.',
          );
        }
      }

      // 작업일 검사 (0~30 사이의 정수)
      const workDays = parseInt(taskFormData.workDays);
      if (isNaN(workDays) || workDays < 1 || workDays > 30) {
        validationErrors.push('작업일은 1에서 30 사이의 정수여야 합니다.');
      }
    }

    return validationErrors;
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    // 폼 유효성 검사
    const errors = validateForm();

    if (errors.length > 0) {
      // 유효성 검사 실패 시 모달로 오류 메시지 표시
      openModal(
        'error',
        '입력 오류',
        <div>
          <p className="mb-2">다음 오류를 확인해주세요:</p>
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index} className="text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>,
      );
      return;
    }

    // 유효성 검사 통과 시 저장 처리
    const editedTask = getEditedTask();

    // 작업 일정 활성화 상태에 따라 계획 시간 포함
    if (isScheduled) {
      editedTask.totalPlannedHours = calculatePlannedHours();
    }

    // 저장 콜백 호출
    onSave(editedTask);
  };

  // 검색어로 필터링된 사용자 목록 - 배열 순회 방식으로 명시적 구현
  let filteredUsers = [];

  // usersData 구조 확인 후 적절한 처리
  if (usersData) {
    // 데이터가 배열인 경우
    if (Array.isArray(usersData)) {
      filteredUsers = usersData.filter(filterUser);
    }
    // 데이터가 { data: [...] } 형태인 경우
    else if (usersData.data && Array.isArray(usersData.data)) {
      filteredUsers = usersData.data.filter(filterUser);
    }
  }

  return (
    <>
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 작업명 */}
        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            작업명
          </Label>
          <Input
            type="text"
            name="name"
            onChange={handleInputChange}
            value={taskFormData?.name || ''}
          />
        </FormItem>
      </Group>

      {/* 작업할당 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        <FormItem direction="vertical" className="flex-1">
          <div className="flex items-center">
            <button
              type="button"
              ref={userIconRef}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-md"
              onClick={toggleUserPopup}
            >
              <FiUserPlus size={20} />
              <span>작업 할당</span>
            </button>

            {/* 할당된 사용자 표시 */}
            <div className="flex gap-2 ml-4">
              {assignedUsers.map((user, index) => (
                <div
                  key={user.id || index}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-indigo-600 relative group"
                >
                  {user.username?.substring(0, 1) || index + 1}
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAssignedUser(user.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* 사용자 선택 팝업 */}
            {showUserPopup && (
              <div
                className="absolute z-50 bg-white border border-gray-200 shadow-lg rounded-md w-64 max-h-96 overflow-y-auto"
                style={{
                  top: '50px',
                  left: '10px',
                }}
              >
                <div className="p-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="사용자 검색하기"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                    value={userSearchTerm}
                    onChange={handleUserSearch}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="border-t border-gray-200">
                  <div className="p-2 text-xs text-gray-600 font-medium">
                    할당됨
                  </div>
                  <ul>
                    {assignedUsers.map((user) => (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAssignedUser(user.id);
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                    {assignedUsers.length === 0 && (
                      <li className="px-3 py-2 text-gray-500 text-sm">
                        할당된 사용자가 없습니다
                      </li>
                    )}
                  </ul>
                </div>

                <div className="border-t border-gray-200">
                  <div className="p-2 text-xs text-gray-600 font-medium">
                    할당되지 않음
                  </div>
                  <ul>
                    {filteredUsers.map((user) => (
                      <li
                        key={`unassigned-${user.id}`}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        style={{
                          backgroundColor: '#f9fafb',
                          marginBottom: '2px',
                        }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            assignUser(user);
                          }}
                        >
                          추가
                        </button>
                      </li>
                    ))}
                    {filteredUsers.length === 0 && (
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
        </FormItem>
      </Group>

      {/* 작업일정, 우선순위, 진행상태 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 작업일정 구분 */}
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">작업일정 구분</Label>
          <Switch
            checked={taskFormData.taskScheduleType}
            onChange={handleSwitchChange}
          />
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">우선순위</Label>
          <Select
            name="priorityLevel"
            value={taskFormData?.priorityLevel?.id}
            onChange={handleInputChange}
          >
            <option value="">선택하세요</option>
            {codebooks?.priority_level?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">진행상태</Label>
          <Select
            name="taskProgress"
            value={taskFormData?.taskProgress?.id}
            onChange={handleInputChange}
          >
            <option value="">선택하세요</option>
            {codebooks?.task_progress?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormItem>
      </Group>

      {/*  작업일정 - 계획일정 활성화시시 */}
      {isScheduled && (
        <Group direction="horizontal" spacing="lg" className="mb-6">
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              계획 시작일
            </Label>
            <Input
              type="date"
              name="planStartDate"
              value={taskFormData?.planStartDate || ''}
              onChange={handleInputChange}
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              계획 종료일
            </Label>
            <Input
              type="date"
              name="planEndDate"
              value={taskFormData?.planEndDate || ''}
              onChange={handleInputChange}
            />
          </FormItem>
          {/* 작업기간은 시작일&종료일로 계산 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">기간</Label>
            <Input
              type="text"
              name="dueDate"
              value={task?.days ? `${task.days}일` : ''}
              disabled={true}
            />
          </FormItem>
        </Group>
      )}
      {isScheduled && (
        <Group direction="horizontal" spacing="lg" className="mb-6">
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              인원
            </Label>
            <Input
              type="number"
              name="personnelCount"
              value={taskFormData?.personnelCount || ''}
              onChange={handleInputChange}
              min="1"
              max="10"
              placeholder="1-10 사이의 정수"
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              투입률
            </Label>
            <Input
              type="text"
              name="allocationRate"
              value={taskFormData?.allocationRate || ''}
              onChange={handleInputChange}
              placeholder="0.1-1.0 사이의 값"
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              작업일
            </Label>
            <Input
              type="number"
              name="workDays"
              value={taskFormData?.workDays || ''}
              onChange={handleInputChange}
              min="1"
              max="30"
              placeholder="1-30 사이의 정수"
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">계획시간</Label>
            <Input
              type="text"
              name="totalPlannedHours"
              value={taskFormData?.totalPlannedHours || ''}
              disabled={true}
              placeholder="자동계산"
              suffix="시간"
            />
          </FormItem>
        </Group>
      )}

      {/* 체크리스트 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        <FormItem direction="vertical" className="flex-1">
          <div className="flex justify-between items-center">
            <Label className="text-left">체크리스트</Label>
            {checklists.length > 0 && (
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
              >
                {isChecklistExpanded ? (
                  <FiChevronUp size={18} />
                ) : (
                  <FiChevronDown size={18} />
                )}
              </button>
            )}
          </div>

          {isChecklistExpanded && (
            <div className="mt-1">
              <div className="mb-2">
                {checklists.map((item, index) => (
                  <div
                    key={item.id || item.index}
                    className="flex items-center gap-2 py-1 px-1 rounded-md group hover:bg-gray-100 transition-colors"
                  >
                    <Checkbox
                      id={`checklist-item-${item.id || item.index}`}
                      checked={item.isCompleted}
                      onChange={(e) =>
                        handleChecklistItemChange(
                          item.id || item.index,
                          e.target.checked,
                        )
                      }
                    />
                    <label
                      htmlFor={`checklist-item-${item.id || item.index}`}
                      className="text-sm flex-1"
                    >
                      {item.description}
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        handleDeleteChecklistItem(item.id || item.index)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* 체크리스트 추가 영역 */}
              {isAddingChecklist ? (
                // 활성화된 입력 필드
                <div className="flex items-center gap-2 py-1">
                  <Checkbox id="new-checklist-item" disabled />
                  <Input
                    placeholder="체크리스트 항목을 입력하세요"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={handleNewChecklistItemKeyDown}
                  />
                </div>
              ) : (
                // 체크리스트 추가 버튼
                <button
                  type="button"
                  className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 py-1 rounded-md"
                  onClick={handleAddChecklistClick}
                >
                  <FiPlus size={16} />
                  <span>항목 추가</span>
                </button>
              )}
            </div>
          )}
        </FormItem>
      </Group>

      {/* 설명 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">설명</Label>
          <TextArea
            name="description"
            rows={2}
            value={taskFormData?.description || ''}
            onChange={handleInputChange}
            placeholder="작업에 대한 상세 설명을 입력하세요"
          />
        </FormItem>
      </Group>

      {/* 직접 버튼 추가 */}
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onCancel} variant="outline">
          취소
        </Button>
        <Button onClick={handleSave}>저장</Button>
      </div>
    </>
  );
};

export default ProjectTaskForm;
