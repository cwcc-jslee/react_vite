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
  name: '',
  customer: '',
  fy: '',
  team: '',
  pjtStatus: '',
  importanceLevel: '',
  projectType: '',
  dateRange: {
    startDate: null,
    endDate: null,
  },
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

    if (name === 'startDate' || name === 'endDate') {
      setSearchFormData((prev) => {
        const updated = {
          ...prev,
          dateRange: {
            ...prev.dateRange,
            [name]: value,
          },
        };
        console.log('**** searchFormData updated (dateRange) ****', updated);
        return updated;
      });
    } else {
      setSearchFormData((prev) => {
        const updated = {
          ...prev,
          [name]: value,
        };
        console.log('**** searchFormData updated ****', updated);
        return updated;
      });
    }
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

    // 건명 필터
    if (formData.name) {
      filters.name = { $contains: formData.name };
    }

    // 고객사 필터
    if (formData.customer) {
      filters.customer = { id: { $eq: formData.customer } };
    }

    // 사업부 필터
    if (formData.team) {
      filters.team = { id: { $eq: formData.team } };
    }

    // FY 필터
    if (formData.fy) {
      filters.fy = { $eq: formData.fy };
    }

    // 프로젝트 상태 필터
    if (formData.pjtStatus) {
      filters.pjt_status = { $eq: parseInt(formData.pjtStatus) };
    }

    // 중요도 필터
    if (formData.importanceLevel) {
      filters.importance_level = { $eq: formData.importanceLevel };
    }

    // 프로젝트유형 필터
    if (formData.projectType) {
      filters.project_type = { $eq: formData.projectType };
    }

    // 진행률 필터
    if (formData.projectProgress) {
      const [min, max] = formData.projectProgress.split(',').map(Number);
      filters.project_progress = {
        $gte: min,
        $lte: max,
      };
    }

    // 날짜 범위 필터
    if (formData.dateRange?.startDate && formData.dateRange?.endDate) {
      filters.created_at = {
        $gte: formData.dateRange.startDate,
        $lte: formData.dateRange.endDate,
      };
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
    actions.getProjectList({ filters });
  };

  /**
   * 검색 초기화 핸들러
   */
  const handleReset = () => {
    setSearchFormData({
      ...INIT_FORM_DATA,
    });
    actions.getProjectList({ filters: {} });
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
  };
};
