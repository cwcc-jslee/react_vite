import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import * as api from '../lib/api/api';
import {
  getList,
  changeDrawerVisible,
  getCodebook,
  initDrawerVisible,
} from '../modules/status';
import { Button, Space, Divider, Table, Radio } from 'antd';
import ListTableForm from '../components/templete/ListTableForm';

const Base = styled.div`
  width: 100%;
`;

const MaintenanceContainer = () => {
  //
  return (
    <Base>
      <h1>유지보수 페이지</h1>
    </Base>
  );
};

export default MaintenanceContainer;
