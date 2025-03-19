// src/features/project/components/forms/ProjectTaskForm.jsx
/**
 * 프로젝트 작업 정보 수정을 위한 폼 컴포넌트
 * 작업 기본 정보 및 상세 옵션을 입력받는 폼을 제공
 */

import React, { useState } from 'react';
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

/**
 * 프로젝트 작업 수정 폼 컴포넌트
 *
 */
const ProjectTaskForm = ({ codebooks, task, onSave }) => {
  // 작입일정 구분
  const [isScheduled, setIsScheduled] = useState(true);
  // 새 체크리스트 항목을 위한 상태
  const [newChecklistItem, setNewChecklistItem] = useState('');
  // 체크리스트 입력 필드 활성화 상태
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  // 체크리스트 섹션 펼침/접기 상태
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);

  // 체크리스트 예시 데이터 (실제 구현 시 task에서 가져옴)
  const sampleChecklists = task?.projectTaskChecklists || [
    { id: 1, description: '요구사항 분석', isCompleted: true },
    // { id: 2, description: '디자인 검토', isCompleted: true },
  ];

  // 체크리스트 완료/미완료 필터링
  const completedChecklists = sampleChecklists.filter(
    (item) => item.isCompleted,
  );
  const pendingChecklists = sampleChecklists.filter(
    (item) => !item.isCompleted,
  );

  // 새 체크리스트 항목 추가 핸들러
  const handleNewChecklistItemKeyDown = (e) => {
    if (e.key === 'Enter' && newChecklistItem.trim()) {
      // 실제 구현에서는 여기에 새 체크리스트 항목 추가 로직 구현
      console.log(`새 체크리스트 항목 추가: ${newChecklistItem}`);
      setNewChecklistItem('');
      // 입력 후에도 입력 필드 활성화 상태 유지
    } else if (e.key === 'Escape') {
      // ESC 키 누르면 입력 취소
      setNewChecklistItem('');
      setIsAddingChecklist(false);
    }
  };

  // 체크리스트 추가 영역 클릭 핸들러
  const handleAddChecklistClick = () => {
    setIsAddingChecklist(true);
  };

  return (
    <>
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 작업명 */}
        <FormItem direction="vertical" className="flex-1">
          <Input
            type="text"
            name="name"
            // onChange={updateFormField}
            value={task?.name}
            // disabled={isSubmitting}
          />
        </FormItem>
      </Group>

      {/* 작업일정, 우선순위, 진행상태 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 작업일정 구분 */}
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">작업일정 구분</Label>
          <Switch
            checked={isScheduled}
            onChange={() => setIsScheduled(!isScheduled)}
            // disabled={isSubmitting}
          />
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">우선순위</Label>
          <Select
            name="priorityLevel"
            // value={formData.employee}
            // onChange={updateFormField}
            // disabled={isSubmitting}
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
            // value={formData.employee}
            // onChange={updateFormField}
            // disabled={isSubmitting}
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
              // value={formData.commencementDate}
              // onChange={updateFormField}
              // disabled={isSubmitting}
            />
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              계획 종료일
            </Label>
            <Input
              type="date"
              name="commencementDate"
              // value={formData.commencementDate}
              // onChange={updateFormField}
              // disabled={isSubmitting}
            />
          </FormItem>
          {/* 작업기간은 시작일&종료일로 계산 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">기간</Label>
            <Input
              type="text"
              name="dueDate"
              // onChange={updateFormField}
              value={task?.days ? `${task.days}일` : ''}
              disabled={true}
            />
          </FormItem>
        </Group>
      )}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">인원</Label>
          <Input
            type="number"
            name="personnelCount"
            // value={formData.commencementDate}
            // onChange={updateFormField}
            // disabled={isSubmitting}
          />
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">투입률</Label>
          <Input
            type="text"
            name="allocationRate"
            // value={formData.commencementDate}
            // onChange={updateFormField}
            // disabled={isSubmitting}
            placeholder="0 - 1"
          />
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">작업일</Label>
          <Input
            type="number"
            name="workDays"
            value={task?.days || ''}
            // onChange={updateFormField}
            // disabled={isSubmitting}
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
            {sampleChecklists.length > 0 && (
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
                {sampleChecklists.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={`checklist-item-${item.id}`}
                      checked={item.isCompleted}
                      onChange={(e) =>
                        handleChecklistItemChange(item.id, e.target.checked)
                      }
                    />
                    <label
                      htmlFor={`checklist-item-${item.id}`}
                      className="text-sm flex-1"
                    >
                      {item.description}
                    </label>
                  </div>
                ))}
              </div>

              {/* 체크리스트 추가 영역 */}
              {isAddingChecklist ? (
                // 활성화된 입력 필드
                <div className="flex items-center gap-2 py-1">
                  <Checkbox id="new-checklist-item" disabled />
                  {/* <input
                    type="text"
                    placeholder="체크리스트 항목을 입력하세요"
                    className="text-sm w-full focus:outline-none"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={handleNewChecklistItemKeyDown}
                    autoFocus
                  /> */}
                  <Input
                    placeholder="체크리스트 항목을 입력하세요"
                    // className="text-sm w-full focus:outline-none"
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
            // value={formData.description}
            // onChange={updateFormField}
            // disabled={isSubmitting}
            placeholder="작업에 대한 상세 설명을 입력하세요"
          />
        </FormItem>
      </Group>
    </>
  );
};

export default ProjectTaskForm;
