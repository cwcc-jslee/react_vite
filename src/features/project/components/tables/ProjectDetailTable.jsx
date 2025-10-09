// src/features/project/components/ProjectDetailTable.jsx
// 프로젝트 상세 정보를 표시하는 컴포넌트
// 프로젝트의 상태, 진행률, 완료여부 등 다양한 정보를 표시합니다

import React from 'react';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Progress,
  Badge,
  StatusProgressIndicator,
  Tooltip,
} from '@shared/components/ui/index';
import {
  calculateProjectTotalPlannedHours,
  validateProjectPlanningHours,
} from '../../utils/projectTimeUtils';
import {
  calculateProjectPrice,
  formatProjectPrice,
  getProjectPriceDetails,
} from '../../utils/projectPriceUtils';
import { calculateProjectProgress } from '../../utils/projectProgressUtils';

/**
 * 완료 여부를 표시하는 Status Badge 컴포넌트
 * @param {boolean} isCompleted - 완료 여부
 * @returns {JSX.Element} - 상태 표시 UI 요소
 */
const StatusBadge = ({ isCompleted }) => {
  return isCompleted ? (
    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
      완료
    </span>
  ) : (
    <span className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">
      진행중
    </span>
  );
};

/**
 * 프로젝트 상세 정보 테이블 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - 프로젝트 상세 데이터
 * @param {Array} props.projectTasks - 프로젝트 태스크 목록
 * @param {Function} props.onStatusClick - 상태 클릭 시 호출될 함수
 */
