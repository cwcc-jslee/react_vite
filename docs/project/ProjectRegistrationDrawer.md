# 프로젝트 등록 Drawer 컴포넌트 분석

> **분석일:** 2025-01-23

---

## 컴포넌트 구조 개요

```
ProjectRegistrationDrawer (메인)
├── Step 1: ProjectBasicInfoForm (기본정보)
│   └── ProjectAddBaseForm (실제 폼 UI)
├── Step 2: TaskPlanningBoard (작업계획)
│   ├── KanbanColumn (칸반 컬럼)
│   └── TaskDetailDrawer (중첩 Drawer - 작업 상세)
└── Step 3: TaskVerificationStep (최종검증)
```

---

## 1. 메인 컴포넌트: ProjectRegistrationDrawer.jsx

**파일 경로:** `src/features/project/components/registration/ProjectRegistrationDrawer.jsx`

### 핵심 특징
- **3단계 Wizard 패턴**: `currentStep` 상태로 단계 관리
- **사용 훅**:
  - `useProjectTask` - 칸반 보드 상태 관리
  - `useProjectForm` - 폼 데이터/유효성 관리
  - `useProjectSubmit` - 제출 로직 및 진행률

### 주요 로직

| 단계 | 검증 항목 |
|------|----------|
| 1→2 | `isRequiredFieldsFilled` (필수 필드 체크) |
| 2→3 | 프로젝트 일정, 태스크 존재 여부, 태스크 유효성 검사 |
| 3→완료 | `handleFormSubmit()` 호출 |

### Drawer 설정
```jsx
<Drawer
  visible={visible}
  title="새 프로젝트 등록"
  onClose={onClose}
  width="XL"
  level="primary"
  enableOverlayClick={false}
  mode="add"
  animationEnabled={true}
/>
```

---

## 2. 1단계: 기본정보 입력

**파일 경로:**
- `src/features/project/components/registration/ProjectBasicInfoForm.jsx`
- `src/features/project/components/forms/ProjectAddBaseForm.jsx`

### 입력 필드 구성

| 섹션 | 필드 | 필수 | 비고 |
|------|------|------|------|
| **프로젝트 실행 정보** | 프로젝트명 | ✓ | 최소 3자 |
| | 작업유형 | ✓ | project/task/maintenance |
| | 상태 | - | `CREATABLE_PROJECT_STATUSES` 필터링 |
| | 사업부/서비스/사업년도/중요도 | ✓ | 코드북 기반 |
| **매출 및 고객 정보** | 매출유형 | ✓ | revenue/investment |
| | 고객사 | ✓ | `CustomerSearchInput` 사용 |
| | SFA | 조건부✓ | 매출유형=revenue일 때 필수 |
| | 매출이익 | 조건부✓ | SFA 선택 시 사업부별 배분 이익 표시 |

### 자동화 로직
- **사업년도(`fy`)**: 현재 연도 기반 자동 설정
- **중요도(`importanceLevel`)**: '중간' 기본값
- **매출이익**: 사업부 선택 시 해당 팀 이익 자동 매칭

### 필수 필드 검증 로직 (useProjectForm.js)
```javascript
const checkRequiredFields = useCallback(() => {
  const baseRequiredFields = [
    'projectType', 'workType', 'name',
    'customer', 'service', 'team', 'fy'
  ];

  // 1. 공통 필수 필드 체크
  const isBaseValid = baseRequiredFields.every((field) => {
    const value = formData[field];
    if (!value) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  });

  // 2. 조건부 필수 필드 (매출 유형일 때 SFA 필수)
  if (formData.projectType === 'revenue') {
    if (!formData.sfa || formData.sfa === '') return false;
  }

  // 3. 프로젝트명 길이 체크 (최소 3자)
  if (!formData.name || formData.name.trim().length < 3) return false;

  return true;
}, [formData]);
```

---

## 3. 2단계: 작업계획 (TaskPlanningBoard)

**파일 경로:** `src/features/project/components/registration/TaskPlanningBoard.jsx`

### 기능
- **칸반 보드**: 버킷(컬럼) + 태스크(카드) 관리
- **템플릿 적용**: `loadTemplate()` 함수로 사전 정의 구조 로드
- **공수 검증**: `PROJECT_COST_CONSTANTS.STANDARD_HOURLY_RATE` 기준 예산 대비 계획 공수 비교

### 상태 관리 (Redux `projectBucketSlice`)
```javascript
buckets: [
  {
    bucket: '버킷명',
    position: 0,
    tasks: [
      {
        name: '작업명',
        isScheduled: true,
        planStartDate,
        planEndDate,
        planningTimeData: {
          personnelCount,
          allocationRate,
          workDays,
          totalPlannedHours
        }
      }
    ]
  }
]
```

