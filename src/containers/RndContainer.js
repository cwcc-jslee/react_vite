import React, { useEffect, useState } from 'react';
import CheckBoxComponent from '../components/common/CheckBoxComponent';

const RndContainer = () => {
  const items = ['홈페이지', '홍보영상', '3D', '기타1'];

  return <CheckBoxComponent group="서비스" items={items} />;
};

export default RndContainer;
