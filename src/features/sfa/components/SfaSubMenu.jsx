// src/features/sfa/components/SfaSubMenu/index.jsx
import React from 'react';
import styled from 'styled-components';
import { useSfa } from '../context/SfaContext';

const MenuContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const MenuButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  &:active {
    background: #e5e7eb;
  }
`;

const SfaSubMenu = () => {
  const { setLayout, setDrawer } = useSfa();

  // const handleModeChange = (newMode) => {
  //   console.log('Clicking menu button:', newMode); // 디버깅을 위한 로그 추가
  //   changeMode(newMode);
  // };

  return (
    <MenuContainer>
      <MenuButton onClick={() => setDrawer({ visible: true, mode: 'add' })}>
        매출등록
      </MenuButton>
      <MenuButton onClick={() => setLayout('search')}>상세조회</MenuButton>
      <MenuButton onClick={() => setLayout('forecast')}>매출예측</MenuButton>
      <MenuButton onClick={() => setLayout('default')}>초기화</MenuButton>
    </MenuContainer>
  );
};
export default SfaSubMenu;
