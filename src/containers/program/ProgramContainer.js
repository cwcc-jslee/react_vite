import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import * as api from '../../lib/api/api';
import {
  getList,
  changeDrawerVisible,
  initDrawerVisible,
  fetchCodebook,
} from '../../modules/status';
import { Button, Space, Divider, Table, Radio, Drawer, Row, Col } from 'antd';
import ListTableForm from '../../components/templete/ListTableForm';
import { qs_programs, qs_programDetail } from '../../lib/api/queryProgram';
import {
  qs_getSelectFormLists,
  qs_getUserLists,
} from '../../lib/api/queryCommon';
import {
  proposalDrawerFormItems,
  proposalTableColumns,
  setProposalTableLists,
} from '../../config/proposalConfig';
import fetchLists from '../../modules/fetchLists';
import fetchAllList from '../../lib/api/fetchAllList';
import jsonFormatOptimize from '../../modules/common/jsonFormatOptimize';
import ActionButton from '../../components/common/ActionButton';
import * as CONF from '../../config/programConfig';
import { useLocation } from 'react-router-dom';
import { getDrawerData } from '../../modules/common/handleAction';
import ProgramDrawerForm from '../../components/program/ProgramDrawerForm';
import composeSubmitDatas from '../../modules/common/composeSubmitDatas';
import submitToDB2 from '../../modules/common/submitToDB2';
import setDayjsFormat from '../../modules/common/setDayjsFormat';

const Base = styled.div`
  width: 100%;
`;

const DrawerBlock = styled.div`
  //
`;

