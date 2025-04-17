/**
 * Customer 전용 Drawer 컴포넌트입니다.
 */

// src/features/customer/components/drawer/CustomerDrawer.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDrawer, setDrawer } from '../../../../store/slices/uiSlice.js';
import { selectCodebookByType } from '../../../../store/slices/codebookSlice.js';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
// import { useSfa } from '../../context/SfaProvider.jsx';
import { useCustomer } from '../../context/CustomerProvider.jsx';
// import { useSfaForm } from '../../hooks/useSfaForm.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';
import CustomerAddForm from '../forms/CusotmerAddForm';
import CustomerDetailTable from '../tables/CustomerDetailTable.jsx';
import EditableCustomerDetailTable from '../tables/EditableCustomerDetailTable.jsx';

const CustomerDrawer = ({ drawer }) => {
  const dispatch = useDispatch();
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
  //   const { togglePaymentSelection, resetPaymentForm } = useSfaForm(); // Custom hook을 통한 form 관련 로직 분리

  // const { drawerState, setDrawer, setDrawerClose } = useCustomer();
  const { visible, mode, data } = drawer;

  const setDrawerClose = () => {
    dispatch(closeDrawer());
  };

  const handleSetDrawer = (payload) => {
    dispatch(setDrawer(payload));
  };

  const controlMenus = [
    {
      key: 'view',
      label: 'View',
      active: mode === 'view',
      onClick: () => {
        // setActiveControl('view');
        handleSetDrawer({ mode: 'view' });
      },
    },
    {
      key: 'edit',
      label: 'Edit',
      active: mode === 'edit',
      onClick: () => {
        // setActiveControl('edit');
        handleSetDrawer({ mode: 'edit' });
      },
    },
  ];

  const functionMenus = [];

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

  // ViewContent 컴포넌트 - 조회 모드 UI
  const AddContent = () => (
    <CustomerAddForm
      codebooks={codebooks}
      isLoadingCodebook={isLoadingCodebook}
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
        codebooks={codebooks}
        isLoadingCodebook={isLoadingCodebook}
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
      controlMode={mode}
    >
      {/* {renderDrawerContent()} */}
      {mode === 'add' && <AddContent />}
      {mode === 'view' && <ViewContent data={data?.data[0]} />}
      {mode === 'edit' && <EditContent data={data?.data[0]} />}
    </BaseDrawer>
  );
};

export default CustomerDrawer;
