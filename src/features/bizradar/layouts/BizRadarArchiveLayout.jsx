import React, { useState } from 'react';
import { Section } from '@shared/layout/components';
import ArchiveYearlySummary from '../components/archive/ArchiveYearlySummary';
import ArchiveAdvancedFilter from '../components/archive/ArchiveAdvancedFilter';
import ArchiveDataGrid from '../components/archive/ArchiveDataGrid';
import ArchiveRetrospectiveModal from '../components/archive/ArchiveRetrospectiveModal';

const BizRadarArchiveLayout = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'group'

    const handleSearch = (filters) => {
        console.log('Search filters:', filters);
        // TODO: Implement API call with filters
    };

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="space-y-6">
            {/* Section A: Yearly Summary */}
            <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">연도별 성과 요약</h2>
                <ArchiveYearlySummary />
            </section>

            {/* Section B: Advanced Filter */}
            <section>
                <ArchiveAdvancedFilter onSearch={handleSearch} />
            </section>

            {/* Section C: Data Grid */}
            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-lg font-bold text-gray-800">아카이브 목록</h2>
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-1 rounded-md flex text-xs font-medium">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                제안별 보기
                            </button>
                            <button
                                onClick={() => setViewMode('group')}
                                className={`px-3 py-1 rounded ${viewMode === 'group' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                공고별 묶어보기
                            </button>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <button className="text-sm text-gray-500 hover:text-blue-600 underline">
                            엑셀 다운로드
                        </button>
                    </div>
                </div>
                <ArchiveDataGrid onRowClick={handleRowClick} viewMode={viewMode} />
            </section>

            {/* Modal */}
            <ArchiveRetrospectiveModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                data={selectedItem}
            />
        </div>
    );
};

export default BizRadarArchiveLayout;
