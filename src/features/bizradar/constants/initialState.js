/**
 * BizRadar 초기 상태 및 상수 정의
 *
 * 분류 기준:
 * - Type A (Sales Lead): 마케팅, 영상제작, 웹사이트, 홍보 서비스 (서비스 공급)
 * - Type B (Project Lead): 미디어아트, 실감콘텐츠, 전시공간, SI 프로젝트 (프로젝트 수행)
 * - Type C (Growth Lead): R&D, 펀딩, 바우처, 인건비 지원 (기업 성장)
 * - Type D (Review): 모호하거나 복합적인 분류 (수동 검토 필요)
 * - Type F (Not Applicable): 해당없음 (산업 불일치, 지역 불일치, 초기창업 제한 등)
 */

// 지원 유형 정의
export const SUPPORT_TYPES = {
  A: {
    label: 'Type A',
    name: 'Sales Lead',
    description: '영업기회',
    detail: '마케팅, 영상제작, 웹사이트, 홍보 서비스',
    color: 'bg-green-100 text-green-800',
  },
  B: {
    label: 'Type B',
    name: 'Project Lead',
    description: '프로젝트',
    detail: '미디어아트, 실감콘텐츠, 전시공간, SI',
    color: 'bg-blue-100 text-blue-800',
  },
  C: {
    label: 'Type C',
    name: 'Growth Lead',
    description: '성장지원',
    detail: 'R&D, 펀딩, 바우처, 인건비 지원',
    color: 'bg-yellow-100 text-yellow-800',
  },
  D: {
    label: 'Type D',
    name: 'Review',
    description: '검토필요',
    detail: '모호하거나 복합적인 분류',
    color: 'bg-orange-100 text-orange-800',
  },
  F: {
    label: 'Type F',
    name: 'Not Applicable',
    description: '해당없음',
    detail: '산업/지역 불일치, 초기창업 제한',
    color: 'bg-gray-100 text-gray-500',
  },
};

// 지원 유형 색상 맵
export const SUPPORT_TYPE_COLORS = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-gray-100 text-gray-500',
};

// 신뢰도 정의
export const CONFIDENCE_LEVELS = {
  High: { label: '높음', color: 'bg-green-100 text-green-800' },
  Medium: { label: '보통', color: 'bg-yellow-100 text-yellow-800' },
  Low: { label: '낮음', color: 'bg-red-100 text-red-800' },
};

// 접수 상태 정의
export const SUBMISSION_STATUS = {
  접수중: { label: '접수중', color: 'bg-blue-100 text-blue-800' },
  마감임박: { label: '마감임박', color: 'bg-red-100 text-red-800' },
  마감: { label: '마감', color: 'bg-gray-100 text-gray-800' },
  예정: { label: '예정', color: 'bg-purple-100 text-purple-800' },
};

// 확정 상태 정의
export const CONFIRMATION_STATUS = {
  pending: { label: '검토대기', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmed: { label: '확정완료', color: 'bg-green-100 text-green-800', icon: '✓' },
  rejected: { label: '재검토', color: 'bg-red-100 text-red-800', icon: '✗' },
};

// 프로젝트 상태 정의 (진행중/과거)
export const PROJECT_STATUS = {
  active: { label: '진행중', color: 'bg-blue-100 text-blue-800', description: '현재 진행중인 사업' },
  archived: { label: '과거', color: 'bg-gray-100 text-gray-600', description: '마감된 사업' },
};

// 데이터 출처 정의
export const DATA_SOURCES = {
  all: { label: '전체', value: '', description: '모든 출처' },
  gntp: { label: 'GNTP', value: 'gntp', description: '경남테크노파크' },
  mss: { label: 'MSS', value: 'mss', description: '중소벤처기업부' },
  gyeongnam: { label: '경남', value: 'gyeongnam', description: '경상남도' },
  bizinfo: { label: 'BizInfo', value: 'bizinfo', description: '기업마당' },
};

// 출처 목록 (탭 표시용)
export const SOURCE_LIST = ['all', 'gntp', 'mss', 'gyeongnam', 'bizinfo'];

// 기본 페이지네이션
export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 20,
  total: 0,
};

// 기본 필터 (API 파라미터와 일치)
export const DEFAULT_FILTERS = {
  source: null,      // 출처 (gntp, mss, gyeongnam, bizinfo)
  type: null,        // 지원유형 (A,B,C,D,F - 쉼표 구분)
  region: null,      // 지역 (부분 일치)
  min_date: null,    // 마감일 최소값 (YYYY-MM-DD)
  keyword: '',       // 검색 키워드 (프론트엔드 전용)
  project_status: 'active', // 프로젝트 상태 (active/archived/all)
};

// 테이블 컬럼 정의
export const TABLE_COLUMNS = [
  { key: 'id', title: 'ID', width: 60, align: 'center' },
  { key: 'source', title: '출처', width: 100, align: 'center' },
  { key: 'title', title: '공고명', width: 300, align: 'left', essential: true },
  { key: 'confirmed_category', title: '유형', width: 80, align: 'center', essential: true },
  { key: 'region', title: '지역', width: 80, align: 'center' },
  { key: 'period', title: '신청기간', width: 120, align: 'center' },
  { key: 'created_at', title: '등록일', width: 100, align: 'center' },
  { key: 'submission_status', title: '접수상태', width: 80, align: 'center' },
  { key: 'confidence', title: '신뢰도', width: 80, align: 'center' },
];

// 수정 가능한 필드
export const EDITABLE_FIELDS = ['tags', 'summary', 'submission_status', 'confirmed_category'];

export default {
  SUPPORT_TYPES,
  SUPPORT_TYPE_COLORS,
  CONFIDENCE_LEVELS,
  SUBMISSION_STATUS,
  CONFIRMATION_STATUS,
  PROJECT_STATUS,
  DATA_SOURCES,
  SOURCE_LIST,
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  TABLE_COLUMNS,
  EDITABLE_FIELDS,
};
