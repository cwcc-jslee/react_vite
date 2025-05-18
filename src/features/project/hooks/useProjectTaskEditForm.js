// src/features/project/hooks/useTaskEditor.js
import { useState, useEffect } from 'react';

/**
 * 작업 편집을 위한 커스텀 훅
 * 작업 정보 관리 및 체크리스트 기능을 포함
 *
 * @param {Object} initialTask - 초기 작업 데이터
 * @param {Function} onSave - 저장 시 호출할 콜백 함수 (columnIndex, taskIndex, updatedTask)
 * @param {boolean} isNewProject - 신규 프로젝트 등록 여부
 * @returns {Object} 작업 편집 관련 상태 및 함수들
 */
const useProjectTaskEditForm = (
  initialTask = {},
  onSave = null,
  isNewProject = true,
) => {
  // 작업 데이터 상태
  const [formData, setFormData] = useState({
    name: '',
    taskScheduleType: 'scheduled',
    taskProgress: {
      id: 91,
      code: '0',
      name: '0%',
    },
    priorityLevel: {
      id: 116,
      code: 'medium',
      name: '중간',
    },
    planStartDate: '',
    planEndDate: '',
    planningTimeData: {},
    users: [],
  });

  // 체크리스트 상태
  const [checklists, setChecklists] = useState([]);

  // 체크리스트 확장/축소 상태
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);
  // 체크리스트 항목 추가 모드 상태
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  // 체크리스트 수정 상태
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  // 체크리스트 수정 텍스트
  const [editingChecklistText, setEditingChecklistText] = useState('');

  // 제출 및 오류 상태 (향후 개별 task 제출 시 사용)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 상태 변경 감지 및 콘솔 출력
  useEffect(() => {
    console.log('>>>> formData 상태 변경:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('>>>> checklists 상태 변경:', checklists);
  }, [checklists]);

  // 초기 데이터로 상태 초기화
  useEffect(() => {
    if (initialTask) {
      setFormData({
        name: initialTask.name || '',
        taskScheduleType: initialTask?.taskScheduleType || 'scheduled',
        taskProgress: initialTask?.taskProgress || {
          id: 91,
          code: '0',
          name: '0%',
        },
        priorityLevel: initialTask?.priorityLevel || {
          id: 116,
          code: 'medium',
          name: '중간',
        },
        planStartDate: initialTask?.planStartDate || '',
        planEndDate: initialTask?.planEndDate || '',
        planningTimeData: initialTask?.planningTimeData || {},
        users: initialTask?.users || [],
      });

      // 체크리스트 초기화 시 index 재설정
      if (
        initialTask?.projectTaskChecklists &&
        initialTask.projectTaskChecklists.length > 0
      ) {
        const checklistsWithIndexes = initialTask.projectTaskChecklists.map(
          (item, idx) => ({
            ...item,
            index: idx,
          }),
        );
        setChecklists(checklistsWithIndexes);
      } else {
        setChecklists([]);
      }
    }
  }, [initialTask]);

  /**
   * 체크리스트 항목의 index를 순차적으로 재설정
   * @param {Array} items - 체크리스트 항목 배열
   * @returns {Array} - index가 재설정된 체크리스트 항목 배열
   */
  const reorderChecklistIndexes = (items) => {
    return items.map((item, idx) => ({
      ...item,
      index: idx,
    }));
  };

  // 필드 변경 핸들러
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 개발 중 디버깅용 로깅 (실제 코드에서는 제거)
    console.log(`formData 변경: ${name} = ${value}`);
  };

  // 필드 변경 핸들러 함수 (일반 필드와 중첩 객체 필드 모두 처리)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 필드 이름에 점(.)이 포함되어 있는지 확인 - 중첩 객체 접근 방식 지원
    if (name.includes('.')) {
      // 예: planningTimeData.personnelCount
      const [objectName, fieldName] = name.split('.');

      setFormData((prev) => ({
        ...prev,
        [objectName]: {
          ...(prev[objectName] || {}),
          [fieldName]:
            type === 'number'
              ? value === ''
                ? ''
                : Number(value)
              : type === 'checkbox'
              ? checked
              : value,
        },
      }));
    } else if (name.includes('planningTimeData.')) {
      // 별도의 속성명 처리 (예: planningTimeData.personnelCount)
      const fieldName = name.replace('planningTimeData.', '');

      setFormData((prev) => ({
        ...prev,
        planningTimeData: {
          ...(prev.planningTimeData || {}),
          [fieldName]:
            type === 'number'
              ? value === ''
                ? ''
                : Number(value)
              : type === 'checkbox'
              ? checked
              : value,
        },
      }));
    } else {
      // 일반 필드 처리 (기존 로직)
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'number'
            ? value === ''
              ? ''
              : Number(value)
            : type === 'checkbox'
            ? checked
            : value,
      }));
    }
  };

  // 특정 필드용 핸들러
  const handleSwitchChange = () => {
    setFormData((prev) => ({
      ...prev,
      taskScheduleType:
        prev.taskScheduleType === 'scheduled' ? 'ongoing' : 'scheduled',
    }));
  };

  // 체크리스트 관련 함수들
  /**
   * 체크리스트 항목 추가
   * @param {string} description - 체크리스트 항목 내용
   */
  const addChecklistItem = (description) => {
    if (!description.trim()) return;

    setChecklists((prev) => {
      // 새 항목 생성 (임시 인덱스 사용)
      const newItem = {
        description: description.trim(),
        isCompleted: false,
      };

      // 기존 항목에 새 항목 추가 후 인덱스 재정렬
      const updatedItems = [...prev, newItem];
      return reorderChecklistIndexes(updatedItems);
    });

    setIsAddingChecklist(false); // 추가 후 입력 모드 종료
  };

  /**
   * 체크리스트 항목 토글
   * @param {string|number} id - 체크리스트 항목 ID 또는 인덱스
   * @param {boolean} isCompleted - 완료 상태
   */
  const toggleChecklistItem = (id, isCompleted) => {
    setChecklists((prev) =>
      prev.map((item) =>
        item.id === id || item.index === id
          ? {
              ...item,
              isCompleted:
                isCompleted !== undefined ? isCompleted : !item.isCompleted,
            }
          : item,
      ),
    );
  };

  /**
   * 체크리스트 항목 삭제
   * @param {string|number} id - 체크리스트 항목 ID 또는 인덱스
   */
  const deleteChecklistItem = (id) => {
    setChecklists((prev) => {
      // 항목 삭제
      const filteredItems = prev.filter(
        (item) => !(item.id === id || item.index === id),
      );
      // 인덱스 재정렬
      return reorderChecklistIndexes(filteredItems);
    });
  };

  /**
   * 체크리스트 항목 수정 시작
   * @param {Object} item - 수정할 체크리스트 항목
   */
  const startChecklistItemEdit = (item) => {
    setEditingChecklistId(item.id || item.index);
    setEditingChecklistText(item.description);
  };

  /**
   * 체크리스트 항목 수정 저장
   */
  const saveChecklistItemEdit = () => {
    if (editingChecklistText.trim()) {
      setChecklists((prev) =>
        prev.map((item) => {
          if ((item.id || item.index) === editingChecklistId) {
            return { ...item, description: editingChecklistText.trim() };
          }
          return item;
        }),
      );
    }

    // 수정 모드 종료
    setEditingChecklistId(null);
    setEditingChecklistText('');
  };

  /**
   * 체크리스트 항목 수정 취소
   */
  const cancelChecklistItemEdit = () => {
    setEditingChecklistId(null);
    setEditingChecklistText('');
  };

  /**
   * 체크리스트 통계 계산
   * @returns {Object} 체크리스트 통계 (총 항목 수, 완료된 항목 수)
   */
  const getChecklistStats = () => {
    return {
      total: checklists.length,
      completed: checklists.filter((item) => item.isCompleted).length,
    };
  };

  /**
   * 체크리스트 섹션 토글 (펼침/접기)
   */
  const toggleChecklistExpanded = () => {
    setIsChecklistExpanded(!isChecklistExpanded);
  };

  /**
   * 체크리스트 추가 모드 설정
   * @param {boolean} isAdding - 추가 모드 활성화 여부
   */
  const setChecklistAddingMode = (isAdding) => {
    setIsAddingChecklist(isAdding);
  };

  // 사용자 할당 관련 함수들
  const handleAssignUser = (user) => {
    try {
      if (!user?.id) {
        alert('유효하지 않은 사용자입니다');
        return false;
      }

      if (formData.users.some((u) => u.id === user.id)) {
        alert('이미 할당된 사용자입니다');
        return false;
      }

      const newUser = {
        id: user.id,
        username: user.username || user.name || String(user.id),
      };

      setFormData((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
      }));

      return true;
    } catch (error) {
      alert('사용자 할당 중 오류가 발생했습니다');
      return false;
    }
  };

  const handleRemoveUser = (userId) => {
    setFormData((prev) => ({
      ...prev,
      users: prev.users.filter((user) => user.id !== userId),
    }));
  };

  // 현재 편집 중인 작업 데이터 가져오기
  const getEditedTask = () => {
    return {
      ...formData,
      projectTaskChecklists: checklists,
      isModified: true,
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

    if (!formData.name) {
      newErrors.name = '작업명은 필수입니다';
    }

    // 기타 유효성 검증 규칙 추가

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    // 작업 데이터 관련
    formData,
    setFormData,
    handleChange,
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
    users: formData.users,
    handleAssignUser,
    handleRemoveUser,

    // 기타 상태 및 기능
    errors,
    isSubmitting,
    getEditedTask,
    saveTask,
    validateTask,
  };
};

export default useProjectTaskEditForm;
