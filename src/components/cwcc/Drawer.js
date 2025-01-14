import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const DrawerBlock = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  ${(props) =>
    props.isOpen
      ? css`
          width: 900px;
        `
      : css`
          width: 0;
        `}
`;

const CloseButton = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  border: none;
  background: none;
  font-size: 1.5em;
`;

const DrawerComp = ({ isOpen, onClose }) => (
  <DrawerBlock isOpen={isOpen}>
    <CloseButton onClick={onClose}>X</CloseButton>
    <div style={{ padding: '1em' }}>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </div>
  </DrawerBlock>
);

const Drawer = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div>
      <button onClick={handleOpen}>Open Drawer</button>
      {isOpen && <DrawerComp isOpen={isOpen} onClose={handleClose} />}
      {props.children}
    </div>
  );
};

export default Drawer;
