# Dashboard 승인 대기 기능 분석

> **분석일:** 2025-01-23

---

## 기능 개요

프로젝트 등록 시 초기 상태는 **'보류/대기'(85)**로 설정되며, 사용자가 선택한 상태로의 전환은 **승인 대기** 상태로 등록됩니다. 대시보드에서 승인권자가 해당 요청을 **승인** 또는 **반려** 처리합니다.

---

## 컴포넌트 구조

```
DashboardPage
├── StatCard (승인 대기 / 진행 중 / 완료)
└── ApprovalPendingWidget
    ├── ApprovalCard (목록 아이템)
    └── ApprovalDetailDrawer (상세 Drawer)
        ├── StatusChangeSummary (상태 변경 요약)
        ├── ReviewForm (검토 의견 입력)
        └── ApprovalActionButtons (승인/반려 버튼)
```

---

## 1. 대시보드 페이지

**파일 경로:** `src/features/dashboard/pages/DashboardPage.jsx`

### 레이아웃 구성

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD                                                   │
│  프로젝트 현황 및 승인 대기 항목을 확인하세요                │
├───────────────────┬───────────────────┬─────────────────────┤
│   [승인 대기]     │   [진행 중]       │   [완료]            │
│      3            │      12           │      45             │
├───────────────────┴───────────────────┴─────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │   승인 대기 위젯    │  │   내 프로젝트       │           │
│  │   (ApprovalPending) │  │   (추후 구현)       │           │
│  └─────────────────────┘  └─────────────────────┘           │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │   상태별 분포       │  │   완료 추세         │           │
│  │   (추후 구현)       │  │   (추후 구현)       │           │
│  └─────────────────────┘  └─────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 사용 훅
```javascript
const { stats, isLoading } = useDashboardStats();      // 진행중/완료 통계
const { total: approvalPendingCount } = useApprovalPending(); // 승인 대기 수
```

---

## 2. 승인 대기 위젯 (ApprovalPendingWidget)

**파일 경로:** `src/features/dashboard/components/widgets/ApprovalPendingWidget.jsx`

### 기능
- 승인 대기 목록 표시 (최대 5건)
- 새로고침 버튼
- 클릭 시 상세 Drawer 열림
- 5건 초과 시 "전체 보기" 버튼 표시

### 상태 관리
```javascript
const { approvals, total, isLoading, refetch } = useApprovalPending();
const [selectedApproval, setSelectedApproval] = useState(null);
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
```

### 자동 갱신
- `REFRESH_INTERVALS.approvalPending`: **1분마다** 자동 갱신
- `refetchOnWindowFocus: true`: 윈도우 포커스 시 갱신

---

## 3. 승인 카드 (ApprovalCard)

**파일 경로:** `src/features/dashboard/components/cards/ApprovalCard.jsx`

### 표시 정보

| 영역 | 내용 |
|------|------|
| 왼쪽 | 승인 유형 Badge, 프로젝트명, 고객사명 |
| | 요청 시간 (상대시간), 요청자 |
| 오른쪽 | 이전 상태 → 다음 상태 (색상 Badge) |
| 하단 | 상태 세부 내용 (statusDetail) |

### 승인 유형 결정 로직
```javascript
const getApprovalType = () => {
  if (!fromStatus) {
    return { label: '신규', color: 'bg-green-100 text-green-800' };
  }
  if (toStatus?.name === '종료') {
    return { label: '종료', color: 'bg-gray-100 text-gray-800' };
  }
  if (toStatus?.name === '중간검수' || toStatus?.name === '고객검수') {
    return { label: '검수', color: 'bg-blue-100 text-blue-800' };
  }
  return { label: '변경', color: 'bg-yellow-100 text-yellow-800' };
};
```

| 유형 | 조건 | 색상 |
|------|------|------|
| 신규 | `fromStatus` 없음 (새 프로젝트) | 녹색 |
| 종료 | `toStatus.name === '종료'` | 회색 |
| 검수 | `toStatus.name`이 '중간검수' 또는 '고객검수' | 파란색 |
| 변경 | 그 외 | 노란색 |

---

## 4. 승인 상세 Drawer (ApprovalDetailDrawer)

**파일 경로:** `src/features/dashboard/components/approval/ApprovalDetailDrawer.jsx`

### 구조

