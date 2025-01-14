import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import ActionButton from '../../components/common/ActionButton';
import {
  getList,
  changeDrawerVisible,
  getCodebook,
  initDrawerVisible,
  fetchCodebook,
  changeMode,
  addMoreinfo,
} from '../../modules/status';
import { Drawer, Button, Space, Divider, Table, Radio } from 'antd';
import ListTableForm from '../../components/templete/ListTableForm';
import * as CONF from '../../config/projectConfig';
import ProjectDrawerForm from '../../components/project/ProjectDrawerForm';
import { qs_sfaCustomersByIsProject } from '../../lib/api/querySfa';
import fetchAllListR1 from '../../lib/api/fetchAllListR1';
import jsonFormatOptimize from '../../modules/common/jsonFormatOptimize';
import composeSubmitDatas from '../../modules/common/composeSubmitDatas';
import submitToDB2 from '../../modules/common/submitToDB2';
import { useLocation } from 'react-router-dom';
import { qs_projectLists } from '../../lib/api/queryProject';
// import Drawer from '../components/cwcc/Drawer';
import ProjectDetailContainer from './ProjectDetailContainer';
import ProjectStatusForm from '../../components/project/ProjectStatusForm';

const Base = styled.div`
  width: 100%;
`;

const DrawerBlock = styled.div`
  //
`;

