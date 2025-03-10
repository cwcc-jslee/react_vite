/**
 * Contact 전용 Drawer 컴포넌트
 */
// src/features/contact/components/drawer/ContactDrawer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice.js';
import { useContact } from '../../context/ContactProvider.jsx';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';
import ContactAddForm from '../forms/ContactAddForm';
import ContactExcelUpload from '../upload/ContactExcelUpload.jsx';

const ContactDrawer = () => {
  // Codebook 데이터 조회
  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );

  const { drawerState, setDrawer, setDrawerClose } = useContact();
  const { visible, controlMode, featureMode, data } = drawerState;

  console.log(`ContactDrawer's drawerState: `, drawerState);

  const controlMenus = [
    {
      key: 'add',
      label: 'add',
      active: featureMode === 'add',
      onClick: () => {
        // setActiveControl('view');
        setDrawer({ featureMode: 'add' });
      },
    },
    {
      key: 'upload',
      label: 'upload',
      active: featureMode === 'upload',
      onClick: () => {
        // setActiveControl('edit');
        setDrawer({ featureMode: 'upload' });
      },
    },
  ];

  const functionMenus = [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (controlMode) {
      const titles = {
        add: '담당자 등록',
        view: '담당자 상세정보',
        edit: '담당자 수정',
      };
      return titles[controlMode] || '';
    }
    return '';
  };

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
      {controlMode === 'add' && featureMode === 'add' && <ContactAddForm />}
      {controlMode === 'add' && featureMode === 'upload' && (
        <ContactExcelUpload />
      )}
      {/* {controlMode === 'view' && <ViewContent data={data?.data[0]} />}
      {controlMode === 'edit' && <EditContent data={data?.data[0]} />} */}
    </BaseDrawer>
  );
};

export default ContactDrawer;
