// src/features/project/hooks/useTaskEditor.js
import { useState, useEffect } from 'react';

/**
 * 작업 편집을 위한 커스텀 훅
 *
 * @param {Object} initialTask - 초기 작업 데이터
 * @param {Function} onSave - 저장 시 호출할 콜백 함수 (columnIndex, taskIndex, updatedTask)
 * @param {boolean} isNewProject - 신규 프로젝트 등록 여부
 * @returns {Object} 작업 편집 관련 상태 및 함수들
 */
const useTaskEditor = (
  initialTask = {},
  onSave = null,
  isNewProject = true,
) => {
  // 작업 데이터 상태
  const [taskFormData, setTaskFormData] = useState({});
  // 체크리스트 상태
  const [checklists, setChecklists] = useState([]);
  // 할당된 사용자 상태
  const [assignedUsers, setAssignedUsers] = useState([]);

  // 제출 및 오류 상태 (향후 개별 task 제출 시 사용)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 초기 데이터로 상태 초기화
  useEffect(() => {
    if (initialTask) {
      setTaskFormData({
        name: initialTask.name || '',
        taskScheduleType:
          initialTask?.taskScheduleType !== undefined
            ? initialTask.taskScheduleType
            : true,
        days: initialTask.days || '',
        dueDate: initialTask.dueDate || '',
        taskProgress: initialTask?.taskProgress || {
          id: 91,
          code: '0',
          name: '0%',
        },
        priorityLevel: initialTask?.priorityLevel || { id: 116, name: '중간' },
        planStartDate: initialTask?.planStartDate || '',
        planEndDate: initialTask?.planEndDate || '',
        // 기타 필요한 필드 추가
      });

      setChecklists(initialTask?.projectTaskChecklists || []);
      setAssignedUsers(initialTask?.users || []);
    }
  }, [initialTask]);

  // 필드 변경 핸들러
  const handleChange = (name, value) => {
    setTaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 개발 중 디버깅용 로깅 (실제 코드에서는 제거)
    console.log(`taskFormData 변경: ${name} = ${value}`);
  };

  // 통합 핸들러 함수
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaskFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 특정 필드용 핸들러
  const handleSwitchChange = () => {
    setTaskFormData((prev) => ({
      ...prev,
      taskScheduleType: !prev.taskScheduleType,
    }));
  };

  // 체크리스트 관련 함수들
  const addChecklistItem = (description) => {
    if (!description.trim()) return;

    const newItem = {
      id: Date.now(), // 임시 ID (실제 구현에서는 서버에서 할당될 수 있음)
      description: description.trim(),
      isCompleted: false,
    };

    setChecklists((prev) => [...prev, newItem]);
  };

  const toggleChecklistItem = (id) => {
    setChecklists((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    );
  };

  const deleteChecklistItem = (id) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  };

  // 사용자 할당 관련 함수들
  const assignUser = (user) => {
    if (!assignedUsers.some((u) => u.id === user.id)) {
      setAssignedUsers((prev) => [...prev, user]);
    }
  };

  const removeAssignedUser = (userId) => {
    setAssignedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  // 현재 편집 중인 작업 데이터 가져오기
  const getEditedTask = () => {
    return {
      ...initialTask,
      ...taskFormData,
      projectTaskChecklists: checklists,
      assignedUsers,
    };
  };

  // 작업 저장하기 (신규 프로젝트에서는 실제 저장이 아닌 데이터 전달)
  const saveTask = async () => {
    // 신규 프로젝트 등록 모드에서는 단순히 데이터만 반환
    if (isNewProject) {
      return getEditedTask();
    }

    // 향후 개별 작업 저장 구현을 위한 코드 (현재는 사용되지 않음)
    if (onSave) {
      setIsSubmitting(true);
      try {
        await onSave(getEditedTask());
        return true;
      } catch (error) {
        console.error('작업 저장 중 오류:', error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    return false;
  };

  // 작업 유효성 검증 (필요한 경우)
  const validateTask = () => {
    const newErrors = {};

    if (!taskFormData.name) {
      newErrors.name = '작업명은 필수입니다';
    }

    // 기타 유효성 검증 규칙 추가

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    taskFormData,
    checklists,
    assignedUsers,
    errors,
    isSubmitting,
    handleSwitchChange,
    handleChange,
    handleInputChange,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    assignUser,
    removeAssignedUser,
    getEditedTask,
    saveTask,
    validateTask,
  };
};

export default useTaskEditor;
