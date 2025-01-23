// src/features/sfa/components/drawer/SfaDrawer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
import { useSfa } from '../../context/SfaContext';
import { Button } from '../../../../shared/components/ui';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer';
import SfaAddForm from '../forms/SfaAddForm';
import SfaDetailTable from '../tables/SfaDetailTable';
import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable';
import { useSfaForm } from '../../hooks/useSfaForm';
import SfaEditForm from '../forms/SfaEditForm';
import EditableSfaDetail from '../tables/EditableSfaDetail';
import SalesByPayment from '../elements/SalesByPayment.jsx';
import SfaAddPaymentForm from '../forms/SfaAddPaymentForm.jsx';

/**
 * SFA Drawer 컴포넌트
 * Drawer UI와 상태 관리를 담당
 */
const SfaDrawer = () => {
  // Codebook 데이터 조회
  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );
  // Form Props 생성
  const formProps = useSfaForm(); // Custom hook을 통한 form 관련 로직 분리

  // Props 객체 구성
  const addFormProps = {
    ...formProps,
    sfaSalesTypeData,
    sfaClassificationData,
  };

  const { drawerState, setDrawer, setDrawerClose } = useSfa();
  const { visible, controlMode, featureMode, detailMode, data } = drawerState;
  // edit > 결제 매출 등록 메뉴..
  // const {
  //   formData,
  //   handleSalesPaymentChange,
  //   handleRemoveSalesPayment,
  //   isSubmitting,
  //   paymentMethodData,
  //   percentageData,
  //   isPaymentDataLoading,
  // } = formProps;

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (controlMode) {
      const titles = {
        add: '매출등록',
        view: 'SFA 상세정보',
        edit: 'SFA 수정',
      };
      return titles[controlMode] || '';
    }
    return '';
  };

  // 필드 업데이트 핸들러 / sfa 상세보기 'eidt ' 모드
  const handleFieldUpdate = async (fieldName, value) => {
    try {
      await updateSfaDetail({
        id: data.id,
        [fieldName]: value,
      });
    } catch (error) {
      console.error('Failed to update field:', error);
    }
  };

  // Control 메뉴 렌더링 (View/Edit)
  const renderControlMenu = () => {
    if (controlMode === 'add') return null;

    const controlItems = [
      { mode: 'view', label: 'View' },
      { mode: 'edit', label: 'Edit' },
    ];

    return (
      <div className="flex gap-2">
        {controlItems.map(({ mode: btnMode, label }) => (
          <Button
            key={btnMode}
            variant={controlMode === btnMode ? 'primary' : 'outline'}
            onClick={() => setDrawer({ controlMode: btnMode })}
            size="sm"
            className="mx-1"
          >
            {label}
          </Button>
        ))}
      </div>
    );
  };

  // Feature 메뉴 렌더링 (매출추가, 항목수정)
  const renderFeatureMenu = () => {
    if (controlMode !== 'edit') return null;

    // const featureItems = [
    //   { mode: 'addPayment', label: '매출추가' },
    //   { mode: 'editItem', label: '항목수정' },
    // ];

    // return (
    //   <div className="flex gap-2 mt-2">
    //     {featureItems.map(({ mode: btnMode, label }) => (
    //       <Button
    //         key={btnMode}
    //         variant={featureMode === btnMode ? 'primary' : 'outline'}
    //         onClick={() => setDrawer({ featureMode: btnMode })}
    //         size="sm"
    //         className="mx-1"
    //       >
    //         {label}
    //       </Button>
    //     ))}
    //   </div>
    // );
    return (
      <Button
        type="button"
        variant="primary"
        onClick={addFormProps.handleAddSalesPayment}
        // disabled={isSubmitting || formData.salesByPayments.length >= 3}
        // className={`w-full ${
        //   formData.salesByPayments.length >= 3
        //     ? 'bg-gray-200 hover:bg-gray-200 text-gray-500 border-gray-200'
        //     : ''
        // }`}
      >
        결제매출등록
      </Button>
    );
  };

  // 메뉴 버튼 렌더링
  const renderMenu = () => {
    if (mode !== 'detail') return null;

    let menuItems = [];

    if (detailMode === 'view') {
      menuItems = [
        { mode: 'view', label: 'View' },
        { mode: 'edit', label: 'Edit' },
      ];
    } else if (detailMode === 'edit') {
      menuItems = [
        { mode: 'view', label: 'View' },
        { mode: 'edit', label: 'Edit' },
        { mode: 'addPayment', label: '매출추가' },
      ];
    }

    return menuItems.map(({ mode: btnMode, label }) => (
      <Button
        key={btnMode}
        variant={detailMode === btnMode ? 'primary' : 'outline'}
        onClick={() => setDrawer({ mode: btnMode })}
        size="sm"
        className="mx-1"
      >
        {label}
      </Button>
    ));
  };

  // Drawer 컨텐츠 렌더링
  const renderDrawerContent = () => {
    if (!visible) return null;
    if (controlMode === 'view' && !data) return null;

    if (controlMode === 'add') {
      return <SfaAddForm {...addFormProps} />;
    }

    if (controlMode === 'view') {
      return (
        <>
          <SfaDetailTable data={data} />
          <SfaDetailPaymentTable
            data={data.sfa_by_payments || []}
            detailMode="view"
            onEdit={(item) =>
              setDrawer({
                detailMode: 'sales-edit',
                editData: item,
              })
            }
          />
        </>
      );
    }
    if (controlMode === 'edit') {
      return (
        <>
          <h1>기본정보수정</h1>
          <EditableSfaDetail
            data={data}
            sfaSalesTypeData={sfaSalesTypeData}
            onUpdate={handleFieldUpdate}
          />

          {/* 결제 매출 등록 버튼 */}
          {renderFeatureMenu()}

          {/* 결제 매출 Form */}
          <SfaAddPaymentForm {...formProps} />
          {/* <SalesByPayment
            payments={formData.salesByPayments}
            onChange={handleSalesPaymentChange}
            // onAdd={handleAddSalesPayment}
            onRemove={handleRemoveSalesPayment}
            isSubmitting={isSubmitting}
            paymentMethodData={paymentMethodData}
            percentageData={percentageData}
            isPaymentDataLoading={isPaymentDataLoading}
          /> */}

          <SfaDetailPaymentTable
            data={data.sfa_by_payments || []}
            detailMode="edit"
            onEdit={(item) =>
              setDrawer({
                detailMode: 'sales-edit',
                editData: item,
              })
            }
          />
        </>
      );
    }
    if (controlMode === 'detail' && detailMode === 'sales-add') {
      return (
        <>
          <SfaDetailTable data={data} />
        </>
      );
    }

    return null;
  };

  return (
    <BaseDrawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      controlMenu={renderControlMenu()}
      // featureMenu={renderFeatureMenu()}
      width="900px"
      enableOverlayClick={false}
    >
      {renderDrawerContent()}
    </BaseDrawer>
  );
};

export default SfaDrawer;
