import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { getCustomerlist } from '../modules/customer';
import {
  changeDrawerVisible,
  getCodebook,
  initDrawerVisible,
  fetchCodebook,
  changeMode,
} from '../modules/status';
import AutoComplete from '../components/common/AutoComplete';
import * as api from '../lib/api/api';
import { qs_customerDetail, qs_customers } from '../lib/api/queryCustomer';
import jsonFormatOptimize from '../modules/common/jsonFormatOptimize';
import ListTableForm from '../components/templete/ListTableForm';
import {
  tableColumns,
  setTableLists,
  drawerInfo,
  drawerFormItems,
  submitPath,
  composeDrawerInitialValues,
  drawerSubMenuItems,
} from '../config/customerConfig';
import { Button, Space, Divider, message, Radio, Drawer, Row, Col } from 'antd';
import DrawerForm from '../components/templete/DrawerForm';
import { qs_getSelectFormLists } from '../lib/api/queryCommon';
import fetchLists from '../modules/fetchLists';
import dayjs from 'dayjs';
import { tbl_insert } from '../modules/common/tbl_crud';
// import SubmitDrwaerContainer from '../common/SubmitDrawerContainer';
import submitToDB from '../modules/common/submitToDB';
import DrawerFormContainer, {
  handleDrawer,
} from './common/DrawerFormContainer';
import DrawerContainer from './common/DrawerContainer';
import CustomerDrawerForm from '../components/customer/CustomerDrawerForm';
import * as CONF from '../config/customerConfig';
import { useLocation } from 'react-router-dom';
import composeSubmitDatas from '../modules/common/composeSubmitDatas';
import submitToDB2 from '../modules/common/submitToDB2';
import DrawerButton from '../components/drawer/DrawerButton';
import ActionButton from '../components/common/ActionButton';
import CustomerSearchComponent from '../components/customer/CustomerSearchComponent';
import CustomerStatisticsContainer from './CustomerStatisticsContainer';
import fetchAllList from '../lib/api/fetchAllListR1';

const Base = styled.div`
  width: 100%;
`;

const DrawerBlock = styled.div`
  //
`;

