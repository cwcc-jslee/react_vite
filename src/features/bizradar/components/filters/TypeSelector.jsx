/**
 * Type 선택기 컴포넌트
 * A/B/C/D/F 타입을 버튼 형태로 선택
 */
import React from 'react';
import { SUPPORT_TYPES } from '../../constants/initialState';

/**
 * Type 버튼 컴포넌트
 */
const TypeButton = ({ type, isSelected, onClick, count }) => {
    const config = SUPPORT_TYPES[type];
    if (!config) return null;

    const getColorClasses = () => {
        const baseClasses = 'transition-all duration-200';
        switch (type) {
            case 'A':
                return isSelected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
            case 'B':
                return isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
            case 'C':
                return isSelected
                    ? 'bg-yellow-600 text-white border-yellow-600'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
            case 'D':
                return isSelected
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
            case 'F':
                return isSelected
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
        }
    };

    return (
        <button
            onClick={() => onClick(type)}
            className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg border-2 ${getColorClasses()} min-w-[100px]`}
            title={config.detail}
        >
            <span className="text-lg font-bold mb-1">{config.label}</span>
            <span className="text-xs font-medium mb-1">{config.description}</span>
            {count !== undefined && (
                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {count}건
                </span>
            )}
        </button>
    );
};

/**
 * Type 선택기 메인 컴포넌트
 */
const TypeSelector = ({ selectedTypes = [], onChange, stats }) => {
    const handleTypeClick = (type) => {
        let newSelection;
        if (selectedTypes.includes(type)) {
            // 이미 선택된 경우 제거
            newSelection = selectedTypes.filter((t) => t !== type);
        } else {
            // 선택되지 않은 경우 추가
            newSelection = [...selectedTypes, type];
        }
        onChange(newSelection);
    };

    const handleSelectAll = () => {
        onChange(['A', 'B', 'C', 'D', 'F']);
    };

    const handleClear = () => {
        onChange([]);
    };

    const handleSelectValid = () => {
        onChange(['A', 'B', 'C']);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">지원 유형</label>
                <div className="flex gap-2">
                    <button
                        onClick={handleSelectValid}
                        className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    >
                        유효사업만 (A+B+C)
                    </button>
                    <button
                        onClick={handleSelectAll}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        전체 선택
                    </button>
                    <button
                        onClick={handleClear}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        선택 해제
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {['A', 'B', 'C', 'D', 'F'].map((type) => (
                    <TypeButton
                        key={type}
                        type={type}
                        isSelected={selectedTypes.includes(type)}
                        onClick={handleTypeClick}
                        count={stats?.byType?.[type]}
                    />
                ))}
            </div>

            {selectedTypes.length > 0 && (
                <div className="text-sm text-gray-600">
                    <span className="font-medium">{selectedTypes.length}개</span> 유형 선택됨:{' '}
                    {selectedTypes.join(', ')}
                </div>
            )}
        </div>
    );
};

export default TypeSelector;