```
┌─────────────────────────────────────────────────┐
│  승인 요청 상세                            [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [프로젝트 정보]                                │
│  ┌─────────────────────────────────────────┐   │
│  │ 프로젝트명: OOO 프로젝트                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [상태 변경 내역] (StatusChangeSummary)         │
│  ┌─────────────────────────────────────────┐   │
│  │ ● 보류/대기  →  ● 시작전                │   │
│  │ 상태 세부 내용: ...                     │   │
│  │ 변경 사유: ...                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [요청 정보]                                    │
│  👤 요청자: admin                              │
│  📅 요청일: 2025-01-23 10:30                   │
│                                                 │
│  [종료 정보] (종료 상태 전환 시에만 표시)       │
│  ┌─────────────────────────────────────────┐   │
│  │ 종료 유형: [선택하세요 ▼] *              │   │
│  │ 종료 일자: [2025-01-23]                 │   │
│  │ ⚠ 프로젝트를 종료하면 더 이상 상태를    │   │
│  │   변경할 수 없습니다.                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [승인 의견] (ReviewForm)                       │
│  ┌─────────────────────────────────────────┐   │
│  │ 검토 의견을 입력해주세요 (선택사항)     │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [반려]                      [승인]             │
└─────────────────────────────────────────────────┘
```

### 종료 상태 처리
- `toStatus.id === 90` (종료)일 때 종료 정보 입력 필드 표시
- **종료 유형** 선택 필수 (`pjtClosureType`)
- **종료 일자** 입력 (기본값: 오늘)

### 반려 플로우
1. [반려] 클릭 → `showRejectForm = true`
2. 반려 사유 입력 폼 표시 (필수)
3. [반려 확정] 클릭 → API 호출

---

## 5. 훅 상세

### useApprovalPending

**파일 경로:** `src/features/dashboard/hooks/useApprovalPending.js`

```javascript
export const useApprovalPending = () => {
  const query = useQuery({
    ...buildApprovalPendingQuery(),
    refetchInterval: REFRESH_INTERVALS.approvalPending, // 1분
    refetchOnWindowFocus: true,
  });

  return {
    approvals: query.data?.data || [],
    total: query.data?.meta?.pagination?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
```

### useApprovalActions

**파일 경로:** `src/features/dashboard/hooks/useApprovalActions.js`

#### handleApprove (승인 처리)
```javascript
const handleApprove = async (
  projectDocumentId,
  statusChangeDocumentId,
  toStatusId,
  approvalComment,
  closureData  // 종료 시: { projectId, closureDate, closureType }
) => {
  // 1. 상태 변경 이력 업데이트 (approved)
  // 2. 프로젝트 상태 업데이트
  // 3. 종료 시 project_closures 생성
  // 4. 캐시 무효화
};
```

#### handleReject (반려 처리)
```javascript
const handleReject = async (
  projectDocumentId,
  statusChangeDocumentId,
  approvalComment  // 필수
) => {
  // 1. 반려 사유 필수 체크
  // 2. 상태 변경 이력 업데이트 (rejected)
  // 3. 프로젝트 currentApprovalStatus 업데이트
  // 4. 캐시 무효화
};
```

---

## 6. API 서비스 (approvalApiService)

**파일 경로:** `src/features/dashboard/api/approvalApiService.js`

### 주요 API

| 메서드 | 설명 |
|--------|------|
| `getApprovalPendingList()` | 승인 대기 목록 조회 |
| `getApprovalDetail(projectId)` | 승인 상세 조회 |
| `approveStatusChange(...)` | 승인 처리 |
| `rejectStatusChange(...)` | 반려 처리 |
| `getDashboardStats()` | 대시보드 통계 조회 |

### getApprovalPendingList 쿼리

```javascript
// projects 테이블에서 current_approval_status가 'pending'인 항목 조회
const response = await apiClientV2.get('/projects', {
  params: {
    filters: {
      current_approval_status: { $eq: 'pending' },
    },
    populate: {
      pjt_status: { fields: ['name', 'code'] },
      customer: { fields: ['name'] },
      project_status_changes: {
        sort: ['id:desc'],
        populate: {
          from_status: { fields: ['name', 'code'] },
          to_status: { fields: ['name', 'code'] },
          requested_by: true,
        },
      },
    },
    sort: ['id:desc'],
  },
});
```

### approveStatusChange 처리 흐름

