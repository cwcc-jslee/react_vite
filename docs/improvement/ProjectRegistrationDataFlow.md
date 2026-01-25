# 프로젝트 등록/수정 데이터 흐름 및 개선 제안

**작성일**: 2026-01-24

## 1. 현황 및 문제점

### 1.1 `isModified` 플래그의 이중성
현재 프로젝트 관리 기능은 **'신규 등록(Create)'**과 **'기존 수정(Edit)'** 기능이 `projectBucketSlice` (Redux)와 `ProjectTaskBoard` (UI)를 공유하고 있습니다.

*   **수정 모드**: 기존 데이터와 변경된 사항을 식별하기 위해 `isModified: true` 플래그가 필수적입니다. (변경된 항목만 API 호출)
*   **신규 등록 모드**: 모든 데이터가 새로 생성되는 것이므로 `isModified` 플래그가 논리적으로는 불필요하지만, 공통 Redux 로직(`addColumn`, `addTask`)을 사용함에 따라 자동으로 생성됩니다.

### 1.2 발생했던 문제
신규 등록 시 생성된 `isModified` 플래그가 API 페이로드에 그대로 포함되어 전송될 경우, 백엔드(Strapi 등)에서 "알 수 없는 필드" 오류를 발생시킬 수 있습니다.

## 2. 현재 적용된 해결책 (Workaround)

구조적인 변경 비용을 최소화하기 위해 **API 전송 시점의 데이터 전처리(Sanitization)** 방식을 채택했습니다.

*   **위치**: `src/features/project/hooks/useProjectSubmit.js`
*   **함수**: `prepareCleanData`
*   **동작**: 폼 데이터 및 태스크 데이터를 처리할 때 `isModified` 키를 명시적으로 구조 분해 할당을 통해 제거(`exclude`)합니다.

```javascript
const prepareCleanData = useCallback((data) => {
  // ...
  // isModified 키를 명시적으로 제거
  const { __temp, revenueAmount, revenueProfit, isModified, ...cleanData } = clonedData;
  return cleanData;
}, []);
```

이 방식은 기존의 수정 로직을 건드리지 않으면서 신규 등록 시의 API 오류를 방지하는 실용적인 해결책입니다.

## 3. 향후 개선 제안 (Refactoring Plan)

시스템이 고도화되거나 등록/수정 로직이 더 복잡해질 경우, 다음과 같은 구조적 개선을 고려할 수 있습니다.

### 3.1 스토어 로직 분리 (Mode-based Reducer)
Redux 액션에 '모드' 옵션을 추가하여 `isModified` 생성 여부를 제어합니다.

*   **변경안**: `addColumn`, `addTask` 등의 액션 페이로드에 `skipModificationFlag` 옵션 추가
*   **예시**:
    ```javascript
    // projectBucketSlice.js
    addColumn: (state, action) => {
      const { column, skipModificationFlag } = action.payload;
      // ...
      const newColumn = {
        ...column,
        // 옵션이 true면 isModified를 설정하지 않음
        isModified: skipModificationFlag ? undefined : true 
      };
      state.buckets.push(newColumn);
    }
    ```

### 3.2 등록 전용 상태 관리 분리
현재는 `useProjectBucketStore`가 전역 Redux 상태를 사용하지만, 등록 마법사(`ProjectRegistrationDrawer`)와 같이 독립적인 흐름을 가진 기능은 **Local State (Context API)**로 분리하는 것을 고려할 수 있습니다.

*   **장점**: 전역 상태 오염 방지, 등록 중 취소 시 별도의 Cleanup 로직 불필요
*   **단점**: 기존 칸반 보드 컴포넌트(`ProjectTaskBoard`)가 Redux에 의존하고 있다면 리팩토링 비용 발생

### 3.3 DTO (Data Transfer Object) 패턴 도입
현재는 프론트엔드 모델 객체를 거의 그대로 API로 보내고 있습니다. 이를 명확한 **변환 레이어(Mapper/DTO)**를 두어 관리합니다.

*   `toApiPayload(bucketData)`: API 스펙에 맞는 필드만 Whitelist 방식으로 추출
*   현재의 `prepareCleanData`가 이 역할을 일부 수행하고 있지만, 더 명시적인 타입 정의나 클래스 등을 활용할 수 있습니다.