### 툴바 구성 (4분할)
1. **계획 시작일**: date input
2. **계획 종료일**: date input
3. **작업 템플릿 적용**: select (템플릿 목록)
4. **작업 공수 검증 카드**: 계획 시간 vs 가용 공수

### 공수 검증 로직
```javascript
// 총 계획 시간 계산
const totalPlannedHours = useMemo(() => {
  return buckets.reduce((acc, bucket) => {
    return acc + bucket.tasks.reduce((tAcc, task) => {
      const taskHours = parseFloat(task.planningTimeData?.totalPlannedHours) || 0;
      return tAcc + taskHours;
    }, 0);
  }, 0);
}, [buckets]);

// 매출 이익 기반 가용 공수 계산
const sfaBudgetHours = useMemo(() => {
  const profit = Number(formData.revenueProfit) || 0;
  return Math.floor(profit / PROJECT_COST_CONSTANTS.STANDARD_HOURLY_RATE);
}, [formData.revenueProfit]);
```

---

## 4. 3단계: 최종검증 (TaskVerificationStep)

**파일 경로:** `src/features/project/components/registration/TaskVerificationStep.jsx`

### 컴포넌트 구조

```
TaskVerificationStep
├── 좌측 컬럼 (col-span-3) - 메트릭 & 분석
│   ├── StatCard x4 (총 계획 공수, 가용 공수, 투입 효율, 등록 태스크)
│   ├── Placeholder Card (향후 기능 예정)
│   └── Budget Validation Summary (공수 검증 진행바)
│
└── 우측 컬럼 (col-span-9) - 프로젝트 정보 & 작업 상세
    ├── Header Banner (프로젝트명, 유형, 고객사, 일정, 예상이익)
    ├── Management Details (사업부, 서비스, 사업년도, 중요도)
    └── Task Breakdown Table (버킷별 작업 목록)
```

### 데이터 소스

```javascript
// 1단계에서 입력한 폼 데이터
const { formData } = useProjectForm();

// 2단계에서 구성한 칸반 보드 데이터
const { buckets } = useProjectTask();
```

### 핵심 계산 로직

#### 가용 공수 계산 (Budget Hours)
```javascript
const revenueProfit = Number(formData.revenueProfit) || 0;
const budgetHours = Math.floor(revenueProfit / PROJECT_COST_CONSTANTS.STANDARD_HOURLY_RATE);
```
- 매출이익 ÷ 시간당 단가 = 가용 공수
- 예: 이익 1,000만원 ÷ 시간당 5만원 = 200시간

#### 총 계획 공수 계산 (Total Planned Hours)
```javascript
const totalHours = useMemo(() => {
  return buckets.reduce((acc, bucket) => {
    return acc + bucket.tasks.reduce((tAcc, task) => {
      return tAcc + (parseFloat(task.planningTimeData?.totalPlannedHours) || 0);
    }, 0);
  }, 0);
}, [buckets]);
```

#### 투입 효율 계산 (Efficiency Rate)
```javascript
const efficiencyRate = budgetHours > 0 ? Math.round((totalHours / budgetHours) * 100) : 0;
const isOverBudget = totalHours > budgetHours;
```

#### 프로젝트 기간 계산
```javascript
const calculateDuration = () => {
  if (!formData.planStartDate || !formData.planEndDate) return 0;
  const start = new Date(formData.planStartDate);
  const end = new Date(formData.planEndDate);
  return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
};
```

### StatCard 컴포넌트

```javascript
const StatCard = ({ label, value, subValue, icon: Icon, colorClass, isWarn = false }) => (
  <div className={`bg-white p-5 rounded-2xl border ${isWarn ? 'border-red-200' : 'border-gray-100'}`}>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <h4 className={`text-xl font-bold ${isWarn ? 'text-red-600' : 'text-gray-800'}`}>{value}</h4>
      {subValue && <p className="text-[11px] text-gray-400">{subValue}</p>}
    </div>
    <div className={`p-2.5 rounded-xl ${colorClass}`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);
```

### 4개의 StatCard 구성

| 카드 | label | value | subValue | icon | colorClass | 조건 |
|------|-------|-------|----------|------|------------|------|
| 1 | 총 계획 공수 | `{totalHours} h` | "Estimated Effort" | FiClock | bg-orange-500 | `isWarn={isOverBudget}` |
| 2 | 가용 공수 | `{budgetHours} h` 또는 "무제한" | "Budget Threshold" | FiPieChart | bg-blue-500 | 투자형이면 "무제한" |
| 3 | 투입 효율 | `{efficiencyRate}%` 또는 "N/A" | "예산 초과 주의" / "예산 내 적정" | FiTrendingUp | bg-teal-500 / bg-red-500 | `isWarn={isOverBudget}` |
| 4 | 등록 태스크 | `{totalTasks} 건` | `{totalBuckets} 개의 카테고리` | FiLayers | bg-indigo-500 | - |

