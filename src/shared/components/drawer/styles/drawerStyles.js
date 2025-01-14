// src/shared/components/drawer/styles/drawerStyles.js
import styled from 'styled-components';

export const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

export const DrawerWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: ${(props) => props.width || '900px'};
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1001;
`;

export const DrawerHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h2`
  font-size: 18px;
  color: #1f2937;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    color: #1f2937;
  }
`;

export const DrawerContent = styled.div`
  padding: 0 24px 24px 24px; // 좌우 하단 여백 추가
  height: ${(props) =>
    props.hasMenu ? 'calc(100vh - 120px)' : 'calc(100vh - 72px)'};
  overflow-y: auto;
`;

export const ButtonGroup = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
`;

export const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: ${(props) => (props.active ? '#2563eb' : 'white')};
  color: ${(props) => (props.active ? 'white' : '#374151')};
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: ${(props) => (props.active ? '#2563eb' : '#f9fafb')};
  }
`;
