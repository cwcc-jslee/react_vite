// src/features/sfa/components/drawer/SfaDrawer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice.js';
import { useSfa } from '../../context/SfaProvider.jsx';
import { Button } from '../../../../shared/components/ui/index.jsx';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import SfaAddForm from '../forms/SfaAddForm/index.jsx';
import SfaDetailTable from '../tables/SfaDetailTable.jsx';
import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable.jsx';
import { useSfaForm } from '../../hooks/useSfaForm.js';
import SfaEditForm from '../forms/SfaEditForm/index.jsx';
import EditableSfaDetail from '../tables/EditableSfaDetail.jsx';
import SalesByPayment from '../elements/SalesByPayment.jsx';
import SfaAddPaymentForm from '../forms/SfaAddPaymentForm.jsx';
import SfaPaymentForm from '../forms/SfaPaymentForm.jsx';

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
  const {
    formData,
    handleAddPayment,
    togglePaymentSelection,
    handleEditPayment,
    resetPaymentForm,
    // selectedPaymentData,
  } = formProps;

  // Props 객체 구성
  // const addFormProps = {
  //   // ...formProps,
  //   sfaSalesTypeData,
  //   sfaClassificationData,
  // };

  const { drawerState, setDrawer, setDrawerClose } = useSfa();
  const { visible, controlMode, featureMode, data } = drawerState;

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
            onClick={() =>
              setDrawer({ controlMode: btnMode, featureMode: 'editBase' })
            }
            size="sm"
            className="mx-1"
          >
            {label}
          </Button>
        ))}
      </div>
    );
  };

  // Feature 메뉴 렌더링 (editBase, addPayment, editPayment)
  const renderFeatureMenu = () => {
    if (controlMode !== 'edit') return null;

    const featureItems = [
      { mode: 'editBase', label: '기본정보수정' },
      { mode: 'addPayment', label: '결제매출등록' },
      { mode: 'editPayment', label: '결제매출수정' },
    ];

    return (
      <div className="flex gap-2">
        {featureItems.map(({ mode, label }) => (
          <Button
            key={mode}
            type="button"
            variant={featureMode === mode ? 'primary' : 'outline'}
            onClick={() => {
              setDrawer({ featureMode: mode });
              resetPaymentForm();
              // handleEditPayment();
            }}
            size="sm"
            className="mx-1"
          >
            {label}
          </Button>
        ))}
      </div>
    );
  };

  // Drawer 컨텐츠 렌더링
  const renderDrawerContent = () => {
    if (!visible) return null;
    if (controlMode === 'view' && !data) return null;

    if (controlMode === 'add') {
      return (
        <SfaAddForm
          sfaSalesTypeData={sfaSalesTypeData}
          sfaClassificationData={sfaClassificationData}
        />
      );
    }

    if (controlMode === 'view') {
      return (
        <>
          <SfaDetailTable data={data} />
          <SfaDetailPaymentTable
            data={data.sfa_by_payments || []}
            controlMode="view"
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
            featureMode={featureMode}
            sfaSalesTypeData={sfaSalesTypeData}
            sfaClassificationData={sfaClassificationData}
            // onUpdate={handleFieldUpdate}
          />

          {/* 결제 매출 등록 버튼 */}
          {/* {renderFeatureMenu()} */}

          {/* 결제 매출 Form */}

          {/* {featureMode === 'addPayment' && (
            <SfaAddPaymentForm data={data} controlMode={controlMode} />
          )} */}

          {(featureMode === 'editPayment' || featureMode === 'addPayment') && (
            <SfaPaymentForm
              {...formProps}
              data={data}
              controlMode={controlMode}
              featureMode={featureMode}
              // selectedPaymentData={selectedPaymentData}
              // formData={formData}
            />
          )}
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
            controlMode="edit"
            featureMode={featureMode}
            togglePaymentSelection={togglePaymentSelection}
            // onEdit={(item) =>
            //   setDrawer({
            //     detailMode: 'sales-edit',
            //     editData: item,
            //   })
            // }
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
      featureMenu={renderFeatureMenu()}
      width="900px"
      enableOverlayClick={false}
    >
      {renderDrawerContent()}
    </BaseDrawer>
  );
};

export default SfaDrawer;
