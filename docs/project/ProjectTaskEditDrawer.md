# 프로젝트 작업 수정 Drawer 기능 명세

## 개요

프로젝트 상세보기에서 "작업 수정" 메뉴를 통해 버킷(Bucket)과 태스크(Task)를 관리하는 기능입니다.
칸반 보드 형태로 작업을 시각화하고, 변경된 항목만 선택적으로 저장하여 API 호출을 최적화합니다.

## 주요 기능

### 1. 버킷(Bucket) 관리
- 버킷 추가
- 버킷 이름 변경
- 버킷 위치 이동
- 버킷 삭제

### 2. 태스크(Task) 관리
- 태스크 추가
- 태스크 수정 (모달 폼)
- 태스크 완료 상태 토글
- 태스크 삭제

### 3. 저장 최적화
- `isModified` 플래그를 활용하여 변경된 항목만 API 호출
- 신규 생성(CREATE)과 수정(UPDATE) 자동 구분

---

## 파일 구조

```
src/features/project/
├── components/
│   ├── drawer/
│   │   ├── ProjectTaskEditDrawer.jsx    # 작업 수정 Drawer 메인 컴포넌트
│   │   └── ProjectDetailDrawerMenu.jsx  # Drawer 헤더 메뉴
│   ├── card/
│   │   └── ProjectTaskBoard.jsx         # 칸반 보드 컬럼 컴포넌트
│   └── forms/
│       └── ProjectTaskEditForm.jsx      # 태스크 수정 폼
├── hooks/
│   ├── useProjectBucketStore.js         # 버킷 스토어 훅
│   └── useProjectTaskSubmit.js          # 저장 로직 훅
└── services/
    └── projectTaskService.js            # API 서비스

src/store/slices/
└── projectBucketSlice.js                # Redux 상태 관리
```

---

## 데이터 흐름

### 1. 초기 데이터 로드
```
ProjectDetailDrawer (data prop)
    ↓
ProjectTaskEditDrawer
    ↓
useProjectBucketStore.syncProjectTasksToKanban()
    ↓
Redux Store (projectBucketSlice)
```

### 2. 저장 흐름
```
사용자 수정 작업
    ↓
Redux Action (isModified = true 설정)
    ↓
저장 버튼 클릭
    ↓
handleSaveAll(buckets, projectId)
    ↓
isModified === true 항목 필터링
    ↓
버킷 처리 (CREATE/UPDATE)
    ↓
태스크 처리 (CREATE/UPDATE)
    ↓
성공 알림
```

---

## isModified 플래그 동작

### 버킷 (Bucket)
| 액션 | isModified 설정 |
|------|-----------------|
| `addColumn` | `true` (신규 생성) |
| `saveEdit` (bucketTitle) | `true` (이름 변경) |
| `moveColumn` | `true` (양쪽 버킷 모두) |

### 태스크 (Task)
| 액션 | isModified 설정 |
|------|-----------------|
| `addTask` | `true` (신규 생성) |
| `updateTask` | `true` (수정) |
| `saveEdit` (task field) | `true` (필드 수정) |
| `toggleTaskCompletion` | `true` (완료 상태 변경) |

---

## API 엔드포인트

### 버킷 API
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/project-task-buckets` | 버킷 생성 |
| PUT | `/project-task-buckets/:documentId` | 버킷 수정 |

### 태스크 API
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/project-tasks` | 태스크 생성 |
| PUT | `/project-tasks/:documentId` | 태스크 수정 |

---

## 저장 로직 (useProjectTaskSubmit.js)

### handleSaveAll 함수

```javascript
handleSaveAll(buckets, projectId)
```

**동작 순서:**
1. `isModified === true`인 버킷/태스크 필터링
2. 수정된 항목이 없으면 "수정된 항목이 없습니다" 알림 후 종료
3. 버킷 처리 (순차)
   - `id`/`documentId` 없음 → `createBucket()` (CREATE)
   - `id`/`documentId` 있음 → `updateBucket()` (UPDATE)
4. 태스크 처리 (순차)
   - `id`/`documentId` 없음 → `createTask()` (CREATE)
   - `id`/`documentId` 있음 → `updateTask()` (UPDATE)
5. 성공 알림: "버킷: N개 생성, M개 수정 | 태스크: X개 생성, Y개 수정"

### 데이터 전처리

**버킷 데이터 (prepareBucketData):**
```javascript
{
  name: string,           // 버킷 이름
  project: number,        // 프로젝트 ID
  position: number,       // 버킷 위치
}
```

**태스크 데이터 (prepareTaskData):**
```javascript
{
  name: string,                  // 태스크 이름
  project: number,               // 프로젝트 ID
  projectTaskBucket: string,     // 버킷 documentId
  position: number,              // 태스크 위치
  users: number[],               // 담당자 ID 배열
  taskProgress: number,          // 진행률 코드북 ID
  priorityLevel: number,         // 우선순위 코드북 ID
  planStartDate: string,         // 계획 시작일 (isScheduled=true일 때만)
  planEndDate: string,           // 계획 종료일 (isScheduled=true일 때만)
  planningTimeData: object,      // 시간 관리 데이터 (isScheduled=true일 때만)
}
```

---

## Redux 슬라이스 (projectBucketSlice.js)