const ProgramContainer = () => {
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
  //Drawer Form 관련
  const [drawerInitialValues, setDrawerInitialValues] = useState();
  const [programInitvalus, setProgramInitvalus] = useState();
  const [newFormItems, setNewFormItems] = useState(CONF.drawerFormItems);
  const [proposalLists, setProposalLists] = useState();
  const [rawDrawerInitialValues, setRawDrawerInitialValues] = useState();

  //drawer initvalus 저장공간

  useEffect(() => {
    dispatch(initDrawerVisible());
    fetchSelectFormLists();
    return () => {
      // unmount
    };
  }, []);

  useEffect(() => {
    setSelectBook((prevState) => {
      return {
        ...prevState,
        ...commonData,
        ...cb,
      };
    });
  }, [cb, commonData]);

  // 컴포넌트 처음 렌더링시 고객리스트 가져옴(디스패치..)
  useEffect(() => {
    dispatch(getList('api/programs', qs_programs));
    // getcodebook 부분 수정 필요 해당 메뉴 선택시 마다 dispatch 됨
    dispatch(fetchCodebook('program'));
  }, [dispatch]);

  // 리스트 폼 테이블 데이터 설정
  useEffect(() => {
    if (lists) {
      const request = CONF.setTableLists(lists);
      setTableData(request);
    }
  }, [lists]);

  // 컴포넌트 1번만 렌더링
  // useEffect(() => {
  //   if (
  //     (drawer.action && drawer.action === 'add') ||
  //     drawer.action === 'edit'
  //   ) {
  //     fetchSelectFormLists();
  //   }
  // }, [drawer.open]);

  // form items 재설정, programs - proposals
  useEffect(() => {
    if (drawer.action && drawer.path && drawer.path === 'programs') {
      setNewFormItems(CONF.drawerFormItems);
    } else if (drawer.path && drawer.path === 'proposals') {
      setNewFormItems(proposalDrawerFormItems);
    }
  }, [drawer.path]);

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
            onClick={() =>
              handleButtonOnclick(
                {
                  action: 'DRAWER',
                  drawer: {
                    action: 'view',
                    path: 'programs',
                    title: '프로그램 View',
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
      </>
    ),
  };

  // ****************************************************** //

  // Drawer -> EDIT, ADD 모드일경우 SELECT 정보 가져오기 기능
  // 코드북 1단계
  const fetchSelectFormLists = async () => {
    //
    const path1 = `api/top-programs`;
    const path2 = `api/customers`;
    const path4 = `api/users`;
    // 고객사 테이블에서 '지원기관' 정보 필터
    const filter2 = { co_classification: { id: { $eq: 3 } } };
    const filter3 = { co_classification: { id: { $ne: 3 } } };
    // 상위프로그램 리스트
    const query1 = qs_getSelectFormLists();
    // 지원, 운영기관 리스트
    const query2 = qs_getSelectFormLists(filter2);
    // 고객사 리스트
    const query3 = qs_getSelectFormLists(filter3);
    // 사용자 리스트
    const query4 = qs_getUserLists();
    //
    const request1 = await fetchLists(path1, query1, true);
    const request2 = await fetchLists(path2, query2, true);
    const request3 = await fetchLists(path2, query3, true);
    const request4 = await api.getQueryString(path4, query4);
    setSelectBook((prevState) => {
      return {
        ...prevState,
        top_program: request1,
        operation_org: request2,
        customer: request3,
        user: request4.data,
      };
    });
    console.log('**select book**', selectBook);
    dispatch(changeDrawerVisible({ loading: false }));
  };

  const EditProposalForm = () => {
    return <h3>고객제안 수정</h3>;
  };

  //Drawer Form -> 프로그램에 해당하는 Promotion 전체 리스트 테이블 설정
  const ProposalList = () => {
    if (drawer.path === 'proposals' && proposalLists) {
      let columns = [];
      if (drawer.action === 'list') {
        columns = [
          ...proposalTableColumns,
          {
            title: 'ACTION',
            key: 'action',
            render: (_, record) => (
              <Space size="small">
                <Button
                  // type="primary"
                  onClick={() =>
                    handleButtonOnclick({
                      action: 'TABLEACTION',
                      drawer: {
                        subaction: 'edit',
                        proposalId: record.key,
                      },
                    })
                  }
                  size="small"
                >
                  edit
                </Button>
                <Button
                  // type="primary"
                  // onClick={() => prlistEdit(record)}
                  size="small"
                >
                  매출
                </Button>
              </Space>
            ),
          },
        ];
      } else if (drawer.action === 'proposal-add') {
        columns = [...proposalTableColumns];
      }
      const data = setProposalTableLists(proposalLists);

      return (
        <>
          <Table columns={columns} dataSource={data} size="small" />
          {drawer.action === 'edit' && drawer.path === 'proposals' ? (
            <EditProposalForm />
          ) : (
            ''
          )}
        </>
      );
    } else return '';
  };

  //******************공통사항 **********************
  const handleButtonOnclick = async (value, id) => {
    // view, edit -> id
    console.log(`>>>>`, value);
    if (value.action === 'DRAWER' && value.drawer.action === 'add') {
      const drawer_data = getDrawerData(value, CONF.info.path);
      console.log(`>>>>`, drawer_data);

      dispatch(changeDrawerVisible(drawer_data));
      // OPENDRAWER 로 변경
    } else if (value.action === 'DRAWER' && value.drawer.action === 'view') {
      let changeDrawer = {};
      console.log(`>>>>(view)`, value);
      const path = `api/programs/${id}`;
      const query = qs_programDetail();
      const request = await fetchLists(path, query);
      console.log('**request**', request[0]);
      const proposals = request[0].proposals;
      console.log('**proposal_optimize-before**', proposals);
      const proposal_opt = jsonFormatOptimize(proposals);
      console.log('**proposal_optimize-after**', proposal_opt);
      //Drawer initialValues 설정
      const init = CONF.composeDrawerInitialValues(
        request[0],
        value.drawer.action,
      );
      console.log('**DrawerInitialValues**', init);
      //
      changeDrawer = { ...changeDrawer, ...value.drawer, id: id };
      changeDrawer.loading = false;
      setProposalLists(proposal_opt);
      setDrawerInitialValues(init);
      setRawDrawerInitialValues(request[0]);
      // setSelectBook({
      //   ...commonData,
      //   ...cb,
      // });
      changeDrawer = { ...changeDrawer, open: true };
      dispatch(changeDrawerVisible(changeDrawer));
    } else if (value.action === 'SUB') {
      // DRAWERACTION 으로 변경
      // drawer form 버튼 클릭시
      console.log(`>>>>(DRAWERACTION)`, value);
      // initvalues 변경
      const init = CONF.composeDrawerInitialValues(
        rawDrawerInitialValues,
        value.drawer.action,
      );
      console.log(`>>>>(init)`, init);
      setDrawerInitialValues(init);
      // subaction, proposalId 삭제
      const tempdrawer = drawer;
      delete tempdrawer.subaction;
      delete tempdrawer.proposalId;
      dispatch(initDrawerVisible());
      dispatch(changeDrawerVisible({ ...tempdrawer, ...value.drawer }));
    } else if (value.action === 'TABLEACTION') {
      //
      console.log(`>>>>(TABLEACTION)`, value);
      // console.log(`>>>>(proposalLists)`, proposalLists);
      const proposal = proposalLists.filter(
        (list) => list.id === value.drawer.proposalId,
      )[0];
      console.log(`>>>>(selectedProposal)`, proposal);
      let init = {};
      if (drawer.action === 'list' && drawer.subaction === 'edit') {
        init = {
          key: proposal.id,
          id: proposal.id,
          customer: proposal.customer.id,
          pro_status: proposal.pro_status.id,
          pro_method: proposal.pro_method.id,
          // services: proposal.pro_status.id,
          proposal_date: setDayjsFormat(proposal.proposal_date),
          user: proposal.user.id,
          description: proposal.description,
        };
      }
      dispatch(changeDrawerVisible({ ...value.drawer }));
      setDrawerInitialValues(init);
    }
  };

  //(공통) Drawer Form -> Close 시
  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setDrawerInitialValues();
  };

  // ************************************************************** //
  const handleOnSubmit = async (props) => {
    dispatch(
      changeDrawerVisible({
        btnDisabled: true,
      }),
    );
    console.log(`>>>>_props`, props);
    console.log(`>>>>_drawer`, drawer);
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
    //       // open: false,
    //     }),
    //   );
    // }, 5000);
  };
  // ************************************************************** //
  //******************공통사항 **********************
  //******************개별사항 **********************
  const handleSelectOnChange = async (value, option) => {
    // console.log('--value----', value);
    let in_out = null;
    let top_program = [];
    let operation_org = [];
    console.log('--option----', option);
    if (option['data-grp'] === 'in_out') {
      in_out = option.children;
      if (in_out === '내부') {
        // top_program = [];
        // operation_org = [];
      }
      if (in_out === '외부') {
        const filter_org = { co_classification: { id: { $eq: 3 } } };
        const query_topprogram = qs_getSelectFormLists();
        const query_org = qs_getSelectFormLists(filter_org);

        const req_topprogram = await fetchLists(
          `api/top-programs`,
          query_topprogram,
          true,
        );
        const req_org = await fetchLists(`api/customers`, query_org, true);
        // top_program = req_topprogram;
        // operation_org = req_org;
        console.log(`>>>in_out>>`, req_topprogram, req_org);
        console.log(`>>>select_book>>`, selectBook);
      }
      // setSelectBook({ ...selectBook, top_program, operation_org });
    }
  };

  const DrawerButton = () => {
    if (drawer.action !== 'add') {
      return (
        <Row gutter={16}>
          <Col span={12}>
            <Radio.Group
              // defaultValue="View"
              onChange={(e) => handleButtonOnclick(e.target.value)}
              buttonStyle="solid"
            >
              {CONF.drawerMenuItems.map((item, index) => {
                return (
                  <Radio.Button key={index} value={item}>
                    {item.name}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Col>
          <Divider />
        </Row>
      );
    } else return '';
  };
  //******************개별사항 **********************

  return (
    <Base>
      {/* <ProgramSubMenu handleDrawer={openDrawerForm} /> */}
      <ActionButton
        items={CONF.subMenuItems}
        handleButtonOnclick={handleButtonOnclick}
      />
      {lists ? (
        <ListTableForm
          tableColumns={CONF.tableColumns}
          tableActionForm={tableActionForm}
          tableData={tableData}
          // handleOnclick={handleOnclick}
        />
      ) : (
        ''
      )}
      {drawer.open && drawer.loading === false && selectBook ? (
        <DrawerBlock>
          <Drawer
            title={drawer.title}
            open={drawer.open}
            width={drawer.width}
            onClose={handleOnclose}
            bodyStyle={{ paddingBottom: 80 }}
          >
            <DrawerButton />
            <ProgramDrawerForm
              drawer={drawer}
              selectBook={selectBook}
              // formItems={CONF.drawerFormItems}
              formItems={newFormItems}
              initialValues={drawerInitialValues}
              handleOnSubmit={handleOnSubmit}
              handleOnChange={handleSelectOnChange}
            />
            <ProposalList />
          </Drawer>
        </DrawerBlock>
      ) : (
        ''
      )}
    </Base>
  );
};

export default ProgramContainer;
