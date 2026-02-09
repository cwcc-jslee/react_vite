/**
 * 일괄 작업 바
 * 선택된 항목에 대한 일괄 작업 수행
 */
import React, { useState } from 'react';
import { FaDownload, FaEdit, FaTimes } from 'react-icons/fa';
import { SUPPORT_TYPES } from '../../constants/initialState';

/**
 * 일괄 작업 바 컴포넌트
 */
const BulkActionBar = ({ selectedCount, selectedIds, onExport, onBulkUpdate, onClearSelection }) => {
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [selectedType, setSelectedType] = useState('');

    const handleBulkTypeChange = () => {
        if (!selectedType) {
            alert('변경할 유형을 선택해주세요.');
            return;
        }
        if (confirm(`선택한 ${selectedCount}개 항목을 ${SUPPORT_TYPES[selectedType]?.label}로 변경하시겠습니까?`)) {
            onBulkUpdate(selectedIds, { confirmed_category: selectedType });
            setShowTypeSelector(false);
            setSelectedType('');
        }
    };

    if (selectedCount === 0) return null;

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">
                        {selectedCount}개 항목 선택됨
                    </span>
                    <button
                        onClick={onClearSelection}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        선택 해제
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* 엑셀 내보내기 */}
                    <button
                        onClick={() => onExport(selectedIds)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <FaDownload className="h-4 w-4" />
                        엑셀 내보내기
                    </button>

                    {/* 일괄 유형 변경 */}
                    {showTypeSelector ? (
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">유형 선택</option>
                                {['A', 'B', 'C', 'D', 'F'].map((type) => (
                                    <option key={type} value={type}>
                                        {SUPPORT_TYPES[type]?.label} - {SUPPORT_TYPES[type]?.description}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleBulkTypeChange}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                적용
                            </button>
                            <button
                                onClick={() => {
                                    setShowTypeSelector(false);
                                    setSelectedType('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowTypeSelector(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaEdit className="h-4 w-4" />
                            유형 일괄 변경
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkActionBar;
