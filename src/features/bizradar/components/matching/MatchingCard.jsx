import React from 'react';
import { Card } from '@components/ui';
import { FaUserCircle, FaPhoneAlt, FaClock } from 'react-icons/fa';

const MatchingCard = ({ item, onClick, onDragStart }) => {
    // D-Day Badge Logic
    const getDDayBadge = (date) => {
        if (!date) return null;
        const today = new Date();
        const target = new Date(date);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let colorClass = 'bg-gray-100 text-gray-600';
        let text = `D-${diffDays}`;

        if (diffDays < 0) {
            text = '마감';
            colorClass = 'bg-red-100 text-red-600';
        } else if (diffDays === 0) {
            text = 'D-Day';
            colorClass = 'bg-red-500 text-white animate-pulse';
        } else if (diffDays <= 3) {
            colorClass = 'bg-orange-100 text-orange-600 font-bold';
        } else if (diffDays <= 7) {
            colorClass = 'bg-yellow-100 text-yellow-700';
        }

        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>{text}</span>;
    };

    return (
        <div
            className="cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-md mb-3"
            onClick={onClick}
            draggable="true" // HTML5 DnD for simplicity for now, or use DnD kit wrapper
            onDragStart={(e) => onDragStart && onDragStart(e, item)}
        >
            <Card className="p-3 border-l-4 border-l-blue-500">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-sm truncate pr-2">{item.clientName}</h3>
                    {getDDayBadge(item.dueDate)}
                </div>

                {/* Body */}
                <div className="mb-3">
                    <p className="text-xs text-gray-600 line-clamp-2 hover:line-clamp-none transition-all duration-200">
                        {item.projectTitle}
                    </p>
                    <div className="mt-1 text-[10px] text-gray-400">
                        예상 {item.amount}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
                    <div className="flex items-center text-[10px] text-gray-500 gap-1">
                        <FaPhoneAlt className="text-gray-300" />
                        <span>{item.lastContactSimple}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">{item.picName}</span>
                        <FaUserCircle className="text-gray-300 w-4 h-4" />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MatchingCard;
