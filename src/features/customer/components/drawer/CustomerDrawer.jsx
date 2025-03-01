/**
 * Customer 전용 Drawer 컴포넌트입니다.
 */

// src/features/customer/components/drawer/CustomerDrawer.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice.js';
// import { useSfa } from '../../context/SfaProvider.jsx';
import { useCustomer } from '../../context/CustomerProvider.jsx';
// import { useSfaForm } from '../../hooks/useSfaForm.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';
import CustomerAddForm from '../forms/CusotmerAddForm';
import CustomerDetailTable from '../tables/CustomerDetailTable.jsx';
import EditableCustomerDetailTable from '../tables/EditableCustomerDetailTable.jsx';

const CustomerDrawer = () => {
  // Codebook 데이터 조회
  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );
  //   const { togglePaymentSelection, resetPaymentForm } = useSfaForm(); // Custom hook을 통한 form 관련 로직 분리

  const { drawerState, setDrawer, setDrawerClose } = useCustomer();
  const { visible, controlMode, featureMode, data } = drawerState;

  const controlMenus = [
    {
      key: 'view',
      label: 'View',
      active: controlMode === 'view',
      onClick: () => {
        // setActiveControl('view');
        setDrawer({ controlMode: 'view' });
      },
    },
    {
      key: 'edit',
      label: 'Edit',
      active: controlMode === 'edit',
      onClick: () => {
        // setActiveControl('edit');
        setDrawer({ controlMode: 'edit' });
      },
    },
  ];

  const functionMenus = [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (controlMode) {
      const titles = {
        add: '고객등록',
        view: '고객 상세정보',
        edit: '고객 수정',
      };
      return titles[controlMode] || '';
    }
    return '';
  };

  // ViewContent 컴포넌트 - 조회 모드 UI
  const AddContent = () => (
    <CustomerAddForm
    //   sfaSalesTypeData={sfaSalesTypeData}
    //   sfaClassificationData={sfaClassificationData}
    />
  );
  const ViewContent = ({ data }) => (
    <>
      <CustomerDetailTable data={data} />
    </>
  );
  const EditContent = ({ data }) => (
    <>
      <EditableCustomerDetailTable
        data={data}
        editable={true} // 편집 가능 여부 설정
      />
    </>
  );

  return (
    <BaseDrawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      menu={
        <ActionMenuBar
          controlMenus={controlMenus}
          functionMenus={functionMenus}
        />
      }
      width="900px"
      enableOverlayClick={false}
      controlMode={controlMode}
    >
      {/* {renderDrawerContent()} */}
      {controlMode === 'add' && <AddContent />}
      {controlMode === 'view' && <ViewContent data={data?.data[0]} />}
      {controlMode === 'edit' && <EditContent data={data?.data[0]} />}
    </BaseDrawer>
  );
};

export default CustomerDrawer;
