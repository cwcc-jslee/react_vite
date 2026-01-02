# 신규 Drawer 시스템 (v2)

Priority 1 개선사항을 적용한 새로운 Drawer 시스템입니다.

## 📁 파일 구조

```
src/shared/components/drawer/
├── index.js                      # Export 통합
├── Drawer.jsx                    # 메인 Drawer 컴포넌트 (애니메이션 포함)
├── DrawerMenu.jsx                # 통합 메뉴 컴포넌트
├── README.md                     # 이 파일
│
├── hooks/
│   └── useDrawer.js              # Drawer 전용 Hook
│
├── constants/
│   └── drawerConfig.js           # 크기, 모드, 애니메이션 설정
│
├── utils/
│   └── drawerUtils.js            # 유틸리티 함수
│
└── types/
    └── drawer.types.js           # JSDoc 타입 정의
```

## ✨ 주요 개선사항 (vs 기존 BaseDrawer)

### 1. Framer Motion 애니메이션
- Overlay fade in/out
- Drawer slide in/out (spring 애니메이션)
- `animationEnabled` prop으로 on/off 가능

### 2. 표준화된 크기 시스템
- `DRAWER_SIZES`: SM, MD, LG, XL, FULL
- 하위 호환성: `"900px"` → `"XL"` 자동 변환

### 3. useDrawer Hook (상태 관리 통일)
- Redux 직접 사용 대신 Hook으로 통일
- `open()`, `close()`, `update()` 등 명확한 API

### 4. 통합 DrawerMenu 컴포넌트
- Toggle, Dropdown, Tabs 스타일 통합
- 일관된 인터페이스

### 5. ESC 키 지원
- ESC 키로 Drawer 닫기 자동 지원

### 6. 기타 개선
- Body 스크롤 잠금/해제
- JSDoc 타입 정의
- 유틸리티 함수 제공

## 🚀 기본 사용법

### 1. Drawer 열기

```javascript
import { Drawer, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';

const MyFeature = () => {
  const { drawer, open, close } = useDrawer();

  const handleOpenDrawer = () => {
    open({
      mode: 'add',
      data: null,
    });
  };

  return (
    <>
      <button onClick={handleOpenDrawer}>Drawer 열기</button>

      <Drawer
        visible={drawer.visible}
        title="고객 등록"
        width={DRAWER_SIZES.XL}
        onClose={close}
      >
        {/* Drawer 내용 */}
        <p>여기에 내용을 입력하세요</p>
      </Drawer>
    </>
  );
};
```

### 2. DrawerMenu 사용 (Toggle)

```javascript
import { Drawer, DrawerMenu, useDrawer } from '@shared/components/drawer';

const CustomerDrawer = () => {
  const { drawer, close, setMode } = useDrawer();

  const menuItems = [
    { key: 'view', label: 'View' },
    { key: 'edit', label: 'Edit' },
  ];

  return (
    <Drawer
      visible={drawer.visible}
      title="고객 상세"
      onClose={close}
      mode={drawer.mode}
      menu={
        <DrawerMenu
          type="toggle"
          items={menuItems}
          activeKey={drawer.mode}
          onItemClick={setMode}
        />
      }
    >
      {drawer.mode === 'view' && <ViewContent />}
      {drawer.mode === 'edit' && <EditContent />}
    </Drawer>
  );
};
```

### 3. DrawerMenu 사용 (Dropdown)

```javascript
import { Trash2, Copy, FileText } from 'lucide-react';

const menuItems = [
  {
    key: 'delete',
    label: 'SFA 삭제',
    icon: Trash2,
    onClick: handleDelete,
    className: 'text-red-600',
  },
  { separator: true }, // 구분선
  { key: 'copy', label: '복사하기', icon: Copy, onClick: handleCopy },
  { key: 'history', label: '이력 보기', icon: FileText, onClick: handleHistory },
];

<DrawerMenu type="dropdown" items={menuItems} />
```

### 4. 유틸리티 함수 사용

```javascript
import { getDrawerTitle, getSubmitButtonText } from '@shared/components/drawer';

// Drawer 타이틀 자동 생성
const title = getDrawerTitle('customer', 'add'); // "고객 등록"

// 제출 버튼 텍스트 자동 생성
const submitText = getSubmitButtonText('edit'); // "수정"
```

## 📖 API 문서

### Drawer Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| visible | boolean | required | Drawer 표시 여부 |
| title | string | required | Drawer 제목 |
| onClose | function | required | 닫기 핸들러 |
| width | string | 'MD' | Drawer 너비 (SM, MD, LG, XL, FULL 또는 "900px") |
| menu | ReactNode | null | 메뉴 영역 컴포넌트 |
| footer | ReactNode | null | 푸터 영역 컴포넌트 |
| children | ReactNode | required | Drawer 내용 |
| mode | string | null | Drawer 모드 (menu 표시 제어용) |
| enableOverlayClick | boolean | false | 오버레이 클릭 시 닫기 |
| showCloseButton | boolean | true | 닫기 버튼 표시 여부 |
| animationEnabled | boolean | true | 애니메이션 활성화 |
| className | string | '' | 추가 CSS 클래스 |

