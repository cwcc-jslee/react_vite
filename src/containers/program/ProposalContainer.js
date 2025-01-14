import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../../lib/api/api';
import {
  getList,
  changeDrawerVisible,
  initDrawerVisible,
  fetchCodebook,
} from '../../modules/status';
import * as CONF from '../../config/proposalConfig';
import { Button, Space, Divider, Table, Radio, Drawer, Row, Col } from 'antd';
import ActionButton from '../../components/common/ActionButton';
import ListTableForm from '../../components/templete/ListTableForm';
import { qs_proposals } from '../../lib/api/queryProposal';
import fetchAllList from '../../lib/api/fetchAllListR1';
import jsonFormatOptimize from '../../modules/common/jsonFormatOptimize';

const Base = styled.div`
  width: 100%;
`;

const DrawerBlock = styled.div`
  //
`;

const ProposalContainler = () => {
  const dispatch = useDispatch();
  const pathName = useLocation().pathname;
  const { cb, commonData } = useSelector(({ status }) => ({
    cb: status.cb,
    commonData: status.commonData,
  }));
  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  const { lists } = useSelector(({ status }) => ({
    lists: status.list,
  }));

  //리스트 관련
  const [tableData, setTableData] = useState();
  const [selectBook, setSelectBook] = useState();

  // 컴포넌트 처음 렌더링시 고객리스트 가져옴(디스패치..)
  useEffect(() => {
    const path = 'api/proposals';
    const qs = qs_proposals;
    FetchTableList(path, qs);
  }, []);

  const FetchTableList = async (path, qs, filter) => {
    try {
      const request = await fetchAllList({ path, qs, filter });
      const optimize = jsonFormatOptimize(request);
      console.log(`@@@@@@@@@@@@@@@@@`, optimize);
      // list
      const tablelist = CONF.setTableLists(optimize);
      console.log(`@@@@@@@@@@@@@@@@@`, tablelist);
      setTableData(tablelist);
    } catch (error) {
      //
      console.error('>>>>>>>>>error', error);
    }
  };

  const tableActionForm = {
    title: 'Action',
    key: 'action',
    // width: 200,
    align: 'center',
    render: (text, record) => (
      <>
        <Space size="middle">
          {/* handleDrawer : /명령-add, view, edit / id */}
          <Button
            // onClick={() =>
            //   handleButtonOnclick(
            //     {
            //       action: 'DRAWER',
            //       drawer: {
            //         action: 'view',
            //         path: 'programs',
            //         title: '프로그램 View',
            //         width: 900,
            //       },
            //     },
            //     record.id,
            //   )
            // }
            disabled
          >
            View
          </Button>
        </Space>
      </>
    ),
  };

  const handleButtonOnclick = () => {
    //
  };

  return (
    <Base>
      <ActionButton
        items={CONF.subMenuItems}
        handleButtonOnclick={handleButtonOnclick}
      />
      {tableData ? (
        <ListTableForm
          tableColumns={CONF.tableColumns}
          tableActionForm={tableActionForm}
          tableData={tableData}
        />
      ) : (
        ''
      )}
      {/* {drawer.open && drawer.loading === false && selectBook ? (
        <DrawerBlock>
          <Drawer
            title={drawer.title}
            open={drawer.open}
            width={drawer.width}
            onClose={handleOnclose}
            bodyStyle={{ paddingBottom: 80 }}
          >
          </Drawer>
        </DrawerBlock>
      ) : (
        ''
      )} */}
    </Base>
  );
};

export default ProposalContainler;
