# 권한 시스템 (Permission System)

## 1. 개요

사용자별 페이지 접근 및 기능 사용 권한을 관리하는 시스템입니다.

### 1.1 권한 계층 구조

```
사용자 (User)
  └── userAccessControl
        └── permissions
              ├── default          # 기본 권한 (전역)
              ├── initialPage      # 초기 진입 페이지
              └── pages            # 페이지별 권한
                    └── {pageId}
                          ├── view/create/update/delete  # 페이지 권한
                          └── menus                      # 메뉴별 권한
                                └── {menuId}
                                      ├── view           # 메뉴 권한
                                      └── subMenus       # 서브메뉴별 권한
                                            └── {subMenuId}
                                                  └── view
```

### 1.2 권한 타입 (Action)

| Action | 설명 | 용도 |
|--------|------|------|
| `view` | 조회 권한 | 페이지/메뉴 접근, 데이터 조회 |
| `create` | 생성 권한 | 데이터 추가, 복사 |
| `update` | 수정 권한 | 데이터 편집 |
| `delete` | 삭제 권한 | 데이터 삭제 |

---

## 2. 권한 데이터 구조

### 2.1 전체 구조 (Backend에서 제공)

```javascript
{
  permissions: {
    // 기본 권한 (명시적 설정이 없을 때 적용)
    default: {
      view: true,
      create: false,
      update: false,
      delete: false
    },

    // 초기 진입 페이지 설정
    initialPage: {
      path: '/todo'
    },

    // 페이지별 권한
    pages: {
      sfa: {
        view: true,
        create: true,
        update: true,
        delete: false,
        menus: {
          forecast: { view: true },
          analytics: { view: true },
          salesInformation: { view: false }
        }
      },
      project: {
        view: true,
        create: true,
        update: true,
        delete: true,
        menus: {
          list: { view: true },
          detail: {
            view: true,
            subMenus: {
              table: { view: true },
              board: { view: true },
              timeline: { view: false }
            }
          }
        }
      },
      // ... 다른 페이지들
    }
  }
}
```

### 2.2 권한 우선순위

권한 확인 시 다음 순서로 적용됩니다:

1. **명시적 거부** (`false`) → 항상 거부
2. **명시적 허용** (`true`) → 허용
3. **상위 권한 상속** → 설정되지 않은 경우 상위 레벨 권한 사용
4. **기본 권한** → 모든 상위 레벨에 설정이 없을 경우

```
서브메뉴 권한 > 메뉴 권한 > 페이지 권한 > 기본 권한
```

---

## 3. 권한 유틸리티 함수

### 3.1 파일 위치

```
src/shared/utils/permissionUtils.js
```

### 3.2 주요 함수

#### 통합 권한 체크

```javascript
import { hasPermission } from '@shared/utils/permissionUtils';

// 기본 사용법
hasPermission(userAccessControl, 'sfa', 'view')    // SFA 조회 권한
hasPermission(userAccessControl, 'sfa', 'create')  // SFA 생성 권한
hasPermission(userAccessControl, 'sfa', 'update')  // SFA 수정 권한
hasPermission(userAccessControl, 'sfa', 'delete')  // SFA 삭제 권한
```

#### 단축 함수

```javascript
import {
  hasPagePermission,
  hasCreatePermission,
  hasUpdatePermission,
  hasDeletePermission
} from '@shared/utils/permissionUtils';

// 페이지 접근 권한 (view)
hasPagePermission(userAccessControl, 'sfa')

// CRUD 권한
hasCreatePermission(userAccessControl, 'sfa')
hasUpdatePermission(userAccessControl, 'sfa')
hasDeletePermission(userAccessControl, 'sfa')
```

#### 메뉴/서브메뉴 권한

```javascript
import {
  hasMenuItemPermission,
  hasSubMenuPermission
} from '@shared/utils/permissionUtils';

// 메뉴 권한 (예: SFA > 매출현황)
hasMenuItemPermission(userAccessControl, 'sfa', 'forecast')

// 서브메뉴 권한 (예: Project > 상세정보 > 보드)
hasSubMenuPermission(userAccessControl, 'project', 'detail', 'board')
```

#### 복합 권한 체크

```javascript
import {
  hasAnyPermission,
  hasAllPermissions
} from '@shared/utils/permissionUtils';

// 하나라도 권한이 있으면 true
hasAnyPermission(userAccessControl, 'sfa', ['create', 'update'])

// 모든 권한이 있어야 true
hasAllPermissions(userAccessControl, 'sfa', ['view', 'create', 'update'])
```

#### 초기 페이지 경로

```javascript
import { getInitialPage } from '@shared/utils/permissionUtils';

// 사용자의 초기 진입 페이지 경로 반환
const initialPath = getInitialPage(userAccessControl, '/todo');
```

---

## 4. 사용 예시

### 4.1 컴포넌트에서 권한 체크

```javascript
import { useSelector } from 'react-redux';
import { hasUpdatePermission, hasDeletePermission } from '@shared/utils/permissionUtils';

const MyComponent = () => {
  const user = useSelector(state => state.auth.user);
  const userAccessControl = user?.userAccessControl;

  const canUpdate = hasUpdatePermission(userAccessControl, 'sfa');
  const canDelete = hasDeletePermission(userAccessControl, 'sfa');

  return (
    <div>
      {canUpdate && <button>수정</button>}
      {canDelete && <button>삭제</button>}
    </div>
  );
};
```

