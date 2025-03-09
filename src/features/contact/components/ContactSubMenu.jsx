// src/features/contact/components/ContactSubMenu.jsx
import React from 'react';
import { Group, Button } from '../../../shared/components/ui/index';
import { useContact } from '../context/ContactProvider';

/**
 * SFA 서브 메뉴 컴포넌트
 * @component
 * @description 매출 관련 주요 기능에 대한 네비게이션 메뉴를 제공합니다.
 * - 매출등록: 새로운 매출 정보를 등록하는 드로어를 엽니다.
 * - 상세조회: 매출 데이터의 상세 검색 화면으로 전환합니다.
 * - 매출예측: 매출 예측 분석 화면으로 전환합니다.
 * - 초기화: 모든 필터를 초기화하고 기본 화면으로 돌아갑니다.
 */
const ContactSubMenu = () => {
  const { setLayout, setDrawer, resetFilters } = useContact();

  return (
    <Group direction="horizontal" spacing="sm" className="mb-5">
      <Button
        variant="outline"
        onClick={() => setDrawer({ visible: true, controlMode: 'add' })}
      >
        등록
      </Button>

      {/* <Button variant="outline" onClick={() => setLayout('search')}>
        조회
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          resetFilters();
          setLayout('default');
        }}
      >
        초기화
      </Button> */}
    </Group>
  );
};

export default ContactSubMenu;
