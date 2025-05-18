/**
 * 작업 등록 폼 유효성 검사
 * @param {Object} formData - 폼 데이터
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateWorkForm = (formData) => {
  const errors = {};

  // 작업일 검증
  if (!formData.workDate) {
    errors.workDate = '작업일을 선택하세요.';
  }

  // 작업시간 검증
  if (!formData.workHours) {
    errors.workHours = '작업시간을 입력하세요.';
  } else {
    const workHours = parseFloat(formData.workHours);
    if (isNaN(workHours) || workHours < 0 || workHours > 20) {
      errors.workHours = '작업시간은 0~20 사이의 값을 입력하세요.';
    }
  }

  // 이동/기타시간 검증
  if (formData.nonBillableHours) {
    const nonBillableHours = parseFloat(formData.nonBillableHours);
    if (
      isNaN(nonBillableHours) ||
      nonBillableHours < 0 ||
      nonBillableHours > 20
    ) {
      errors.nonBillableHours = '이동/기타시간은 0~20 사이의 값을 입력하세요.';
    }
  }

  // 진행율 검증
  if (!formData.taskProgress?.id) {
    errors.taskProgress = '진행율을 선택하세요.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
