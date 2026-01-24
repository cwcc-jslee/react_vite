// src/features/project/components/table/ProjectTable.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, TableColumnMenu } from '@shared/components/ui';
import { Pagination } from '@shared/components/ui/pagination/Pagination';
import { useTableColumns } from '@shared/hooks/useTableColumns';
import { fetchProjectDetail } from '../../store/projectStoreActions';
import Badge from '@shared/components/ui/badge/Badge';

// 컴포넌트

const COLUMNS = [
  { key: 'id', title: 'ID', align: 'left', essential: true },
  {
    key: 'scheduleStatus',
    title: (
      <div className="text-xs leading-tight">
        <div>일정상태/</div>
        <div>종료타입</div>
      </div>
    ),
    align: 'center',
  },
  {
    key: 'remainingDays',
    title: (
      <div className="text-xs leading-tight">
        <div>잔여일정/</div>
        <div>종료일</div>
      </div>
    ),
    align: 'center',
  },
  { key: 'taskStatus', title: 'TASK상태', align: 'center' },
  { key: 'timeOverStatus', title: '시간초과', align: 'center' },
  { key: 'customer', title: '고객사', align: 'left' },
  { key: 'name', title: '프로젝트명', align: 'left', essential: true },
  { key: 'progressStatus', title: '진행상태', align: 'center' },
  { key: 'approvalStatus', title: '승인상태', align: 'center' },
  { key: 'importanceLevel', title: '중요도', align: 'center' },
  { key: 'projectProgress', title: '진행률', align: 'center' },
  { key: 'taskCount', title: 'TASK', align: 'center' },
  { key: 'service', title: '서비스', align: 'center' },
  // { key: 'tag', title: '시작일', align: 'center' },
  { key: 'projectPeriod', title: '프로젝트기간', align: 'center' },
  { key: 'lastDate', title: '최근작업일', align: 'center' },
  {
    key: 'totalProjectHours',
    title: (
      <div className="text-xs leading-tight">
        <div>계획/실제</div>
        <div>시간</div>
      </div>
    ),
    align: 'center',
  },
  { key: 'action', title: 'Action', align: 'center', essential: true },
];

const DEFAULT_VISIBLE_COLUMNS = [
  'id',
  'scheduleStatus',
  'remainingDays',
  'taskStatus',
  'timeOverStatus',
  'customer',
  'name',
  'progressStatus',
  'approvalStatus',
  'projectProgress',
  'projectPeriod',
  'totalProjectHours',
  'action',
];

// 테이블 로딩 상태 컴포넌트
const TableLoadingIndicator = ({ columnsCount }) => {
  return (
    <tr>
      <td colSpan={columnsCount} className="py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">
            데이터를 불러오는 중입니다...
          </span>
        </div>
      </td>
    </tr>
  );
};

// 테이블 빈 상태 컴포넌트
const TableEmptyState = ({ columnsCount }) => {
  return (
    <tr>
      <td colSpan={columnsCount} className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-gray-500">데이터가 없습니다</span>
        </div>
      </td>
    </tr>
  );
};

// 테이블 에러 상태 컴포넌트
const TableErrorState = ({ columnsCount, message }) => {
  return (
    <tr>
      <td colSpan={columnsCount} className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-red-500">
            {message || '데이터를 불러오는 중 오류가 발생했습니다'}
          </span>
        </div>
      </td>
    </tr>
  );
};

// 잔여일정 계산 함수
const formatRemainingDays = (item) => {
  // isClosed가 true이면 잔여일정 표시 안함
  if (item?.isClosed) return <span>-</span>;

  // endDate가 없으면 planEndDate 사용
  const planEndDate = item?.endDate || item?.planEndDate;

  if (!planEndDate) return <span>-</span>;

  const today = new Date();
  const endDate = new Date(planEndDate);

  // 시간을 제거하고 날짜만 비교 (자정 기준)
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    // 남은 일정
    const colorClass =
      diffDays <= 3
        ? 'text-orange-500 font-bold'
        : diffDays <= 7
        ? 'text-gray-700'
        : 'text-blue-500';

    return <span className={`text-xs ${colorClass}`}>D-{diffDays}일</span>;
  } else if (diffDays === 0) {
    // 당일
    return <span className="text-xs text-purple-600 font-bold">D-Day</span>;
  } else {
    // 지연 상황
    const delayDays = Math.abs(diffDays);
    return (
      <span className="text-xs text-red-500 font-bold">+{delayDays}일</span>
    );
  }
};

