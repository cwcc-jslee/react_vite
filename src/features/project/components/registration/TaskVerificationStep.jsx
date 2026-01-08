// src/features/project/components/registration/TaskVerificationStep.jsx
// 프로젝트 등록 3단계: 최종 검증 (Dashboard Style + 공수/수익 분석 추가)

import React, { useMemo } from 'react';
import { 
  FiBriefcase, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiLayers, 
  FiUser, 
  FiActivity,
  FiDollarSign,
  FiPieChart,
  FiAlertCircle,
  FiTrendingUp,
  FiPlus,
  FiInfo
} from 'react-icons/fi';
import { useProjectForm } from '../../hooks/useProjectForm';
import useProjectTask from '../../hooks/useProjectTask';
import { Card, Badge } from '@shared/components/ui';

const TaskVerificationStep = () => {
  const { formData } = useProjectForm();
  const { buckets } = useProjectTask();

  // [Mock Data] 향후 실제 연동 시 formData.sfa 정보를 통해 계산될 값들
  const budgetHours = 120; // 가용 공수
  const revenueProfit = 10000000; // 매출 이익 (1,000만원)

  // 통계 계산
  const totalBuckets = buckets.length;
  const totalTasks = buckets.reduce((acc, b) => acc + b.tasks.length, 0);
  
  const totalHours = useMemo(() => {
    return buckets.reduce((acc, bucket) => {
      return acc + bucket.tasks.reduce((tAcc, task) => {
        return tAcc + (parseFloat(task.planningTimeData?.totalPlannedHours) || 0);
      }, 0);
    }, 0);
  }, [buckets]);

  // 효율성 분석
  const efficiencyRate = budgetHours > 0 ? Math.round((totalHours / budgetHours) * 100) : 0;
  const isOverBudget = totalHours > budgetHours;

  const calculateDuration = () => {
    if (!formData.planStartDate || !formData.planEndDate) return 0;
    const start = new Date(formData.planStartDate);
    const end = new Date(formData.planEndDate);
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  };
  const duration = calculateDuration();

  const StatCard = ({ label, value, subValue, icon: Icon, colorClass, isWarn = false }) => (
    <div className={`bg-white p-5 rounded-2xl border ${isWarn ? 'border-red-200' : 'border-gray-100'} shadow-sm flex items-start justify-between`}>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <h4 className={`text-xl font-bold ${isWarn ? 'text-red-600' : 'text-gray-800'}`}>{value}</h4>
        {subValue && <p className="text-[11px] text-gray-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50/30 overflow-y-auto p-6">
      
      <div className="max-w-6xl mx-auto w-full">
        
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Metrics & Analysis (3/12 width -> 1/4) */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            
            {/* 1. Key Metrics Vertical Stack */}
            <div className="flex flex-col gap-4">
              <StatCard 
                label="총 계획 공수" 
                value={`${totalHours} h`} 
                subValue="Estimated Effort"
                icon={FiClock} 
                colorClass="bg-orange-500"
                isWarn={isOverBudget}
              />
              <StatCard 
                label="가용 공수" 
                value={formData.projectType === 'investment' ? '무제한' : `${budgetHours} h`} 
                subValue="Budget Threshold"
                icon={FiPieChart} 
                colorClass="bg-blue-500" 
              />
              <StatCard 
                label="투입 효율" 
                value={formData.projectType === 'investment' ? 'N/A' : `${efficiencyRate}%`} 
                subValue={isOverBudget ? "예산 초과 주의" : "예산 내 적정"}
                icon={FiTrendingUp} 
                colorClass={isOverBudget ? "bg-red-500" : "bg-teal-500"} 
                isWarn={isOverBudget}
              />
              <StatCard 
                label="등록 태스크" 
                value={`${totalTasks} 건`} 
                subValue={`${totalBuckets} 개의 카테고리`}
                icon={FiLayers} 
                colorClass="bg-indigo-500" 
              />
            </div>

            {/* Placeholder Card for height balance */}
            <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-gray-400 min-h-[120px]">
              <FiPlus className="mb-2 opacity-20" size={24} />
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">향후 추가 기능 구현 예정</span>
            </div>

            {/* 2. Budget Validation Summary */}
            {formData.projectType === 'revenue' && (
              <div className={`rounded-xl p-4 border ${isOverBudget ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <h3 className={`text-xs font-bold flex items-center gap-2 mb-2 ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
                  {isOverBudget ? <FiAlertCircle /> : <FiCheckCircle />}
                  공수 검증
                </h3>
                <div className="space-y-2">
                  <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                         style={{ width: `${Math.min(efficiencyRate, 100)}%` }}></div>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-tight">
                    {isOverBudget 
                      ? `예산(${budgetHours}h) 초과! 조정 필요.`
                      : `예산 내 적정 수준입니다.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Project Header & Task Breakdown (9/12 width -> 3/4) */}
          <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
            
            {/* 1. Header Banner (Moved here) */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 border-l-4 border-l-indigo-600 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 uppercase tracking-tighter text-[10px]">
                    {formData.projectType === 'revenue' ? 'Revenue' : 'Investment'}
                  </Badge>
                  <span className="text-xs font-bold text-gray-500">{formData.customer?.name || '고객사 미지정'}</span>
                </div>
                <h1 className="text-lg font-bold text-gray-800 leading-tight flex items-center gap-2">
                  {formData.name}
                </h1>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="text-gray-400" />
                    <span className="font-medium">{formData.planStartDate} ~ {formData.planEndDate}</span>
                  </div>
                  <div className="w-px h-3 bg-gray-300"></div>
                  <div className="flex items-center gap-1.5">
                    <FiClock className="text-gray-400" />
                    <span className="font-medium">Total: <span className="text-indigo-600 font-bold">{totalHours} h</span></span>
                  </div>
                </div>
              </div>

              {formData.projectType === 'revenue' && (
                <div className="flex-shrink-0 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 text-right min-w-[140px]">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Est. Profit</p>
                  <p className="text-base font-black text-gray-800">₩{revenueProfit.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* 2. Management Details (Horizontal Row) */}
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm flex flex-wrap gap-x-8 gap-y-2 items-center">
              {[
                { label: "사업부", value: formData.team?.name },
                { label: "서비스", value: formData.service?.name },
                { label: "사업년도", value: formData.fy?.name },
                { label: "중요도", value: formData.importanceLevel?.name }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium">{item.label}</span>
                  <span className="font-bold text-gray-700">{item.value || '-'}</span>
                </div>
              ))}
            </div>

            {/* 3. Task Breakdown Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm flex-1 min-h-[400px]">
              <div className="px-5 py-3 border-b border-gray-200 bg-white flex justify-between items-center">
                <span className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                  <FiLayers className="text-indigo-500" /> 작업 구성 상세
                </span>
                <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-100 text-[10px]">
                  Total {totalTasks} Tasks
                </Badge>
              </div>
              
              <div className="h-full overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 text-[11px] text-gray-400 uppercase font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 border-b border-gray-100 w-[20%]">버킷명 (단계)</th>
                      <th className="px-6 py-3 border-b border-gray-100 w-[60%]">주요 작업 (최대 2개)</th>
                      <th className="px-6 py-3 border-b border-gray-100 w-[20%] text-right">총 공수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {buckets.map((bucket, idx) => {
                      const bucketHours = bucket.tasks.reduce((sum, t) => sum + (parseFloat(t.planningTimeData?.totalPlannedHours) || 0), 0);
                      const displayTasks = bucket.tasks.slice(0, 2);
                      const extraCount = bucket.tasks.length - 2;

                      return (
                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800">{bucket.bucket}</span>
                              <span className="text-[10px] text-gray-400 mt-0.5">{bucket.tasks.length}개의 작업</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-col gap-1.5">
                              {displayTasks.map((task, tIdx) => (
                                <div key={tIdx} className="flex items-center justify-between gap-4 text-xs">
                                  <span className="text-gray-600 truncate max-w-[300px] flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-indigo-300"></div>
                                    {task.name}
                                  </span>
                                  <span className="text-gray-400 font-medium shrink-0">{(task.planningTimeData?.totalPlannedHours) || 0}h</span>
                                </div>
                              ))}
                              {extraCount > 0 && (
                                <div className="text-[10px] text-indigo-500 font-bold mt-0.5 pl-2.5">
                                  + 외 {extraCount}개 작업 더보기...
                                </div>
                              )}
                              {bucket.tasks.length === 0 && (
                                <span className="text-gray-300 italic">등록된 작업 없음</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right align-top font-bold text-indigo-600">
                            {bucketHours} h
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskVerificationStep;