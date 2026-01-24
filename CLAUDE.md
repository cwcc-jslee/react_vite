# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React application built with Vite, using Redux Toolkit for state management and TailwindCSS for styling. This is a business management system with features for customer management, project tracking, sales forecasting (SFA), and todo management.

## Development Commands

### Development Server
```bash
npm run dev
```
- Runs development server on http://192.168.20.101:3001
- API proxy configured to http://192.168.20.101:1337

### Build & Preview
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

Note: The README mentions `npm start` and `npm test` but these scripts are not defined in package.json. Use the commands above instead.

### Preview Server
```bash
npm run preview
```
- Runs on http://192.168.20.101:3001
- Previews production build locally

## Architecture Overview

### Core Structure
- **Feature-based architecture**: Each domain (auth, customer, project, sfa, todo) is organized as a self-contained feature module
- **Redux Toolkit**: Centralized state management with feature-specific slices
- **React Query**: Server state management and caching (configured with devtools)
- **Vite**: Build tool with path aliases configured

### State Management
Two store configurations exist:
- `src/app/store.js`: Minimal store (auth only)
- `src/store/index.js`: Main store with all slices

Current Redux slices:
- `authSlice`: Authentication state
- `codebookSlice`: Dropdown/select data caching
- `uiSlice`: Global UI state
- `sfaSlice`: Sales forecast data
- `projectSlice`: Project management state
- `todoSlice`: Todo and task management
- `workSlice`, `taskSlice`, `projectBucketSlice`: Work tracking
- `pageStateSlice`, `pageFormSlice`: Generic page state management

### Feature Module Structure
Each feature follows this pattern:
```
src/features/{feature}/
├── api/           # API calls and queries
├── components/    # Feature-specific components
├── constants/     # Constants and initial states
├── context/       # React Context providers
├── hooks/         # Custom hooks
├── pages/         # Page components
├── containers/    # Layout orchestrators (read Redux state, render layouts)
├── layouts/       # Page layout components (one per menu)
├── sections/      # Page sections (composed into layouts)
├── services/      # Business logic
├── store/         # Redux slices (if feature-specific)
└── utils/         # Utility functions
```

### Layout and Navigation Structure

#### File Organization
```
src/
├── app/
│   └── App.jsx                          # Main routing configuration
├── shared/
│   ├── components/ui/layout/
│   │   ├── DefaultLayout.jsx            # Root layout (header, sidebar, content)
│   │   └── BreadcrumbWithMenu.jsx       # Menu & sub-menu renderer
│   └── constants/
│       └── navigation.jsx               # Navigation config (sidebar, page menus, sub-menus)
├── store/slices/
│   └── uiSlice.js                       # UI state (page, menu, layout)
└── features/{feature}/
    ├── pages/{Feature}Page.jsx          # Feature entry point
    ├── containers/{Feature}Container.jsx # Conditional layout rendering
    └── layouts/{Feature}*Layout.jsx     # Specific layouts per menu
```

#### Navigation Hierarchy (3 levels)

**Level 1: Sidebar Menu** (`navigation.jsx:SIDEBAR_ITEMS`)
- SFA, PROJECT, ToDo, CUSTOMER, CONTACT

**Level 2: Page Menus** (`navigation.jsx:PAGE_MENUS` → horizontal tabs)
- **SFA**: 현황, 상세조회, 매출예측, 매출분석, 매출정보
- **Project**: 프로젝트, 투입률, 팀별실적, 상세조회
- **Customer**: 현황
- **Todo**: 오늘할일, 할일검색, 최근작업

**Level 3: Sub-Menus** (`navigation.jsx:PAGE_SUB_MENUS` → right-aligned)
- **Project Detail**: 테이블, 보드, 작업, 타임라인, 차트

#### Component Flow Pattern
```
User clicks menu
    ↓
BreadcrumbWithMenu.jsx → handleMenuClick()
    ↓
Redux uiSlice → changePageMenu() action
    ↓
Update state: { page, menu, layout }
    ↓
FeatureContainer reads Redux state
    ↓
Conditional render: {layout === 'list' && <ListLayout />}
```

**Example: Project Container** (`ProjectContainer.jsx`)
```jsx
const { layout } = useSelector(state => state.ui.pageLayout);
return (
  <>
    {layout === 'list' && <ProjectListLayout />}
    {layout === 'detail' && <ProjectDetailLayout />}
    {layout === 'utilization' && <ProjectUtilizationLayout />}
    {layout === 'teamWeekly' && <TeamWeeklyUtilizationLayout />}
  </>
);
```

#### Key Files
- `DefaultLayout.jsx`: Wraps all authenticated pages
- `BreadcrumbWithMenu.jsx`: Renders breadcrumb, page menus, sub-menus
- `navigation.jsx`: Defines all menu configurations
- `uiSlice.js`: Manages page/menu/layout state
- Feature Container: Orchestrates layout rendering based on Redux state
- Feature Layouts: Implement specific UI for each menu

