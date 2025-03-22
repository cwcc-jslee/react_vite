// src/features/project/components/forms/ProjectTaskForm.jsx
// 프로젝트 작업 정보 수정을 위한 폼 컴포넌트
// 작업 기본 정보 및 상세 옵션을 입력받는 폼을 제공합니다

import React, { useState, useRef } from 'react';
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
import { FiChevronUp, FiChevronDown, FiPlus } from 'react-icons/fi';
import useTaskEditor from '../../hooks/useTaskEditor';
import ProjectUserSelector from './ProjectUserSelector';

/**
 * 프로젝트 작업 수정 폼 컴포넌트
 * 리액트 패턴을 활용하여 DOM 조작 최소화 및 상태 관리 개선
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
    handleSubmit,
  } = useTaskEditor(task);

  // 새 체크리스트 항목을 위한 상태
  const [newChecklistItem, setNewChecklistItem] = useState('');
  // 체크리스트 입력 필드 활성화 상태
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  // 체크리스트 섹션 펼침/접기 상태
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);

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

  // 체크리스트 아이템 삭제 핸들러
  const handleDeleteChecklistItem = (id) => {
    deleteChecklistItem(id);
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
          <ProjectUserSelector
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
            checked={taskFormData.taskScheduleType}
            onChange={handleSwitchChange}
          />
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">우선순위</Label>
          <Select
            name="priorityLevel"
            value={taskFormData?.priorityLevel}
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
            value={taskFormData?.taskProgress}
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
            <Label className="text-left">인원</Label>
            <Input
              type="number"
              name="personnelCount"
              // value={formData.commencementDate}
              // onChange={updateFormField}
              // disabled={!taskFormData.taskScheduleType}
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">투입률</Label>
            <Input
              type="text"
              name="allocationRate"
              // value={formData.commencementDate}
              // onChange={updateFormField}
              // disabled={!taskFormData.taskScheduleType}
              placeholder="0 - 1"
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">작업일</Label>
            <Input
              type="number"
              name="workDays"
              // value={task?.days || ''}
              // onChange={updateFormField}
              // disabled={!taskFormData.taskScheduleType}
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">계획시간</Label>
            <Input
              type="number"
              name="totalPlannedHours"
              // value={formData.commencementDate}
              // onChange={updateFormField}
              disabled={true}
            />
          </FormItem>
        </Group>
      )}
      {/* 작업할당 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 체크 리스트트 */}
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">작업할당</Label>
          {/* 작업 할당 구현 */}
          {(task?.assignedUsers || []).length > 0 ? (
            <div className="flex gap-2 mt-1">
              {task.assignedUsers.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{
                    backgroundColor:
                      color === 'red-900'
                        ? 'rgb(127, 29, 29)'
                        : 'rgb(99, 102, 241)',
                  }}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-1">할당된 작업자가 없습니다</div>
          )}
        </FormItem>
      </Group>

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
                {checklists.map((item) => (
                  <div
                    key={item.id || item.index}
                    className="flex items-center gap-2 py-1 px-1 rounded-md group hover:bg-gray-100 transition-colors"
                  >
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
        <Button onClick={() => onSave(getEditedTask())}>저장</Button>
      </div>
    </>
  );
};

export default ProjectTaskForm;
