# 프로젝트 상태 변경 유형 (Status Change Type)

> **분석일:** 2025-01-23

---

## 개요

`project_status_changes` 테이블의 `name` 필드에 저장되는 상태 변경 유형 코드입니다.
프로젝트 상태 변경 시 해당 변경의 성격을 분류하여 기록합니다.

---

## 상수 파일

**파일 경로:** `src/features/project/constants/statusChangeTypeConstants.js`

---

## 상태 변경 유형 코드

| code | label | description | 사용 시점 |
|------|-------|-------------|----------|
| `CREATE` | 신규등록 | 프로젝트 최초 생성 | 프로젝트 등록 시 |
| `STATUS_CHANGE` | 상태변경 | 일반 상태 전환 | 일반적인 상태 변경 |
| `INTERIM_REVIEW` | 중간검수 | 중간검수 요청 | → 중간검수 전환 시 |
| `FINAL_REVIEW` | 고객검수 | 고객검수 요청 | → 고객검수 전환 시 |
| `CLOSE` | 종료 | 프로젝트 종료 요청 | → 종료 전환 시 |
| `RESUME` | 재개 | 보류→진행 등 재시작 | 보류/대기 → 다른 상태 |

---

## 상수 정의

### STATUS_CHANGE_TYPE_CODES

```javascript
export const STATUS_CHANGE_TYPE_CODES = {
  CREATE: 'CREATE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  INTERIM_REVIEW: 'INTERIM_REVIEW',
  FINAL_REVIEW: 'FINAL_REVIEW',
  CLOSE: 'CLOSE',
  RESUME: 'RESUME',
};
```

### STATUS_CHANGE_TYPE

```javascript
export const STATUS_CHANGE_TYPE = {
  CREATE: {
    code: 'CREATE',
    label: '신규등록',
    description: '프로젝트 최초 생성',
  },
  STATUS_CHANGE: {
    code: 'STATUS_CHANGE',
    label: '상태변경',
    description: '일반 상태 전환',
  },
  INTERIM_REVIEW: {
    code: 'INTERIM_REVIEW',
    label: '중간검수',
    description: '중간검수 요청',
  },
  FINAL_REVIEW: {
    code: 'FINAL_REVIEW',
    label: '고객검수',
    description: '고객검수 요청',
  },
  CLOSE: {
    code: 'CLOSE',
    label: '종료',
    description: '프로젝트 종료 요청',
  },
  RESUME: {
    code: 'RESUME',
    label: '재개',
    description: '보류→진행 등 재시작',
  },
};
```

---

## 헬퍼 함수

### getStatusChangeTypeLabel

코드로 라벨 조회

```javascript
import { getStatusChangeTypeLabel } from '@features/project/constants/statusChangeTypeConstants';

getStatusChangeTypeLabel('CREATE'); // '신규등록'
getStatusChangeTypeLabel('CLOSE');  // '종료'
```

### getStatusChangeType

코드로 전체 객체 조회

```javascript
import { getStatusChangeType } from '@features/project/constants/statusChangeTypeConstants';

getStatusChangeType('CREATE');
// { code: 'CREATE', label: '신규등록', description: '프로젝트 최초 생성' }
```

### determineStatusChangeType

상태 변경에 따른 유형 코드 자동 결정

```javascript
import { determineStatusChangeType } from '@features/project/constants/statusChangeTypeConstants';

determineStatusChangeType('진행중', '중간검수');  // 'INTERIM_REVIEW'
determineStatusChangeType('진행중', '고객검수');  // 'FINAL_REVIEW'
determineStatusChangeType('고객검수', '종료');    // 'CLOSE'
determineStatusChangeType('보류/대기', '진행중'); // 'RESUME'
determineStatusChangeType('시작전', '진행중');    // 'STATUS_CHANGE'
```

**결정 로직:**
```javascript
export const determineStatusChangeType = (fromStatusName, toStatusName) => {
  if (toStatusName === '중간검수') return STATUS_CHANGE_TYPE_CODES.INTERIM_REVIEW;
  if (toStatusName === '고객검수') return STATUS_CHANGE_TYPE_CODES.FINAL_REVIEW;
  if (toStatusName === '종료') return STATUS_CHANGE_TYPE_CODES.CLOSE;
  if (fromStatusName === '보류/대기' && toStatusName !== '보류/대기') {
    return STATUS_CHANGE_TYPE_CODES.RESUME;
  }
  return STATUS_CHANGE_TYPE_CODES.STATUS_CHANGE;
};
```

---

## 적용 위치

### 1. 프로젝트 신규 등록

**파일:** `src/features/project/hooks/useProjectSubmit.js`

```javascript
import { STATUS_CHANGE_TYPE_CODES } from '../constants/statusChangeTypeConstants';

const statusChangeData = {
  project: projectId,
  name: STATUS_CHANGE_TYPE_CODES.CREATE, // 'CREATE'
  fromStatus: 85, // 보류/대기
  toStatus: initialStatusId,
  requestedBy: currentUser?.user?.id || null,
  requestedAt: dayjs().toISOString(),
  approvalStatus: 'pending',
};
```

### 2. 프로젝트 상태 변경 (Drawer)

**파일:** `src/features/project/hooks/useProjectUpdate.js`

```javascript
import { determineStatusChangeType } from '../constants/statusChangeTypeConstants';

const statusChangeData = {
  project: id,
  name: determineStatusChangeType(initialData.pjtStatus.name, formData.pjtStatus.name),
  fromStatus: initialData.pjtStatus.id,
  toStatus: formData.pjtStatus.id,
  statusDetail: statusDetail || null,
  requestedBy: currentUser?.user?.id || null,
  requestedAt: dayjs().toISOString(),
  changeDescription: changeDescription || null,
  approvalStatus: 'pending',
};
```

### 3. 빠른 상태 변경 (플로우 탭)

**파일:** `src/features/project/components/drawer/tabs/ProjectStatusFlowTab.jsx`

```javascript
import { determineStatusChangeType } from '../../../constants/statusChangeTypeConstants';

const statusChangeData = {
  project: data.id,
  name: determineStatusChangeType(currentStatus, selectedStatus),
  fromStatus: fromStatusCode,
  toStatus: toStatusCode,
  statusDetail: formData.statusDetail || null,
  requestedBy: currentUser?.user?.id || null,
  requestedAt: dayjs().toISOString(),
  changeDescription: formData.changeDescription || null,
  approvalStatus: 'pending',
};
```

---

## DB 테이블 스키마

### project_status_changes

| 필드 | 타입 | 설명 |
|------|------|------|
| id | int | PK |
| project | FK | 프로젝트 ID |
| **name** | string | **상태 변경 유형 코드 (신규 추가)** |
| from_status | FK | 이전 상태 (codebook_items) |
| to_status | FK | 변경 상태 (codebook_items) |
| status_detail | string | 상태 세부 내용 |
| change_description | text | 변경 사유 |
| requested_by | FK | 요청자 (users) |
| requested_at | datetime | 요청 일시 |
| approval_status | enum | pending / approved / rejected |
| approved_by | FK | 승인자 (users) |
| approved_at | datetime | 승인 일시 |
| approval_comment | text | 승인/반려 의견 |

---

## 관련 파일 목록

| 구분 | 파일 경로 |
|------|----------|
| **상수** | `src/features/project/constants/statusChangeTypeConstants.js` |
| **신규 등록** | `src/features/project/hooks/useProjectSubmit.js` |
| **상태 변경** | `src/features/project/hooks/useProjectUpdate.js` |
| **플로우 탭** | `src/features/project/components/drawer/tabs/ProjectStatusFlowTab.jsx` |
