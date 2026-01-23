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
import {
  getProjectTypeInfo,
  getWorkTypeInfo,
} from '../../../../features/project/constants/projectTypeConstants';
import {
  STATUS_CHANGE_TYPE_CODES,
  getStatusChangeTypeLabel,
} from '../../../../features/project/constants/statusChangeTypeConstants';

// dashboard/components/cards/ApprovalCard.jsx와 동일한 스타일 매핑
const APPROVAL_TYPE_STYLES = {
  [STATUS_CHANGE_TYPE_CODES.CREATE]: { color: 'bg-green-100 text-green-800' },
  [STATUS_CHANGE_TYPE_CODES.INTERIM_REVIEW]: {
    color: 'bg-blue-100 text-blue-800',
  },
  [STATUS_CHANGE_TYPE_CODES.FINAL_REVIEW]: { color: 'bg-blue-100 text-blue-800' },
  [STATUS_CHANGE_TYPE_CODES.CLOSE]: { color: 'bg-gray-100 text-gray-800' },
  [STATUS_CHANGE_TYPE_CODES.RESUME]: { color: 'bg-teal-100 text-teal-800' },
  [STATUS_CHANGE_TYPE_CODES.STATUS_CHANGE]: {
    color: 'bg-yellow-100 text-yellow-800',
  },
};

const ProjectEfficiencyCard = ({ project, changeTypeName }) => {
  if (!project) return null;

  // 1. 매출 이익 및 가용 공수 계산
  const revenueProfit = Number(project.revenueProfit) || 0;
  const budgetHours = Math.floor(
    revenueProfit / PROJECT_COST_CONSTANTS.STANDARD_HOURLY_RATE
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
  const isRevenueProject = project.projectType === 'revenue';
  const isCreate = changeTypeName === 'CREATE';

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

  // 유형 정보 조회 (상수 활용)
  const projectTypeInfo = getProjectTypeInfo(project.projectType);
  const workTypeInfo = getWorkTypeInfo(project.workType);

  // 승인 유형 스타일 적용 (ApprovalCard와 일치)
  const getApprovalTypeStyle = () => {
    const style =
      APPROVAL_TYPE_STYLES[changeTypeName] ||
      APPROVAL_TYPE_STYLES[STATUS_CHANGE_TYPE_CODES.STATUS_CHANGE];
    return {
      label: getStatusChangeTypeLabel(changeTypeName),
      color: style.color,
    };
  };

  const approvalType = getApprovalTypeStyle();

  // 섹션 타이틀 결정
  const getSectionTitle = () => {
    switch (changeTypeName) {
      case 'CREATE':
        return '신규등록 검증';
      case 'INTERIM_REVIEW':
        return '중간 점검 분석';
      case 'FINAL_REVIEW':
        return '최종 점검 분석';
      case 'CLOSE':
        return '종료 데이터 확인';
      default:
        return '프로젝트 현황 분석';
    }
  };

  // 검증 바 라벨 결정
  const getVerificationLabel = () => {
    switch (changeTypeName) {
      case 'CREATE':
        return '등록 적정성 검증';
      default:
        return '운영 지표 점검';
    }
  };

  const StatCard = ({
    label,
    value,
    subValue,
    icon: Icon,
    colorClass,
    isWarn = false,
  }) => (
    <div
      className={`bg-white p-4 rounded-xl border ${
        isWarn ? 'border-red-200' : 'border-gray-100'
      } shadow-sm flex items-start justify-between`}
    >
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <h4
          className={`text-lg font-bold ${
            isWarn ? 'text-red-600' : 'text-gray-800'
          }`}
        >
          {value}
        </h4>
        {subValue && (
          <p className="text-[10px] text-gray-400 mt-0.5">{subValue}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">
            {getSectionTitle()}
          </h3>
          {changeTypeName && (
            <span
              className={`px-2 py-0.5 text-[11px] font-medium rounded flex-shrink-0 ${approvalType.color}`}
            >
              {approvalType.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${projectTypeInfo.colorClass}`}>
            {projectTypeInfo.label}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${workTypeInfo.colorClass}`}>
            {workTypeInfo.label}
          </span>
        </div>
      </div>

      {/* 4개의 메트릭 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3">
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
          value={
            project.projectType === 'investment' ? '무제한' : `${budgetHours} h`
          }
          subValue="Budget Threshold"
          icon={FiPieChart}
          colorClass="bg-blue-500"
        />
        <StatCard
          label="투입 효율"
          value={
            project.projectType === 'investment' ? 'N/A' : `${efficiencyRate}%`
          }
          subValue={isOverBudget ? '예산 초과 주의' : '예산 내 적정'}
          icon={FiTrendingUp}
          colorClass={isOverBudget ? 'bg-red-500' : 'bg-teal-500'}
          isWarn={isOverBudget}
        />
        <StatCard
          label="등록 태스크"
          value={`${totalTasks} 건`}
          subValue="Total Tasks"
          icon={FiLayers}
          colorClass="bg-indigo-500"
        />
      </div>

      {/* 검증 바 (매출 프로젝트이거나 신규 등록인 경우 무조건 표시) */}
      {(isRevenueProject || isCreate) && (
        <div
          className={`rounded-lg p-3 border ${status.bgColor} ${status.borderColor}`}
        >
          <div className={`flex items-center gap-2 mb-2 text-xs font-bold ${status.color}`}>
            <status.icon />
            <span>{getVerificationLabel()}</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${status.barColor}`}
                style={{ width: `${Math.min(efficiencyRate, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-600">
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