const CustomerContainer = () => {
  const dispatch = useDispatch();
  const pathName = useLocation().pathname;
  const { cb, commonData } = useSelector(({ status }) => ({
    cb: status.cb,
    commonData: status.commonData,
  }));
  const { lists, status, error } = useSelector(({ customer }) => ({
    lists: customer.data,
    status: customer.status,
    error: customer.error,
  }));

  const { drawer, mode } = useSelector(({ status }) => ({
    drawer: status.drawer,
    mode: status.mode,
  }));

  // const [customerInfo, setCustomerInfo] = useState();
  const [tableData, setTableData] = useState();
  const [selectBook, setSelectBook] = useState();
  const [drawerInitialValues, setDrawerInitialValues] = useState();
  const [rawDrawerInitialValues, setRawDrawerInitialValues] = useState();

  useEffect(() => {
    dispatch(initDrawerVisible());
    // getcodebook 부분 수정 필요 해당 메뉴 선택시 마다 dispatch 됨
    dispatch(fetchCodebook('customer'));
  }, []);

  // useEffect(() => {
  //   setSelectBook({
  //     ...commonData,
  //     ...cb,
  //   });
  // }, [cb, commonData]);

  // 컴포넌츠 처음 렌더링시 고객리스트 가져옴(디스패치..)
  useEffect(() => {
    dispatch(getCustomerlist());
  }, [dispatch]);

  useEffect(() => {
    if (status) {
      console.log('고객리스트 가져오기 성공');
    }
    if (error) {
      console.log('고객리스트 가져오기 실패');
      console.log(error);
    }
  }, [status]);

  // ListTableForm 데이터
  useEffect(() => {
    if (lists) {
      const tablelist = setTableLists(lists);
      setTableData(tablelist);
    }
  }, [lists]);

  // 컴포넌트 1번만 렌더링
  useEffect(() => {
    if (
      (drawer.action && drawer.action === 'add') ||
      drawer.action === 'edit'
    ) {
      fetchSelectFormLists();
    }
  }, [drawer.open]);

  const tableActionForm = {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <Space size="middle">
        {/* handleDrawer : /명령-add, view, edit / id */}
        <Button
          onClick={() =>
            handleButtonOnclick(
              {
                action: 'DRAWER',
                drawer: {
                  action: 'view',
                  path: 'customers',
                  title: '고객 View',
                  width: 900,
                },
              },
              record.id,
            )
          }
        >
          View
        </Button>
      </Space>
    ),
  };

  // ****************************************************** //

  // Drawer -> EDIT, ADD 모드일경우 SELECT 정보 가져오기 기능
  // 코드북 1단계
  const fetchSelectFormLists = async () => {
    // const query_topprogram = qs_getSelectFormLists();
    // const req_topprogram = await fetchLists(
    //   `api/top-programs`,
    //   query_topprogram,
    //   true,
    // );
    // console.log('>>(top-program)>>', req_topprogram);

    // setSelectBook({
    //   ...cb,
    //   ...commonData,
    //   'top-programs': req_topprogram,
    // });
    dispatch(changeDrawerVisible({ loading: false }));
  };
  // ****************************************************** //

  // ************************************************************** //
  const handleOnSubmit = async (props) => {
    dispatch(
      changeDrawerVisible({
        btnDisabled: true,
      }),
    );
    const req_submit_datas = composeSubmitDatas({
      pathName: pathName,
      drawer: drawer,
      submit_data: props.value,
      isChecked: props.isChecked,
      selectBook: selectBook,
    });
    console.log(`>>>>_req_submit_data`, req_submit_datas);

    const reqData4th = await submitToDB2(req_submit_datas);
    // 임시
    // setTimeout(() => {
    //   dispatch(
    //     changeDrawerVisible({
    //       btnDisabled: false,
    //     }),
    //   );
    // }, 5000);
  };
  // ************************************************************** //
  const handleButtonOnclick = async (value, id) => {
    setSelectBook({
      ...commonData,
      ...cb,
    });
    if (value.action === 'DRAWER' && value.drawer.action === 'add') {
      dispatch(changeDrawerVisible(value.drawer));
    } else if (value.action === 'DRAWER' && value.drawer.action === 'view') {
      let changeDrawer = {};
      console.log(`>>>>(view)`, value);
      const path = `api/customers/${id}`;
      const query = qs_customerDetail();
      const request = await fetchLists(path, query);
      console.log('**request**', request[0]);
      //Drawer initialValues 설정
      const init = CONF.composeDrawerInitialValues(
        request[0],
        value.drawer.action,
      );
      console.log('**DrawerInitialValues**', init);
      //
      changeDrawer = {
        ...changeDrawer,
        ...value.drawer,
        id: id,
        moreinfo: init.moreinfo,
      };
      changeDrawer.loading = false;
      setDrawerInitialValues(init);
      setRawDrawerInitialValues(request[0]);
      changeDrawer = { ...changeDrawer, open: true };
      dispatch(changeDrawerVisible(changeDrawer));
    } else if (value.action === 'SUB') {
      // drawer form 버튼 클릭시
      console.log(`>>>>(sub)`, value);
      // initvalues 변경
      const init = CONF.composeDrawerInitialValues(
        rawDrawerInitialValues,
        value.drawer.action,
      );
      console.log('**DrawerInitialValues**', init);
      setDrawerInitialValues(init);
      dispatch(changeDrawerVisible({ ...value.drawer }));
    } else if (value.action === 'reset') {
      const tablelist = setTableLists(lists);
      setTableData(tablelist);
      dispatch(changeMode('default'));
    } else if (value.action === 'search') {
      dispatch(changeMode('search'));
    }
  };

  //(공통) Drawer Form -> Close 시
  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setDrawerInitialValues();
  };

  const searchOnSubmit = async (v) => {
    let filter = [];
    const path = 'api/customers';
    const qs = qs_customers;
    console.log('검색 - onSubmit', v);
    //고객명
    if (v.name) filter = [...filter, { name: { $contains: v.name } }];
    //등록일 조회
    if (v.createdAt) {
      const startDay = dayjs(v.createdAt[0])
        .startOf('month')
        .format('YYYY-MM-DD');
      const endDay = dayjs(v.createdAt[1]).endOf('month').format('YYYY-MM-DD');
      console.log('>>>>', endDay);
      filter = [
        ...filter,
        {
          createdAt: {
            $gte: startDay,
          },
        },
        {
          createdAt: {
            $lte: endDay,
          },
        },
      ];
    }
    //기업분류
    if (v.co_classfication) {
      filter = [
        ...filter,
        { co_classification: { id: { $eq: v.co_classfication } } },
      ];
    }
    //기업규모
    if (v.business_scale) {
      filter = [
        ...filter,
        { business_scale: { id: { $eq: v.business_scale } } },
      ];
    }
    //종업원
    if (v.employee) {
      filter = [...filter, { employee: { id: { $eq: v.employee } } }];
    }
    //지역
    if (v.region) {
      filter = [...filter, { region: { id: { $eq: v.region } } }];
    }
    //지역
    if (v.city) {
      filter = [...filter, { city: { $contains: v.city } }];
    }
    //유입경로
    if (v.funnel) {
      filter = [...filter, { funnel: { $contains: v.funnel } }];
    }

    //
    //
    const request = await fetchAllList({ path, qs, filter });
    const optimize = jsonFormatOptimize(request);
    console.log('optimize', optimize);
    const newtablelists = setTableLists(optimize);
    setTableData(newtablelists);
  };

  return (
    <Base>
      {/* <AutoComplete lists={tableData} /> */}
      <ActionButton
        items={CONF.actionButton}
        handleButtonOnclick={handleButtonOnclick}
      />
      {mode === 'default' ? (
        <CustomerStatisticsContainer
        // staticsOnClick={staticsOnClick}
        />
      ) : (
        ''
      )}
      {mode === 'search' && selectBook ? (
        <CustomerSearchComponent
          selectBook={selectBook}
          // handleSelectOnChange={handleSelectOnChange}
          searchOnSubmit={searchOnSubmit}
        />
      ) : (
        ''
      )}
      {status ? (
        <ListTableForm
          tableColumns={tableColumns}
          tableActionForm={tableActionForm}
          tableData={tableData}
          // handleDrawer={handleDrawer}
        />
      ) : (
        <h1>로객리스트 로딩중..</h1>
      )}
      {drawer.loading === false && selectBook ? (
        <DrawerBlock>
          <Drawer
            title={drawer.title}
            open={drawer.open}
            width={drawer.width}
            onClose={handleOnclose}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <DrawerButton
              items={CONF.drawerForms.memubutton}
              handleButtonOnclick={handleButtonOnclick}
              visible={drawer.action !== 'add' ? true : false}
            />
            <CustomerDrawerForm
              drawer={drawer}
              selectBook={selectBook}
              // formItems={CONF.drawerFormItems}
              drawerForms={CONF.drawerForms}
              initialValues={drawerInitialValues}
              handleOnSubmit={handleOnSubmit}
              // handleOnChange={handleSelectOnChange}
              CONF={CONF}
              handleButtonOnclick={handleButtonOnclick}
            />
          </Drawer>
        </DrawerBlock>
      ) : (
        ''
      )}
    </Base>
  );
};

export default CustomerContainer;
