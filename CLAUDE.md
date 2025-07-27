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
├── services/      # Business logic
├── store/         # Redux slices (if feature-specific)
└── utils/         # Utility functions
```

### Path Aliases (Vite Config)
- `@` → `./src`
- `@features` → `./src/features`
- `@shared` → `./src/shared`
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
- **React DnD** for drag-and-drop functionality
- **DayJS** for date manipulation
- **Axios** for HTTP requests
- **Papa Parse** for CSV parsing
- **React DatePicker** for date inputs

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
- Base API URL: `http://192.168.20.101:1337`
- Configured with Vite proxy for `/api` routes
- Uses Axios for HTTP requests
- Authentication via JWT tokens stored in localStorage