/**
 * 관계 필드 처리를 위한 유틸리티 함수들
 *
 * 이 모듈은 API 요청 전 데이터의 관계 필드를 처리하는 유틸리티 함수들을 제공합니다.
 * 주요 기능:
 * 1. 객체 배열을 ID 배열로 변환 (예: users 배열)
 * 2. 중첩된 객체에서 ID 값 추출 (예: importanceLevel, fy, pjtStatus 등)
 * 3. 불필요한 필드 제거 (예: templateId)
 *
 * 사용 예시:
 * const processedData = processRelationFields({
 *   users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
 *   importanceLevel: { id: 3, name: 'High' }
 * });
 * // 결과: { users: [1, 2], importanceLevel: 3 }
 */

/**
 * 빈 값(빈 문자열, 빈 배열, null, undefined)을 가진 필드 제거
 * @param {Object} data - 처리할 데이터
 * @returns {Object} 빈 값이 제거된 데이터
 */
export const removeEmptyFields = (data) => {
  const cleanedData = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];

    // 값이 유효한 경우만 포함
    if (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      cleanedData[key] = value;
    }
  });

  return cleanedData;
};

/**
 * 관계 필드를 처리하는 유틸리티 함수
 * 객체 배열을 ID 배열로 변환 (예: users배열)
 *
 * @param {Object} data - 처리할 데이터
 * @returns {Object} 관계 필드가 처리된 데이터
 */
export const processRelationFields = (data) => {
  // 깊은 복사로 원본 데이터 유지
  const processedData = JSON.parse(JSON.stringify(data));

  // templateId 삭제
  if ('templateId' in processedData) {
    delete processedData.templateId;
  }

  // users 필드 처리 - 객체 배열을 ID 배열로 변환
  if (
    processedData.users &&
    Array.isArray(processedData.users) &&
    processedData.users.length > 0
  ) {
    if (
      typeof processedData.users[0] === 'object' &&
      processedData.users[0].id !== undefined
    ) {
      console.log(
        '>>> users 필드를 ID 배열로 변환합니다:',
        processedData.users,
      );
      processedData.users = processedData.users.map((user) => user.id);
      console.log('>>> 변환된 users 필드:', processedData.users);
    }
  }

  // 특정 키들의 id 값 추출
  const idExtractionKeys = [
    'importanceLevel',
    'fy',
    'pjtStatus',
    'service',
    'team',
    'customer',
    'coClassification',
    'businessScale',
    'region',
    'employee',
  ];

  idExtractionKeys.forEach((key) => {
    if (
      processedData[key] &&
      typeof processedData[key] === 'object' &&
      processedData[key].id !== undefined
    ) {
      processedData[key] = processedData[key].id;
    }
  });

  // businessType, funnel 같은 객체 배열 필드 처리
  const arrayIdExtractionKeys = ['businessType', 'funnel'];

  arrayIdExtractionKeys.forEach((key) => {
    if (
      processedData[key] &&
      Array.isArray(processedData[key]) &&
      processedData[key].length > 0
    ) {
      if (
        typeof processedData[key][0] === 'object' &&
        processedData[key][0].id !== undefined
      ) {
        processedData[key] = processedData[key].map((item) => item.id);
      }
    }
  });

  return processedData;
};
