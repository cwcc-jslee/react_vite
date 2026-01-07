import React from 'react';
import PropTypes from 'prop-types';
import { 
  Briefcase, 
  Plus, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Building2,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button, Badge } from '@shared/components/ui';
import { enhanceItemsWithScheduleStatus } from '@features/project/utils/projectListUtils';
import { useCodebook } from '@shared/hooks/useCodebook';

// 상태별 컬러 매핑 (Badge color용)
const getStatusBadgeColor = (statusName) => {
  switch (statusName) {
    case '진행중': return 'success';
    case '보류/대기': return 'warning';
    case '시작전': return 'info';
    case '중간검수':
    case '고객검수': return 'primary';
    case '종료': return 'default';
    default: return 'default';
  }
};

/**
 * 잔여일정 계산 (TableRow logic 복사)
 */
const getRemainingDays = (item) => {
  if (item?.isClosed) return null;
  const planEndDate = item?.endDate || item?.planEndDate;
  if (!planEndDate) return null;

  const today = new Date();
  const endDate = new Date(planEndDate);
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return 'D-Day';
  return `+${Math.abs(diffDays)}`;
};

/**
 * SFA 연계 프로젝트 섹션
 */
const ProjectRelationSection = ({
  data,
  projects = [],
  isLoading = false,
  error = null,
  onViewDetail,
  onCreateProject,
  showBox = true,
}) => {
  // 프로젝트 상태 코드북 조회 (ID -> 이름 매핑용)
  const { data: codebooks } = useCodebook(['pjtStatus']);
  const pjtStatusList = codebooks?.pjtStatus || [];

  // 데이터 강화 (일정상태, 태스크상태, 진행률 등 계산)
  const enhancedProjects = React.useMemo(() => {
    return enhanceItemsWithScheduleStatus(projects);
  }, [projects]);

  // 박스 스타일 제거 여부에 따른 래퍼
  const Container = showBox ? 'section' : 'div';
  const containerClass = showBox 
    ? "bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden" 
    : "";
  const headerClass = showBox 
    ? "px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200"
    : "flex items-center justify-between mb-4";

  return (
    <Container className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-gray-600" />
            <h2 className={showBox ? "text-base font-semibold text-gray-900" : "text-lg font-semibold text-gray-900"}>
              연계 프로젝트
            </h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {projects.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateProject}
              className="h-8 text-xs opacity-50 cursor-not-allowed"
              disabled={true}
              title="프로젝트 생성 기능 준비중입니다."
            >
              <Plus className="h-3 w-3 mr-1" />
              신규 생성
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={showBox ? "p-6" : ""}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm font-medium">연계 프로젝트 정보를 불러오고 있습니다...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="h-8 w-8 mb-3" />
            <p className="text-sm font-medium">프로젝트 정보를 불러오지 못했습니다.</p>
            <p className="text-xs mt-1 opacity-70">{error?.message || '알 수 없는 오류가 발생했습니다.'}</p>
          </div>
        ) : enhancedProjects.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">
              연계된 프로젝트가 없습니다.<br />
              프로젝트 관리 메뉴에서 신규 등록 시, 이 매출 정보를 선택하면 연동됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enhancedProjects.map((project) => {
              const dDay = getRemainingDays(project);
              
              // pjtStatus가 객체인지 문자열인지 판별
              let statusName = '시작전'; // 기본값
              
              if (project.pjtStatus) {
                if (typeof project.pjtStatus === 'object') {
                  statusName = project.pjtStatus.name || '시작전';
                } else {
                  // 문자열(ID)인 경우 코드북에서 조회
                  const foundStatus = pjtStatusList.find(
                    status => String(status.documentId) === String(project.pjtStatus) || 
                              String(status.id) === String(project.pjtStatus)
                  );
                  if (foundStatus) {
                    statusName = foundStatus.name;
                  } else {
                    // 코드북에서 못 찾았으면 일단 ID라도 표시 (디버깅용)하거나 '미정' 표시
                    // statusName = String(project.pjtStatus); 
                    // 하지만 사용자에게 ID를 보여주는 건 좋지 않으므로 잠시 대기
                  }
                }
              }
              
              // 계획시간 합계 계산
              const totalPlannedHours = project.projectTasks?.reduce(
                (sum, task) => sum + (task.planningTimeData?.totalPlannedHours || 0),
                0
              ) || 0;

              // 실제 투입시간 합계
              const totalActualHours = (project.totalProjectHours || 0) + (project.totalProjectNonBillableHours || 0);

              // Task 완료 현황
              const completedTasks = project.projectTasks?.filter(t => t.taskProgress?.name === '100%').length || 0;
              const totalTasks = project.projectTasks?.length || 0;

              return (
                <div 
                  key={project.id}
                  className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 group p-5"
                >
                  {/* 상단: 상태, 이름, 사업부 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge 
                        color={getStatusBadgeColor(statusName)}
                        className="font-bold px-2.5 py-1 whitespace-nowrap min-w-[60px] justify-center"
                      >
                        {statusName}
                      </Badge>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {project.team?.name || '-'}
                          </span>
                          <span className="w-px h-2 bg-gray-300"></span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> PM {project.pmName || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단: 그리드 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 px-5 pb-4 mt-2">
                    
                    {/* 1. 기간 */}
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> 프로젝트 기간
                      </p>
                      <div className="text-sm font-semibold text-gray-700">
                        {project.planStartDate || '-'} ~ {project.planEndDate || '-'}
                        {dDay && (
                          <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${
                            dDay.startsWith('+') ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'
                          }`}>
                            {dDay}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. 진행률 */}
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium mb-1">진행률</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${project.calculatedProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(project.calculatedProgress || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{project.calculatedProgress || 0}%</span>
                      </div>
                    </div>

                    {/* 3. 투입/계획 시간 */}
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 투입 / 계획 공수
                      </p>
                      <div className="flex items-end gap-1">
                        <span className="text-sm font-bold text-gray-900">{totalActualHours}h</span>
                        <span className="text-xs text-gray-400 mb-0.5">/ {totalPlannedHours}h</span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${totalPlannedHours > 0 ? Math.min((totalActualHours / totalPlannedHours) * 100, 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* 4. Task 현황 */}
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium mb-1 flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" /> Task (완료/전체)
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {completedTasks}
                          <span className="text-gray-400 font-normal"> / {totalTasks}</span>
                        </span>
                        {totalTasks > 0 && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                            잔여 {totalTasks - completedTasks}
                          </Badge>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
};

ProjectRelationSection.propTypes = {
  data: PropTypes.object,
  projects: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
  onViewDetail: PropTypes.func,
  onCreateProject: PropTypes.func,
  showBox: PropTypes.bool,
};

export default ProjectRelationSection;