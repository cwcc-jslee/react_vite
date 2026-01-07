// src/features/project/components/registration/TaskVerificationStep.jsx
// 프로젝트 등록 3단계: 최종 검증 (순수 뷰)

import React from 'react';
import { FiInfo, FiCalendar, FiBriefcase } from 'react-icons/fi';
import { useProjectForm } from '../../hooks/useProjectForm';
import useProjectTask from '../../hooks/useProjectTask';
import { Card, Badge } from '@shared/components/ui';

const TaskVerificationStep = () => {
  const { formData } = useProjectForm();
  const { buckets } = useProjectTask();

  // 통계 계산
  const totalBuckets = buckets.length;
  const totalTasks = buckets.reduce((acc, b) => acc + b.tasks.length, 0);

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '-'}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50/50 rounded-lg p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto grid grid-cols-12 gap-6 w-full">
        
        {/* 요약 카드 */}
        <div className="col-span-12">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-indigo-100 text-sm font-medium mb-1">Project Summary</p>
              <h3 className="text-2xl font-bold mb-4">{formData.name}</h3>
              <div className="flex gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                  <p className="text-xs text-indigo-200">버킷 수</p>
                  <p className="text-xl font-bold">{totalBuckets}개</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                  <p className="text-xs text-indigo-200">총 작업 수</p>
                  <p className="text-xl font-bold">{totalTasks}개</p>
                </div>
              </div>
            </div>
            <FiBriefcase size={120} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
          </div>
        </div>

        {/* 프로젝트 정보 상세 */}
        <div className="col-span-7">
          <Card className="h-full border-none shadow-sm overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-gray-50 flex items-center gap-2 font-bold text-gray-700">
              <FiInfo className="text-indigo-500" /> 기본 정보 확인
            </div>
            <div className="p-6 bg-white space-y-1">
              <InfoRow label="고객사" value={formData.customer?.name} />
              <InfoRow label="매출유형" value={formData.projectType === 'revenue' ? '매출' : '투자'} />
              <InfoRow label="작업유형" value={formData.workType} />
              <InfoRow label="사업년도" value={formData.fy?.name} />
              <InfoRow label="사업부" value={formData.team?.name} />
              <InfoRow label="서비스" value={formData.service?.name} />
            </div>
          </Card>
        </div>

        {/* 일정 및 상태 */}
        <div className="col-span-5 flex flex-col gap-6">
          <Card className="border-none shadow-sm">
            <div className="bg-white px-6 py-4 border-b border-gray-50 flex items-center gap-2 font-bold text-gray-700">
              <FiCalendar className="text-orange-500" /> 일정 계획
            </div>
            <div className="p-6 bg-white">
              <div className="flex items-center justify-center gap-4 py-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="text-center">
                  <p className="text-[10px] text-orange-400 font-bold uppercase">Start</p>
                  <p className="text-lg font-bold text-orange-700">{formData.planStartDate}</p>
                </div>
                <div className="h-8 w-px bg-orange-200"></div>
                <div className="text-center">
                  <p className="text-[10px] text-orange-400 font-bold uppercase">End</p>
                  <p className="text-lg font-bold text-orange-700">{formData.planEndDate}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm flex-1">
            <div className="bg-white px-6 py-4 border-b border-gray-50 font-bold text-gray-700">관리 설정</div>
            <div className="p-6 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">중요도</span>
                <Badge variant={formData.importanceLevel?.name === '상' ? 'error' : 'info'}>
                  {formData.importanceLevel?.name || '보통'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">진행상태</span>
                <Badge variant="success">{formData.pjtStatus?.name || '시작전'}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* 태스크 구성 요약 (버킷 리스트) */}
        <div className="col-span-12">
          <Card className="border-none shadow-sm">
            <div className="bg-white px-6 py-4 border-b border-gray-50 font-bold text-gray-700">작업 구성 (Bucket List)</div>
            <div className="p-6 bg-white grid grid-cols-4 gap-4">
              {buckets.map((bucket, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold mb-1">Bucket {idx + 1}</p>
                  <p className="font-bold text-gray-700 mb-2 truncate">{bucket.bucket}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">
                      Tasks: {bucket.tasks.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default TaskVerificationStep;