/**
 * 프로젝트 검색 기능을 위한 커스텀 훅
 * useProjectStore와 연동되어 검색 상태를 관리합니다.
 *
 * @returns {Object} {
 *   handleSearch: () => void - 검색 실행 함수
 *   handleReset: () => void - 검색 초기화 함수
 *   buildFilters: (formData) => Object - 필터 객체 생성 함수
 *   filters: Object - 현재 필터 상태
 *   isFetching: boolean - 검색 중 여부
 *   error: string | null - 에러 메시지
 *   searchFormData: Object - 검색 폼 데이터
 *   handleInputChange: (e: Event) => void - 입력 필드 변경 핸들러
 *   handleCustomerSelect: (customer: Object) => void - 고객사 선택 핸들러
 *   handleStatusFilter: (status: string) => void - 상태 필터 핸들러
 *   handleProgressFilter: (progress: string) => void - 진행률 필터 핸들러
 * }
 */
import { useState } from 'react';
import { useProjectStore } from './useProjectStore';

// 초기 폼 데이터
const INIT_FORM_DATA = {
  // 1열
  projectType: '',
  fy: '',
  isClosed: '',
  pjtStatus: '',
  // 2열
  customer: '',
  name: '',
  startDate: null,
  endDate: null,
  // 3열
  team: '',
  service: '',
  sfa: '', // SFA input (단일 필드)
  importanceLevel: '',
};

