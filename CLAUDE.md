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

## API Integration
- Base API URL: `http://192.168.20.101:1337` (configurable via `VITE_API_URL`)
- Configured with Vite proxy for `/api` routes
- Uses Axios for HTTP requests
- Authentication via JWT tokens stored in localStorage
- Shared API utilities in `src/shared/api/`

## Environment Configuration
- **Development host/port**: Configurable via `VITE_HOST` and `VITE_PORT` environment variables
- **Default development server**: http://192.168.20.101:3001
- **API URL**: Configurable via `VITE_API_URL` environment variable

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.