const ProjectContainer = () => {
  const dispatch = useDispatch();
  const pathName = useLocation().pathname;
  const { drawer, mode, moreinfo } = useSelector(({ status }) => ({
    drawer: status.drawer,
    mode: status.mode,
    moreinfo: status.moreinfo,
  }));
  const [tableData, setTableData] = useState();

  // ************************ 임시
  const progressCount = { _10: 1, _25: 2, _50: 3, _75: 4, _90: 5 };
  const count = [
    { count: 1 },
    { count: 2 },
    { count: 3 },
    { count: 4 },
    { count: 5 },
    { count: 6 },
  ];
  const selectedBt = ['bt0', 'bt0', 'bt0'];
  // ************************ 임시

  useEffect(() => {
    // dispatch(getList('api/sfa-moreinfos', qs_sfaMoreinfos));
    dispatch(fetchCodebook('project'));
  }, [dispatch]);

  useEffect(() => {
    const path = 'api/projects';
    const qs = qs_projectLists;
    FetchAllList(path, qs);
    dispatch(changeMode('default'));
    return () => {
      dispatch(changeMode('default'));
    };
  }, []);

  const FetchAllList = async (path, qs) => {
    try {
      const filter = { status: '진행중' };
      const request = await fetchAllListR1({ path, qs, filter });
      const optimize = jsonFormatOptimize(request);
      console.log(`@@@@@@@@@@@@@@@@@`, optimize);

      const tablelist = CONF.setTableLists(optimize);
      console.log(`@@@@@@@@@@@@@@@@@`, tablelist);
      setTableData(tablelist);
    } catch (error) {
      console.error('>>>>>>>>>error', error);
    }
  };

  const { cb, commonData } = useSelector(({ status }) => ({
    cb: status.cb,
    commonData: status.commonData,
  }));
  //
  //**************************************************/
  const tableActionForm = {
    title: 'Action',
    key: 'action',
    // width: 200,
    align: 'center',
    render: (text, record) => (
      <>
        <Space size="middle">
          <Button
            onClick={() =>
              handleButtonOnclick(
                {
                  mode: 'detailview',
                },
                record.id,
              )
            }
          >
            View
          </Button>
        </Space>
      </>
    ),
  };
  //**************************************************/
  //Drawer Form 관련
  const [selectBook, setSelectBook] = useState();
  const [drawerInitialValues, setDrawerInitialValues] = useState();
  // sfa 정보 저장 > 고객사 선택시 SFA 데이터 제공용
  const [drSfas, setDrSfas] = useState();
  //**************************************************/

  // sub menu action
  const handleDfAction = (action) => {
    if (action === 'add') {
      let changeDrawer = {};
      console.log(`>>(handleSubMenu)>>`, action);
      // changeDrawer.path = CONF.drawerInfo.path;
      changeDrawer.action = action;
      changeDrawer.loading = false;
      changeDrawer = { ...changeDrawer, open: true };
      setSelectBook({
        ...commonData,
        ...cb,
      });
      dispatch(changeDrawerVisible(changeDrawer));
    }
  };
  //******************drawer form **********************
  //(공통) Drawer Form -> Close 시
  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setDrawerInitialValues();
  };
  //******************drawer form **********************

  //******************공통사항 **********************
  const handleButtonOnclick = async (value, id) => {
    if (value.action === 'DRAWER') {
      console.log(`>>>>`, value);
      const drawer = value.drawer;
      if (drawer.action === 'add') {
        let changeDrawer = {};
        // sfa isProject enable 고객사 정보
        const query = qs_sfaCustomersByIsProject;
        const path = 'api/sfas';
        const get_sfa_customers = await fetchAllListR1({
          qs: query,
          path: path,
          filter: { isProject: true },
        });
        console.log(`>>>>(get_sfa_customers)`, get_sfa_customers);
        const opt_sfa_customers = jsonFormatOptimize(get_sfa_customers);
        console.log(`>>>>(get_sfa_customers > opt)`, opt_sfa_customers);
        // 고객사 중복 제거
        // 고유한 customer 객체를 저장하기 위한 Map 생성
        let customersMap = new Map();
        // 각 데이터 항목에 대해 customer 객체를 추출하고, Map에 추가
        opt_sfa_customers.forEach((item) => {
          let customer = item.customer;
          customersMap.set(customer.id, customer);
        });
        console.log(`>>>>(get_sfa_customers > map)`, customersMap);
        // Map의 value로부터 Array 생성
        let customers = Array.from(customersMap.values());
        // Array를 이름순으로 정렬
        customers.sort((a, b) => a.name.localeCompare(b.name));
        console.log(`>>>>(get_sfa_customers > 중복제거&정렬)`, customers);

        setDrSfas(opt_sfa_customers);
        changeDrawer.path = CONF.info.path;
        changeDrawer.loading = false;
        changeDrawer = { ...changeDrawer, ...value.drawer, open: true };
        setSelectBook({
          ...commonData,
          ...cb,
          sfa_customer: customers,
        });
        dispatch(changeDrawerVisible(changeDrawer));
      }
    } else if (value.mode === 'detailview') {
      //
      console.log('>>', id);
      dispatch(changeMode(value.mode));
      dispatch(addMoreinfo({ id: id }));
    }
  };
  //******************공통사항 **********************

  const handleSelectOnChange = async (name, value) => {
    // console.log(`value&option`, value, option);
    console.log('drSfas', drSfas);
    if (name === 'customer') {
      //
      let filterData = drSfas.filter((item) => item.customer.id === value);
      console.log('>>>(filterData)', filterData);
      console.log('>>>(type)', typeof value);
      setSelectBook({ ...selectBook, sfa: filterData });
    }
    // const sfa = [
    //   { id: 1, attributes: { name: '수출바우처' } },
    //   { id: 2, attributes: { name: '코트라' } },
    // ];
  };
  console.log('>>>(selectBook)', selectBook);

  // ************************************************************** //
  const handleOnSubmit = async (props) => {
    dispatch(
      changeDrawerVisible({
        btnDisabled: true,
      }),
    );
    // console.log('>>>', props.value);
    const req_submit_datas = composeSubmitDatas({
      pathName: pathName,
      drawer: drawer,
      submit_data: props.value,
      isChecked: props.isChecked,
    });
    console.log(`>>>>_req_submit_data`, req_submit_datas);

    const reqData4th = await submitToDB2(req_submit_datas);
    // 임시
    setTimeout(() => {
      dispatch(
        changeDrawerVisible({
          btnDisabled: false,
        }),
      );
    }, 5000);
  };
  // ************************************************************** //

  return (
    <Base>
      <ActionButton
        items={CONF.subMenuItems}
        handleButtonOnclick={handleButtonOnclick}
      />
      {mode === 'default' ? (
        <>
          <ProjectStatusForm
            progressCount={progressCount}
            count={count}
            selectedBt={selectedBt}
          />
          <ListTableForm
            tableColumns={CONF.tableColumns}
            tableActionForm={tableActionForm}
            tableData={tableData}
          />
        </>
      ) : (
        ''
      )}
      {drawer.open &&
      drawer.loading === false &&
      selectBook &&
      drawer.action === 'add' ? (
        <DrawerBlock>
          <Drawer
            title={drawer.title}
            open={drawer.open}
            width={drawer.width}
            onClose={handleOnclose}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <ProjectDrawerForm
              formItems={CONF.drawerFormItems}
              selectBook={selectBook}
              handleSelectOnChange={handleSelectOnChange}
              handleOnSubmit={handleOnSubmit}
            />
          </Drawer>
        </DrawerBlock>
      ) : (
        ''
      )}
      {mode === 'detailview' ? <ProjectDetailContainer id={moreinfo.id} /> : ''}
    </Base>
  );
};

export default ProjectContainer;
