/**
 * Contact 전용 Drawer 컴포넌트
 */
// src/features/contact/components/drawer/ContactDrawer.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDrawer, setDrawer } from '../../../../store/slices/uiSlice.js';
import { selectCodebookByType } from '../../../../store/slices/codebookSlice.js';
import { useContact } from '../../context/ContactProvider.jsx';
import Drawer from '../../../../shared/components/ui/drawer/Drawer.jsx';
import DrawerActionMenu from '../../../../shared/components/ui/button/DrawerActionMenu.jsx';
import ContactAddForm from '../forms/ContactAddForm';
import ContactExcelUpload from '../upload/ContactExcelUpload.jsx';
import { useCodebook } from '../../../../shared/hooks/useCodebook.js';

const ContactDrawer = ({ drawer }) => {
  const dispatch = useDispatch();

  // Codebook 데이터 조회
  const {
    data: codebooks,
    isLoading,
    error,
  } = useCodebook(['sfa_sales_type', 'sfa_classification']);
  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );

  // const { drawerState, setDrawer, setDrawerClose } = useContact();
  // const { visible, baseMode, subMode, data } = drawerState;
  const { visible, mode, featureMode, data } = drawer;

  const setDrawerClose = () => {
    dispatch(closeDrawer());
  };

  const handleSetDrawer = (payload) => {
    dispatch(setDrawer(payload));
  };

  // console.log(`ContactDrawer's drawerState: `, drawerState);

  const baseMenus = [
    {
      key: 'add',
      label: '단일 등록',
      active: mode === 'addSingle',
      onClick: () => {
        // setActiveControl('view');
        handleSetDrawer({ mode: 'addSingle' });
      },
    },
    {
      key: 'upload',
      label: '일괄 등록',
      active: mode === 'addBulk',
      onClick: () => {
        // setActiveControl('edit');
        handleSetDrawer({ mode: 'addBulk' });
      },
    },
  ];

  const subMenus = [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (mode) {
      const titles = {
        addSingle: '담당자 등록',
        addBulk: '담당자 일괄괄등록',
        view: '담당자 상세정보',
        edit: '담당자 수정',
      };
      return titles[mode] || '';
    }
    return '';
  };

  return (
    <Drawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      width="900px"
      enableOverlayClick={false}
    >
      {/* 메뉴 영역 */}
      {(baseMenus.length > 0 || subMode.length > 0) && (
        <div className="border-b border-gray-200 px-4 py-2">
          <DrawerActionMenu baseMenus={baseMenus} subMenus={subMenus} />
        </div>
      )}
      {/* {renderDrawerContent()} */}
      {mode === 'addSingle' && <ContactAddForm />}
      {mode === 'addBulk' && <ContactExcelUpload />}
      {/* {controlMode === 'view' && <ViewContent data={data?.data[0]} />}
      {controlMode === 'edit' && <EditContent data={data?.data[0]} />} */}
    </Drawer>
  );
};

export default ContactDrawer;
