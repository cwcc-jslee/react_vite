// src/features/project/utils/validateProjectForm.js
/**
 * Project 폼 데이터 유효성 검사 모듈
 */

// 프로젝트 폼 유효성 검사 함수
export const validateProjectForm = (formData) => {
  const errors = [];
  let isValid = true;

  // SFA 검사 (매출 유형일 때만)
  if (!formData.sfa && formData.projectType === 'revenue') {
    errors.push('SFA를 선택해주세요.');
    isValid = false;
  }

  // 프로젝트명 검사
  if (!formData.name || formData.name.trim() === '') {
    errors.push('프로젝트명을 입력해주세요.');
    isValid = false;
  } else if (formData.name.length < 3) {
    errors.push('프로젝트명은 최소 3자 이상이어야 합니다.');
    isValid = false;
  }

  // fy, 서비스, 사업부 검사
  if (!formData.fy) {
    errors.push('사업년도를 선택해주세요.');
    isValid = false;
  }
  if (!formData.service) {
    errors.push('서비스를 선택해주세요.');
    isValid = false;
  }
  if (!formData.team) {
    errors.push('사업부를 선택해주세요');
    isValid = false;
  }
  if (!formData.planStartDate) {
    errors.push('계획 시작일을 입력해 주세요');
    isValid = false;
  }
  if (!formData.planEndDate) {
    errors.push('계획 종료일을 입력해 주세요');
    isValid = false;
  }

  // 시작일이 종료일보다 늦으면 오류
  if (formData.planStartDate && formData.planEndDate) {
    const startDate = new Date(formData.planStartDate);
    const endDate = new Date(formData.planEndDate);

    if (startDate > endDate) {
      errors.push(`종료일이 시작일보다 빠릅니다.`);
      isValid = false;
    }
  }

  return { isValid, errors };
};

// 칸반 보드 작업 유효성 검사 함수
export const validateProjectTaskForm = (projectBuckets) => {
  const errors = [];
  let isValid = true;

  // 칸반 보드에 최소 1개 이상의 컬럼이 있어야 함
  if (!projectBuckets || projectBuckets.length === 0) {
    errors.push('최소 1개 이상의 버킷이 필요합니다.');
    isValid = false;
  }

  // 각 버킷(컬럼)별 유효성 검사
  projectBuckets.forEach((bucket, bucketIndex) => {
    // 버킷 이름이 비어있는지 확인
    if (!bucket.bucket || bucket.bucket.trim() === '') {
      errors.push(`버킷 ${bucketIndex + 1}의 이름이 비어있습니다.`);
      isValid = false;
    }

    // 해당 버킷의 작업들 검사
    if (bucket.tasks && bucket.tasks.length > 0) {
      bucket.tasks.forEach((task, taskIndex) => {
        // 작업명 필수
        if (!task.name || task.name.trim() === '') {
          errors.push(
            `${bucket.bucket || `버킷 ${bucketIndex + 1}`}의 작업 ${
              taskIndex + 1
            }에 작업명이 없습니다.`,
          );
          isValid = false;
        }

        // taskScheduleType이 'scheduled'인 경우에만 검사
        if (task.isScheduled) {
          // 계획 시작일, 종료일 필수
          if (!task.planStartDate || !task.planEndDate) {
            errors.push(
              `${bucket.bucket || `버킷 ${bucketIndex + 1}`}의 "${
                task.name || `작업 ${taskIndex + 1}`
              }"에 계획 시작/종료일이 없습니다.`,
            );
            isValid = false;
          }

          // 시작일이 종료일보다 늦으면 오류
          if (task.planStartDate && task.planEndDate) {
            const startDate = new Date(task.planStartDate);
            const endDate = new Date(task.planEndDate);

            if (startDate > endDate) {
              errors.push(
                `${bucket.bucket || `버킷 ${bucketIndex + 1}`}의 "${
                  task.name || `작업 ${taskIndex + 1}`
                }"의 종료일이 시작일보다 빠릅니다.`,
              );
              isValid = false;
            }
          }

          // 작업 시간 관련 데이터 검사
          const planningTimeData = task.planningTimeData || {};
          const personnelCount = parseInt(planningTimeData.personnelCount);
          const allocationRate = parseFloat(planningTimeData.allocationRate);
          const workDays = parseInt(planningTimeData.workDays);

          // 인원수 검사
          if (isNaN(personnelCount) || personnelCount < 1) {
            errors.push(
              `${bucket.bucket || `버킷 ${bucketIndex + 1}`}의 "${
                task.name || `작업 ${taskIndex + 1}`
              }"의 인원 수가 유효하지 않습니다.`,
            );
            isValid = false;
          }

          // 투입률 검사
          if (
            isNaN(allocationRate) ||
            allocationRate <= 0 ||
            allocationRate > 1
          ) {
            errors.push(
              `${bucket.bucket || `버킷 ${bucketIndex + 1}`}의 "${
                task.name || `작업 ${taskIndex + 1}`
              }"의 투입률이 유효하지 않습니다.`,
            );
            isValid = false;
          }

          // 작업일 검사
          if (isNaN(workDays) || workDays < 1) {
            errors.push(
              `${bucket.bucket || `버킷 ${bucketIndex + 1}`}의 "${
                task.name || `작업 ${taskIndex + 1}`
              }"의 작업일이 유효하지 않습니다.`,
            );
            isValid = false;
          }
        }
      });
    } else {
      // 작업이 없는 버킷 경고 (에러는 아님)
      console.warn(
        `버킷 "${
          bucket.bucket || `버킷 ${bucketIndex + 1}`
        }"에 작업이 없습니다.`,
      );
    }
  });

  return { isValid, errors };
};
