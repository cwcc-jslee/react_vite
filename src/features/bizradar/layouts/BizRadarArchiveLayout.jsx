/**
 * BizRadar 과거사업 레이아웃
 * 마감된 공고 조회 (읽기 전용)
 */
import React, { useEffect, useState } from 'react';
import { FaSearch, FaInfoCircle } from 'react-icons/fa';
import { useBizRadarStore } from '../hooks/useBizRadarStore';
import BizRadarListTable from '../components/tables/BizRadarListTable';
import { filterByProjectStatus } from '../utils/projectStatusUtils';

const BizRadarArchiveLayout = () => {
    const { items, isLoading, isError, error, actions } = useBizRadarStore();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');

    // 초기 데이터 로드 (전체)
    useEffect(() => {
        actions.data.fetchList({});
    }, []);

    // 과거 사업만 필터링
    const archivedItems = React.useMemo(() => {
        return filterByProjectStatus(items, 'archived');
    }, [items]);

    // 검색 필터링
    const filteredItems = React.useMemo(() => {
        let result = archivedItems;

        if (searchKeyword.trim()) {
            result = result.filter(item =>
                item.title?.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        if (selectedType) {
            result = result.filter(item => {
                const type = item.confirmedCategory || item.confirmed_category;
                return type === selectedType;
            });
        }

        if (selectedRegion) {
            result = result.filter(item =>
                item.region?.includes(selectedRegion)
            );
        }

        return result;
    }, [archivedItems, searchKeyword, selectedType, selectedRegion]);

    const handleSearch = () => {
        // 검색은 클라이언트 사이드에서 처리
    };

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (isError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600">
                    {error || '데이터를 불러오는 중 오류가 발생했습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">과거 사업</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            마감된 공고 목록 (참고용, 읽기 전용)
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-gray-600">{filteredItems.length}</div>
                        <div className="text-sm text-gray-500">마감된 공고</div>
                    </div>
                </div>

                {/* 안내 메시지 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <FaInfoCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">과거 사업 안내</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>마감일이 지난 공고가 자동으로 표시됩니다</li>
                            <li>참고 자료로 활용하세요 (수정 불가)</li>
                            <li>과거 사업을 다시 진행중으로 변경하려면 관리자에게 문의하세요</li>
                        </ul>
                    </div>
                </div>

                {/* 검색 필터 */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2 relative">
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="공고명 검색..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">전체 유형</option>
                        <option value="A">Type A - 영업기회</option>
                        <option value="B">Type B - 프로젝트</option>
                        <option value="C">Type C - 성장지원</option>
                        <option value="D">Type D - 검토필요</option>
                        <option value="F">Type F - 해당없음</option>
                    </select>

                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">전체 지역</option>
                        <option value="전국">전국</option>
                        <option value="경남">경남</option>
                        <option value="김해">김해</option>
                        <option value="서울">서울</option>
                        <option value="부산">부산</option>
                        <option value="경기">경기</option>
                    </select>
                </div>
            </div>

            {/* 빈 상태 */}
            {filteredItems.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        과거 사업이 없습니다
                    </h3>
                    <p className="text-gray-600">
                        {searchKeyword || selectedType || selectedRegion
                            ? '검색 조건에 맞는 과거 사업이 없습니다.'
                            : '마감된 공고가 아직 없습니다.'}
                    </p>
                </div>
            )}

            {/* 과거 사업 테이블 */}
            {filteredItems.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <BizRadarListTable
                        items={filteredItems}
                        readOnly={true}
                        selectedIds={[]}
                        onSelect={() => { }}
                        onSelectAll={() => { }}
                    />
                </div>
            )}
        </div>
    );
};

export default BizRadarArchiveLayout;
