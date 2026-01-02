/**
 * Contact 전용 Drawer 컴포넌트 (신규 Drawer 시스템 적용)
 * - Framer Motion 애니메이션
 * - useDrawer Hook 사용
 * - DrawerMenu 통합 메뉴 사용
 * - 단일 등록 / 일괄 등록 기능
 */

import React from 'react';
import { Drawer, DrawerMenu, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';
import { useCodebook } from '../../../../shared/hooks/useCodebook.js';
import ContactAddForm from '../forms/ContactAddForm';
import ContactExcelUpload from '../upload/ContactExcelUpload.jsx';

const ContactDrawer = ({ drawer }) => {
  const { close, setMode } = useDrawer();
  const { visible, mode, data } = drawer;

  // Codebook 데이터 조회
  const {
    data: codebooks,
    isLoading,
    error,
  } = useCodebook(['sfaSalesType', 'sfaClassification']);

  // Toggle 메뉴 아이템 (단일 등록 / 일괄 등록)
  const toggleMenuItems = [
    { key: 'addSingle', label: '단일 등록' },
    { key: 'addBulk', label: '일괄 등록' },
  ];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (mode) {
      const titles = {
        addSingle: '담당자 등록',
        addBulk: '담당자 일괄등록',
        view: '담당자 상세정보',
        edit: '담당자 수정',
      };
      return titles[mode] || '';
    }
    return '';
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    switch (mode) {
      case 'addSingle':
        return <ContactAddForm />;
      case 'addBulk':
        return <ContactExcelUpload />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={close}
      width={DRAWER_SIZES.XL}
      enableOverlayClick={false}
      mode={mode}
      animationEnabled={true}
      menu={
        (mode === 'addSingle' || mode === 'addBulk') && (
          <DrawerMenu
            type="toggle"
            items={toggleMenuItems}
            activeKey={mode}
            onItemClick={setMode}
          />
        )
      }
    >
      {renderContent()}
    </Drawer>
  );
};

export default ContactDrawer;