### 공수 검증 Summary (매출형 프로젝트만 표시)

```javascript
{formData.projectType === 'revenue' && (
  <div className={`rounded-xl p-4 border ${isOverBudget ? 'bg-red-50' : 'bg-green-50'}`}>
    {/* 진행바 */}
    <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
        style={{ width: `${Math.min(efficiencyRate, 100)}%` }}
      />
    </div>
    {/* 메시지 */}
    <p>
      {isOverBudget
        ? `예산(${budgetHours}h) 초과! 조정 필요.`
        : `예산 내 적정 수준입니다.`}
    </p>
  </div>
)}
```

### Task Breakdown Table 구조

```javascript
<table>
  <thead>
    <tr>
      <th>버킷명 (단계)</th>      {/* w-[20%] */}
      <th>주요 작업 (최대 2개)</th> {/* w-[60%] */}
      <th>총 공수</th>            {/* w-[20%] */}
    </tr>
  </thead>
  <tbody>
    {buckets.map((bucket, idx) => {
      const bucketHours = bucket.tasks.reduce((sum, t) =>
        sum + (parseFloat(t.planningTimeData?.totalPlannedHours) || 0), 0
      );
      const displayTasks = bucket.tasks.slice(0, 2);
      const extraCount = bucket.tasks.length - 2;

      return (
        <tr>
          <td>
            <span>{bucket.bucket}</span>
            <span>{bucket.tasks.length}개의 작업</span>
          </td>
          <td>
            {displayTasks.map(task => (
              <div>
                <span>{task.name}</span>
                <span>{task.planningTimeData?.totalPlannedHours || 0}h</span>
              </div>
            ))}
            {extraCount > 0 && <span>+ 외 {extraCount}개 작업 더보기...</span>}
          </td>
          <td>{bucketHours} h</td>
        </tr>
      );
    })}
  </tbody>
</table>
```

### 프로젝트 유형별 차이점

| 항목 | 매출형 (revenue) | 투자형 (investment) |
|------|-----------------|-------------------|
| 가용 공수 | `budgetHours` (이익 기반 계산) | "무제한" |
| 투입 효율 | `efficiencyRate%` | "N/A" |
| 예산 초과 경고 | O (isOverBudget 적용) | X |
| 공수 검증 Summary | O | X |
| 예상 이익 표시 | O | X |

### 레이아웃 그리드

```
┌─────────────────────────────────────────────────────────────┐
│                    max-w-6xl mx-auto                        │
├─────────────┬───────────────────────────────────────────────┤
│  col-span-3 │                 col-span-9                    │
│  (25%)      │                 (75%)                         │
├─────────────┼───────────────────────────────────────────────┤
│ [StatCard]  │ ┌─────────────────────────────────────────┐   │
│ 총 계획 공수 │ │ Header Banner                           │   │
├─────────────┤ │ Revenue | 고객사명                      │   │
│ [StatCard]  │ │ 프로젝트명                              │   │
│ 가용 공수   │ │ 일정 | Total: XXh        Est. Profit    │   │
├─────────────┤ └─────────────────────────────────────────┘   │
│ [StatCard]  │                                               │
│ 투입 효율   │ ┌─────────────────────────────────────────┐   │
├─────────────┤ │ Management Details (horizontal)         │   │
│ [StatCard]  │ │ 사업부 | 서비스 | 사업년도 | 중요도     │   │
│ 등록 태스크 │ └─────────────────────────────────────────┘   │
├─────────────┤                                               │
│ [Placeholder]│ ┌─────────────────────────────────────────┐   │
│ 향후 기능   │ │ Task Breakdown Table                    │   │
├─────────────┤ │ ┌───────┬────────────────────┬────────┐ │   │
│ [Validation]│ │ │버킷명 │ 주요 작업          │ 총공수 │ │   │
│ 공수 검증   │ │ ├───────┼────────────────────┼────────┤ │   │
│ (매출형만) │ │ │기획   │ • 요구사항 분석 8h │  24h   │ │   │
│             │ │ │       │ • 화면설계 16h     │        │ │   │
│             │ │ ├───────┼────────────────────┼────────┤ │   │
│             │ │ │개발   │ • API 개발 40h     │  80h   │ │   │
│             │ │ │       │ • 프론트 구현 40h  │        │ │   │
│             │ │ └───────┴────────────────────┴────────┘ │   │
│             │ └─────────────────────────────────────────┘   │
└─────────────┴───────────────────────────────────────────────┘
```

