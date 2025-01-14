// src/shared/components/Drawer/index.jsx
import React from 'react';
import {
  DrawerContainer,
  Overlay,
  DrawerWrapper,
  DrawerHeader,
  Title,
  CloseButton,
  DrawerContent,
  ButtonGroup,
} from './styles';

const BaseDrawer = ({
  visible,
  title,
  width,
  onClose,
  menu,
  children,
  enableOverlayClick = false,
}) => {
  if (!visible) return null;

  return (
    <DrawerContainer>
      <Overlay onClick={enableOverlayClick ? onClose : undefined} />
      <DrawerWrapper width={width}>
        <DrawerHeader>
          <Title>{title}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </DrawerHeader>

        {menu && <ButtonGroup>{menu}</ButtonGroup>}

        <DrawerContent hasMenu={!!menu}>{children}</DrawerContent>
      </DrawerWrapper>
    </DrawerContainer>
  );
};

export default BaseDrawer;
