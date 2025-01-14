import dayjs from 'dayjs';
import checkInitValue from '../modules/common/checkInitValue';
import setDayjsFormat from '../modules/common/setDayjsFormat';
import { tr } from 'faker/lib/locales';

// #############################################
// ## INFO  :                           ##
// #############################################
export const info = {
  path: 'program',
};

// #############################################
// ## 1 SUB MENU  :                           ##
// #############################################
export const subMenuItems = [
  {
    name: '등록',
    action: 'DRAWER',
    drawer: {
      title: '프로그램 등록',
      action: 'add',
      path: 'programs',
      width: 1000,
    },
  },
  // {
  //   name: '제안',
  //   // action: 'search',
  // },
  // {
  //   name: '대기',
  //   // action: 'LINKTO',
  // },
  // {
  //   name: '수행',
  //   // action: 'LINKTO',
  // },
  // {
  //   name: '종료',
  //   // action: 'LINKTO',
  // },
];

// #############################################
// ## 2-1 리스트 : 테이블폼 컬럼                ##
// #############################################
export const tableColumns = [
  {
    title: 'No',
    dataIndex: 'no',
    key: 'no',
    width: 70,
  },
  {
    title: '구분',
    dataIndex: 'in_out',
    key: 'in_out',
    width: 70,
    align: 'center',
  },
  {
    title: '상태',
    dataIndex: 'pgm_status',
    key: 'pgm_status',
    width: 70,
    align: 'center',
  },
  {
    title: '프로그램명',
    dataIndex: 'name',
    key: 'name',
    width: 480,
  },
  {
    title: '운영기관',
    dataIndex: 'operation_org',
    key: 'operation_org',
    width: 150,
  },
  {
    title: '공고일',
    dataIndex: 'announcement_date',
    key: 'announcement_date',
    width: 120,
    align: 'center',
  },
  {
    title: '신청기간',
    dataIndex: 'application_date',
    key: 'application_date',
    width: 200,
    align: 'center',
  },
  {
    title: '제안/신청',
    dataIndex: 'proposal_1',
    key: 'proposal_1',
    width: 100,
    align: 'center',
  },
  {
    title: '결과대기',
    dataIndex: 'proposal_2',
    key: 'proposal_2',
    width: 100,
    align: 'center',
  },
  {
    title: '선정/탈락',
    dataIndex: 'proposal_3',
    key: 'proposal_3',
    width: 100,
    align: 'center',
  },
];

// #############################################
// ## 2-2 리스트 :  테이블폼 Data              ##
// #############################################
export const setTableLists = (lists) => {
  const arrLists = [];
  lists.map((list, index) => {
    const count = { 제안: 0, 신청: 0, 선정: 0, 탈락: 0 };
    const top_program = list.top_program ? list.top_program.name : '';
    const name =
      top_program === '' ? list.name : `${list.top_program.name}-${list.name}`;
    if (list.proposals) {
      count['제안'] = list.proposals.length;
      list.proposals.map((cnt) => {
        //
        const name = cnt.attributes.pro_status.data.attributes.name;
        if (name === '제안') {
        } else {
          count[name] = count[name] + 1;
        }
      });
    }
    const setTableRow = {
      key: list.id,
      id: list.id,
      no: index + 1,
      in_out: list.in_out.name,
      pgm_status: list.pgm_status.name,
      name: name,
      operation_org: list.operation_org ? list.operation_org.name : '',
      announcement_date: list.announcement_date,
      application_date: `${list.application_date_start} ~ ${list.application_date_end}`,
      proposal_1: `${count['제안']} / ${
        count['신청'] + count['선정'] + count['탈락']
      }`,
      proposal_2: count['신청'],
      proposal_3: `${count['선정']}/${count['탈락']}`,
    };
    arrLists.push(setTableRow);
  });
  return arrLists;
};

// #############################################
// ## 3-1 DRAWER FORM :  기본정보              ##
// #############################################
export const drawerInfo = {
  title: '프로그램 관리',
  width: 720,
  path: ['programs'],
};

// #############################################
// ## 3-2 DRAWER FORM :  FORM ITEMS           ##
// #############################################

