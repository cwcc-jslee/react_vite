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
      index: checklists.length, // 배열의 현재 길이를 id로 사용
      description: description.trim(),
      isCompleted: false,
    };

    setChecklists((prev) => [...prev, newItem]);
  };

  const toggleChecklistItem = (id) => {
    setChecklists((prev) =>
      prev.map((item) =>
        item.id === id || item.index === id
          ? { ...item, isCompleted: !item.isCompleted }
          : item,
      ),
    );
  };

  const deleteChecklistItem = (id) => {
    setChecklists((prev) =>
      prev.filter((item) => !(item.id === id || item.index === id)),
    );
  };

  // 사용자 할당 관련 함수들
  const assignUser = (user) => {
    try {
      console.log('useTaskEditor: 할당 시도하는 사용자:', user);

      if (!user || typeof user !== 'object') {
        alert('유효하지 않은 사용자 객체');
        console.error('useTaskEditor: 사용자 객체가 유효하지 않습니다:', user);
        return false;
      }

      // 필수 필드가 있는지 확인
      if (user.id === undefined) {
        alert('사용자 ID가 없습니다');
        console.error('useTaskEditor: 사용자 ID가 없습니다:', user);
        return false;
      }

      // 이미 할당된 사용자인지 확인
      const isAlreadyAssigned = assignedUsers.some((u) => u.id === user.id);
      console.log('useTaskEditor: 이미 할당됨?', isAlreadyAssigned);

      if (isAlreadyAssigned) {
        alert('이미 할당된 사용자입니다');
        return false;
      }

      // 필요한 필드만 추출하여 통일된 구조로 저장
      const newUser = {
        id: user.id,
        username: user.username || user.name || String(user.id),
      };

      console.log('useTaskEditor: 추가할 사용자:', newUser);

      // 강제로 상태 업데이트 - 직접 배열에 추가
      setAssignedUsers([...assignedUsers, newUser]);

      // 성공 메시지
      alert(`사용자 "${newUser.username}"가 할당되었습니다`);
      console.log('useTaskEditor: 사용자 할당 성공');

      return true;
    } catch (error) {
      alert('사용자 할당 중 오류가 발생했습니다');
      console.error('useTaskEditor: 사용자 할당 중 오류:', error);
      return false;
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
