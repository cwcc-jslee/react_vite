# 테이블 컬럼 선택 기능 (Table Column Customization)

## 개요
테이블의 컬럼을 사용자가 직접 선택하여 표시하거나 숨길 수 있는 기능에 대한 기술 문서입니다. 이 기능은 공통 Hook과 UI 컴포넌트로 모듈화되어 있어 시스템 전반에서 일관된 사용자 경험을 제공합니다.

## 파일 구조 (File Structure)

### 공통 모듈 (Shared)
*   **Hook**: `src/shared/hooks/useTableColumns.js`
    *   컬럼의 표시 상태(visible/hidden)를 관리하는 로직
*   **Component**: `src/shared/components/ui/table/TableColumnMenu.jsx`
    *   설정 버튼 및 드롭다운 메뉴 UI
    *   필수 컬럼/선택 컬럼 구분, 전체 선택/초기화 기능 제공
    *   React Portal을 사용하여 테이블 스타일(overflow, z-index 등)의 간섭 없이 메뉴 렌더링

### 구현 예시 (Features)
*   **SfaListTable** (`src/features/sfa/components/tables/SfaListTable.jsx`)
    *   가장 표준적인 구현 형태
*   **ProjectTaskTable** (`src/features/project/components/tables/ProjectTaskTable.jsx`)
    *   (구 `ProjectTaskList`와 `ProjectTaskTable` 통합)
    *   반응형/확장형 구현 예시
    *   화면 확장 상태(`isExpanded`)에 따라 기본 표시 컬럼 세트가 동적으로 변경됨
*   **WorkList** (`src/features/todo/components/tables/WorkList.jsx`)
    *   최근 작업 목록 표시를 위한 표준 테이블 구현 형태

## 주요 구성 요소

### 1. useTableColumns (Hook)
컬럼의 가시성 상태를 관리하는 커스텀 훅입니다.

```javascript
const { 
  visibleColumns,   // 현재 표시 중인 컬럼 Key 배열
  toggleColumn,     // 컬럼 토글 함수 (on/off)
  resetColumns,     // 초기 상태로 리셋 함수
  showAllColumns,   // 전체 컬럼 표시 함수
  setVisibleColumns // 상태 직접 변경 함수 (동적 제어용)
} = useTableColumns(initialColumns);
```

### 2. TableColumnMenu (Component)
사용자 인터페이스를 담당하는 컴포넌트입니다.

**Props:**
*   `columns` (Array): 전체 컬럼 정의 객체 배열 (`{ key, title, ... }`)
*   `visibleColumns` (Array): 현재 표시 중인 컬럼 Key 배열
*   `onToggleColumn` (Function): 컬럼 토글 핸들러
*   `essentialColumns` (Array): 숨김 처리가 불가능한 필수 컬럼 Key 배열 (체크박스 비활성화됨)
*   `defaultVisibleColumns` (Array): '초기화' 버튼 클릭 시 적용될 컬럼 Key 배열
*   `onReset` (Function, Optional): 커스텀 초기화 핸들러
*   `onShowAll` (Function, Optional): 커스텀 전체 선택 핸들러

## 구현 가이드

새로운 테이블에 이 기능을 적용하기 위한 표준 절차입니다.

### 1. 컬럼 상수 정의
전체 컬럼(`COLUMNS`)과 기본으로 보여줄 컬럼(`DEFAULT_VISIBLE_COLUMNS`)을 정의합니다.

```javascript
const COLUMNS = [
  { key: 'id', title: 'ID', essential: true },
  { key: 'name', title: '이름', essential: true },
  { key: 'status', title: '상태' },
  { key: 'created_at', title: '생성일' },
  { key: 'action', title: '관리', essential: true } // 보통 메뉴를 배치할 컬럼을 필수로 지정
];

const DEFAULT_VISIBLE_COLUMNS = ['id', 'name', 'status', 'action'];
```

### 2. Hook 초기화
컴포넌트 내부에서 Hook을 호출하여 상태를 초기화합니다.

```javascript
import { useTableColumns } from '@shared/hooks/useTableColumns';

// ...
const { visibleColumns, toggleColumn, resetColumns, showAllColumns } =
  useTableColumns(DEFAULT_VISIBLE_COLUMNS);

// 헬퍼 함수: 렌더링 시 가독성을 위해 사용
const isColumnVisible = (key) => visibleColumns.includes(key);
```

### 3. 테이블 헤더(Header) 구현
`visibleColumns`에 포함된 컬럼만 필터링하여 렌더링하고, `TableColumnMenu`를 배치합니다.

```jsx
import { TableColumnMenu } from '@shared/components/ui';

// ...
<thead>
  <tr>
    {COLUMNS.filter(col => isColumnVisible(col.key)).map(col => (
      <th key={col.key}>
        {col.key === 'action' ? (
          <div className="flex items-center justify-center gap-2">
            {/* 필요한 경우 다른 액션 버튼들... */}
            
            {/* 컬럼 설정 메뉴 */}
            <TableColumnMenu
              columns={COLUMNS}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              onReset={resetColumns}
              onShowAll={showAllColumns}
              essentialColumns={['id', 'name', 'action']} // 필수 컬럼 지정
              defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
            />
          </div>
        ) : (
          col.title
        )}
      </th>
    ))}
  </tr>
</thead>
```

### 4. 테이블 바디(Body) 구현
데이터 행 렌더링 시에도 동일하게 필터링하여 `<td>`를 렌더링합니다.

```jsx
<tbody>
  {items.map((item, index) => (
    <tr key={item.id}>
      {COLUMNS.filter(col => isColumnVisible(col.key)).map(col => (
        <td key={col.key}>
          {/* 각 컬럼 키에 맞는 데이터 렌더링 로직 */}
          {renderCell(item, col.key)}
        </td>
      ))}
    </tr>
  ))}
</tbody>
```

## 아키텍처 및 데이터 흐름

```mermaid
graph TD
    subgraph Feature Layer [기능 구현 영역]
        Table[Table Component]
    end

    subgraph Shared Layer [공통 모듈 영역]
        Hook[useTableColumns Hook]
        Menu[TableColumnMenu Component]
    end

    User[사용자] -->|설정 버튼 클릭| Menu
    Menu -->|onToggleColumn| Hook
    Hook -->|State Update (visibleColumns)| Table
    Table -->|Re-render (Filtered Columns)| User
```

### 주요 특징
*   **재사용성**: 로직과 UI가 분리되어 있어 어떤 테이블이든 쉽게 적용 가능합니다.
*   **유연성**: 필수 컬럼 지정, 초기화, 전체 선택 등의 기능을 옵션으로 제공합니다.
*   **안정성**: Portal을 사용하여 복잡한 테이블 스타일링(스크롤 등) 내에서도 메뉴가 안정적으로 표시됩니다.