// src/features/project/components/forms/ProjectTaskForm.jsx
/**
 * 프로젝트 작업 정보 수정을 위한 폼 컴포넌트
 * 작업 기본 정보 및 상세 옵션을 입력받는 폼을 제공
 */

import React from 'react';
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

/**
 * 프로젝트 작업 수정 폼 컴포넌트
 *
 */
const ProjectTaskForm = ({ codebooks, task, onSave }) => {
  return (
    <>
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 작업명 */}
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">작업명</Label>
          <Input
            type="text"
            name="name"
            // onChange={updateFormField}
            value={task?.name}
            // disabled={isSubmitting}
          />
        </FormItem>
      </Group>

      {/* 2열: 업태, 종업원 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        {/* 작업일정 구분 */}
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">작업일정 구분</Label>
          <Switch
          // checked={isScheduled}
          // onChange={() => setIsProject(!isProject)}
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

      {/* 1열: 작업일정 - 계획일정 활성화시시 */}
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
        {/* 체크 리스트트 */}
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">체크리스트</Label>
          <div className="border border-gray-200 rounded-md p-2 mt-1">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox id="check-item-1" />
              <label htmlFor="check-item-1" className="text-sm">
                작업 항목 1
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="check-item-2" />
              <label htmlFor="check-item-2" className="text-sm">
                작업 항목 2
              </label>
            </div>
          </div>
        </FormItem>
      </Group>

      {/* 설명 */}
      <Group direction="horizontal" spacing="lg" className="mb-6">
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">설명</Label>
          <TextArea
            name="description"
            rows={4}
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
