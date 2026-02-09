/**
 * 날짜 범위 선택기 컴포넌트
 * 신청 시작일/마감일 범위 선택 및 프리셋 제공
 */
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar, FaTimes } from 'react-icons/fa';

/**
 * 날짜 프리셋 정의
 */
const DATE_PRESETS = {
    today: {
        label: '오늘',
        getValue: () => {
            const today = new Date();
            return { start: today, end: today };
        },
    },
    thisWeek: {
        label: '이번주',
        getValue: () => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const start = new Date(today);
            start.setDate(today.getDate() - dayOfWeek);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return { start, end };
        },
    },
    thisMonth: {
        label: '이번달',
        getValue: () => {
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { start, end };
        },
    },
    next7Days: {
        label: '7일 이내',
        getValue: () => {
            const today = new Date();
            const end = new Date(today);
            end.setDate(today.getDate() + 7);
            return { start: today, end };
        },
    },
    next30Days: {
        label: '30일 이내',
        getValue: () => {
            const today = new Date();
            const end = new Date(today);
            end.setDate(today.getDate() + 30);
            return { start: today, end };
        },
    },
    deadlineSoon: {
        label: '마감임박',
        getValue: () => {
            const today = new Date();
            const end = new Date(today);
            end.setDate(today.getDate() + 7);
            return { start: today, end };
        },
    },
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
};

/**
 * 날짜 범위 선택기 컴포넌트
 */
const DateRangePicker = ({ startDate, endDate, onChange, label = '신청 마감일' }) => {
    const [localStartDate, setLocalStartDate] = useState(startDate ? new Date(startDate) : null);
    const [localEndDate, setLocalEndDate] = useState(endDate ? new Date(endDate) : null);

    const handleStartDateChange = (date) => {
        setLocalStartDate(date);
        onChange({
            startDate: formatDate(date),
            endDate: formatDate(localEndDate),
        });
    };

    const handleEndDateChange = (date) => {
        setLocalEndDate(date);
        onChange({
            startDate: formatDate(localStartDate),
            endDate: formatDate(date),
        });
    };

    const handlePresetClick = (presetKey) => {
        const preset = DATE_PRESETS[presetKey];
        const { start, end } = preset.getValue();
        setLocalStartDate(start);
        setLocalEndDate(end);
        onChange({
            startDate: formatDate(start),
            endDate: formatDate(end),
        });
    };

    const handleClear = () => {
        setLocalStartDate(null);
        setLocalEndDate(null);
        onChange({
            startDate: null,
            endDate: null,
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {(localStartDate || localEndDate) && (
                    <button
                        onClick={handleClear}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                        <FaTimes className="h-3 w-3" />
                        초기화
                    </button>
                )}
            </div>

            {/* 프리셋 버튼 */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(DATE_PRESETS).map(([key, preset]) => (
                    <button
                        key={key}
                        onClick={() => handlePresetClick(key)}
                        className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* 날짜 선택기 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">시작일</label>
                    <div className="relative">
                        <DatePicker
                            selected={localStartDate}
                            onChange={handleStartDateChange}
                            selectsStart
                            startDate={localStartDate}
                            endDate={localEndDate}
                            maxDate={localEndDate}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="시작일 선택"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <FaCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-600 mb-1">종료일</label>
                    <div className="relative">
                        <DatePicker
                            selected={localEndDate}
                            onChange={handleEndDateChange}
                            selectsEnd
                            startDate={localStartDate}
                            endDate={localEndDate}
                            minDate={localStartDate}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="종료일 선택"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <FaCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* 선택된 범위 표시 */}
            {(localStartDate || localEndDate) && (
                <div className="text-sm text-gray-600 bg-blue-50 rounded px-3 py-2">
                    {localStartDate && formatDate(localStartDate)} ~{' '}
                    {localEndDate && formatDate(localEndDate)}
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
