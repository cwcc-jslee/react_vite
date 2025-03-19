// src/features/project/hooks/useTaskForm.js
import { useState, useEffect } from 'react';

const useTaskEditor = (initialTask, onSubmit) => {
  // 폼 상태 관리
  const [taskData, setTaskData] = useState({});
  // 체크리스트 상태 관리
  const [checklists, setChecklists] = useState([]);
  // 폼 유효성 검증 상태
  const [errors, setErrors] = useState({});

  // 초기 작업 데이터가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (initialTask) {
      setTaskData({
        name: initialTask.name || '',
        days: initialTask.days || '',
        dueDate: initialTask.dueDate || '',
        pjt_progress: initialTask.pjt_progress || '0',
        priorityLevel: initialTask.priorityLevel || '',
        // 다른 필드 추가
      });

      // 체크리스트 초기화
      setChecklists(initialTask.projectTaskChecklists || []);
    }
  }, [initialTask]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 체크리스트 항목 추가 핸들러
  const addChecklistItem = (description) => {
    setChecklists((prev) => [
      ...prev,
      { id: Date.now(), description, isCompleted: false },
    ]);
  };

  // 체크리스트 항목 상태 변경 핸들러
  const toggleChecklistItem = (id) => {
    setChecklists((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    );
  };

  // 체크리스트 항목 삭제 핸들러
  const deleteChecklistItem = (id) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 유효성 검증
    const newErrors = {};
    if (!taskData.name) newErrors.name = '작업명은 필수입니다';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 폼 데이터와 체크리스트를 합쳐서 완성된 작업 데이터 생성
      const updatedTask = {
        ...initialTask,
        ...taskData,
        projectTaskChecklists: checklists,
      };

      // 콜백을 통해 상위 컴포넌트에 변경된 작업 데이터 전달
      await onSubmit(updatedTask);
    } catch (error) {
      console.error('작업 저장 중 오류 발생:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    taskData,
    checklists,
    errors,
    isSubmitting,
    handleInputChange,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    handleSubmit,
  };
};

export default useTaskEditor;
