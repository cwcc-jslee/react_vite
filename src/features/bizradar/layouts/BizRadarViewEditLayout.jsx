/**
 * BizRadar 상세/수정 레이아웃
 * 드로어 형태로 상세 정보 표시 및 수정
 */
import React from 'react';
import { useSelector } from 'react-redux';
import BizRadarViewDrawer from '../components/drawer/BizRadarViewDrawer';

const BizRadarViewEditLayout = ({ onClose }) => {
  const drawer = useSelector((state) => state.ui.drawer);

  return (
    <BizRadarViewDrawer
      visible={drawer.visible}
      mode={drawer.mode}
      data={drawer.data}
      onClose={onClose}
    />
  );
};

export default BizRadarViewEditLayout;
