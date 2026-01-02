/**
 * Customer 전용 Drawer 컴포넌트 (신규 Drawer 시스템 적용)
 * - Framer Motion 애니메이션
 * - useDrawer Hook 사용
 * - DrawerMenu 통합 메뉴 사용
 */

import React from 'react';
import { Drawer, DrawerMenu, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import CustomerAddForm from '../forms/CustomerAddForm';
import CustomerDetailTable from '../tables/CustomerDetailTable.jsx';
import EditableCustomerDetailTable from '../tables/EditableCustomerDetailTable.jsx';

const CustomerDrawer = ({ drawer }) => {
  const { close, setMode } = useDrawer();
  const { visible, mode, data } = drawer;

  // Codebook 데이터 조회
  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error,
  } = useCodebook([
    'coClassification',
    'businessScale',
    'coFunnel',
    'employee',
    'businessType',
    'region',
  ]);

  // Toggle 메뉴 아이템 (View/Edit 전환)
  const toggleMenuItems = [
    { key: 'view', label: 'View' },
    { key: 'edit', label: 'Edit' },
  ];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (mode) {
      const titles = {
        add: '고객등록',
        view: '고객 상세정보',
        edit: '고객 수정',
      };
      return titles[mode] || '';
    }
    return '';
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    switch (mode) {
      case 'add':
        return (
          <CustomerAddForm
            codebooks={codebooks}
            isLoadingCodebook={isLoadingCodebook}
          />
        );
      case 'view':
        return <CustomerDetailTable data={data?.data[0]} />;
      case 'edit':
        return (
          <EditableCustomerDetailTable
            codebooks={codebooks}
            isLoadingCodebook={isLoadingCodebook}
            data={data?.data[0]}
            editable={true}
          />
        );
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
        mode !== 'add' && (
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

export default CustomerDrawer;
