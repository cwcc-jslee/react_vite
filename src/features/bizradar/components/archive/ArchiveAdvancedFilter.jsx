import React, { useState } from 'react';
import { Card, Button, Input, Select } from '@components/ui';
import { FaSearch, FaFilter } from 'react-icons/fa';

const ArchiveAdvancedFilter = ({ onSearch }) => {
    const [filters, setFilters] = useState({
        year: '2026',
        type: 'all',
        result: 'all',
        customer: '',
        keyword: '',
    });

    const handleChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        if (onSearch) onSearch(filters);
    };

    return (
        <Card className="p-4 mb-6 bg-white">
            <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
                <div className="flex flex-wrap gap-3 flex-1">
                    {/* Year */}
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">연도/기간</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                            value={filters.year}
                            onChange={(e) => handleChange('year', e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    {/* Type */}
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">사업 유형</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                            value={filters.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="A">Type A</option>
                            <option value="B">Type B</option>
                            <option value="C">Type C</option>
                        </select>
                    </div>

                    {/* Result */}
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">진행 결과</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                            value={filters.result}
                            onChange={(e) => handleChange('result', e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="Win">선정 (Win)</option>
                            <option value="Loss">탈락 (Loss)</option>
                            <option value="Drop">중도포기 (Drop)</option>
                        </select>
                    </div>

                    {/* Customer */}
                    <div className="w-40">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">고객사</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="고객사명"
                            value={filters.customer}
                            onChange={(e) => handleChange('customer', e.target.value)}
                        />
                    </div>

                    {/* Keyword */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">키워드 (태그, 공고명)</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded pl-8 pr-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="예: #AI, #메타버스, 바우처 사업"
                                value={filters.keyword}
                                onChange={(e) => handleChange('keyword', e.target.value)}
                            />
                            <FaSearch className="absolute left-2.5 top-2 text-gray-400 w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-1 text-gray-600 border-gray-300 hover:bg-gray-50">
                        <FaFilter className="w-3 h-3" /> 초기화
                    </Button>
                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
                        <FaSearch className="w-3 h-3" /> 검색
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ArchiveAdvancedFilter;
