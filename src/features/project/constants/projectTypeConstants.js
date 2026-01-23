// src/features/project/constants/projectTypeConstants.js

/**
 * 프로젝트 유형(Revenue Type) 및 작업 유형(Work Type) 상수 정의
 * - 코드, 라벨, 뱃지 스타일 매핑
 */

// ============================================================
// 1. 매출 유형 (Project Type / Revenue Type)
// ============================================================

export const PROJECT_TYPE = {
  REVENUE: {
    code: 'revenue',
    label: '매출',
    colorClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  INVESTMENT: {
    code: 'investment',
    label: '투자',
    colorClass: 'bg-purple-100 text-purple-700 border-purple-200',
  },
};

/**
 * 매출 유형 코드로 정보 조회
 * @param {string} code - revenue | investment
 * @returns {object} { code, label, colorClass }
 */
export const getProjectTypeInfo = (code) => {
  const type = Object.values(PROJECT_TYPE).find((t) => t.code === code);
  return type || { code, label: code, colorClass: 'bg-gray-100 text-gray-700' };
};

// ============================================================
// 2. 작업 유형 (Work Type)
// ============================================================

export const WORK_TYPE = {
  PROJECT: {
    code: 'project',
    label: '프로젝트',
    colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  TASK: {
    code: 'task',
    label: '단순작업',
    colorClass: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  MAINTENANCE: {
    code: 'maintenance',
    label: '유지보수',
    colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

/**
 * 작업 유형 코드로 정보 조회
 * @param {string} code - project | task | maintenance
 * @returns {object} { code, label, colorClass }
 */
export const getWorkTypeInfo = (code) => {
  const type = Object.values(WORK_TYPE).find((t) => t.code === code);
  return (
    type || {
      code,
      label: code || '미지정',
      colorClass: 'bg-gray-100 text-gray-700',
    }
  );
};

// ============================================================
// 3. 옵션 목록 (Select UI 등에서 사용)
// ============================================================

export const PROJECT_TYPE_OPTIONS = Object.values(PROJECT_TYPE).map((t) => ({
  value: t.code,
  label: t.label,
}));

export const WORK_TYPE_OPTIONS = [
  { value: '', label: '선택하세요' },
  ...Object.values(WORK_TYPE).map((t) => ({
    value: t.code,
    label: t.label,
  })),
];