```
1. project_status_changes 업데이트
   ├── approvalStatus: 'approved'
   ├── approvedAt: 현재 시간
   ├── approvedBy: 승인자 ID
   └── approvalComment: 승인 의견

2. projects 업데이트
   ├── pjtStatus: toStatusId (새 상태)
   ├── currentApprovalStatus: 'approved'
   └── isClosed: true (종료 시에만)

3. project_closures 생성 (종료 시에만)
   ├── project: projectId
   ├── closureType: 종료 유형 ID
   ├── closureDate: 종료 일자
   └── closureBy: 승인자 ID
```

### rejectStatusChange 처리 흐름

```
1. project_status_changes 업데이트
   ├── approvalStatus: 'rejected'
   ├── approvedAt: 현재 시간
   ├── approvedBy: 승인자 ID
   └── approvalComment: 반려 사유

2. projects 업데이트
   └── currentApprovalStatus: 'rejected'
   (pjtStatus는 변경하지 않음 - 기존 상태 유지)
```

---

## 7. 데이터 흐름

### 프로젝트 등록 → 승인 대기 등록

```
[프로젝트 등록 (ProjectRegistrationDrawer)]
     │
     ├── 1. projects 생성 (pjtStatus: 85 보류/대기)
     │
     ├── 2. project_status_changes 생성
     │       ├── fromStatus: 85 (보류/대기)
     │       ├── toStatus: 사용자 선택 상태
     │       ├── approvalStatus: 'pending'
     │       └── requestedBy: 현재 사용자
     │
     └── 3. projects.currentApprovalStatus = 'pending'
```

### 대시보드 승인 처리

```
[대시보드 승인 대기 위젯]
     │
     ├── useApprovalPending()
     │   └── GET /projects?filters[current_approval_status][$eq]=pending
     │
     ├── [카드 클릭] → ApprovalDetailDrawer 열림
     │
     ├── [승인 클릭]
     │   ├── PUT /project-status-changes/:id (approved)
     │   ├── PUT /projects/:id (상태 변경)
     │   └── POST /project-closures (종료 시)
     │
     └── [반려 클릭]
         ├── PUT /project-status-changes/:id (rejected)
         └── PUT /projects/:id (currentApprovalStatus만 변경)
```

---

## 8. 상수 정의

**파일 경로:** `src/features/dashboard/constants/dashboardConstants.js`

### 자동 새로고침 간격

| 항목 | 간격 |
|------|------|
| `dashboardStats` | 30초 |
| `approvalPending` | 1분 |
| `myProjects` | 2분 |

### 승인 상태

| 상태 | 라벨 | 색상 |
|------|------|------|
| `pending` | 승인 대기 | orange |
| `approved` | 승인 완료 | green |
| `rejected` | 반려 | red |

---

## 9. 관련 파일 목록

| 구분 | 파일 경로 |
|------|----------|
| **페이지** | `src/features/dashboard/pages/DashboardPage.jsx` |
| **위젯** | `src/features/dashboard/components/widgets/ApprovalPendingWidget.jsx` |
| **카드** | `src/features/dashboard/components/cards/ApprovalCard.jsx` |
| | `src/features/dashboard/components/cards/StatCard.jsx` |
| **Drawer** | `src/features/dashboard/components/approval/ApprovalDetailDrawer.jsx` |
| **하위 컴포넌트** | `src/features/dashboard/components/approval/StatusChangeSummary.jsx` |
| | `src/features/dashboard/components/approval/ReviewForm.jsx` |
| | `src/features/dashboard/components/approval/ApprovalActionButtons.jsx` |
| **훅** | `src/features/dashboard/hooks/useApprovalPending.js` |
| | `src/features/dashboard/hooks/useApprovalActions.js` |
| | `src/features/dashboard/hooks/useDashboardStats.js` |
| **API** | `src/features/dashboard/api/approvalApiService.js` |
| | `src/features/dashboard/api/queries.js` |
| **상수** | `src/features/dashboard/constants/dashboardConstants.js` |

---

## 10. DB 테이블 관계

```
projects
├── id
├── name
├── pjt_status (FK → codebook_items)
├── current_approval_status ('pending' | 'approved' | 'rejected')
├── is_closed (boolean)
└── ...

project_status_changes
├── id
├── project (FK → projects)
├── from_status (FK → codebook_items)
├── to_status (FK → codebook_items)
├── approval_status ('pending' | 'approved' | 'rejected')
├── requested_by (FK → users)
├── requested_at
├── approved_by (FK → users)
├── approved_at
├── approval_comment
├── status_detail
└── change_description

project_closures (종료 시 생성)
├── id
├── project (FK → projects)
├── closure_type (FK → codebook_items)
├── closure_date
└── closure_by (FK → users)
```
