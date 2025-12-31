// src/features/sfa/components/filters/QuickDateFilter.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * 빠른 날짜 필터 컴포넌트
 * 날짜 범위 표시 및 월 이동 기능 제공
 *
 * @component
 * @param {Object} props
 * @param {string} props.viewMode - 현재 뷰 모드 ('overview' | 'search')
 * @param {Function} props.onViewModeChange - 뷰 모드 변경 핸들러
 * @param {boolean} props.showAnnualRange - 연간 범위 표시 여부 (12개월)
 */
const QuickDateFilter = ({ viewMode = 'overview', onViewModeChange, showAnnualRange = false }) => {
  const { filters, actions } = useSfaStore();
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef(null);
  const selectedMonthRef = useRef(null);

  // 현재 선택된 날짜 범위
  const currentStartDate = filters.dateRange?.startDate || dayjs().startOf('month').format('YYYY-MM-DD');
  const currentEndDate = filters.dateRange?.endDate || dayjs().endOf('month').format('YYYY-MM-DD');

  // 프리셋 필터 핸들러
  const handlePresetFilter = (preset) => {
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = dayjs().format('YYYY-MM-DD');
        endDate = dayjs().format('YYYY-MM-DD');
        break;
      case 'thisWeek':
        startDate = dayjs().startOf('week').format('YYYY-MM-DD');
        endDate = dayjs().endOf('week').format('YYYY-MM-DD');
        break;
      case 'thisMonth':
        startDate = dayjs().startOf('month').format('YYYY-MM-DD');
        endDate = dayjs().endOf('month').format('YYYY-MM-DD');
        break;
      case 'lastMonth':
        startDate = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        endDate = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'nextMonth':
        startDate = dayjs().add(1, 'month').startOf('month').format('YYYY-MM-DD');
        endDate = dayjs().add(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'thisQuarter':
        startDate = dayjs().startOf('quarter').format('YYYY-MM-DD');
        endDate = dayjs().endOf('quarter').format('YYYY-MM-DD');
        break;
      case 'thisYear':
        startDate = dayjs().startOf('year').format('YYYY-MM-DD');
        endDate = dayjs().endOf('year').format('YYYY-MM-DD');
        break;
      default:
        return;
    }

    actions.filter.updateDateRange(startDate, endDate);
  };

  // 월 이동 핸들러
  const handleMonthNavigation = (direction) => {
    const currentMonth = dayjs(currentStartDate);
    const targetMonth = direction === 'prev'
      ? currentMonth.subtract(1, 'month')
      : currentMonth.add(1, 'month');

    const startDate = targetMonth.startOf('month').format('YYYY-MM-DD');
    const endDate = targetMonth.endOf('month').format('YYYY-MM-DD');

    actions.filter.updateDateRange(startDate, endDate);
  };

  // 현재 기간 포맷
  const currentPeriodLabel = () => {
    const start = dayjs(currentStartDate);
    const end = dayjs(currentEndDate);

    if (start.isSame(end, 'day')) {
      return start.format('YYYY년 MM월 DD일');
    }

    if (start.isSame(end, 'month')) {
      return start.format('YYYY년 MM월');
    }

    return `${start.format('YYYY.MM.DD')} - ${end.format('YYYY.MM.DD')}`;
  };

  // 연간 기간 포맷 (12개월 범위 표시용)
  const annualPeriodLabel = () => {
    const start = dayjs(currentStartDate);
    const end = start.add(11, 'month'); // 시작월부터 11개월 후
    return `${start.format('YYYY년 MM월')} - ${end.format('YYYY년 MM월')}`;
  };

  // 월 선택 핸들러
  const handleMonthSelect = (yearMonth) => {
    const date = dayjs(yearMonth);
    const startDate = date.startOf('month').format('YYYY-MM-DD');
    const endDate = date.endOf('month').format('YYYY-MM-DD');
    actions.filter.updateDateRange(startDate, endDate);
    setShowMonthPicker(false);
  };

  // 월 선택기 생성 (현재 년도 기준 ±1년)
  const generateMonthOptions = () => {
    const options = [];
    const today = dayjs(); // 현재 날짜
    const currentYear = today.year();
    const startYear = currentYear - 1;
    const endYear = currentYear + 1;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        options.push({
          value: `${year}-${String(month).padStart(2, '0')}`,
          label: `${year}년 ${month}월`,
        });
      }
    }
    return options;
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false);
      }
    };

    if (showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthPicker]);

  // 드롭다운 열릴 때 선택된 월로 스크롤
  useEffect(() => {
    if (showMonthPicker && selectedMonthRef.current) {
      selectedMonthRef.current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, [showMonthPicker]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        {/* 왼쪽: 현재 기간 표시 및 월 이동 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-gray-700 relative" ref={monthPickerRef}>
            <Calendar size={16} />
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              {showAnnualRange ? annualPeriodLabel() : currentPeriodLabel()}
            </button>

            {/* 월 선택 드롭다운 */}
            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto w-40">
                {generateMonthOptions().map((option) => {
                  const isSelected = option.value === dayjs(currentStartDate).format('YYYY-MM');
                  return (
                    <button
                      key={option.value}
                      ref={isSelected ? selectedMonthRef : null}
                      onClick={() => handleMonthSelect(option.value)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleMonthNavigation('prev')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="이전 달"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleMonthNavigation('next')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="다음 달"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 오른쪽: 뷰 모드 전환 버튼 (optional) */}
        {onViewModeChange && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewModeChange('overview')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewMode === 'overview'
                  ? 'text-blue-700 bg-blue-50 border border-blue-300'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              현황
            </button>
            <button
              onClick={() => onViewModeChange('search')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewMode === 'search'
                  ? 'text-blue-700 bg-blue-50 border border-blue-300'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              상세검색
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickDateFilter;
