// src/features/sfa/components/filters/QuickDateFilter.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
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
 * @param {string} props.annualBaseDate - 연간 범위 기준일 (외부 상태로 관리)
 * @param {Function} props.onAnnualDateChange - 연간 범위 날짜 변경 핸들러
 */
const QuickDateFilter = ({
  viewMode = 'overview',
  onViewModeChange,
  showAnnualRange = false,
  annualBaseDate,
  onAnnualDateChange,
  duration = 12,
  onDurationChange,
  onDownload
}) => {
  const { filters, actions } = useSfaStore();
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef(null);
  const selectedMonthRef = useRef(null);

  // 현재 선택된 날짜 범위 (연간 범위 모드일 경우 prop 사용, 아니면 전역 필터 사용)
  const currentStartDate = showAnnualRange && annualBaseDate
    ? annualBaseDate
    : filters.dateRange?.startDate || dayjs().startOf('month').format('YYYY-MM-DD');
  const currentEndDate = showAnnualRange && annualBaseDate
    ? dayjs(annualBaseDate).endOf('month').format('YYYY-MM-DD')
    : filters.dateRange?.endDate || dayjs().endOf('month').format('YYYY-MM-DD');

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

    // 연간 범위 모드일 경우 콜백 호출, 아니면 전역 필터 업데이트
    if (showAnnualRange && onAnnualDateChange) {
      onAnnualDateChange(startDate, endDate);
    } else {
      actions.filter.updateDateRange(startDate, endDate);
    }
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
    const end = start.add(duration - 1, 'month'); // 시작월부터 duration-1개월 후
    return `${start.format('YYYY년 MM월')} - ${end.format('YYYY년 MM월')}`;
  };

  // 월 선택 핸들러
  const handleMonthSelect = (yearMonth) => {
    const date = dayjs(yearMonth);
    const startDate = date.startOf('month').format('YYYY-MM-DD');
    const endDate = date.endOf('month').format('YYYY-MM-DD');

    // 연간 범위 모드일 경우 콜백 호출, 아니면 전역 필터 업데이트
    if (showAnnualRange && onAnnualDateChange) {
      onAnnualDateChange(startDate, endDate);
    } else {
      actions.filter.updateDateRange(startDate, endDate);
    }
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

        {/* 오른쪽: 뷰 모드 전환 버튼 및 기간 선택 드롭다운 */}
        <div className="flex items-center gap-1">
          {/* 엑셀 다운로드 버튼 (추가) */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-all"
              title="엑셀 다운로드"
            >
              <Download size={16} />
            </button>
          )}

          {/* 1. 현황 관련 (독립 버튼 또는 개월 드롭다운) */}
          {onViewModeChange && (
            <>
              {/* SfaOverviewLayout용 독립 현황 버튼 */}
              {!showAnnualRange && (
                <button
                  onClick={() => onViewModeChange('overview')}
                  className={`w-20 h-8 text-sm font-bold rounded transition-all flex items-center justify-center border ${
                    viewMode === 'overview'
                      ? 'text-blue-700 bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  현황
                </button>
              )}

              {/* SfaForecastLayout용 개월 선택 드롭다운 통합 버튼 */}
              {showAnnualRange && onDurationChange && (
                <div className="">
                  {viewMode === 'search' ? (
                    <button
                      onClick={() => onViewModeChange('overview')}
                      className="w-20 h-8 border border-gray-300 rounded text-sm font-bold bg-white text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-all"
                      title="현황 보기 및 기간 선택"
                    >
                      {duration}개월
                    </button>
                  ) : (
                    <select
                      value={duration}
                      onChange={onDurationChange}
                      className="w-20 h-8 px-1 py-0 border border-blue-300 rounded text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-700 cursor-pointer transition-all appearance-none text-center"
                      title="조회 기간 선택 (월)"
                    >
                      {[4, 6, 9, 12].map((num) => (
                        <option key={num} value={num} className="font-medium">
                          {num}개월
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </>
          )}

          {/* 2. 상세검색 버튼 (항상 마지막에 위치) */}
          {onViewModeChange && (
            <button
              onClick={() => onViewModeChange('search')}
              className={`w-20 h-8 text-sm font-bold rounded transition-all flex items-center justify-center border ${
                viewMode === 'search'
                  ? 'text-blue-700 bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              상세검색
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickDateFilter;
