import React from 'react';
import { Badge } from '@/shared/components/ui';
import { Zap } from 'lucide-react';

const DiscoverySidebar = ({ items, selectedItem, onSelect, filter, setFilter }) => {
    const getCategory = (item) => {
        return item.confirmedCategory || item.confirmed_category || item.analyzedCategory || item.analyzed_category || item.category;
    };

    const filteredItems = items.filter((item) => {
        if (filter === 'ALL') return true;
        return getCategory(item) === filter;
    });

    return (
        <div className="flex flex-col h-full">
            {/* Quick Filters */}
            <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap gap-y-1">
                {['ALL', 'A', 'B', 'C', 'D', 'F'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === f
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {f === 'ALL' ? '전체' : `Cat ${f}`}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredItems.map((item) => {
                    const category = getCategory(item);
                    return (
                        <div
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className={`
                  p-4 border-b border-gray-100 cursor-pointer transition-colors
                  hover:bg-blue-50/50
                  ${selectedItem?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}
                `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span
                                    className={`
                      px-2 py-0.5 rounded text-xs font-semibold
                      ${category === 'A' ? 'bg-red-100 text-red-700' : ''}
                      ${category === 'B' ? 'bg-blue-100 text-blue-700' : ''}
                      ${category === 'C' ? 'bg-green-100 text-green-700' : ''}
                      ${category === 'D' ? 'bg-orange-100 text-orange-700' : ''}
                      ${category === 'F' ? 'bg-gray-200 text-gray-700' : ''}
                    `}
                                >
                                    Cat {category || 'N/A'}
                                </span>
                                {item.confidence === 'High' && (
                                    <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug">
                                {item.title}
                            </h4>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{item.agency || item.source || 'N/A'}</span>
                                <span className={item.dDay?.includes?.('D-3') ? 'text-red-500 font-bold' : ''}>
                                    {item.dDay || item.endDate || item.end_date || '기간 미정'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {filteredItems.length === 0 && (
                    <div className='p-8 text-center text-gray-400 text-sm'>
                        데이터가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoverySidebar;
