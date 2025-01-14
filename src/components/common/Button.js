import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import palette from '../../lib/styles/palette';
import paletteJY from '../../lib/styles/palette_JY';

const buttonStyle = css`
  border: none;
  border-radius: 40px;
  font-size: 14px;
  padding: 14px 0 10px;
  color: ${paletteJY.gray[2]};
  outline: none;
  cursor: pointer;
  width: 231px;
  box-shadow: 3px 3px 3px rgba(181 191 198 / 46%), -2px -3px 2px #fff;
  background: transparent linear-gradient(100deg, #e7ecf3 0%, #eff3f6 100%) 0%
    0% no-repeat padding-box;
  display: block;
  height: 40px;
  margin-left: auto;
  &:hover {
    color: ${paletteJY.gray[1]};
  }
  &:active {
    box-shadow: inset 3px 3px 3px rgba(181 191 198 / 46%),
      inset -2px -3px 2px rgba(255 255 255 / 52%);
  }
  // sub menu button 선택시
  ${(props) =>
    props.type === 'primary' &&
    css`
      /* box-shadow: inset 3px 3px 3px rgba(181 191 198 / 46%),
        inset -2px -3px 2px rgba(255 255 255 / 52%); */
      span {
        display: block;
        width: 86px;
        height: 29px;
        margin: 0 auto;
        border-radius: 4px;
        background-color: ${paletteJY.blue};
        color: #fff;
      }
    `}
`;

const StyledButton = styled.button`
  ${buttonStyle}
`;

const StyledLink = styled(Link)`
  ${buttonStyle}
`;

const Button = (props) => {
  return props.to ? (
    <StyledLink {...props} cyan={props.cyan ? 1 : 0} />
  ) : (
    <StyledButton {...props} />
  );
};

export default Button;
