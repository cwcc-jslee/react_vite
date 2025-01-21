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
  const { visible, mode, detailMode, data } = drawerState;

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (mode === 'add') return '매출등록';
    if (mode === 'detail') {
      const titles = {
        view: 'SFA 상세정보',
        edit: 'SFA 수정',
        'sales-view': '매출정보 상세 보기',
        'sales-edit': '매출정보 수정',
        'sales-add': '매출정보 추가',
      };
      return titles[detailMode] || '';
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

  // 메뉴 버튼 렌더링
  const renderMenu = () => {
    if (mode !== 'detail') return null;

    const menuItems = [
      { mode: 'view', label: 'View' },
      { mode: 'edit', label: 'Edit' },
      { mode: 'sales-add', label: '매출추가' },
    ];

    return menuItems.map(({ mode: btnMode, label }) => (
      <Button
        key={btnMode}
        variant={detailMode === btnMode ? 'primary' : 'outline'}
        onClick={() => setDrawer({ detailMode: btnMode })}
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
    if (mode === 'detail' && !data) return null;

    if (mode === 'add' || mode === 'edit') {
      return <SfaAddForm {...addFormProps} mode={mode} />;
    }

    if (mode === 'detail' && detailMode === 'view') {
      return (
        <>
          <SfaDetailTable data={data} />
          <SfaDetailPaymentTable
            data={data.sfa_by_payments || []}
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
    if (mode === 'detail' && detailMode === 'edit') {
      return (
        <>
          <h1>기본정보수정</h1>
          <EditableSfaDetail
            data={data}
            sfaSalesTypeData={sfaSalesTypeData}
            onUpdate={handleFieldUpdate}
          />

          <SfaDetailPaymentTable
            data={data.sfa_by_payments || []}
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
    if (mode === 'detail' && detailMode === 'sales-add') {
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
      menu={renderMenu()}
      width="900px"
      enableOverlayClick={false}
    >
      {renderDrawerContent()}
    </BaseDrawer>
  );
};

export default SfaDrawer;