export const useProjectSearch = () => {
  const { filters, status, error, actions } = useProjectStore();
  const [searchFormData, setSearchFormData] = useState({
    ...INIT_FORM_DATA,
  });

  /**
   * 입력 필드 변경 처리
   * @param {Event} e - 이벤트 객체
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSearchFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      console.log('**** searchFormData updated ****', updated);

      // 폼 업데이트시 즉시 필터 업데이트 및 검색 실행
      setTimeout(() => {
        const filters = buildFilters(updated);
        actions.filter.replaceFilters(filters);
        actions.getProjectList();
      }, 0);

      return updated;
    });
  };

  /**
   * 고객사 선택 핸들러
   * @param {Object} customer - 선택된 고객사 정보
   */
  const handleCustomerSelect = (customer) => {
    setSearchFormData((prev) => {
      const updated = {
        ...prev,
        customer: customer.id,
      };
      console.log('**** searchFormData updated (customer) ****', updated);

      // 고객사 선택시 즉시 필터 업데이트 및 검색 실행
      setTimeout(() => {
        const filters = buildFilters(updated);
        actions.filter.replaceFilters(filters);
        actions.getProjectList();
      }, 0);

      return updated;
    });
  };

  /**
   * 필터 객체 생성
   * @param {Object} formData - 폼 데이터
   * @returns {Object} 필터 객체
   */
  const buildFilters = (formData) => {
    const filters = {};

    // 1열: 필수 필터
    // 프로젝트 타입
    if (formData.projectType) {
      filters.project_type = { $eq: formData.projectType };
    }

    // 프로젝트 상태
    if (formData.pjtStatus) {
      filters.pjt_status = { $eq: parseInt(formData.pjtStatus) };
    }

    // 기준일자 (시작/종료)
    if (formData.startDate && formData.endDate) {
      filters.created_at = {
        $gte: formData.startDate,
        $lte: formData.endDate,
      };
    }

    // 2열: 기본 정보
    // 고객사
    if (formData.customer) {
      filters.customer = { id: { $eq: formData.customer } };
    }

    // 건명
    if (formData.name) {
      filters.name = { $contains: formData.name };
    }

    // 사업부
    if (formData.team) {
      filters.team = { id: { $eq: formData.team } };
    }

    // 서비스
    if (formData.service) {
      filters.service = { id: { $eq: formData.service } };
    }

    // 선택사항
    // FY
    if (formData.fy) {
      filters.fy = { $eq: formData.fy };
    }

    // 종료여부
    if (formData.isClosed !== '') {
      filters.is_closed = { $eq: formData.isClosed === 'true' };
    }

    // SFA (단일 input)
    if (formData.sfa) {
      filters.sfa = {
        name: { $contains: formData.sfa },
      };
    }

    // 중요도
    if (formData.importanceLevel) {
      filters.importance_level = { $eq: formData.importanceLevel };
    }

    return filters;
  };

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = () => {
    console.log('**** searchFormData ****', searchFormData);
    const filters = buildFilters(searchFormData);
    console.log('**** built filters ****', filters);

    // Redux에 필터 저장 (완전 대체)
    actions.filter.replaceFilters(filters);

    // 프로젝트 목록 조회 (저장된 filters 사용)
    actions.getProjectList();
  };

  /**
   * 검색 초기화 핸들러
   */
  const handleReset = () => {
    setSearchFormData({
      ...INIT_FORM_DATA,
    });

    // 기본 필터 (종료여부: 진행중) 적용
    const defaultFilters = buildFilters(INIT_FORM_DATA);

    // Redux에 기본 필터 저장 (완전 대체)
    actions.filter.replaceFilters(defaultFilters);

    // 프로젝트 목록 조회 (기본 필터 사용)
    actions.getProjectList();
  };

  /**
   * 도넛 차트 상태 필터 핸들러
   * @param {string} status - 프로젝트 상태
   */
  const handleStatusFilter = (status) => {
    if (status !== '') {
      const filters = {
        pjt_status: { $eq: parseInt(status) },
      };
      actions.filter.replaceFilters(filters);
      actions.getProjectList();
    } else {
      actions.filter.resetFilters();
      actions.getProjectList();
    }
  };

  /**
   * 활성 필터 목록 생성
   * @returns {Array} 활성 필터 배열
   */
  const getActiveFilters = () => {
    const activeFilters = [];

    if (searchFormData.projectType) {
      const typeLabel =
        searchFormData.projectType === 'revenue' ? '매출' : '투자';
      activeFilters.push({
        key: 'projectType',
        label: '프로젝트타입',
        value: typeLabel,
      });
    }
    if (searchFormData.pjtStatus) {
      activeFilters.push({
        key: 'pjtStatus',
        label: '프로젝트상태',
        value: searchFormData.pjtStatus,
      });
    }
    if (searchFormData.name) {
      activeFilters.push({
        key: 'name',
        label: '건명',
        value: searchFormData.name,
      });
    }
    if (searchFormData.team) {
      activeFilters.push({
        key: 'team',
        label: '사업부',
        value: searchFormData.team,
      });
    }
    if (searchFormData.service) {
      activeFilters.push({
        key: 'service',
        label: '서비스',
        value: searchFormData.service,
      });
    }
    if (searchFormData.fy) {
      activeFilters.push({ key: 'fy', label: 'FY', value: searchFormData.fy });
    }
    if (searchFormData.isClosed !== '') {
      const statusLabel =
        searchFormData.isClosed === 'false' ? '진행중' : '종료';
      activeFilters.push({
        key: 'isClosed',
        label: '종료여부',
        value: statusLabel,
      });
    }
    if (searchFormData.sfa) {
      activeFilters.push({
        key: 'sfa',
        label: 'SFA',
        value: searchFormData.sfa,
      });
    }
    if (searchFormData.importanceLevel) {
      activeFilters.push({
        key: 'importanceLevel',
        label: '중요도',
        value: searchFormData.importanceLevel,
      });
    }

    return activeFilters;
  };

  /**
   * 특정 필터 제거
   * @param {string} filterKey - 제거할 필터 키
   */
  const removeFilter = (filterKey) => {
    setSearchFormData((prev) => ({
      ...prev,
      [filterKey]: filterKey === 'isClosed' ? '' : '',
    }));

    // 필터 제거 후 자동 검색
    setTimeout(() => {
      const updatedFormData = { ...searchFormData, [filterKey]: '' };
      const filters = buildFilters(updatedFormData);

      // Redux에 필터 저장 (완전 대체)
      actions.filter.replaceFilters(filters);

      // 프로젝트 목록 조회
      actions.getProjectList();
    }, 0);
  };

  /**
   * 빠른 필터 적용
   * @param {string} filterType - 빠른 필터 타입
   */
  const applyQuickFilter = (filterType) => {
    let quickFilterData = { ...INIT_FORM_DATA };

    switch (filterType) {
      case 'inProgress':
        // 진행중인 프로젝트 (pjt_status = 88, is_closed = false)
        quickFilterData.pjtStatus = '88';
        quickFilterData.isClosed = 'false';
        break;
      case 'thisMonth':
        // 이번 달 시작 프로젝트
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        quickFilterData.startDate = firstDay.toISOString().split('T')[0];
        quickFilterData.endDate = lastDay.toISOString().split('T')[0];
        break;
      case 'revenue':
        // 매출 프로젝트 (진행중)
        quickFilterData.projectType = 'revenue';
        quickFilterData.isClosed = 'false';
        break;
      case 'investment':
        // 투자 프로젝트 (진행중)
        quickFilterData.projectType = 'investment';
        quickFilterData.isClosed = 'false';
        break;
      default:
        break;
    }

    setSearchFormData(quickFilterData);

    // 빠른 필터 적용 후 자동 검색
    setTimeout(() => {
      const filters = buildFilters(quickFilterData);

      // Redux에 필터 저장 (완전 대체)
      actions.filter.replaceFilters(filters);

      // 프로젝트 목록 조회
      actions.getProjectList();
    }, 0);
  };

  return {
    handleSearch,
    handleReset,
    buildFilters,
    filters,
    isFetching: status === 'loading',
    error,
    searchFormData,
    handleInputChange,
    handleCustomerSelect,
    handleStatusFilter,
    getActiveFilters,
    removeFilter,
    applyQuickFilter,
  };
};