### 상태 구조
```javascript
{
  buckets: [
    {
      id: number,
      documentId: string,
      name: string,
      position: number,
      isModified: boolean,      // 수정 여부 플래그
      tasks: [
        {
          id: number,
          documentId: string,
          name: string,
          position: number,
          isModified: boolean,  // 수정 여부 플래그
          // ... 기타 태스크 필드
        }
      ]
    }
  ],
  editState: {
    isEditing: boolean,
    bucketIndex: number | null,
    taskIndex: number | null,
    field: string | null,
    value: string,
  },
  completedExpanded: boolean,
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null,
}
```

### 주요 액션
| 액션 | 설명 |
|------|------|
| `setBuckets` | 전체 버킷 데이터 설정 |
| `addColumn` | 새 버킷 추가 |
| `deleteColumn` | 버킷 삭제 |
| `moveColumn` | 버킷 위치 이동 |
| `addTask` | 새 태스크 추가 |
| `updateTask` | 태스크 수정 |
| `deleteTask` | 태스크 삭제 |
| `toggleTaskCompletion` | 태스크 완료 상태 토글 |
| `startEditingColumnTitle` | 버킷 이름 편집 시작 |
| `saveEdit` | 편집 내용 저장 |
| `cancelEdit` | 편집 취소 |

---

## 컴포넌트 Props

### ProjectTaskEditDrawer
| Prop | Type | 설명 |
|------|------|------|
| `visible` | boolean | Drawer 표시 여부 |
| `data` | object | 프로젝트 데이터 (projectTaskBuckets, projectTasks 포함) |
| `onClose` | function | Drawer 닫기 핸들러 |
| `onSaveSuccess` | function | 저장 성공 콜백 |

### ProjectTaskBoard
| Prop | Type | 설명 |
|------|------|------|
| `bucket` | object | 버킷 데이터 |
| `bucketIndex` | number | 버킷 인덱스 |
| `enableAddTask` | boolean | 작업 추가 버튼 활성화 |
| `onOpenTaskEditModal` | function | 작업 수정 모달 열기 핸들러 |
| `startEditingColumnTitle` | function | 버킷 이름 편집 시작 |
| `saveEdit` | function | 편집 저장 |
| `onAddTask` | function | 작업 추가 |
| `deleteTask` | function | 작업 삭제 |
| `deleteColumn` | function | 버킷 삭제 |

---

## 유효성 검사

### 메인 저장 시 검사 (useProjectTaskSubmit.validateBucketsAndTasks)

`isModified === true`인 모든 버킷과 태스크에 대해 유효성 검사를 수행합니다.

**버킷 검사:**
- 버킷 이름 필수

**태스크 검사:**
- 작업명 필수
- `isScheduled !== false`인 경우 (undefined도 true로 취급):
  - 계획 시작일/종료일 필수
  - 종료일이 시작일보다 이후여야 함
  - 인원수, 투입률, 작업일 유효성 검사

> **참고**: 태스크의 `isScheduled`가 `undefined`인 경우 `true`로 취급하여 검사를 수행합니다.
> 이는 작업 수정 모달(ProjectTaskEditForm)의 기본 동작과 동일한 로직입니다.

### 모달 저장 시 검사 (ProjectTaskEditForm.validateForm)

개별 태스크 수정 시 모달 내에서 검사를 수행합니다.

### 시간 관리 필드
| 필드 | 검사 조건 |
|------|----------|
| 인원수 (personnelCount) | 1 ~ 100 정수 |
| 투입률 (allocationRate) | 0 ~ 1 사이, 소수점 1자리까지 |
| 작업일 (workDays) | 0.1 ~ 30 사이, 소수점 1자리까지 |

### 계획 시간 계산
```javascript
계획시간 = 인원수 × 투입률 × 작업일 × 8시간
// 결과는 반올림하여 정수로 변환
```

---

## 사용 예시

### Drawer 열기
```jsx
// ProjectDetailDrawer.jsx
const handleEditTask = () => {
  setTaskEditDrawerVisible(true);
};

<ProjectTaskEditDrawer
  visible={taskEditDrawerVisible}
  data={data}
  onClose={handleTaskEditDrawerClose}
  onSaveSuccess={handleTaskSaveSuccess}
/>
```

### 저장 성공 후 처리
```jsx
const handleTaskSaveSuccess = () => {
  // 프로젝트 데이터 갱신
  fetchProjectDetail(projectId);
};
```

---

## 관련 문서

- [프로젝트 등록 Drawer](./ProjectRegistrationDrawer.md)
- [프로젝트 상태 변경](./StatusChangeType.md)
- [대시보드 승인 대기](./DashboardApprovalPending.md)

---

## 부록: 버킷 템플릿 샘플 (JSON)

작업 템플릿 로드시 사용되는 데이터 구조 샘플입니다.

```json
[
  {
    "bucket": "프로젝트 관리",
    "position": 0,
    "tasks": [
      {
        "name": "행정 업무",
        "position": 0,
        "is_scheduled": false,
        "is_progress": false
      },
      {
        "name": "내부 조율",
        "position": 1,
        "is_scheduled": false,
        "is_progress": false
      },
      {
        "name": "미팅 및 보고",
        "position": 2,
        "is_scheduled": false,
        "is_progress": true
      }
    ]
  },
  {
    "bucket": "기획 단계",
    "position": 1,
    "tasks": [
      {
        "name": "프로젝트 기획",
        "position": 0,
        "is_scheduled": true,
        "is_progress": true
      }
    ]
  }
]
```
