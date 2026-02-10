import React, { useState } from 'react';
import { Modal } from '@components/ui';
import { FaTimes, FaFileAlt, FaClipboardCheck, FaFolderOpen, FaCalendarAlt, FaCloudUploadAlt, FaDownload } from 'react-icons/fa';

// Simple Modal Implementation if @components/ui/modal is generic or I'll build a custom one here for the layout
const ArchiveRetrospectiveModal = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen || !data) return null;

    const tabs = [
        { id: 'overview', label: '기본 정보', icon: FaFileAlt },
        { id: 'analysis', label: '결과 분석', icon: FaClipboardCheck },
        { id: 'assets', label: '자산 관리', icon: FaFolderOpen },
        { id: 'nextstep', label: '미래 전략', icon: FaCalendarAlt },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-bold">{data.year}</span>
                            <span className="text-gray-500 text-xs font-medium">{data.type} Type</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{data.project}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors
                        ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <tab.icon className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaFileAlt className="text-blue-500" /> 공고 원문 및 개요
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2">
                                        <label className="block text-gray-500 text-xs mb-1">공고명</label>
                                        <div className="font-medium">{data.project}</div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-1">고객사</label>
                                        <div className="font-medium">{data.client}</div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-1">담당자</label>
                                        <div className="font-medium">{data.pic}</div>
                                    </div>
                                    <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                                        <p className="text-gray-600 leading-relaxed">
                                            [공고 요약] 본 사업은 2025년도 AI 바우처 지원사업의 일환으로,
                                            제조 분야 기업의 AI 도입을 지원하여 생산성 향상 및 경쟁력 강화를 목적으로 함.
                                            (원문 데이터가 있을 경우 이곳에 표시됩니다.)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaClipboardCheck className="text-green-500" /> Win/Loss 분석
                                </h3>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">성공/실패 요인 태그</label>
                                    <div className="flex flex-wrap gap-2">
                                        {data.result === 'Win' ? (
                                            <>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">#제안서우수</span>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">#기술점수만점</span>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">#사전영업성공</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">#가격경쟁력약함</span>
                                                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">#포트폴리오부족</span>
                                            </>
                                        )}
                                        <button className="text-xs text-blue-500 underline ml-2">+ 태그 추가</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">심사평 기록</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm min-h-[100px]"
                                        placeholder="심사위원들의 코멘트나 피드백을 기록하세요."
                                        defaultValue={data.note}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'assets' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaFolderOpen className="text-yellow-500" /> 제안 산출물 관리
                                </h3>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer mb-6">
                                    <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 font-medium">파일을 드래그하여 업로드하거나 클릭하세요</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, PPTX, HWP, DOCX (최대 50MB)</p>
                                </div>

                                <ul className="divide-y divide-gray-100">
                                    <li className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">PDF</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">2025_AI바우처_제안서_최종.pdf</p>
                                                <p className="text-xs text-gray-400">12.5 MB • 2025.01.15 업로드</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-500 hover:text-blue-600">
                                            <FaDownload />
                                        </button>
                                    </li>
                                    <li className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">PPT</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">2025_AI바우처_발표자료_v2.pptx</p>
                                                <p className="text-xs text-gray-400">45.2 MB • 2025.01.20 업로드</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-500 hover:text-blue-600">
                                            <FaDownload />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'nextstep' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center py-12">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaCalendarAlt className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">내년 사업 알림 예약</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    이 사업은 매년 2월에 공고가 뜹니다.<br />
                                    미리 알림을 설정해두면 놓치지 않고 준비할 수 있습니다.
                                </p>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105">
                                    2027년 1월 15일에 알림 받기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 text-sm font-medium hover:bg-gray-50">
                        닫기
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveRetrospectiveModal;
