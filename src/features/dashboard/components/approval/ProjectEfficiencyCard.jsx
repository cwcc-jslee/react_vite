// src/features/dashboard/components/approval/ProjectEfficiencyCard.jsx
/**
 * 프로젝트 효율성 분석 카드
 * - 승인 상세 Drawer 및 프로젝트 개요에서 사용
 * - 계획 공수, 가용 공수, 투입 효율, 등록 태스크 표시
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FiClock,
  FiPieChart,
  FiTrendingUp,
  FiLayers,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { PROJECT_COST_CONSTANTS } from '../../../../features/project/constants/projectCostConstants';
import { PROJECT_TYPE } from '../../../../features/project/constants/projectTypeConstants';
import { STATUS_CHANGE_TYPE_CODES } from '../../../../features/project/constants/statusChangeTypeConstants';
import { calculateTeamProfits } from '../../../../shared/utils/summaryCalculations';
import EfficiencyStatCard from '../cards/EfficiencyStatCard';

const ProjectEfficiencyCard = ({ project, changeTypeName }) => {
  if (!project) return null;

  // 1. 매출 이익 및 가용 공수 계산
  // SFA 데이터를 기반으로 사업부 매출이익 계산 (우선순위: 계산된 팀 이익 > 저장된 revenueProfit)
  const teamRevenueProfit = useMemo(() => {
    if (!project.sfa?.sfaByPayments || !project.team?.id) {
      return Number(project.revenueProfit) || 0;
    }
    const teamProfits = calculateTeamProfits(project.sfa.sfaByPayments);
    const myTeamData = teamProfits.find((tp) => tp.teamId === project.team.id);
    return myTeamData ? myTeamData.totalProfit : Number(project.revenueProfit) || 0;
  }, [project.sfa, project.team, project.revenueProfit]);

  const budgetHours = Math.floor(
    teamRevenueProfit / PROJECT_COST_CONSTANTS.STANDARD_HOURLY_RATE
  );

  // 2. 총 계획 공수 및 태스크 수 계산
  const { totalHours, totalTasks } = useMemo(() => {
    const tasks = project.projectTasks || [];
    const hours = tasks.reduce((acc, task) => {
      return acc + (parseFloat(task.planningTimeData?.totalPlannedHours) || 0);
    }, 0);
    return {
      totalHours: hours,
      totalTasks: tasks.length,
    };
  }, [project.projectTasks]);

  // 3. 효율성 분석
  const efficiencyRate =
    budgetHours > 0 ? Math.round((totalHours / budgetHours) * 100) : 0;
  const isOverBudget = totalHours > budgetHours;
  const isInvestmentProject = project.projectType === PROJECT_TYPE.INVESTMENT.code;
  const isRevenueProject = project.projectType === PROJECT_TYPE.REVENUE.code;
  const isCreate = changeTypeName === STATUS_CHANGE_TYPE_CODES.CREATE;

  // 검증 상태 및 메시지 계산
  const getVerificationStatus = () => {
    if (totalTasks === 0) {
      return {
        isWarn: true,
        message: '등록된 태스크가 없습니다. 작업 계획을 수립해 주세요.',
        icon: FiAlertCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-100',
        barColor: 'bg-red-500',
      };
    }
    if (totalHours === 0) {
      return {
        isWarn: true,
        message: '계획된 공수가 0h입니다. 상세 공수를 입력해 주세요.',
        icon: FiAlertCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-100',
        barColor: 'bg-red-500',
      };
    }
    if (isOverBudget) {
      return {
        isWarn: true,
        message: `예산(${budgetHours}h)을 초과했습니다. 조정이 필요할 수 있습니다.`,
        icon: FiAlertCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-100',
        barColor: 'bg-red-500',
      };
    }
    return {
      isWarn: false,
      message: '예산 범위 내에서 안정적으로 계획되었습니다.',
      icon: FiCheckCircle,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      barColor: 'bg-green-500',
    };
  };

  const status = getVerificationStatus();

  // 검증 바 라벨 결정
  const getVerificationLabel = () => {
    switch (changeTypeName) {
      case STATUS_CHANGE_TYPE_CODES.CREATE:
        return '등록 적정성 검증';
      default:
        return '운영 지표 점검';
    }
  };

  return (
    <div className="space-y-4">
      {/* 4개의 메트릭 카드 그리드 */}
      <div className="grid grid-cols-4 gap-2">
        <EfficiencyStatCard
          label="계획 공수"
          value={`${totalHours}h`}
          icon={FiClock}
          colorClass="bg-orange-500"
          isWarn={isOverBudget}
          showIcon={false}
        />
        <EfficiencyStatCard
          label="가용 공수"
          value={isInvestmentProject ? '-' : `${budgetHours}h`}
          icon={FiPieChart}
          colorClass="bg-blue-500"
          showIcon={false}
        />
        <EfficiencyStatCard
          label="투입 효율"
          value={isInvestmentProject ? '-' : `${efficiencyRate}%`}
          icon={FiTrendingUp}
          colorClass={isOverBudget ? 'bg-red-500' : 'bg-teal-500'}
          isWarn={isOverBudget}
          showIcon={false}
        />
        <EfficiencyStatCard
          label="사업부 매출이익"
          value={teamRevenueProfit ? `${Number(teamRevenueProfit).toLocaleString()}원` : '0원'}
          icon={FiPieChart}
          colorClass="bg-indigo-500"
          showIcon={false}
        />
      </div>

      {/* 검증 바 (매출 프로젝트이거나 신규 등록인 경우 무조건 표시) */}
      {(isRevenueProject || isCreate) && (
        <div
          className={`rounded-lg p-3 border ${status.bgColor} ${status.borderColor}`}
        >
          <div className={`flex items-center gap-2 mb-2 text-xs font-semibold ${status.color}`}>
            <status.icon size={14} />
            <span>{getVerificationLabel()}</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${status.barColor}`}
                style={{ width: `${Math.min(efficiencyRate, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {status.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

ProjectEfficiencyCard.propTypes = {
  project: PropTypes.shape({
    revenueProfit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    projectType: PropTypes.string,
    workType: PropTypes.string,
    projectTasks: PropTypes.arrayOf(
      PropTypes.shape({
        planningTimeData: PropTypes.shape({
          totalPlannedHours: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),
        }),
      })
    ),
  }),
  changeTypeName: PropTypes.string,
};

export default ProjectEfficiencyCard;