### useDrawer Hook

#### 반환값

```javascript
const {
  drawer,      // Redux drawer 상태
  open,        // (config) => void
  close,       // () => void
  update,      // (config) => void
  setMode,     // (mode) => void
  setData,     // (data) => void
  setWidth,    // (width) => void
  setType,     // (type) => void
  setOptions,  // (options) => void
  actions,     // 위 함수들을 객체로 묶은 것
} = useDrawer();
```

### DrawerMenu Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | string | 'toggle' | 메뉴 타입 (toggle, dropdown, tabs) |
| items | array | required | 메뉴 항목 배열 |
| activeKey | string | null | 현재 활성 메뉴 키 |
| onItemClick | function | null | 메뉴 클릭 핸들러 (key) => void |
| className | string | '' | 추가 CSS 클래스 |

#### MenuItem 구조

```javascript
{
  key: 'view',          // 필수: 고유 키
  label: 'View',        // 필수: 표시 텍스트
  onClick: () => {},    // 선택: 클릭 핸들러
  icon: IconComponent,  // 선택: Lucide React 아이콘
  disabled: false,      // 선택: 비활성화
  active: false,        // 선택: 활성 상태 (activeKey 우선)
  separator: false,     // 선택: 구분선 (dropdown만)
  className: '',        // 선택: 추가 클래스
}
```

## 🔄 마이그레이션 가이드

### 기존 코드 (BaseDrawer)

```javascript
import BaseDrawer from '@shared/components/ui/drawer/BaseDrawer';
import { useDispatch } from 'react-redux';
import { closeDrawer, setDrawer } from '@/store/slices/uiSlice';

const MyDrawer = () => {
  const dispatch = useDispatch();
  const drawer = useSelector(state => state.ui.drawer);

  const handleClose = () => {
    dispatch(closeDrawer());
  };

  return (
    <BaseDrawer
      visible={drawer.visible}
      title="고객 등록"
      onClose={handleClose}
      width="900px"
    >
      {/* content */}
    </BaseDrawer>
  );
};
```

### 신규 코드 (Drawer)

```javascript
import { Drawer, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';

const MyDrawer = () => {
  const { drawer, close } = useDrawer();

  return (
    <Drawer
      visible={drawer.visible}
      title="고객 등록"
      onClose={close}
      width={DRAWER_SIZES.XL}  // 또는 "XL"
    >
      {/* content */}
    </Drawer>
  );
};
```

## ⚠️ 주의사항

### 1. Framer Motion 의존성

이 Drawer는 `framer-motion` 라이브러리를 사용합니다.

**package.json 확인:**
```json
{
  "dependencies": {
    "framer-motion": "^10.0.0"
  }
}
```

**설치 필요 시:**
```bash
npm install framer-motion
```

### 2. 기존 Drawer와 충돌 방지

신규 Drawer는 기존 Drawer와 별도로 동작합니다:

- **기존**: `@shared/components/ui/drawer/BaseDrawer`
- **신규**: `@shared/components/drawer`

Import 경로가 다르므로 충돌 없습니다.

### 3. Redux 상태 공유

신규 Drawer도 기존과 동일한 Redux 상태(`state.ui.drawer`)를 사용합니다.
따라서 **한 번에 하나의 Drawer만 열 수 있습니다** (기존과 동일).

## 📝 예제 모음

### 예제 1: Footer가 있는 Drawer

```javascript
const DrawerWithFooter = () => {
  const { drawer, close } = useDrawer();

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={close}>
        취소
      </Button>
      <Button variant="primary" onClick={handleSubmit}>
        저장
      </Button>
    </div>
  );

  return (
    <Drawer
      visible={drawer.visible}
      title="고객 등록"
      onClose={close}
      footer={footer}
    >
      {/* content */}
    </Drawer>
  );
};
```

### 예제 2: 동적 타이틀

```javascript
import { getDrawerTitle } from '@shared/components/drawer';

const DynamicDrawer = () => {
  const { drawer, close } = useDrawer();

  return (
    <Drawer
      visible={drawer.visible}
      title={getDrawerTitle('customer', drawer.mode)} // "고객 등록", "고객 수정" 등
      onClose={close}
    >
      {/* content */}
    </Drawer>
  );
};
```

### 예제 3: 애니메이션 비활성화

```javascript
<Drawer
  visible={drawer.visible}
  title="빠른 입력"
  onClose={close}
  animationEnabled={false}  // 애니메이션 OFF
>
  {/* content */}
</Drawer>
```

## 🤝 기여 가이드

신규 기능 추가나 개선사항이 있으면:

1. `constants/drawerConfig.js`에 상수 추가
2. `utils/drawerUtils.js`에 유틸리티 함수 추가
3. `types/drawer.types.js`에 JSDoc 타입 정의 추가
4. `index.js`에서 export

## 📚 관련 문서

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 📞 문의

문제나 질문이 있으면 개발팀에 문의하세요.
