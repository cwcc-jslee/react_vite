/**
 * 확정 상태 토글 컴포넌트
 * 담당자가 AI 분석 결과를 확정/재검토 처리
 */
import React, { useState } from 'react';
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import { CONFIRMATION_STATUS } from '../../constants/initialState';

/**
 * 확정 상태 뱃지
 */
const ConfirmationBadge = ({ status, onClick, size = 'md' }) => {
    const config = CONFIRMATION_STATUS[status] || CONFIRMATION_STATUS.pending;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2',
    };

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1 rounded-full font-medium transition-all hover:opacity-80 ${config.color} ${sizeClasses[size]}`}
            title="클릭하여 상태 변경"
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </button>
    );
};

/**
 * 확정 상태 토글 컴포넌트
 */
const ConfirmationToggle = ({ itemId, currentStatus = 'pending', onStatusChange, compact = false }) => {
    const [isChanging, setIsChanging] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleStatusChange = async (newStatus) => {
        if (newStatus === currentStatus) {
            setShowMenu(false);
            return;
        }

        setIsChanging(true);
        try {
            await onStatusChange(itemId, newStatus);
            setShowMenu(false);
        } catch (err) {
            console.error('Status change failed:', err);
            alert('상태 변경 중 오류가 발생했습니다.');
        } finally {
            setIsChanging(false);
        }
    };

    if (compact) {
        return (
            <div className="relative">
                <ConfirmationBadge
                    status={currentStatus}
                    onClick={() => setShowMenu(!showMenu)}
                    size="sm"
                />
                {showMenu && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[120px]">
                        {Object.entries(CONFIRMATION_STATUS).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => handleStatusChange(key)}
                                disabled={isChanging || key === currentStatus}
                                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2 ${key === currentStatus ? 'bg-gray-50' : ''
                                    }`}
                            >
                                <span>{config.icon}</span>
                                <span className="text-sm">{config.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-gray-700">확정 상태</div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={isChanging || currentStatus === 'confirmed'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentStatus === 'confirmed'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <FaCheck className="h-4 w-4" />
                    확정완료
                </button>
                <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isChanging || currentStatus === 'rejected'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentStatus === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <FaTimes className="h-4 w-4" />
                    재검토
                </button>
                <button
                    onClick={() => handleStatusChange('pending')}
                    disabled={isChanging || currentStatus === 'pending'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentStatus === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <FaUndo className="h-4 w-4" />
                    검토대기
                </button>
            </div>
        </div>
    );
};

export { ConfirmationBadge, ConfirmationToggle };
export default ConfirmationToggle;