### Path Aliases (Vite Config)
- `@` → `./src`
- `@features` → `./src/features`
- `@shared` → `./src/shared`
- `@assets` → `./src/assets`
- `@components` → `./src/shared/components`
- `@utils` → `./src/shared/utils`
- `@hooks` → `./src/shared/hooks`
- `@config` → `./src/shared/config`

## Key Technologies

### UI Framework
- **React 18** with functional components
- **Styled Components** for complex styling
- **TailwindCSS** for utility-first styling
- **Lucide React** for icons
- **Material-UI** components (`@mui/icons-material`, `@emotion/react`)

### State & Data Management
- **Redux Toolkit** with Immer for immutable updates
- **React Query** (`@tanstack/react-query`) for server state
- **React Context** for feature-specific state

### Additional Libraries
- **React Router v7** for routing
- **Chart.js + Recharts** for data visualization
- **DnD Kit** (`@dnd-kit/core`, `@dnd-kit/sortable`) for drag-and-drop functionality
- **DayJS** for date manipulation
- **Axios** for HTTP requests
- **Papa Parse** for CSV parsing
- **React DatePicker** for date inputs
- **XLSX** for Excel file handling

## Development Guidelines

### Component Patterns
- Use functional components with hooks
- PropTypes for type validation
- Follow naming convention: PascalCase for components, camelCase for functions
- Function naming: `verb + target` (e.g., `createProject`, `updateUserStatus`)

### State Management Rules
- Global state in Redux slices
- Component state with useState
- Complex logic in custom hooks
- Async actions with Redux Toolkit's createAsyncThunk

### Code Organization
- Feature modules are self-contained
- Shared utilities in `src/shared/`
- API calls centralized in feature `api/` directories
- Business logic in `services/` directories

### Styling
- Prefer TailwindCSS utilities
- Use Styled Components for complex component styling
- Global styles in `src/index.css`
- Component-specific styles co-located when needed

## Key Business Domains

1. **Authentication** (`features/auth`): User login/logout with JWT tokens
2. **Customer Management** (`features/customer`): Customer data, statistics, Excel import
3. **Project Management** (`features/project`): Kanban boards, task tracking, progress charts
4. **SFA (Sales Forecast)** (`features/sfa`): Revenue tracking, payment management
5. **Todo/Work Management** (`features/todo`, `features/work`): Task and work item tracking
6. **Contact Management** (`features/contact`): Contact data with Excel import functionality

### Project Status Management

**Status Codes** (defined in `src/features/project/constants/projectStatusConstants.js`):

| Code | Status Name | Description | English Key |
|------|------------|-------------|-------------|
| 85 | 보류/대기 | Project on hold or waiting to start | `pendingWaiting` |
| 86 | 시작전 | Project preparation phase | `notStarted` |
| 87 | 중간검수 | Interim review (internal or agency) | `interimReview` |
| 88 | 진행중 | Project in progress | `inProgress` |
| 89 | 고객검수 | Customer review | `finalReview` |
| 90 | 종료 | Project closed | `closed` |

**Status Transition Rules**:
- `시작전` → 진행중, 보류/대기, 종료
- `보류/대기` → 시작전, 진행중, 종료
- `진행중` → 보류/대기, 중간검수, 고객검수, 종료 (can skip 중간검수)
- `중간검수` → 진행중, 고객검수, 종료
- `고객검수` → 진행중, 종료 (can return to 진행중 for revisions)
- `종료` → (no transitions allowed)

**Key Constants**:
- `PROJECT_STATUS_CODES`: Maps English keys to status code IDs
- `PROJECT_STATUS_MAP`: Maps camelCase keys to code IDs
- `PROJECT_STATUS_LABEL_TO_KEY`: Korean labels → English keys
- `PROJECT_STATUS_KEY_TO_LABEL`: English keys → Korean labels
- `PROJECT_STATUS_COLORS`: Chart color mappings for each status
- `PROJECT_STATUS_TRANSITIONS`: Allowed state transitions

**Usage Example**:
```javascript
import {
  PROJECT_STATUS_CODES,
  PROJECT_STATUS_KEY_TO_LABEL
} from '@features/project/constants/projectStatusConstants';

// Get status code
const inProgressCode = PROJECT_STATUS_CODES.IN_PROGRESS; // 88

// Get Korean label
const label = PROJECT_STATUS_KEY_TO_LABEL.finalReview; // '고객검수'
```

## API Integration
- Base API URL: `http://192.168.20.101:1337` (configurable via `VITE_API_URL`)
- Configured with Vite proxy for `/api` routes
- Uses Axios for HTTP requests
- Authentication via JWT tokens stored in localStorage
- Shared API utilities in `src/shared/api/`

### Data Transformation Policy (camelCase ↔ snake_case)

**Naming Convention:**
- **Frontend (React)**: camelCase (e.g., `userName`, `planStartDate`)
- **Backend (Database)**: snake_case (e.g., `user_name`, `plan_start_date`)

**Standard Implementation: Axios Interceptors**

All API requests and responses are automatically transformed using Axios interceptors configured in `src/shared/api/apiClient.js` and `src/shared/api/apiService.js`:

