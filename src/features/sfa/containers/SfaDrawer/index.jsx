// src/features/sfa/containers/SfaDrawer/index.jsx
import React from 'react';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer';
import { Button } from '../../../../shared/components/ui';
import { useSfa } from '../../context/SfaContext';

// 폼 컴포넌트들
// 매출등록 - drawer 폼
import SfaAddForm from '../../components/drawer/SfaAddForm';
// // // 매출상세보기 - draser
import SfaDetailTable from '../../components/drawer/SfaDetailTable';
import SfaDetailSalesTable from '../../components/drawer/SfaDetailSalesTable';
// //
// import SfaDetailEditForm from '../../components/drawer/SfaDetailEditForm';
// import SfaSalesItemForm from '../../components/drawer/SfaSalesItemForm';

const SfaDrawer = () => {
  const { drawerState, setDrawer, handleFormSubmit, setDrawerClose } = useSfa();
  const { visible, mode, detailMode, data } = drawerState;

  if (!visible) return null;
  if (mode === 'detail' && !data) return null;

  // 헤더 타이틀 결정
  const getHeaderTitle = () => {
    if (mode === 'add') return '매출등록';
    if (mode === 'detail') {
      switch (detailMode) {
        case 'view':
          return 'SFA 상세정보';
        case 'edit':
          return 'SFA 수정';
        case 'sales-view':
          return '매출정보 상세 보기';
        case 'sales-edit':
          return '매출정보 수정';
        case 'sales-add':
          return '매출정보 추가';
        default:
          return '';
      }
    }
    return '';
  };

  // 메뉴 렌더링
  const renderMenu = () => {
    if (mode !== 'detail') return null;

    return (
      <>
        <Button
          variant={detailMode === 'view' ? 'primary' : 'outline'}
          onClick={() => setDrawer({ detailMode: 'view' })}
          size="sm"
        >
          View
        </Button>
        <Button
          variant={detailMode === 'edit' ? 'primary' : 'outline'}
          onClick={() => setDrawer({ detailMode: 'edit' })}
          size="sm"
        >
          Edit
        </Button>
        <Button
          variant={detailMode === 'sales-add' ? 'primary' : 'outline'}
          onClick={() => setDrawer({ detailMode: 'sales-add' })}
          size="sm"
        >
          매출추가
        </Button>
      </>
    );
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    console.log(`>>mode : ${mode} / detail mode : ${detailMode}`);
    // 매출등록 mode
    if (mode === 'add') {
      console.log(
        `>>sfa add form --mode : ${mode} / detail mode : ${detailMode}`,
      );
      // return <SfaAddForm onSubmit={handleFormSubmit} />;
      return <h1>SfaAddForm TEST</h1>;
    }

    // detail mode
    if (mode === 'detail') {
      switch (detailMode) {
        case 'view':
          return (
            <>
              <h1>hi...</h1>
              <SfaDetailTable data={data} />
              {/* <SfaDetailSalesTable
                data={data.sfa_moreinfos || []}
                onEdit={(item) =>
                  setDrawer({
                    detailMode: 'sales-edit',
                    editData: item,
                  })
                }
              /> */}
            </>
          );

        // case 'edit':
        //   return (
        //     <SfaDetailEditForm initialData={data} onSubmit={handleFormSubmit} />
        //   );

        // case 'sales-add':
        //   return (
        //     <SfaSalesItemForm sfaId={data.id} onSubmit={handleFormSubmit} />
        //   );

        // case 'sales-edit':
        //   return (
        //     <SfaDetailEditForm
        //       initialData={drawerState.editData}
        //       onSubmit={handleFormSubmit}
        //     />
        //   );

        default:
          return null;
      }
    }
  };

  return (
    <BaseDrawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      menu={renderMenu()}
      width="1200px"
      enableOverlayClick={true}
    >
      <h1>DRAWER 테스트 페이지</h1>
      {renderContent()}
    </BaseDrawer>
  );
};

export default SfaDrawer;
