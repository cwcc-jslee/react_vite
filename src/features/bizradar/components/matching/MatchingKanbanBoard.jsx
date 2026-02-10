import React, { useState } from 'react';
import MatchingCard from './MatchingCard';
import { FaPlus, FaEllipsisH } from 'react-icons/fa';

const STAGES = [
    { id: 'backlog', title: '추천/대기', color: 'bg-gray-100' },
    { id: 'proposing', title: '제안/협의', color: 'bg-blue-50' },
    { id: 'verified', title: '접수 확인', color: 'bg-indigo-50' },
    { id: 'evaluating', title: '심사/평가', color: 'bg-purple-50' },
    { id: 'result', title: '결과 확정', color: 'bg-green-50' },
];

const MatchingKanbanBoard = ({ data, onCardClick, onCardMove }) => {
    // Simple drag and drop implementation
    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('itemId', item.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, stageId) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('itemId');
        if (onCardMove) {
            onCardMove(itemId, stageId);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] min-w-[1000px]">
            {STAGES.map((stage) => (
                <div
                    key={stage.id}
                    className={`flex-1 min-w-[200px] flex flex-col rounded-lg ${stage.color} p-2 h-full`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                >
                    {/* Column Header */}
                    <div className="flex justify-between items-center mb-3 px-1 py-1">
                        <h3 className="font-bold text-sm text-gray-700">
                            {stage.title}
                            <span className="ml-2 text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                {data.filter(item => item.stage === stage.id).length}
                            </span>
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <FaEllipsisH />
                        </button>
                    </div>

                    {/* Column Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {data
                            .filter(item => item.stage === stage.id)
                            .map(item => (
                                <MatchingCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => onCardClick(item)}
                                    onDragStart={handleDragStart}
                                />
                            ))
                        }

                        {data.filter(item => item.stage === stage.id).length === 0 && (
                            <div className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                <span>Drop Here</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    {stage.id === 'backlog' && (
                        <button className="mt-2 w-full py-2 flex items-center justify-center gap-1 text-gray-500 hover:bg-white hover:shadow-sm rounded transition-all text-xs font-medium border border-transparent hover:border-gray-200">
                            <FaPlus /> 새 추천 등록
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MatchingKanbanBoard;
