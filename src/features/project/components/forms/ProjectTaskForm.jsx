// src/features/project/components/forms/ProjectTaskForm.jsx
// 프로젝트 작업 정보 수정을 위한 폼 컴포넌트 (섹션 타이틀 제거 및 디자인 슬림화)

import React, { useState, useEffect } from 'react';
import {
  FormItem,
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
import UserSelectorForm from './UserSelectorForm';
import { notification } from '../../../../shared/services/notification';

// 간소화된 섹션 컨테이너
const FormSection = ({ children, rightElement, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-5 mb-4 shadow-sm ${className}`}>
    {rightElement && (
      <div className="flex justify-end mb-2">
        {rightElement}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ProjectTaskForm = ({ codebooks, task, onSave, onCancel, usersData }) => {
  const {
    taskFormData,
    setTaskFormData,
    handleInputChange,
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
    assignedUsers,
    assignUser,
    removeAssignedUser,
    getEditedTask,
  } = useTaskFormEditor(task);

  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isScheduled, setIsScheduled] = useState(task?.isScheduled !== false);
  const [isProgress, setIsProgress] = useState(task?.isProgress !== false);

  const checklistStats = getChecklistStats();

  useEffect(() => {
    if (task) {
      setIsScheduled(task.isScheduled !== false);
      setIsProgress(task.isProgress !== false);
    }
  }, [task]);

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

  // 체크리스트 추가 버튼 클릭 핸들러
  const handleAddChecklistClick = () => {
    setChecklistAddingMode(true);
  };

  // 체크리스트 수정 중 키 입력 핸들러
  const handleEditChecklistKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveChecklistItemEdit();
    } else if (e.key === 'Escape') {
      cancelChecklistItemEdit();
    }
  };

  const calculatePlannedHours = () => {
    const planningData = taskFormData.planningTimeData || {};
    const personnelCount = parseInt(planningData.personnelCount) || 0;
    const allocationRate = parseFloat(planningData.allocationRate) || 0;
    const workDays = parseInt(planningData.workDays) || 0;
    const hoursPerDay = 8;
    return Math.round(personnelCount * allocationRate * workDays * hoursPerDay);
  };

  useEffect(() => {
    if (isProgress && taskFormData.planningTimeData) {
      const totalPlannedHours = calculatePlannedHours();
      setTaskFormData((prev) => ({
        ...prev,
        planningTimeData: { ...(prev.planningTimeData || {}), totalPlannedHours },
        isProgress,
      }));
    }
  }, [
    taskFormData.planningTimeData?.personnelCount,
    taskFormData.planningTimeData?.allocationRate,
    taskFormData.planningTimeData?.workDays,
    isProgress,
  ]);

  useEffect(() => {
    if (isScheduled) setIsProgress(true);
    else setIsProgress(false);
    setTaskFormData((prev) => ({ ...prev, isScheduled }));
  }, [isScheduled]);

  useEffect(() => {
    setTaskFormData((prev) => ({ ...prev, isProgress }));
  }, [isProgress]);

  const validateForm = () => {
    let validationErrors = [];
    if (!taskFormData.name || taskFormData.name.trim() === '') validationErrors.push('작업명은 필수입니다.');
    if (isScheduled) {
      if (!taskFormData.planStartDate) validationErrors.push('계획 시작일은 필수입니다.');
      if (!taskFormData.planEndDate) validationErrors.push('계획 종료일은 필수입니다.');
    }
    return validationErrors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      notification.error({ message: '입력 오류', description: errors[0] });
      return;
    }
    onSave(getEditedTask());
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/20">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* 기본 정보 섹션 (타이틀 제거) */}
        <FormSection>
          <FormItem direction="vertical">
            <Label required>작업명</Label>
            <Input
              type="text"
              name="name"
              onChange={handleInputChange}
              value={taskFormData?.name}
              placeholder="작업명을 입력하세요"
              className="font-bold text-base border-gray-200 focus:border-indigo-500"
            />
          </FormItem>
          
          <div className="grid grid-cols-2 gap-4">
            <FormItem direction="vertical">
              <Label>우선순위</Label>
              <Select
                name="priorityLevel"
                value={taskFormData?.priorityLevel?.id}
                onChange={(e) => {
                  const item = codebooks?.priorityLevel?.find(i => i.id.toString() === e.target.value) || {};
                  setTaskFormData(prev => ({ ...prev, priorityLevel: item }));
                }}
              >
                <option value="">선택</option>
                {codebooks?.priorityLevel?.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </FormItem>
            
            <FormItem direction="vertical">
              <Label>진행상태</Label>
              <Select
                name="taskProgress"
                value={taskFormData?.taskProgress?.id}
                disabled={true}
                className="bg-gray-50 text-gray-400"
              >
                <option value="">선택</option>
                {codebooks?.taskProgress?.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </FormItem>
          </div>

          <FormItem direction="vertical">
            <Label>설명</Label>
            <TextArea
              name="description"
              rows={2}
              value={taskFormData?.description || ''}
              onChange={handleInputChange}
              placeholder="상세 내용을 입력하세요"
              className="resize-none"
            />
          </FormItem>
        </FormSection>

        {/* 담당자 섹션 */}
        <FormSection>
          <FormItem direction="vertical">
            <Label>담당자 배정</Label>
            <UserSelectorForm
              usersData={usersData}
              assignedUsers={assignedUsers}
              onAssignUser={assignUser}
              onRemoveUser={removeAssignedUser}
            />
          </FormItem>
        </FormSection>

        {/* 일정 및 공수 (통합 섹션) */}
        <div className="grid grid-cols-2 gap-4">
          <FormSection 
            rightElement={
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">일정관리</span>
                <Switch checked={isScheduled} onChange={() => setIsScheduled(!isScheduled)} size="sm" />
              </div>
            }
          >
            {isScheduled ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <FormItem direction="vertical">
                  <Label required>계획 시작일</Label>
                  <Input type="date" name="planStartDate" value={taskFormData?.planStartDate || ''} onChange={handleInputChange} />
                </FormItem>
                <FormItem direction="vertical">
                  <Label required>계획 종료일</Label>
                  <Input type="date" name="planEndDate" value={taskFormData?.planEndDate || ''} onChange={handleInputChange} />
                </FormItem>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-300 text-xs italic">일정 미사용</div>
            )}
          </FormSection>

          <FormSection 
            rightElement={
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">공수관리</span>
                <Switch checked={isProgress} onChange={() => setIsProgress(!isProgress)} disabled={isScheduled} size="sm" />
              </div>
            }
          >
            {isProgress ? (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                <FormItem direction="vertical">
                  <Label>인원</Label>
                  <Input type="number" name="planningTimeData.personnelCount" value={taskFormData?.planningTimeData?.personnelCount || ''} onChange={handleInputChange} />
                </FormItem>
                <FormItem direction="vertical">
                  <Label>투입률</Label>
                  <Input type="number" step="0.1" name="planningTimeData.allocationRate" value={taskFormData?.planningTimeData?.allocationRate || ''} onChange={handleInputChange} />
                </FormItem>
                <FormItem direction="vertical">
                  <Label>작업일</Label>
                  <Input type="number" name="planningTimeData.workDays" value={taskFormData?.planningTimeData?.workDays || ''} onChange={handleInputChange} />
                </FormItem>
                <FormItem direction="vertical">
                  <Label className="text-indigo-600">계획공수</Label>
                  <div className="h-9 flex items-center justify-end px-3 bg-indigo-50 rounded text-indigo-700 font-bold text-sm">
                    {taskFormData?.planningTimeData?.totalPlannedHours || 0}h
                  </div>
                </FormItem>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-300 text-xs italic">공수 미사용</div>
            )}
          </FormSection>
        </div>

        {/* 체크리스트 섹션 */}
        <FormSection>
          <div className="flex items-center justify-between mb-2">
            <Label>체크리스트 ({checklistStats.completed}/{checklistStats.total})</Label>
            {checklists.length > 0 && (
              <button onClick={toggleChecklistExpanded} className="text-gray-400 hover:text-indigo-500 transition-colors">
                {isChecklistExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </button>
            )}
          </div>
          
          {isChecklistExpanded && (
            <div className="space-y-2">
              {checklists.map((item) => (
                <div key={item.id || item.index} className="flex items-center gap-2 group p-1 hover:bg-gray-50 rounded transition-colors">
                  {editingChecklistId === (item.id || item.index) ? (
                    <Input
                      value={editingChecklistText}
                      onChange={(e) => setEditingChecklistText(e.target.value)}
                      onKeyDown={handleEditChecklistKeyDown}
                      onBlur={saveChecklistItemEdit}
                      autoFocus
                      size="sm"
                    />
                  ) : (
                    <>
                      <Checkbox
                        checked={item.isCompleted}
                        onChange={(e) => toggleChecklistItem(item.id || item.index, e.target.checked)}
                      />
                      <span className={`text-sm flex-1 ${item.isCompleted ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                        {item.description}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex">
                        <button onClick={() => startChecklistItemEdit(item)} className="p-1 text-gray-400 hover:text-blue-500"><FiEdit size={14} /></button>
                        <button onClick={() => deleteChecklistItem(item.id || item.index)} className="p-1 text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {isAddingChecklist ? (
                <Input
                  placeholder="새 항목 입력..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={handleNewChecklistItemKeyDown}
                  autoFocus
                  className="mt-2 h-8 text-sm"
                />
              ) : (
                <button
                  onClick={handleAddChecklistClick}
                  className="w-full py-2 border border-dashed border-gray-200 rounded text-xs text-gray-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-500 flex items-center justify-center gap-1 transition-all"
                >
                  <FiPlus /> 항목 추가
                </button>
              )}
            </div>
          )}
        </FormSection>
      </div>

      {/* Footer (Sticky) */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 z-10">
        <Button variant="outline" onClick={onCancel} className="px-6 border-gray-200">취소</Button>
        <Button variant="primary" onClick={handleSave} className="px-10 bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold">저장</Button>
      </div>
    </div>
  );
};

export default ProjectTaskForm;
