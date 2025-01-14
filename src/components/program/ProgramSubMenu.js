import React from 'react';
import { Button, Select } from 'antd';

const ProgramSubMenu = ({ handleDrawer }) => {
  //
  return (
    <>
      <Button onClick={() => handleDrawer('add')}>등록</Button>
      <Button>예정</Button>
      <Button>제안</Button>
      <Button>수행</Button>
      <Button>완료</Button>
      <Select></Select>
    </>
  );
};

export default ProgramSubMenu;
