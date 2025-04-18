// src/features/project/components/forms/ProjectTaskForm.jsx
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
import {
  FiChevronUp,
  FiChevronDown,
  FiPlus,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import useTaskFormEditor from '../../hooks/useTaskFormEditor';
// import ProjectUserSelector from './ProjectUserSelector';
import UserSelectorForm from './UserSelectorForm';
import { notification } from '../../../../shared/services/notification';

/**
 * 프로젝트 작업 수정 폼 컴포넌트
 * 리액트 패턴을 활용하여 DOM 조작 최소화 및 상태 관리 개선
 */
const ProjectTaskForm = ({ codebooks, task, onSave, onCancel, usersData }) => {
  const {
    // 작업 데이터 관련
    taskFormData,
    setTaskFormData,
    handleInputChange,
    handleSwitchChange,

    // 체크리스트 관련
    checklists,
    isChecklistExpanded,
    isAddingChecklist,
    editingChecklistId,
    editingChecklistText,
    setEditingChecklistText,
    getChecklistStats,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    startChecklistItemEdit,
    saveChecklistItemEdit,
    cancelChecklistItemEdit,
    toggleChecklistExpanded,
    setChecklistAddingMode,

    // 사용자 할당 관련
    assignedUsers,
    assignUser,
    removeAssignedUser,

    // 기타
    errors,
    getEditedTask,
  } = useTaskFormEditor(task);

  // 새 체크리스트 항목을 위한 상태
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const isScheduled = taskFormData.taskScheduleType === 'scheduled';

  // 체크리스트 통계
  const checklistStats = getChecklistStats();

  console.log(`==== task ==== : `, task);

  // 체크리스트 입력 핸들러
  const handleNewChecklistItemKeyDown = (e) => {
    if (e.key === 'Enter' && newChecklistItem.trim()) {
      addChecklistItem(newChecklistItem.trim());
      setNewChecklistItem('');
      setChecklistAddingMode(false);
    } else if (e.key === 'Escape') {
      setNewChecklistItem('');
      setChecklistAddingMode(false);
    }
  };

  // 체크리스트 추가 영역 클릭 핸들러
  const handleAddChecklistClick = () => {
    setChecklistAddingMode(true);
  };

  // 체크리스트 수정 키 입력 핸들러
  const handleEditChecklistKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveChecklistItemEdit();
    } else if (e.key === 'Escape') {
      cancelChecklistItemEdit();
    }
  };

  // 계획 시간 계산 함수
  const calculatePlannedHours = () => {
    const personnelCount =
      parseInt(taskFormData.planningTimeData.personnelCount) || 0;
    const allocationRate =
      parseFloat(taskFormData.planningTimeData.allocationRate) || 0;
    const workDays = parseInt(taskFormData.planningTimeData.workDays) || 0;

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
      const calculationDate = new Date().toISOString().split('T')[0]; // 현재 날짜를 YYYY-MM-DD 형식으로

      setTaskFormData((prev) => ({
        ...prev,
        planningTimeData: {
          ...(prev.planningTimeData || {}),
          totalPlannedHours,
          calculationDate,
        },
      }));
    }
  }, [
    taskFormData.planningTimeData?.personnelCount,
    taskFormData.planningTimeData?.allocationRate,
    taskFormData.planningTimeData?.workDays,
    isScheduled,
  ]);

  // 폼 유효성 검사 함수
  const validateForm = () => {
    // 기본 유효성 검사 오류
    let validationErrors = [];

    console.log(`=== 폼 유효성 검사 시작 ===`);

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
      const personnelCount = parseInt(
        taskFormData.planningTimeData.personnelCount,
      );
      if (isNaN(personnelCount) || personnelCount < 1 || personnelCount > 10) {
        validationErrors.push('인원은 1에서 10 사이의 정수여야 합니다.');
      }

      // 투입률 검사 (0~1 사이의 소수, 소수점 첫째 자리까지)
      const allocationRate = parseFloat(
        taskFormData.planningTimeData.allocationRate,
      );
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
      const workDays = parseInt(taskFormData.planningTimeData.workDays);
      if (isNaN(workDays) || workDays < 1 || workDays > 30) {
        console.log('>>> workDay : ', workDays);
        validationErrors.push('작업일은 1에서 30 사이의 정수여야 합니다.');
      }
    }

    console.log(`=== 폼 유효성 검사 종료 ===`, validationErrors);
    return validationErrors;
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    // 폼 유효성 검사
    const errors = validateForm();

    if (errors.length > 0) {
      const firstError = Object.values(errors)[0];
      notification.error({
        message: '유효성 검증 오류 : Task',
        description: firstError,
      });

      return;
    }

    // 유효성 검사 통과 시 저장 처리
    const editedTask = getEditedTask();
    console.log(`>>>>>>> editedTask : `, editedTask);

    // 저장 콜백 호출
    onSave(editedTask);
  };

  return (
    <>
      <Group direction="horizontal" spacing="lg" className="mb-2">
        {/* 작업명 */}
        <FormItem direction="vertical" className="flex-1">
          <Input
            type="text"
            name="name"
            onChange={handleInputChange}
            value={taskFormData?.name}
          />
        </FormItem>
      </Group>

      {/* 작업할당 - 개선된 컴포넌트 사용 */}
      <Group direction="horizontal" spacing="lg" className="mb-3">
        <FormItem direction="vertical" className="flex-1">
          <UserSelectorForm
            usersData={usersData}
            assignedUsers={assignedUsers}
            onAssignUser={assignUser}
            onRemoveUser={removeAssignedUser}
          />
        </FormItem>
      </Group>

      {/* 작업일정, 우선순위, 진행상태 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 작업일정 구분 */}
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">작업일정 구분</Label>
          <Switch
            // checked={taskFormData.taskScheduleType}
            // onChange={handleSwitchChange}
            checked={taskFormData.taskScheduleType === 'scheduled'}
            onChange={handleSwitchChange}
            // onChange={() => {
            //   updateField(
            //     'taskScheduleType',
            //     taskFormData.taskScheduleType === 'scheduled'
            //       ? 'ongoing'
            //       : 'scheduled',
            //   );
            // }}
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
            {codebooks?.priorityLevel?.map((item) => (
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
            {codebooks?.taskProgress?.map((item) => (
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
              value={taskFormData?.planStartDate}
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
              // name="dueDate"
              value={task?.days ? `${task.days}일` : ''}
              disabled={true}
            />
          </FormItem>
        </Group>
      )}

      {isScheduled && (
        <Group direction="horizontal" spacing="lg" className="mb-6">
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">인원</Label>
            <Input
              type="text"
              name="planningTimeData.personnelCount"
              value={taskFormData?.planningTimeData?.personnelCount || ''}
              onChange={handleInputChange}
              // disabled={!taskFormData.taskScheduleType}
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">투입률</Label>
            <Input
              type="text"
              name="planningTimeData.allocationRate"
              value={taskFormData?.planningTimeData?.allocationRate || ''}
              onChange={handleInputChange}
              // disabled={!taskFormData.taskScheduleType}
              // placeholder="0.1-1.0"
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">작업일</Label>
            <Input
              type="text"
              name="planningTimeData.workDays"
              value={taskFormData?.planningTimeData?.workDays}
              onChange={handleInputChange}
              // disabled={!taskFormData.taskScheduleType}
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">계획시간</Label>
            <Input
              type="text"
              name="totalPlannedHours"
              value={taskFormData?.planningTimeData?.totalPlannedHours || ''}
              disabled={true}
            />
          </FormItem>
        </Group>
      )}

      {/* 체크리스트 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        <FormItem direction="vertical" className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Label className="text-left mr-2">체크리스트</Label>
              {/* 체크리스트 완료 수량 표시 */}
              {checklists.length > 0 && (
                <span className="text-sm text-gray-500">
                  {checklistStats.completed}/{checklistStats.total}
                </span>
              )}
            </div>
            {checklists.length > 0 && (
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={toggleChecklistExpanded}
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
                {checklists.map((item) => (
                  <div
                    key={item.id || item.index}
                    className="flex items-center gap-2 py-1 px-1 rounded-md group hover:bg-gray-100 transition-colors"
                  >
                    {/* 체크리스트 수정 모드 */}
                    {editingChecklistId === (item.id || item.index) ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          id={`checklist-item-${item.id || item.index}`}
                          checked={item.isCompleted}
                          onChange={(e) =>
                            toggleChecklistItem(
                              item.id || item.index,
                              e.target.checked,
                            )
                          }
                        />
                        <Input
                          value={editingChecklistText}
                          onChange={(e) =>
                            setEditingChecklistText(e.target.value)
                          }
                          onKeyDown={handleEditChecklistKeyDown}
                          onBlur={saveChecklistItemEdit}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        {/* 체크박스만 클릭 가능하도록 수정 */}
                        <Checkbox
                          id={`checklist-item-${item.id || item.index}`}
                          checked={item.isCompleted}
                          onChange={(e) =>
                            toggleChecklistItem(
                              item.id || item.index,
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          htmlFor={`checklist-item-${item.id || item.index}`}
                          className="text-sm flex-1 cursor-default"
                        >
                          {item.description}
                        </label>
                        {/* 수정, 삭제 버튼 - 호버 시에만 표시 */}
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-blue-500 mr-2"
                            onClick={() => startChecklistItemEdit(item)}
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() =>
                              deleteChecklistItem(item.id || item.index)
                            }
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* 체크리스트 추가 영역 */}
              {isAddingChecklist ? (
                <div className="flex items-center gap-2 py-1">
                  <Checkbox id="new-checklist-item" disabled />
                  <Input
                    placeholder="체크리스트 항목을 입력하세요"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={handleNewChecklistItemKeyDown}
                    autoFocus // 자동 포커스 추가
                  />
                </div>
              ) : (
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
        <Button onClick={handleSave}>수정</Button>
      </div>
    </>
  );
};

export default ProjectTaskForm;
