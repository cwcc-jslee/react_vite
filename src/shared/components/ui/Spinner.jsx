import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: inline-block;
  position: relative;
  width: ${(props) => {
    switch (props.size) {
      case 'small':
        return '20px';
      case 'medium':
        return '30px';
      case 'large':
        return '40px';
      default:
        return '30px';
    }
  }};
  height: ${(props) => {
    switch (props.size) {
      case 'small':
        return '20px';
      case 'medium':
        return '30px';
      case 'large':
        return '40px';
      default:
        return '30px';
    }
  }};
`;

const SpinnerCircle = styled.div`
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border: ${(props) => {
      switch (props.size) {
        case 'small':
          return '2px';
        case 'medium':
          return '3px';
        case 'large':
          return '4px';
        default:
          return '3px';
      }
    }}
    solid ${(props) => props.color || '#1890ff'};
  border-radius: 50%;
  animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: ${(props) => props.color || '#1890ff'} transparent transparent
    transparent;
`;

const Spinner = ({ size = 'medium', color }) => {
  return (
    <SpinnerWrapper size={size}>
      <SpinnerCircle size={size} color={color} />
    </SpinnerWrapper>
  );
};

export default Spinner;