const ProjectDetailTable = ({
  data = {},
  projectTasks = [],
  onStatusClick,
}) => {
  if (!data) return null;
  console.log('>>>>>data', data);
  console.log('>>>>>projectTasks', projectTasks);

  // 진행률 계산 (태스크 계획시간 기반 가중평균)
  const calculatedProgress = calculateProjectProgress(projectTasks);

  // 완료된 태스크 수 계산
  const completedTasksCount = projectTasks.filter((task) => {
    const progressCode = task.taskProgress?.code;
    return progressCode === '100' || progressCode === 100 || task.isCompleted;
  }).length;

  // 진행률에 따른 상태 계산
  const getProgressStatus = () => {
    if (calculatedProgress >= 100) return 'success';
    return 'normal';
  };

  // 프로젝트 상태 단계 정의
  const projectStatuses = ['시작전', '진행중', '검수', '종료'];

  // 프로젝트 기간 표시 함수
  const formatProjectDuration = () => {
    const startDate = data.startDate || data.planStartDate || '-';
    const endDate = data.endDate || data.planEndDate || '-';

    return `${startDate} - ${endDate}`;
  };

  return (
    <Description>
      {/* 1열: 진행상태, 진행률/종료상태, 프로젝트기간, TASK */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          진행상태
        </DescriptionItem>
        <DescriptionItem>
          <div className="w-full h-full cursor-pointer" onClick={onStatusClick}>
            <StatusProgressIndicator
              statuses={projectStatuses}
              currentStatus={data.pjtStatus?.name || '시작전'}
            />
          </div>
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          {data.isClosed ? '종료상태' : '진행률'}
        </DescriptionItem>
        <DescriptionItem>
          {data.isClosed ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {data.projectClosure?.closureType?.name || '종료'}
              </span>
              {data.projectClosure?.closureDate && (
                <span className="text-xs text-gray-500">
                  ({data.projectClosure.closureDate})
                </span>
              )}
            </div>
          ) : (
            <Tooltip
              content={
                <div className="flex flex-col gap-1 text-xs">
                  <div>가중평균 진행률: {calculatedProgress}%</div>
                  <div>
                    완료 태스크: {completedTasksCount}/{projectTasks.length}
                  </div>
                  <div className="text-gray-400 border-t pt-1 mt-1">
                    * 태스크 계획시간 기반 가중평균 계산
                  </div>
                </div>
              }
            >
              <div className="cursor-help">
                <Progress
                  percent={calculatedProgress}
                  status={getProgressStatus()}
                  size="small"
                />
              </div>
            </Tooltip>
          )}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          프로젝트기간
        </DescriptionItem>
        <DescriptionItem>{formatProjectDuration()}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          TASK
        </DescriptionItem>
        <DescriptionItem>{`${completedTasksCount}/${projectTasks.length}`}</DescriptionItem>
      </DescriptionRow>

      {/* 2열: 투입/계획시간, 남은시간, 중요도, 계획시간검증 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          투입/계획시간
        </DescriptionItem>
        <DescriptionItem>
          <div className="flex flex-col gap-1">
            <Tooltip
              content={
                <div className="flex flex-col gap-1 text-xs">
                  <div>
                    투입시간: {data.totalProjectHours || 0}시간 (
                    {(data.totalProjectHours || 0) / 8}일)
                  </div>
                  <div>
                    계획시간: {calculateProjectTotalPlannedHours(projectTasks)}
                    시간 ({calculateProjectTotalPlannedHours(projectTasks) / 8}
                    일)
                  </div>
                  <div className="flex items-center gap-1">
                    <span>시간진행률:</span>
                    <span
                      className={`font-medium ${
                        data.totalProjectHours >
                        calculateProjectTotalPlannedHours(projectTasks)
                          ? 'text-red-500'
                          : 'text-gray-300'
                      }`}
                    >
                      {Math.round(
                        ((data.totalProjectHours || 0) /
                          (calculateProjectTotalPlannedHours(projectTasks) ||
                            1)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="text-gray-400">* 1일 8시간 기준</div>
                </div>
              }
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 text-xs">투입</span>
                  <span className="font-medium">
                    {data.totalProjectHours || 0}h(
                    {((data.totalProjectHours || 0) / 8).toFixed(1)}d)
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 text-xs">계획</span>
                  <span className="font-medium">
                    {calculateProjectTotalPlannedHours(projectTasks)}h(
                    {(
                      calculateProjectTotalPlannedHours(projectTasks) / 8
                    ).toFixed(1)}
                    d)
                  </span>
                </div>
              </div>
            </Tooltip>
            <Progress
              percent={Math.min(
                ((data.totalProjectHours || 0) /
                  (calculateProjectTotalPlannedHours(projectTasks) || 1)) *
                  100,
                100,
              )}
              status={
                data.totalProjectHours >
                calculateProjectTotalPlannedHours(projectTasks)
                  ? 'exception'
                  : 'normal'
              }
              size="small"
              showInfo={false}
            />
          </div>
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          남은시간
        </DescriptionItem>
        <DescriptionItem>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-xs">
                  {data.totalProjectHours >
                  calculateProjectTotalPlannedHours(projectTasks)
                    ? '초과'
                    : '남은'}
                  시간
                </span>
                <span
                  className={`font-medium ${
                    data.totalProjectHours >
                    calculateProjectTotalPlannedHours(projectTasks)
                      ? 'text-red-500'
                      : 'text-gray-700'
                  }`}
                >
                  {Math.abs(
                    calculateProjectTotalPlannedHours(projectTasks) -
                      (data.totalProjectHours || 0),
                  )}
                  h
                </span>
              </div>
            </div>
            <Progress
              percent={Math.abs(
                ((calculateProjectTotalPlannedHours(projectTasks) -
                  (data.totalProjectHours || 0)) /
                  (calculateProjectTotalPlannedHours(projectTasks) || 1)) *
                  100,
              )}
              status={
                data.totalProjectHours >
                calculateProjectTotalPlannedHours(projectTasks)
                  ? 'exception'
                  : 'normal'
              }
              size="small"
              showInfo={false}
              strokeColor={
                data.totalProjectHours >
                calculateProjectTotalPlannedHours(projectTasks)
                  ? '#ff4d4f'
                  : '#52c41a'
              }
            />
          </div>
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          중요도
        </DescriptionItem>
        <DescriptionItem>{data.importanceLevel?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          계획시간검증
        </DescriptionItem>
        <DescriptionItem>
          <Tooltip
            content={
              <div className="flex flex-col gap-1 text-xs">
                {(() => {
                  const validation = validateProjectPlanningHours(
                    data,
                    calculateProjectTotalPlannedHours(projectTasks),
                  );
                  return (
                    <>
                      <div>
                        프로젝트 금액:{' '}
                        {validation.totalAmount
                          ? `${validation.totalAmount.toLocaleString()}원`
                          : '정보없음'}
                      </div>
                      <div>
                        계획시간:{' '}
                        {calculateProjectTotalPlannedHours(projectTasks)}
                        시간
                      </div>
                      {validation.totalAmount ? (
                        <>
                          <div>
                            금액대비 적정시간: {validation.expectedHours}시간
                          </div>
                          <div>
                            시간 차이: {validation.difference > 0 ? '+' : ''}
                            {validation.difference}시간
                          </div>
                          <div>
                            비율 차이: {validation.percentage > 0 ? '+' : ''}
                            {validation.percentage}%
                          </div>
                          <div>
                            시간당 단가:{' '}
                            {validation.hourlyRate.toLocaleString()}원
                          </div>
                          <div
                            className={`font-medium ${
                              validation.status === 'error'
                                ? 'text-red-600'
                                : validation.status === 'warning'
                                ? 'text-amber-600'
                                : validation.status === 'caution'
                                ? 'text-blue-600'
                                : 'text-green-600'
                            }`}
                          >
                            검증결과: {validation.message}
                          </div>
                          <div className="text-gray-400 border-t pt-1 mt-1">
                            * 5% 초과 시 초과, 20% 미만 시 부족, 10% 미만 시
                            주의
                          </div>
                        </>
                      ) : (
                        <div className="text-amber-500">
                          매출정보를 입력하면 검증이 가능합니다
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            }
          >
            <div className="flex items-center gap-2">
              {(() => {
                const validation = validateProjectPlanningHours(
                  data,
                  calculateProjectTotalPlannedHours(projectTasks),
                );
                return (
                  <>
                    <Badge
                      className={`${
                        validation.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : validation.status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : validation.status === 'caution'
                          ? 'bg-blue-100 text-blue-800'
                          : validation.status === 'disabled'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-green-100 text-green-800'
                      }`}
                      label={validation.message}
                    />
                    {validation.totalAmount && (
                      <div className="flex items-center gap-1 text-sm">
                        <span
                          className={`font-medium ${
                            validation.status === 'error'
                              ? 'text-red-600'
                              : validation.status === 'warning'
                              ? 'text-amber-600'
                              : validation.status === 'caution'
                              ? 'text-blue-600'
                              : 'text-green-600'
                          }`}
                        >
                          {validation.percentage > 0 ? '+' : ''}
                          {validation.percentage}%
                        </span>
                        <span className="text-gray-500">
                          ({validation.expectedHours}h 기준)
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </Tooltip>
        </DescriptionItem>
      </DescriptionRow>

      {/* 3열: 고객사, 사업부/서비스, 위험도(기간/시간), 담당자 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          고객사
        </DescriptionItem>
        <DescriptionItem>
          {data?.sfa?.customer?.name || data?.customer?.name || '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          사업부/서비스
        </DescriptionItem>
        <DescriptionItem>
          {data.team?.name || '-'} / {data.service?.name || '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          위험도(기간/시간)
        </DescriptionItem>
        <DescriptionItem>
          {data.scheduleRisk || '정상'} / {data.timeRisk || '정상'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          프로젝트 금액
        </DescriptionItem>
        <DescriptionItem>
          <Tooltip
            content={
              <div className="flex flex-col gap-1 text-xs">
                {(() => {
                  const priceDetails = getProjectPriceDetails(data);
                  return (
                    <>
                      <div>
                        사업부: {data.team?.name || '정보없음'} / 서비스:{' '}
                        {data.service?.name || '정보없음'}
                      </div>
                      {priceDetails.hasMatchedItems ? (
                        <>
                          <div className="border-t pt-1 mt-1">
                            <div className="font-medium">매칭된 SFA 항목:</div>
                            {priceDetails.matchedItems.map((item, index) => (
                              <div key={index} className="ml-2">
                                • {item.itemName} ({item.teamName}):{' '}
                                {item.formattedPrice}
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-1 mt-1 font-medium">
                            총 프로젝트 금액: {priceDetails.formattedPrice}
                          </div>
                        </>
                      ) : (
                        <div className="text-amber-500">
                          일치하는 SFA 항목이 없습니다
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            }
          >
            <span className="cursor-help">
              {formatProjectPrice(calculateProjectPrice(data))}
            </span>
          </Tooltip>
        </DescriptionItem>
        {/* <DescriptionItem label width="w-[140px]">
          담당자
        </DescriptionItem>
        <DescriptionItem>{data.manager?.name || '-'}</DescriptionItem> */}
      </DescriptionRow>

      {/* 4행:  */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          사업년도
        </DescriptionItem>
        <DescriptionItem>{data.fy?.name || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          SFA
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {data.sfa?.name || '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          이슈사항
        </DescriptionItem>
        <DescriptionItem>{data.issueCount || '-'}</DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          비고
        </DescriptionItem>
        <DescriptionItem className="flex-1">
          {data.remarks || '-'}
        </DescriptionItem>
      </DescriptionRow>
    </Description>
  );
};

export default ProjectDetailTable;