// 시간초과 상태 계산 함수
const formatTimeOverStatus = (item) => {
  if (!item?.projectTasks?.length) return '-';

  // 모든 태스크의 계획시간 합계
  const totalPlannedHours = item.projectTasks.reduce(
    (sum, task) => sum + (task.planningTimeData?.totalPlannedHours || 0),
    0,
  );

  // 실제 투입시간 (billable + non_billable)
  const totalActualHours =
    (item.totalProjectHours || 0) + (item.totalProjectNonBillableHours || 0);

  // 진행률 (현재는 100%로 가정, 향후 실제 진행률 적용)
  const progressRate = 100; // TODO: 실제 진행률로 변경 예정

  // 현재 진행률 100% 가정하에 실제시간과 계획시간 직접 비교
  if (totalActualHours <= totalPlannedHours) {
    // 계획시간 내
    return <span className="text-xs text-green-600 font-medium">정상</span>;
  } else {
    // 계획시간 초과
    const overHours = totalActualHours - totalPlannedHours;
    return (
      <span className="text-xs text-red-500 font-bold">+{overHours}h</span>
    );
  }
};

// 계획/실제 시간 계산 함수
const formatProjectHours = (item) => {
  if (!item?.projectTasks?.length) return '-';

  // console.log('***** 시간계산 ******', item);

  // 모든 태스크의 계획시간 합계 (planningTimeData.totalPlannedHours)
  const totalPlannedHours = item.projectTasks.reduce(
    (sum, task) => sum + (task.planningTimeData?.totalPlannedHours || 0),
    0,
  );

  // 실제 투입시간 (billable + non_billable)
  const totalActualHours =
    (item.totalProjectHours || 0) + (item.totalProjectNonBillableHours || 0);

  return (
    <div className="text-xs leading-tight">
      <div className="text-blue-600 font-medium">{totalPlannedHours}h</div>
      <div className="text-gray-600">/ {totalActualHours}h</div>
    </div>
  );
};

// 프로젝트 기간 계산 함수
const formatProjectPeriod = (item) => {
  // startDate가 없으면 planStartDate 사용, endDate가 없으면 planEndDate 사용
  const startDate = item?.startDate || item?.planStartDate;
  const endDate = item?.endDate || item?.planEndDate;

  if (!startDate || !endDate) return <span>-</span>;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 월 차이 계산 (더 정확한 계산)
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  let totalMonths = yearDiff * 12 + monthDiff;

  // 시작일보다 종료일의 날짜가 크거나 같으면 +1개월
  if (end.getDate() >= start.getDate()) {
    totalMonths += 1;
  }

  // 최소 1개월로 설정
  if (totalMonths <= 0) {
    totalMonths = 1;
  }

  // 날짜 포맷팅 (YYYY-MM-DD)
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="text-xs leading-tight">
      <div>{formatDate(start)}~</div>
      <div>
        {formatDate(end)}
        <span className="font-medium">({totalMonths}M)</span>
      </div>
    </div>
  );
};

