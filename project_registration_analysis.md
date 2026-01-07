# 프로젝트 등록 ('새프로젝트') 기능 분석 보고서

## 1. 개요
'새프로젝트' 등록 기능은 사용자가 신규 프로젝트와 관련 작업(Task)을 한 번에 생성할 수 있도록 설계되었습니다. 이 기능은 사이드바의 액션 버튼을 통해 접근하며, Drawer(슬라이드 패널) 형태의 UI를 제공합니다.

## 2. 주요 구성 요소 및 흐름

### 2.1 진입점 (UI Entry Point)
- **파일**: `src/shared/layout/SidebarActionButton.jsx`
- **동작**: 현재 페이지가 `project`일 때 '새프로젝트' 버튼을 렌더링합니다.
- **트리거**: 버튼 클릭 시 `uiSlice`의 `changePageMenu` 액션을 디스패치하여 `drawer` 모드를 `'add'`로 설정합니다.

### 2.2 컨테이너 및 레이아웃
- **파일**: `src/features/project/containers/ProjectContainer.jsx`
- **역할**: Redux UI 상태(`drawer.mode === 'add'`)를 감지하고 `ProjectAddDrawer` 컴포넌트를 렌더링합니다.

### 2.3 등록 폼 구조 (Drawer)
- **파일**: `src/features/project/components/drawer/ProjectAddDrawer.jsx`
- **구성**:
  1. **기본 정보 폼**: `ProjectAddFormSection` (프로젝트 기본 정보 입력)
  2. **작업 관리(Kanban)**: `ProjectAddTasksSection` (초기 버킷 및 태스크 구성)

### 2.4 데이터 관리 및 유효성 검사
- **폼 상태 관리**: `useProjectForm` (Redux 기반 폼 상태 관리)
- **유효성 검사**: `src/features/project/utils/validateProjectForm.js`
  - **필수 필드**: 고객사, 프로젝트명(3자 이상), 회계년도(FY), 서비스, 사업부(Team), 계획 시작/종료일.
  - **논리 검사**: 종료일이 시작일보다 빨라서는 안 됨.
  - **태스크 검사**: 최소 1개 이상의 버킷과 태스크가 필요함. 일정(Scheduled)이 있는 태스크는 상세 계획 데이터(인원, 투입률 등) 필수.

### 2.5 제출 로직 (Submission Logic)
- **파일**: `src/features/project/hooks/useProjectSubmit.js`
- **함수**: `handleFormSubmit`
- **프로세스**:
  1. **유효성 검사**: 프로젝트 정보 및 태스크 구조 검증.
  2. **프로젝트 생성**: `projectApiService.createProject` 호출 (초기 상태: '보류/대기').
  3. **이력 생성**: `projectApiService.createProjectStatusChange` 호출 (상태 변경 이력 기록).
  4. **버킷 생성**: 정의된 버킷 수만큼 반복하여 `projectTaskService.createBucket` 호출.
  5. **태스크 생성**: 각 버킷 내의 태스크 수만큼 반복하여 `projectTaskService.createTask` 호출.
  6. **결과 처리**: 성공 시 알림 표시 및 목록으로 이동, 실패 시 부분 성공 여부(프로젝트만 생성됨 등)에 따른 에러 메시지 표시.

## 3. 특징
- **트랜잭션 처리**: 프로젝트 생성 후 태스크 생성이 실패하더라도 프로젝트는 유지되도록 설계되어 있습니다 (부분 성공 처리).
- **데이터 전처리**: 제출 전 `processRelationFields` 등을 통해 객체 형태의 데이터를 ID로 변환하고 불필요한 필드를 정리합니다.
- **사용자 경험**: 단계별 진행률(Progress)을 표시하여 대량의 태스크 생성 시 사용자가 진행 상황을 인지할 수 있게 합니다.
