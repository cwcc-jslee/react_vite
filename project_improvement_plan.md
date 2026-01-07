# 프로젝트 등록 ('새프로젝트') 기능 개선 제안서

## 1. UI/UX 개선 방안

### 1.1 단계별 진행 (Wizard/Stepper) 도입
- **문제점**: 현재 `ProjectAddDrawer`는 "기본 정보 폼"과 "태스크 칸반 보드"를 수직으로 나열하고 있어, 좁은 Drawer 공간에서 정보 밀도가 너무 높고 스크롤이 길어집니다.
- **제안**: **Stepper UI**를 도입하여 프로세스를 분리합니다.
  - **1단계 (기본 정보)**: 프로젝트명, 고객사, 기간, 예산 등 필수 정보 입력.
  - **2단계 (작업 계획)**: 칸반 보드를 통해 초기 태스크 및 일정 수립.
  - **3단계 (검토)**: 입력된 정보 요약 확인 및 최종 저장.
- **효과**: 사용자의 인지 부하를 줄이고, 각 단계에 집중할 수 있는 환경을 제공합니다.

### 1.2 임시 저장 (Draft/Auto-save)
- **문제점**: 복잡한 태스크 구성 중 실수로 Drawer를 닫거나 페이지를 이탈하면 모든 작업 내용이 유실됩니다.
- **제안**: `localStorage`를 활용한 자동 저장 기능을 구현합니다.
  - Drawer 재오픈 시 *"작성 중인 내용이 있습니다. 불러오시겠습니까?"* 프롬프트 제공.
- **효과**: 데이터 유실 방지 및 사용자 경험 향상.

### 1.3 실시간 유효성 검사 및 피드백 강화
- **문제점**: "저장하기"를 눌러야만 유효성 검사가 실행되며, 어느 태스크에 문제가 있는지 직관적으로 파악하기 어렵습니다.
- **제안**:
  - 칸반 카드에 **경고 아이콘(Badge)** 표시 (예: 📅 일정 누락, 👤 담당자 미지정).
  - 상단에 *"검토 필요 항목: 3건"*과 같은 요약 메시지바 제공.
  - 저장 버튼에 마우스 오버 시, 비활성화 사유를 툴팁으로 표시.

### 1.4 부분 성공(Partial Success)에 대한 명확한 복구 흐름
- **문제점**: 프로젝트는 생성되었으나 태스크 생성 실패 시, 현재는 알림만 뜨고 흐름이 끊깁니다.
- **제안**: 에러 모달에서 **[재시도]** 또는 **[생성된 프로젝트로 이동]** 옵션을 제공하여, 사용자가 수동으로라도 작업을 이어갈 수 있게 유도합니다.

---

## 2. 파일 구조 및 폴더명 개선 (Refactoring)

### 2.1 기능 기반 폴더 구조 (Feature-First)
현재 구조는 Layer(components, sections, hooks) 중심입니다. '프로젝트 등록'과 같이 복잡도가 높은 기능은 **관련 파일들을 응집(Co-location)**시키는 것이 유지보수에 유리합니다.

**[현행 구조]**
```text
src/features/project/
├── components/drawer/ProjectAddDrawer.jsx
├── sections/ProjectAddFormSection.jsx
├── sections/ProjectAddTasksSection.jsx
├── hooks/useProjectSubmit.js
└── ...
```

**[제안 구조]**
`registration` (또는 `create`)이라는 하위 디렉토리를 만들어 관련 컴포넌트와 훅을 모으는 것을 추천합니다.
```text
src/features/project/
├── components/
│   └── registration/             # [신설] 등록 기능 전용 폴더
│       ├── ProjectRegistrationDrawer.jsx  # (구 ProjectAddDrawer)
│       ├── ProjectBasicInfoForm.jsx       # (구 ProjectAddFormSection)
│       ├── TaskPlanningBoard.jsx          # (구 ProjectAddTasksSection)
│       └── RegistrationWizard.jsx         # [신설] 단계별 진행 관리자
├── hooks/
│   └── registration/             # [신설] 등록 관련 훅 분리
│       ├── useRegistrationForm.js         # (구 useProjectForm)
│       └── useRegistrationSubmit.js       # (구 useProjectSubmit)
└── ...
```

### 2.2 명명 규칙 (Naming Convention) 개선
- **`...Section` 접미사 지양**: `Section`은 레이아웃의 구획을 의미하는데, 실제로는 독립적인 기능을 수행하는 거대 컴포넌트입니다. 역할에 맞는 이름으로 변경합니다.
  - `ProjectAddFormSection` → **`ProjectBasicInfoForm`** (기본 정보 폼임이 명확함)
  - `ProjectAddTasksSection` → **`TaskPlanningBoard`** ('태스크 추가'보다 '계획 수립'이라는 도메인 용어 사용)
- **`Add` vs `Registration`**: 단순 추가(Add)보다 프로세스가 있는 등록(Registration)이나 생성(Creation)이 더 적합할 수 있습니다. 다만, 프로젝트 전체 컨벤션이 `Add`라면 유지하되, 내부 로직은 `RegistrationService` 등으로 구체화합니다.

---

## 3. 아키텍처 및 코드 설계 개선

### 3.1 Container의 역할 분산
- **문제점**: `ProjectContainer.jsx`가 페이지 레이아웃(`ProjectListLayout` 등)과 Drawer(`ProjectDetailDrawer`, `ProjectAddDrawer` 등)를 모두 관리하는 'God Component'가 되었습니다.
- **제안**:
  - **`ProjectDrawerManager.jsx`**: Drawer의 렌더링과 분기 처리만 전담하는 컴포넌트 분리.
  - **`ProjectLayoutManager.jsx`**: 메인 페이지 레이아웃 스위칭 전담.
  - `ProjectContainer`는 위 두 매니저를 포함하는 껍데기 역할만 수행.

### 3.2 비즈니스 로직의 서비스 계층 분리
- **문제점**: `useProjectSubmit.js` 훅 내부에 API 호출 순서 제어, 트랜잭션 처리, 진행률 계산 등 방대한 로직이 포함되어 있습니다.
- **제안**: 순수 비즈니스 로직을 **Service Class**로 추출합니다.
  - **`ProjectRegistrationService.js`**:
    - `createProject()`
    - `logStatusHistory()`
    - `createBucketsAndTasks()`
    - `rollback()` (필요 시)
  - Hook(`useProjectSubmit`)은 UI 상태(Loading, Progress)와 Service 호출만 연결합니다.

### 3.3 설정(Config)의 중앙화
- Drawer 설정이나 초기값들이 여러 파일에 산재되어 있습니다.
- `src/features/project/config/registrationConfig.js`를 만들어 폼 초기값, 유효성 검사 규칙, Drawer 옵션 등을 한곳에서 관리합니다.