---

## 5. 주요 훅 분석

### useProjectForm.js

**파일 경로:** `src/features/project/hooks/useProjectForm.js`

- Redux `projectSlice.form` 상태 연결
- `isRequiredFieldsFilled`: 1단계 필수 필드 검증 로직
- `updateField`: 이벤트 또는 직접 값 업데이트 지원

```javascript
return {
  formData,
  formErrors,
  isSubmitting,
  formMode,
  isFormValid,
  editingId,
  isDirty,
  formProgress,
  isRequiredFieldsFilled,
  createForm,
  resetForm,
  updateField,
  updateFields,
  getProgressColor,
};
```

### useProjectTask.js

**파일 경로:** `src/features/project/hooks/useProjectTask.js`

- Redux `projectBucketSlice` 상태 연결
- 칸반 CRUD: `addTask`, `updateTask`, `deleteTask`, `addColumn`, etc.
- `loadTemplate()`: API로 템플릿 조회 후 Redux 상태 설정
- `syncProjectTasksToKanban()`: 서버 데이터→칸반 형식 변환

```javascript
return {
  buckets,
  editState,
  completedExpanded,
  setProjectBuckets,
  syncProjectTasksToKanban,
  startEditing,
  startEditingColumnTitle,
  handleEditChange,
  saveEdit,
  cancelEdit,
  handleColumnTitleChange,
  addTask,
  updateTask,
  saveTaskEditor,
  deleteTask,
  toggleTaskCompletion,
  addColumn,
  deleteColumn,
  moveColumn,
  toggleCompletedSection,
  loadTemplate,
  resetKanbanBoard,
};
```

### useProjectSubmit.js

**파일 경로:** `src/features/project/hooks/useProjectSubmit.js`

#### 제출 프로세스

1. 유효성 검사 (폼 + 버킷/태스크)
2. 데이터 전처리 (`prepareCleanData`, `processRelationFields`)
3. 프로젝트 생성 API 호출 (초기 상태: 85 보류/대기)
4. 상태 변경 이력 생성
5. 버킷별 순차 처리 (버킷 생성 → 태스크 생성)
6. 진행률 표시 (`progress`, `processingStep`)

```javascript
return {
  isSubmitting,
  progress,
  processingStep,
  currentBucketIndex,
  handleFormSubmit,
  prepareCleanData,
};
```

---

## 6. 데이터 흐름 다이어그램

```
[사용자 입력]
     ↓
ProjectAddBaseForm → updateField() → Redux projectSlice.form
     ↓
TaskPlanningBoard → addTask/updateTask() → Redux projectBucketSlice.buckets
     ↓
[최종 제출]
     ↓
useProjectSubmit.handleFormSubmit()
     ├── 1. validateProjectForm(formData)
     ├── 2. validateProjectTaskForm(buckets)
     ├── 3. processRelationFields() - 관계 필드 ID 추출
     ├── 4. projectApiService.createProject()
     ├── 5. projectApiService.createProjectStatusChange()
     └── 6. 버킷별 순차 처리
           ├── projectTaskService.createBucket()
           └── projectTaskService.createTask() (per task)
```

---

## 7. 관련 파일 목록

| 구분 | 파일 경로 |
|------|----------|
| **메인 컴포넌트** | `src/features/project/components/registration/ProjectRegistrationDrawer.jsx` |
| **1단계** | `src/features/project/components/registration/ProjectBasicInfoForm.jsx` |
| | `src/features/project/components/forms/ProjectAddBaseForm.jsx` |
| **2단계** | `src/features/project/components/registration/TaskPlanningBoard.jsx` |
| | `src/features/project/components/registration/TaskDetailDrawer.jsx` |
| | `src/features/project/components/card/KanbanColumn.jsx` |
| **3단계** | `src/features/project/components/registration/TaskVerificationStep.jsx` |
| **훅** | `src/features/project/hooks/useProjectForm.js` |
| | `src/features/project/hooks/useProjectTask.js` |
| | `src/features/project/hooks/useProjectSubmit.js` |
| **상수** | `src/features/project/constants/projectStatusConstants.js` |
| | `src/features/project/constants/projectCostConstants.js` |
| | `src/features/project/constants/initialState.js` |
| **Redux** | `src/store/slices/projectSlice.js` |
| | `src/store/slices/projectBucketSlice.js` |
| **유틸** | `src/features/project/utils/validateProjectForm.js` |
| **서비스** | `src/features/project/services/projectApiService.js` |
| | `src/features/project/services/projectTaskService.js` |
