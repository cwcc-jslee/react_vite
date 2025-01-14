import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import * as api from '../../lib/api/api';
import {
  changeDrawerVisible,
  initDrawerVisible,
  fetchCodebook,
  changeMode,
} from '../../modules/status';
import { Button, Space, Divider, Radio, Drawer, Row, Col, message } from 'antd';
import ListTableForm from '../../components/templete/ListTableForm';
import * as CONF from '../../config/sfaConfig';
import {
  qs_sfaMoreinfos,
  qs_sfafromEditId,
  qs_sfaitems,
} from '../../lib/api/querySfa';
import {
  qs_filterProposals,
  qs_selectedProposals,
} from '../../lib/api/queryProgram';
import jsonFormatOptimize from '../../modules/common/jsonFormatOptimize';
import fetchLists from '../../modules/fetchLists';
import SfaStatisticsContainer from '../SfaStatisticsContainer';
import SfaDrawerForm from '../../components/SfaDrawerForm';
import ActionButton from '../../components/common/ActionButton';
import composeSubmitDatas from '../../modules/common/composeSubmitDatas';
import { useLocation } from 'react-router-dom';
import { getDrawerData } from '../../modules/common/handleAction';
// import submitToDB2 from '../modules/common/submitToDB2';
import submitToDB2Sfa from '../../modules/common/submitToDB2Sfa';
import fetchAllList from '../../lib/api/fetchAllListR1';
import dayjs from 'dayjs';
import SfaSearchComponent from '../../components/sfa/SfaSearchComponent';
import startEndDay from '../../modules/common/startEndDay';

const Base = styled.div`
  width: 100%;
`;

const DrawerBlock = styled.div`
  //
`;