// 1: co_classification, 2: co_funnel, 3: business_tpe, 4: business_item, 5: region
// 6: fy, 7: pgm_stagus, 8: service
export const drawerFormItems = [
  {
    name: 'in_out',
    label: '내/외부',
    req: true,
    // coid: 9,
    form: 'SELECT',
    span: 4,
    editable: false,
  },
  {
    name: 'top_program',
    label: '사업명',
    // coid: 'top-programs',
    form: 'SELECT',
    span: 8,
    editable: false,
  },
  { name: 'name', label: '사업명_suffix', span: 12, req: true },
  { name: 'fy', label: 'FY', req: true, form: 'SELECT', span: 4 },
  {
    name: 'pgm_status',
    label: '상태',
    req: true,
    // coid: '7',
    form: 'SELECT',
    span: 4,
  },
  {
    name: 'service',
    label: '서비스',
    form: 'CHECKBOXFORM',
    checklist: 'service', //checkbox list > selectBook[service]
    span: 24,
  },
  // { name: 'sub_program', label: '상세프로그램' },
  {
    name: 'operation_org',
    label: '운영기관',
    coid: 'operation_org',
    form: 'SELECT',
    req: true,
    // editable: false,
  },
  {
    name: 'lead_agency',
    label: '주무부처',
    coid: 'operation_org',
    form: 'SELECT',
    // editable: false,
  },
  { name: 'announcement_date', label: '공고일', form: 'DATE', req: true },
  {
    name: 'application_date',
    label: '신청기간',
    form: 'RANGE',
    span: 12,
    req: true,
  },
  {
    name: 'business_date',
    label: '사업기간',
    form: 'RANGE',
    span: 12,
    req: true,
  },
  {
    name: 'expected_result_date',
    label: '결과발표(예정)',
    form: 'DATE',
    req: true,
  },
  { name: 'result_date', label: '결과발표(확정)', form: 'DATE' },
  // { name: 'price', label: '사업비', form: 'NUMBER' },
  {
    name: 'attachment',
    label: '첨부',
    form: 'UPLOAD',
    span: 12,
    editable: false,
  },
  {
    name: 'description',
    label: '비고',
    span: 24,
    form: 'TEXTAREA',
  },
];

// #############################################
// ## 3-3 DRAWER FORM :  InitialValues        ##
// #############################################

export const composeDrawerInitialValues = (value, action) => {
  console.log('@@@@@@@@@@@@', value.service);

  let init = {};
  if (action === 'edit') {
    init = {
      key: value.id,
      id: value.id,
      name: value.name,
      in_out: value.in_out.id,
      announcement_date: setDayjsFormat(value.announcement_date),
      application_date: [
        setDayjsFormat(value.application_date_start),
        setDayjsFormat(value.application_date_end),
      ],
      business_date: [
        setDayjsFormat(value.business_date_start),
        setDayjsFormat(value.business_date_end),
      ],
      expected_result_date: setDayjsFormat(value.expected_result_date),
      result_date: setDayjsFormat(value.result_date),
      //
      top_program: value.top_program ? value.top_program.id : '',
      fy: value.fy.id,
      pgm_status: value.pgm_status.id,
      lead_agency: value.lead_agency ? value.lead_agency.id : '',
      operation_org: value.operation_org ? value.operation_org.id : '',
    };
  }
  if (action === 'view') {
    init = {
      key: value.id,
      id: value.id,
      name: value.name,
      in_out: value.in_out.name,
      announcement_date: value.announcement_date,
      application_date: `${value.application_date_start} ~ ${value.application_date_end}`,
      business_date: `${value.business_date_start} ~ ${value.business_date_end}`,
      expected_result_date: value.expected_result_date,
      result_date: value.result_date,
      //
      service: value.service
        ? value.service.map((item) => item.name).join('/')
        : '',
      top_program: value.top_program ? value.top_program.name : '',
      fy: value.fy.name,
      pgm_status: value.pgm_status.name,
      lead_agency: value.lead_agency ? value.lead_agency.name : '',
      operation_org: value.operation_org ? value.operation_org.name : '',
    };
  }
  return init;
};

// #############################################
// ## 3-4 DRAWER FORM :  Sub MENU BUTTON      ##
// #############################################

export const drawerSubMenuItems = [
  {
    value: 'view',
    name: 'view',
  },
  {
    value: 'edit',
    name: 'edit',
  },
  {
    value: 'btn#1',
    name: '제안',
  },
  {
    value: 'btn#2',
    name: '현황',
  },
];

export const drawerMenuItems = [
  {
    name: 'View',
    action: 'SUB',
    drawer: {
      title: '프로그램 View',
      action: 'view',
      path: 'programs',
    },
  },
  {
    name: 'edit',
    action: 'SUB',
    drawer: {
      title: '프로그램 edit',
      action: 'edit',
      path: 'programs',
    },
  },
  {
    name: '제안',
    action: 'SUB',
    drawer: {
      title: '프로그램 제안',
      action: 'proposal-add',
      path: 'proposals',
    },
  },
  {
    name: '현황',
    action: 'SUB',
    drawer: {
      title: '프로그램 제안 현황',
      action: 'list',
      path: 'proposals',
    },
  },
];

// Drawer Form 현황 테이블 리스트
