// src/features/project/components/registration/TaskPlanningBoard.jsx
// 프로젝트 태스크 관리를 위한 칸반보드 섹션 (리팩토링: 중첩 Drawer 적용)

import React, { useState, useMemo } from 'react';
import { FiPlus, FiCalendar, FiLayout, FiClock, FiAlertCircle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { apiCommon } from '@shared/api/apiCommon';
import { projectApiService } from '../../services/projectApiService';

// Hooks
import { useCodebook } from '@shared/hooks/useCodebook';
import useProjectTask from '../../hooks/useProjectTask';
import useSelectData from '@shared/hooks/useSelectData';
import { useProjectForm } from '../../hooks/useProjectForm';

// Utils
import { validateProjectTaskForm } from '../../utils/validateProjectForm';

// Components
import KanbanColumn from '../card/KanbanColumn';
import TaskDetailDrawer from './TaskDetailDrawer'; // 신규 드로어 컴포넌트
import { Select, Input, Tooltip } from '@shared/components/ui';
import { notification } from '@shared/services/notification';
// import useModal from '@shared/hooks/useModal'; // 제거됨

const TaskPlanningBoard = () => {
  const { formData, updateField } = useProjectForm();
  const isSingleWorkType = formData?.workType === 'single';

  const {
    buckets, editState, startEditing, startEditingColumnTitle,
    handleEditChange, saveEdit, cancelEdit, addTask, addColumn,
    toggleTaskCompletion, toggleCompletedSection, deleteTask,
    deleteColumn, moveColumn, updateTask, loadTemplate
  } = useProjectTask();

  const { data: codebooks } = useCodebook(['priorityLevel', 'taskProgress']);
  const { data: usersData } = useSelectData(apiCommon.getUsers);
  const { data: taskTempleteData } = useSelectData(projectApiService.getTaskTemplate);
  
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // 드로어 상태 관리 (모달 대체)
  const [taskDrawer, setTaskDrawer] = useState({
    visible: false,
    mode: 'add', // 'add' | 'edit'
    task: null,
    bucketIndex: -1,
    taskIndex: -1,
  });

  // 총 계획 시간 계산
  const totalPlannedHours = useMemo(() => {
    return buckets.reduce((acc, bucket) => {
      return acc + bucket.tasks.reduce((tAcc, task) => {
        const taskHours = parseFloat(task.planningTimeData?.totalPlannedHours) || 0;
        return tAcc + taskHours;
      }, 0);
    }, 0);
  }, [buckets]);

  // 가용 공수 검증 로직
  const projectType = formData.projectType || 'revenue';
  const hasSfa = !!formData.sfa;
  const sfaBudgetHours = 120; 

  let budgetDisplay = '-';
  let budgetLabel = '가용 공수';
  let isOverBudget = false;
  let statusColor = 'bg-indigo-900'; 
  let budgetIcon = <FiClock size={10} />;

  if (projectType === 'investment') {
    budgetLabel = '투자 (내부)';
    budgetDisplay = '∞'; 
    isOverBudget = false;
    statusColor = 'bg-teal-700'; 
    budgetIcon = <FiTrendingUp size={10} />;
  } else if (!hasSfa) {
    budgetLabel = 'SFA 미연동';
    budgetDisplay = '-';
    isOverBudget = false;
    statusColor = 'bg-slate-600'; 
  } else {
    budgetLabel = '가용 공수 (Budget)';
    budgetDisplay = sfaBudgetHours;
    isOverBudget = totalPlannedHours > sfaBudgetHours;
    statusColor = isOverBudget ? 'bg-red-600' : 'bg-indigo-900';
  }

  const handleAddColumnClick = () => {
    addColumn({ bucket: '새 버킷', tasks: [] });
  };

  const handleTemplateSelect = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    if (!templateId) return;

    try {
      if (buckets.length > 0 && buckets.some(b => b.tasks.length > 0)) {
        const confirm = window.confirm('템플릿을 적용하면 현재 작업 중인 내용이 초기화될 수 있습니다. 계속하시겠습니까?');
        if (!confirm) {
          setSelectedTemplate('');
          return;
        }
      }
      await loadTemplate(templateId);
      notification.success({ message: '템플릿이 적용되었습니다.' });
    } catch (error) {
      notification.error({ message: '템플릿 로드 실패' });
    }
  };

  /**
   * 작업 드로어 열기 (추가/수정 통합)
   */
  const openTaskDrawer = (mode, bucketIndex, task = null, taskIndex = -1) => {
    let targetTask = task;

    // 추가 모드일 경우 초기값 설정
    if (mode === 'add') {
      targetTask = {
        name: '',
        isScheduled: true,
        isProgress: true,
        planStartDate: formData.planStartDate || '',
        planEndDate: formData.planEndDate || '',
        planningTimeData: {
          personnelCount: 1,
          allocationRate: 1.0,
          workDays: 1,
        }
      };
    }

    setTaskDrawer({
      visible: true,
      mode,
      task: targetTask,
      bucketIndex,
      taskIndex,
    });
  };

  const closeTaskDrawer = () => {
    setTaskDrawer((prev) => ({ ...prev, visible: false }));
  };

  const handleTaskSave = (updatedTask) => {
    if (taskDrawer.mode === 'add') {
      addTask(taskDrawer.bucketIndex, updatedTask);
    } else {
      updateTask(taskDrawer.bucketIndex, taskDrawer.taskIndex, updatedTask);
    }
  };

  const templeteOptions = [
    { value: '', label: '직접 구성 (선택 안함)' },
    ...(taskTempleteData?.data || []).map((item) => ({
      value: item?.id?.toString() || '',
      label: item?.name || '이름 없음',
    })),
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-md relative overflow-hidden">
      
      {/* 4분할 균등 배치 툴바 */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white grid grid-cols-4 gap-6 items-stretch shadow-sm z-10">
        
        {/* 1. 시작일 설정 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
            <FiCalendar className="text-indigo-500" /> 계획 시작일
          </label>
          <Input
            type="date"
            name="planStartDate"
            value={formData?.planStartDate || ''}
            onChange={updateField}
            className="h-11 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-300 transition-all"
          />
        </div>

        {/* 2. 종료일 설정 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
            <FiCalendar className="text-orange-500" /> 계획 종료일
          </label>
          <Input
            type="date"
            name="planEndDate"
            value={formData?.planEndDate || ''}
            onChange={updateField}
            className="h-11 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-300 transition-all"
          />
        </div>

        {/* 3. 템플릿 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
            <FiLayout className="text-green-600" /> 작업 템플릿 적용
          </label>
          <Select 
            value={selectedTemplate} 
            onChange={handleTemplateSelect} 
            className="h-11 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-green-300 transition-all"
          >
            {templeteOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>

        {/* 4. 작업 공수 검증 카드 */}
        <div className={`
          ${statusColor} rounded-lg shadow-md px-4 py-2 flex flex-col justify-center relative overflow-hidden group
          transition-colors duration-300
        `}>
          <div className="absolute -right-2 -bottom-2 p-2 opacity-10 text-white">
            <FiClock size={50} />
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="flex flex-col">
              <span className="text-[11px] text-white/70 font-medium mb-0.5">계획 시간 (Planned)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white leading-none tracking-tight">
                  {totalPlannedHours}
                </span>
                <span className="text-xs text-white/80 font-bold">h</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/20 mx-2 mb-1"></div>

            <div className="flex flex-col items-end">
              <span className="text-[11px] text-white/70 font-medium mb-0.5 flex items-center gap-1">
                {budgetLabel}
                <Tooltip content={projectType === 'investment' ? '투자 프로젝트는 공수 제한이 없습니다.' : 'SFA 매출이익 기반 가용 공수'}>
                  <div className="cursor-help text-white/80 hover:text-white">
                    {budgetIcon}
                  </div>
                </Tooltip>
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-bold ${isOverBudget ? 'text-red-200' : 'text-white'}`}>
                  {budgetDisplay}
                </span>
                {budgetDisplay !== '-' && budgetDisplay !== '∞' && <span className="text-[10px] text-white/60">h</span>}
              </div>
            </div>
          </div>

          {isOverBudget && (
            <div className="absolute top-1 right-2 text-[10px] font-bold text-white bg-red-500/80 px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
              <FiAlertCircle size={10} /> 초과
            </div>
          )}
        </div>

      </div>

      {/* 칸반보드 영역 */}
      <div className="flex-1 overflow-hidden p-6 bg-gray-50/50">
        <div className="flex h-full overflow-x-auto gap-6 pb-2">
          {buckets.map((bucket, index) => (
            <KanbanColumn
              key={index} bucket={bucket} bucketIndex={index} totalColumns={buckets.length}
              startEditingColumnTitle={startEditingColumnTitle} editState={editState}
              handleEditChange={handleEditChange} saveEdit={saveEdit} cancelEdit={cancelEdit}
              startEditing={startEditing}
              toggleTaskCompletion={toggleTaskCompletion} toggleCompletedSection={toggleCompletedSection}
              deleteTask={deleteTask} deleteColumn={deleteColumn} moveColumn={moveColumn}
              
              // UX 변경: 드로어 오픈 핸들러 전달
              onAddTaskClick={() => openTaskDrawer('add', index)} 
              onOpenTaskEditModal={(task, bIdx, tIdx) => openTaskDrawer('edit', bIdx, task, tIdx)} 
              isSingleWorkType={isSingleWorkType}
            />
          ))}

          <div className="flex-shrink-0 w-40">
            <button
              className={`w-full h-12 border-2 border-dashed rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                isSingleWorkType ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 
                'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md'
              }`}
              onClick={handleAddColumnClick}
              disabled={isSingleWorkType}
            >
              <FiPlus className="mr-2" size={20} />
              <span>새 버킷</span>
            </button>
          </div>
        </div>
      </div>

      {/* 중첩 Drawer (작업 상세) */}
      <TaskDetailDrawer 
        visible={taskDrawer.visible}
        mode={taskDrawer.mode}
        task={taskDrawer.task}
        onClose={closeTaskDrawer}
        onSave={handleTaskSave}
        codebooks={codebooks}
        usersData={usersData}
      />
    </div>
  );
};

export default TaskPlanningBoard;