const SfaContainer = () => {
  const dispatch = useDispatch();
  const pathName = useLocation().pathname;
  const { cb, commonData } = useSelector(({ status }) => ({
    cb: status.cb,
    commonData: status.commonData,
  }));
  const path = 'api/sfa-moreinfos';
  const qs = qs_sfaMoreinfos;

  const { drawer, mode } = useSelector(({ status }) => ({
    drawer: status.drawer,
    mode: status.mode,
  }));

  useEffect(() => {
    dispatch(changeMode('default'));
  }, []);

  useEffect(() => {
    // dispatch(getList('api/sfa-moreinfos', qs_sfaMoreinfos));
    dispatch(fetchCodebook('sfa'));
  }, [dispatch]);

  const drMoreinfoColumns = CONF.drMoreinfoColumns;
  useEffect(() => {
    const startOfDay = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfDay = dayjs().endOf('month').format('YYYY-MM-DD');
    const filter = [
      {
        sales_rec_date: {
          $gte: startOfDay,
          // $gte: '2023-07-21',
        },
      },
      {
        sales_rec_date: {
          // $lte: '2023-07-28',
          $lte: endOfDay,
        },
      },
    ];
    FetchSfaList(path, qs, filter);
    // drMoreinfoColumns.push(drSubAction);
  }, []);

  const FetchSfaList = async (path, qs, filter) => {
    try {
      const request = await fetchAllList({ path, qs, filter });
      // const optimize = jsonFormatOptimize(request);
      // console.log(`@@@@@@@@@@@@@@@@@`, optimize);
      // list
      const tablelist = CONF.setTableLists(request);
      console.log(`@@@@@@@@@@@@@@@@@`, tablelist);
      setTableData(tablelist);
    } catch (error) {
      //
      console.error('>>>>>>>>>error', error);
    }
  };

  //************************************************/
  const [tableData, setTableData] = useState();
  const [selectBook, setSelectBook] = useState();
  //Drawer Form 관련
  const [drawerInitialValues, setDrawerInitialValues] = useState();
  const [drawerTableData, setDrawerTableData] = useState();
  const [rawDrawerInitialValues, setRawDrawerInitialValues] = useState();

  //************************************************/
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
                  action: 'DRAWER',
                  drawer: {
                    action: 'view',
                    path: 'sfas',
                    title: 'SFA View',
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
        <Space size="middle">
          <Button disabled>복사</Button>
        </Space>
      </>
    ),
  };

  // dr form 리스트내 acton 클릭시
  const handleDfSubAction = async (action, value) => {
    console.log(`>>>>>>(${action})>>>>>>>>`, value);
    // Drawer 매출 현황 > 금액정보 수정시 edit -> moreinfo id 키 추가 후 action add
    // action 변경, 키path 추가, 키 id 설정
    if (action === 'edit') {
      dispatch(
        changeDrawerVisible({
          // path: [`sfa-moreinfos`, 'sfa-change-records'],
          sub: { action: action, arrNo: value.key, id: value.id },
          more: {
            // actionTo: ['edit', 'add'],
            addkey: [{ sfa_moreinfo: value.id }],
            // keyPath: 'sfa-moreinfo',
            // keyId: value.id,
          },
        }),
      );
    } else if (action === 'del') {
      dispatch(
        changeDrawerVisible({
          sub: {
            action: action,
            arrNo: value.key,
            id: value.id,
            path: 'sfa-moreinfo',
          },
          more: null,
        }),
      );
      // 삭제 기능 추가..[{}]
      const submit_value = [
        {
          index: 0,
          action: 'edit',
          data: { deleted: true },
          path: `sfa-moreinfos/${value.id}`,
        },
      ];
      const action_del = await submitToDB2Sfa(submit_value);
      console.log('>>>', action_del);
      dispatch(changeDrawerVisible({ open: false }));
    } else {
      dispatch(
        changeDrawerVisible({
          sub: { action: action, arrNo: value.key, id: value.id },
          more: null,
        }),
      );
    }
  };

  //DR form SELECT 변경시
  const isSupportProgram = useRef(false);
  const handleSelectOnChange = async (value, option) => {
    console.log('--value----', option);
    let customerkey = null;
    // 매출구분 > 매출품목
    if (option['data-grp'] === 'sfa_classification') {
      const qs = qs_sfaitems(value);
      const req = await api.getQueryString('api/sfa-items', qs);
      console.log('--req----', req.data.data);
      setSelectBook({ ...selectBook, sfa_item: req.data.data });
    }
    // 유입경로 -> 지원사업 & 고객사 선택 완료시
    if (
      option['data-grp'] === 'sfa_funnel' &&
      option['children'] === '지원사업'
    ) {
      console.log('--지원사업----');
      isSupportProgram.current = true;
      const qs = qs_selectedProposals();
      const req = await api.getQueryString('api/proposals', qs);
      console.log('--req----', req.data.data);
      const newCustomer = req.data.data.map((list, index) => {
        return list.attributes.customer.data;
      });
      const test = { customer: newCustomer };
      console.log('--newCustomer----', test);
      // reduce 를 이용한 중복 제거
      // 앞의 값과 비교 하므로 customer 배열 정렬 후 가져와야 됨
      const uniqueCustomers = newCustomer.reduce((acc, curr) => {
        const count = acc.length;
        console.log('@@@acc@@@', acc);
        console.log('@@@curr@@@', curr);
        console.log('---------------', count);
        if (count === 0) acc.push(curr);
        if (count > 0 && acc[count - 1]['id'] !== curr.id) {
          acc.push(curr);
        }
        return acc;
      }, []);

      console.log('--reduce----', uniqueCustomers);
      setSelectBook({ ...selectBook, customer: uniqueCustomers });
    } else if (
      option['data-grp'] === 'sfa_funnel' &&
      option['children'] !== '지원사업'
    ) {
      console.log('--지원사업 외...----');
      isSupportProgram.current = false;
      setSelectBook({
        ...selectBook,
        customer: commonData.customer,
        program: null,
      });
    }
    //
    console.log('--issupportprogram...----', isSupportProgram);
    if (isSupportProgram.current && option['data-grp'] === 'customer') {
      // 유입경로 - 지원사업 & 고객사 선택시...지원 프로그램 정보 가져오기
      const FILTER = {
        customer: {
          id: {
            $eq: value,
          },
        },
        pro_status: {
          id: {
            $eq: 60, //60-선정, 57-제안, 58-신청
          },
        },
      };
      const qs = qs_filterProposals(FILTER);
      const req = await api.getQueryString('api/proposals', qs);
      console.log('--req----', req.data.data);
      const newprogram = req.data.data.map((list, index) => {
        return list.attributes.program.data;
      });
      const test = { program: newprogram };
      console.log('--newprogram----', test);
      setSelectBook({ ...selectBook, ...test });
    }
  };

  //******************공통사항 **********************
  const handleButtonOnclick = async (value, id) => {
    // view, edit -> id
    console.log(`>>>>(value)`, value);
    console.log(`>>>>(drawer)`, drawer);
    if (value.action === 'DRAWER' && value.drawer.action === 'add') {
      const drawer_data = getDrawerData(value, CONF.info.path);
      console.log(`>>>>`, drawer_data);
      if (value.drawer.action === 'add') {
        setSelectBook({
          ...commonData,
          ...cb,
        });
      }
      dispatch(changeDrawerVisible(drawer_data));
    } else if (value.action === 'DRAWER' && value.drawer.action === 'view') {
      let changeDrawer = {};
      console.log(`>>>>(view)`, value);
      const path_sfa = `api/sfas`;
      const query_sfa = qs_sfafromEditId(id);
      const request = await fetchLists(path_sfa, query_sfa);
      console.log('**request**', request[0]);
      //Drawer initialValues 설정
      const init = CONF.composeDrawerInitialValues(
        request[0],
        value.drawer.action,
      );
      console.log('**DrawerInitialValues**', init);
      //drawer tabledata 설정
      const setTableData = jsonFormatOptimize(request[0].sfa_moreinfos);
      console.log('**DrawerTabledata**', setTableData);
      //
      changeDrawer = { ...changeDrawer, ...value.drawer, id: init.id };
      changeDrawer.loading = false;
      setRawDrawerInitialValues(request[0]);
      setDrawerInitialValues(init);
      setDrawerTableData(setTableData);
      setSelectBook({
        ...commonData,
        ...cb,
      });
      changeDrawer = { ...changeDrawer, open: true };
      dispatch(changeDrawerVisible(changeDrawer));
    } else if (value.action === 'SUB') {
      // drawer form 버튼 클릭시
      console.log(`>>>>(sub)`, value);
      const pre_drawer = drawer;
      delete pre_drawer.sub;
      delete pre_drawer.more;
      dispatch(initDrawerVisible());
      dispatch(changeDrawerVisible({ ...pre_drawer, ...value.drawer }));
    } else if (value.action === 'reset') {
      console.log(`>>>>(reset)`, value);
      const path = 'api/sfa-moreinfos';
      const qs = qs_sfaMoreinfos;
      const startOfDay = dayjs().startOf('month').format('YYYY-MM-DD');
      const endOfDay = dayjs().endOf('month').format('YYYY-MM-DD');
      const filter = [
        {
          sales_rec_date: {
            $gte: startOfDay,
            // $gte: '2023-07-21',
          },
        },
        {
          sales_rec_date: {
            // $lte: '2023-07-28',
            $lte: endOfDay,
          },
        },
      ];
      dispatch(changeMode('default'));
      FetchSfaList(path, qs, filter);
    } else if (value.action === 'search') {
      setSelectBook({
        ...commonData,
        ...cb,
      });
      dispatch(changeMode('search'));
    }
  };

  const staticsOnClick = (record, month) => {
    console.log('eeee', record, month);
    const endDate = dayjs(month).endOf('month').format('YYYY-MM-DD');
    const percentage = record.percentage.replace('%', '');
    console.log(`>>>>>(start : ${month}, end : ${endDate})`);
    let filter = {};
    if (record.percentage === '확정') {
      const _confirmed = true;
      filter = [
        {
          sales_rec_date: {
            $gte: month,
          },
        },
        {
          sales_rec_date: {
            $lte: endDate,
          },
        },
        {
          confirmed: {
            $eq: _confirmed,
          },
        },
      ];
    } else {
      const _confirmed = false;
      filter = [
        {
          sales_rec_date: {
            $gte: month,
          },
        },
        {
          sales_rec_date: {
            $lte: endDate,
          },
        },
        {
          confirmed: {
            $eq: _confirmed,
          },
        },
        {
          sfa_percentage: {
            name: {
              $eq: percentage,
            },
          },
        },
      ];
    }
    const path = 'api/sfa-moreinfos';
    const qs = qs_sfaMoreinfos;
    FetchSfaList(path, qs, filter);
  };

  const searchOnSubmit = (v) => {
    console.log('검색 - onSubmit', v);
    // console.log('검색 - selectedCustomer', selectedCustomer);
    // let filters = {};
    const startMonth = dayjs(v.sales_rec_date[0]).format('YYYY-MM');
    const endMonth = dayjs(v.sales_rec_date[1]).format('YYYY-MM');
    const startEnd = startEndDay(startMonth, endMonth);
    // 기준일자
    let filter = [
      {
        sales_rec_date: {
          $gte: startEnd[0],
        },
      },
      {
        sales_rec_date: {
          $lte: startEnd[1],
        },
      },
    ];
    //매출처
    if (v.customer)
      filter = [...filter, { sfa: { customer: { id: { $eq: v.customer } } } }];
    // 건명
    if (v.name) filter = [...filter, { sfa: { name: { $contains: v.name } } }];
    //결제구분
    if (v.re_payment_method)
      filter = [
        ...filter,
        { re_payment_method: { id: { $eq: v.re_payment_method } } },
      ];
    //매출구분, 매출품목
    if (v.sfa_item) {
      filter = [
        ...filter,
        {
          sfa: {
            sfa_item_price: { $contains: `"sfa_item_name":"${v.sfa_item}"` },
          },
        },
      ];
    } else if (v.sfa_classification) {
      filter = [
        ...filter,
        { sfa: { sfa_classification: { id: { $eq: v.sfa_classification } } } },
      ];
    }
    //사업부
    if (v.team) {
      filter = [
        ...filter,
        {
          sfa: {
            sfa_item_price: { $contains: `"team_name":"${v.team}"` },
          },
        },
      ];
    }
    //확률
    if (v.sfa_percentage)
      filter = [
        ...filter,
        { sfa_percentage: { id: { $eq: v.sfa_percentage } } },
      ];
    //매출유형
    if (v.sfa_sales_type)
      filter = [
        ...filter,
        { sfa: { sfa_sales_type: { id: { $eq: v.sfa_sales_type } } } },
      ];
    //확정여부
    if (v.confirmed !== undefined)
      filter = [...filter, { confirmed: { $eq: v.confirmed } }];

    console.log('>>(filter)>>', filter);
    FetchSfaList(path, qs, filter);
  };
  //******************공통사항 **********************

  //******************drawer form **********************
  //(공통) Drawer Form -> Close 시
  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setDrawerInitialValues();
  };
  //******************drawer form **********************

  // ************************************************************** //
  const handleOnSubmit = async (props) => {
    const value = props.value;
    const isChecked = props.isChecked ? props.isChecked : null;
    const action = drawer.action;
    const subAction = drawer.sub ? drawer.sub.action : null;
    const more = drawer.more ? drawer.more : null;
    const actionTo = more ? more.actionTo : null;
    const addkey = more ? more.addkey : null;

    console.log(`>>>>onsubmit mode:(${drawer.action}), value:`, props.value);
    // console.log(`>>>>onsubmit isChecked`, isChecked);
    // console.log(
    //   `>>>>(actionTo:${actionTo}), addkey : `,
    //   addkey ? addkey[0] : null,
    // );

    // 매출등록 금액 & 아이템별 매출액 비교
    if (action === 'add') {
      if (
        value['sfa-moreinfos'] === undefined ||
        value['sfa-moreinfos'].length === 0
      ) {
        console.log('>>(sfa-moreinfos)>>');
        message.info('매출 항목 누락');
        return;
      }
      const total_price = value['sfa-moreinfos'].reduce((acc, cur) => {
        console.log('>>(acc)>>', acc);
        console.log('>>(cur)>>', cur);
        return acc + cur.sales_revenue;
      }, 0);
      value['total_price'] = total_price;
      console.log(`>>>>value>>`, value);
    }

    dispatch(
      changeDrawerVisible({
        btnDisabled: true,
      }),
    );

    //************************************************** */
    // composeSubmitDatas...

    const req_submit_datas = composeSubmitDatas({
      pathName: pathName,
      drawer: drawer,
      submit_data: value,
      isChecked: props.isChecked,
      selectBook: selectBook,
    });
    console.log(`>>>>_req_submit_data`, req_submit_datas);

    const reqData4th = await submitToDB2Sfa(req_submit_datas);
    console.log(
      `************************************************(db insert return>>>)`,
      reqData4th,
    );
    //************************************************** */
    if (reqData4th.status === 200) {
      dispatch(initDrawerVisible());
    } else {
      setTimeout(() => {
        dispatch(
          changeDrawerVisible({
            btnDisabled: false,
          }),
        );
      }, 5000);
    }
    // 임시
  };
  // ************************************************************** //

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

  return (
    <Base>
      <ActionButton
        items={CONF.subMenuItems}
        handleButtonOnclick={handleButtonOnclick}
      />
      <Divider />
      {/* {mode === 'default' ? (
        <SfaStatisticsContainer staticsOnClick={staticsOnClick} />
      ) : (
        ''
      )} */}
      {mode === 'search' && selectBook ? (
        <SfaSearchComponent
          selectBook={selectBook}
          handleSelectOnChange={handleSelectOnChange}
          searchOnSubmit={searchOnSubmit}
        />
      ) : (
        ''
      )}
      <Divider />
      <ListTableForm
        tableColumns={CONF.tableColumns}
        tableActionForm={tableActionForm}
        tableData={tableData}
        // handleOnclick={handleOnclick}
      />
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
            <SfaDrawerForm
              drawer={drawer}
              selectBook={selectBook}
              formItems={CONF.drawerFormItems}
              initialValues={drawerInitialValues}
              handleOnSubmit={handleOnSubmit}
              handleOnChange={handleSelectOnChange}
              //
              drawerTableData={drawerTableData}
              moreinfoColumns={drMoreinfoColumns}
              recordColumns={CONF.drRecordColumns}
              drMoreFormItems={CONF.drMoreFormItems}
              handleDfSubAction={handleDfSubAction}
            />
          </Drawer>
        </DrawerBlock>
      ) : (
        ''
      )}
    </Base>
  );
};

export default SfaContainer;