### 4.2 커스텀 Hook 패턴

```javascript
// hooks/usePagePermissions.js
import { useSelector } from 'react-redux';
import {
  hasPagePermission,
  hasCreatePermission,
  hasUpdatePermission,
  hasDeletePermission
} from '@shared/utils/permissionUtils';

export const usePagePermissions = (pageId) => {
  const user = useSelector(state => state.auth.user);
  const userAccessControl = user?.userAccessControl;

  return {
    canView: hasPagePermission(userAccessControl, pageId),
    canCreate: hasCreatePermission(userAccessControl, pageId),
    canUpdate: hasUpdatePermission(userAccessControl, pageId),
    canDelete: hasDeletePermission(userAccessControl, pageId),
  };
};

// 사용
const { canCreate, canUpdate, canDelete } = usePagePermissions('sfa');
```

### 4.3 메뉴 필터링

```javascript
// 권한에 따라 메뉴 아이템 필터링
const menuItems = [
  { key: 'edit', label: '수정', action: 'update' },
  { key: 'delete', label: '삭제', action: 'delete' },
  { key: 'copy', label: '복사', action: 'create' },
];

const filteredMenuItems = menuItems.filter(item =>
  hasPermission(userAccessControl, 'sfa', item.action)
);
```

### 4.4 메뉴 비활성화

```javascript
const menuItems = [
  {
    key: 'edit',
    label: '수정',
    disabled: !hasUpdatePermission(userAccessControl, 'sfa'),
  },
  {
    key: 'delete',
    label: '삭제',
    disabled: !hasDeletePermission(userAccessControl, 'sfa'),
  },
];
```

---

## 5. 페이지별 권한 적용 현황

### 5.1 사이드바 메뉴

| Page ID | 메뉴명 | 권한 체크 |
|---------|--------|----------|
| `dashboard` | DASHBOARD | view |
| `sfa` | SFA | view |
| `project` | PROJECT | view |
| `todo` | ToDo | view |
| `customer` | CUSTOMER | view |
| `contact` | CONTACT | view |

### 5.2 SFA 페이지

| 기능 | 필요 권한 |
|------|----------|
| 페이지 접근 | `sfa.view` |
| SFA 등록 | `sfa.create` |
| 기본정보 수정 | `sfa.update` |
| 사업부 매출 수정 | `sfa.update` |
| 결제매출 추가 | `sfa.create` |
| 결제매출 수정 | `sfa.update` |
| 결제매출 삭제 | `sfa.delete` |
| SFA 삭제 | `sfa.delete` |
| 복사하기 | `sfa.create` |

### 5.3 Project 페이지

| 기능 | 필요 권한 |
|------|----------|
| 페이지 접근 | `project.view` |
| 프로젝트 등록 | `project.create` |
| 프로젝트 수정 | `project.update` |
| 프로젝트 삭제 | `project.delete` |
| 태스크 추가 | `project.create` |
| 태스크 수정 | `project.update` |
| 태스크 삭제 | `project.delete` |

### 5.4 Customer 페이지

| 기능 | 필요 권한 |
|------|----------|
| 페이지 접근 | `customer.view` |
| 고객 등록 | `customer.create` |
| 고객 수정 | `customer.update` |
| 고객 삭제 | `customer.delete` |
| Excel 업로드 | `customer.create` |

---

## 6. 권한 데이터 저장 위치

### 6.1 인증 시 저장

```javascript
// src/features/auth/store/authSlice.js
// 로그인 성공 시 user 객체에 userAccessControl 포함
state.user = {
  ...userData,
  userAccessControl: { ... }
};
```

### 6.2 접근 방법

```javascript
// Redux store에서 접근
const user = useSelector(state => state.auth.user);
const userAccessControl = user?.userAccessControl;

// 또는 localStorage에서 복원 (세션 유지)
const userData = JSON.parse(localStorage.getItem('userData'));
const userAccessControl = userData?.user?.userAccessControl;
```

---

## 7. 관련 파일

| 파일 | 설명 |
|------|------|
| `src/shared/utils/permissionUtils.js` | 권한 체크 유틸리티 함수 |
| `src/features/auth/store/authSlice.js` | 인증 상태 관리 (권한 정보 포함) |
| `src/shared/constants/navigation.jsx` | 네비게이션 설정 |
| `src/shared/layout/BreadcrumbWithMenu.jsx` | 메뉴 권한 적용 |
| `src/shared/layout/DefaultLayout.jsx` | 레이아웃 권한 적용 |

---

## 8. 향후 확장 계획

### 8.1 Drawer 메뉴 권한 적용

SFA, Project 등 상세정보 Drawer의 액션 메뉴에 권한별 표시/비활성화 적용

### 8.2 세부 권한 확장

- 결제매출 별도 권한 (`sfaPayment.create`, `sfaPayment.delete`)
- 태스크 별도 권한 (`projectTask.create`, `projectTask.update`)
- 필드 단위 수정 권한

### 8.3 권한 관리 UI

- 관리자용 권한 설정 화면
- 역할(Role) 기반 권한 템플릿
