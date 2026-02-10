import React from 'react';
import { Button, Input } from '@components/ui';
import { FaSearch, FaFilter, FaList, FaThLarge } from 'react-icons/fa';
import { MdViewKanban } from 'react-icons/md';

const MatchingControlBar = ({ viewMode, onViewModeChange, onFilterChange }) => {
    return (
        <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="bg-gray-100 p-1 rounded-md flex text-xs font-medium">
                    <button
                        onClick={() => onViewModeChange('board')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded ${viewMode === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MdViewKanban /> 보드
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaList /> 리스트
                    </button>
                </div>

                <div className="h-4 w-px bg-gray-300"></div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" onChange={(e) => onFilterChange('myLeads', e.target.checked)} />
                        <span>내 프로젝트</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-red-600 font-medium cursor-pointer hover:bg-red-50 px-2 py-1 rounded">
                        <input type="checkbox" className="rounded text-red-600 focus:ring-red-500" onChange={(e) => onFilterChange('urgent', e.target.checked)} />
                        <span>긴급 (D-3)</span>
                    </label>
                </div>
            </div>

            {/* Search */}
            <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="고객사명, 공고명 검색..."
                    onChange={(e) => onFilterChange('keyword', e.target.value)}
                />
            </div>
        </div>
    );
};

export default MatchingControlBar;