// 테이블 행 컴포넌트
const TableRow = ({ item, index, pageSize, currentPage, actions, visibleColumns }) => {
  const dispatch = useDispatch();
  const actualIndex = (currentPage - 1) * pageSize + index + 1;

  // 프로젝트 상세정보 조회 핸들러 (Drawer 방식으로 변경)
  const handleViewDetail = () => {
    actions.detail.fetchDetailForDrawer(item.id);
  };

  const isColumnVisible = (key) => visibleColumns.includes(key);

  const renderCell = (key) => {
    switch (key) {
      case 'id':
        return item.id;
      case 'scheduleStatus':
        return item?.isClosed ? (
          <span className="text-xs font-medium text-gray-700">
            {item.projectClosure?.closureType?.name || '-'}
          </span>
        ) : item?.scheduleStatus ? (
          <Badge
            label={item.scheduleStatus}
            color={
              item.scheduleStatus === 'normal'
                ? 'success'
                : item.scheduleStatus === 'imminent'
                ? 'warning'
                : item.scheduleStatus === 'delayed'
                ? 'error'
                : 'default'
            }
          />
        ) : (
          '-'
        );
      case 'remainingDays':
        return item?.isClosed ? (
          item.projectClosure?.closureDate ? (
            <span className="text-xs text-gray-600">
              {item.projectClosure.closureDate}
            </span>
          ) : (
            '-'
          )
        ) : (
          formatRemainingDays(item)
        );
      case 'taskStatus':
        return item?.taskStatus ? (
          <Badge
            label={item.taskStatus}
            color={
              item.taskStatus === '정상'
                ? 'success'
                : item.taskStatus.startsWith('지연')
                ? 'error'
                : 'default'
            }
          />
        ) : (
          '-'
        );
      case 'timeOverStatus':
        return formatTimeOverStatus(item);
      case 'customer':
        return item?.sfa?.customer?.name || item?.customer?.name || '-';
      case 'name':
        return item.name || '-';
      case 'progressStatus':
        return item?.pjtStatus?.name ? (
          <Badge
            label={item.pjtStatus.name}
            color={
              item.pjtStatus.name === '진행중'
                ? 'success'
                : item.pjtStatus.name === '보류/대기'
                ? 'warning'
                : item.pjtStatus.name === '시작전'
                ? 'info'
                : item.pjtStatus.name === '중간검수'
                ? 'primary'
                : item.pjtStatus.name === '고객검수'
                ? 'primary'
                : item.pjtStatus.name === '종료'
                ? 'default'
                : 'default'
            }
          />
        ) : (
          '-'
        );
      case 'approvalStatus':
        return item?.currentApprovalStatus ? (
          <Badge
            label={item.currentApprovalStatus}
            color={
              item.currentApprovalStatus === '승인완료' ||
              item.currentApprovalStatus === '완료' ||
              item.currentApprovalStatus === 'approved'
                ? 'success'
                : item.currentApprovalStatus === '반려' ||
                  item.currentApprovalStatus === 'rejected'
                ? 'error'
                : item.currentApprovalStatus === '결재중' ||
                  item.currentApprovalStatus === '진행중' ||
                  item.currentApprovalStatus === 'pending'
                ? 'warning'
                : 'default'
            }
          />
        ) : (
          '-'
        );
      case 'importanceLevel':
        return item?.importanceLevel?.name ? (
          <Badge
            label={item.importanceLevel.name}
            color={
              item.importanceLevel.name === '상'
                ? 'success'
                : item.importanceLevel.name === '중'
                ? 'warning'
                : 'default'
            }
          />
        ) : (
          '-'
        );
      case 'projectProgress':
        return item?.calculatedProgress !== undefined ? (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`text-sm font-medium ${
                item.calculatedProgress >= 75
                  ? 'text-green-600'
                  : item.calculatedProgress >= 50
                  ? 'text-blue-600'
                  : item.calculatedProgress >= 25
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`}
            >
              {item.calculatedProgress}%
            </span>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  item.calculatedProgress >= 75
                    ? 'bg-green-500'
                    : item.calculatedProgress >= 50
                    ? 'bg-blue-500'
                    : item.calculatedProgress >= 25
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(item.calculatedProgress, 100)}%` }}
              />
            </div>
          </div>
        ) : item?.projectProgress ? (
          `${item.projectProgress}%`
        ) : (
          '-'
        );
      case 'taskCount':
        return item?.projectTasks?.length
          ? `${
              item.projectTasks.filter(
                (task) => task?.taskProgress?.name === '100%',
              ).length
            }/${item.projectTasks.length}`
          : '-';
      case 'service':
        return item?.service?.name;
      case 'projectPeriod':
        return formatProjectPeriod(item);
      case 'lastDate':
        return item?.lastWorkupdateDate;
      case 'totalProjectHours':
        return formatProjectHours(item);
      case 'action':
        return (
          <Button variant="outline" size="sm" onClick={handleViewDetail}>
            View
          </Button>
        );
      default:
        return '-';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      {COLUMNS.filter(col => isColumnVisible(col.key)).map(col => (
        <td
          key={col.key}
          className={`px-3 py-2 text-sm ${
            col.align === 'center' ? 'text-center' : 'text-left'
          }`}
        >
          {renderCell(col.key)}
        </td>
      ))}
    </tr>
  );
};

const ProjectList = ({
  items,
  pagination,
  filters,
  loading,
  error,
  actions,
}) => {
  console.log(`>>> items : `, items);

  const { visibleColumns, toggleColumn, resetColumns, showAllColumns } =
    useTableColumns(DEFAULT_VISIBLE_COLUMNS);

  const isColumnVisible = (key) => visibleColumns.includes(key);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-y border-gray-200">
            {COLUMNS.filter((col) => isColumnVisible(col.key)).map((column) => (
              <th
                key={column.key}
                className={`px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap
                  ${column.align === 'center' && 'text-center'}
                  ${column.align === 'right' && 'text-right'}
                `}
              >
                {column.key === 'action' ? (
                  <div className="flex items-center justify-center gap-1">
                    <TableColumnMenu
                      columns={COLUMNS}
                      visibleColumns={visibleColumns}
                      onToggleColumn={toggleColumn}
                      onReset={resetColumns}
                      onShowAll={showAllColumns}
                      essentialColumns={['id', 'name', 'action']}
                      defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
                    />
                  </div>
                ) : (
                  column.title
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <TableLoadingIndicator columnsCount={visibleColumns.length} />
          ) : error ? (
            <TableErrorState columnsCount={visibleColumns.length} message={error} />
          ) : !items?.length ? (
            <TableEmptyState columnsCount={visibleColumns.length} />
          ) : (
            items.map((item, index) => (
              <TableRow
                key={item.id}
                item={item}
                index={index}
                pageSize={pagination.pageSize}
                currentPage={pagination.current}
                actions={actions}
                visibleColumns={visibleColumns}
              />
            ))
          )}
        </tbody>
      </table>

      {!loading && !error && items?.length > 0 && (
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={actions.pagination.setPage}
          onPageSizeChange={actions.pagination.setPageSize}
        />
      )}
    </div>
  );
};

export default ProjectList;