```javascript
import { convertKeysToSnakeCase, convertKeysToCamelCase } from '@shared/utils/transformUtils';

// Request Interceptor: camelCase → snake_case
apiClient.interceptors.request.use((config) => {
  if (config.data) {
    config.data = convertKeysToSnakeCase(config.data);
  }
  return config;
});

// Response Interceptor: snake_case → camelCase
apiClient.interceptors.response.use((response) => {
  if (response.data) {
    response.data = convertKeysToCamelCase(response.data);
  }
  return response;
});
```

**Development Guidelines:**

1. **Always use camelCase in React components** - The interceptor handles conversion automatically
2. **Special data processing before API calls**:
   - Use `processRelationFields()` to convert objects to IDs (e.g., `{ id: 1, name: 'John' }` → `1`)
   - Remove temporary UI fields (e.g., `__temp`, `templateId`)
   - Apply business-specific transformations (phone number formatting, etc.)
3. **Never manually convert field names** - Rely on the interceptor for all case conversions
4. **Transformation utilities location**: `src/shared/utils/transformUtils.js`

**Example Usage:**

```javascript
// ✅ Correct approach
const formData = {
  planStartDate: '2024-01-01',
  importanceLevel: { id: 3 },
  users: [{ id: 1 }, { id: 2 }]
};

// Process special cases only
const processed = processRelationFields(formData);
// → { planStartDate: '2024-01-01', importanceLevel: 3, users: [1, 2] }

// Send directly - interceptor handles snake_case conversion
await apiService.post('/projects', processed);
// → API receives: { plan_start_date: '2024-01-01', importance_level: 3, users: [1, 2] }

// ❌ Wrong - manual conversion not needed
const snakeCase = convertKeysToSnakeCase(processed); // DON'T DO THIS
await apiService.post('/projects', snakeCase);
```

**Related Files:**
- Interceptor configuration: `src/shared/api/apiClient.js`, `src/shared/api/apiService.js`
- Conversion utilities: `src/shared/utils/transformUtils.js`
- Relation field processing: `src/shared/utils/relationFieldUtils.js`

## Environment Configuration
- **Development host/port**: Configurable via `VITE_HOST` and `VITE_PORT` environment variables
- **Default development server**: http://192.168.20.101:3001
- **API URL**: Configurable via `VITE_API_URL` environment variable

## Permission System (권한 시스템)

사용자별 페이지 접근 및 기능 사용 권한을 관리하는 시스템입니다.

### Permission Types (권한 타입)

| Action | 설명 | 용도 |
|--------|------|------|
| `view` | 조회 권한 | 페이지/메뉴 접근, 데이터 조회 |
| `create` | 생성 권한 | 데이터 추가, 복사 |
| `update` | 수정 권한 | 데이터 편집 |
| `delete` | 삭제 권한 | 데이터 삭제 |

### Permission Data Structure (권한 데이터 구조)

```javascript
{
  permissions: {
    default: { view: true, create: false, update: false, delete: false },
    initialPage: { path: '/todo' },
    pages: {
      sfa: {
        view: true,
        create: true,
        update: true,
        delete: false,
        menus: {
          forecast: { view: true },
          analytics: { view: false }
        }
      }
    }
  }
}
```

### Permission Utility Functions

**Location**: `src/shared/utils/permissionUtils.js`

```javascript
import {
  hasPermission,
  hasPagePermission,
  hasCreatePermission,
  hasUpdatePermission,
  hasDeletePermission,
  hasMenuItemPermission,
  hasSubMenuPermission,
} from '@shared/utils/permissionUtils';

// 통합 권한 체크
hasPermission(userAccessControl, 'sfa', 'update')

// 단축 함수
hasCreatePermission(userAccessControl, 'sfa')
hasUpdatePermission(userAccessControl, 'sfa')
hasDeletePermission(userAccessControl, 'sfa')

// 메뉴/서브메뉴 권한
hasMenuItemPermission(userAccessControl, 'sfa', 'forecast')
hasSubMenuPermission(userAccessControl, 'project', 'detail', 'board')
```

### Usage in Components

```javascript
import { useSelector } from 'react-redux';
import { hasUpdatePermission, hasDeletePermission } from '@shared/utils/permissionUtils';

const MyComponent = () => {
  const user = useSelector(state => state.auth.user);
  const userAccessControl = user?.userAccessControl;

  const canUpdate = hasUpdatePermission(userAccessControl, 'sfa');
  const canDelete = hasDeletePermission(userAccessControl, 'sfa');

  return (
    <>
      {canUpdate && <button>수정</button>}
      {canDelete && <button>삭제</button>}
    </>
  );
};
```

### Permission Priority (권한 우선순위)

```
서브메뉴 권한 > 메뉴 권한 > 페이지 권한 > 기본 권한
```

- 명시적 거부(`false`) → 항상 거부
- 명시적 허용(`true`) → 허용
- 미설정 → 상위 레벨 권한 상속

### Related Files

| 파일 | 설명 |
|------|------|
| `src/shared/utils/permissionUtils.js` | 권한 체크 유틸리티 함수 |
| `src/features/auth/store/authSlice.js` | 인증 상태 관리 (권한 정보 포함) |
| `docs/common/permission-system.md` | 권한 시스템 상세 문서 |

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.