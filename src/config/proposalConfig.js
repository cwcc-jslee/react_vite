import dayjs from 'dayjs';
import checkInitValue from '../modules/common/checkInitValue';
import setDayjsFormat from '../modules/common/setDayjsFormat';

// #############################################
// ## INFO  :                           ##
// #############################################
export const info = {
  path: 'proposal',
};

// #############################################
// ## 1 SUB MENU  :                           ##
// #############################################
export const subMenuItems = [
  {
    name: '전체',
    // action: 'search',
  },
  // {
  //   name: '제안',
  //   // action: 'LINKTO',
  // },
  // {
  //   name: '신청',
  //   // action: 'LINKTO',
  // },
  // {
  //   name: '탈락',
  //   // action: 'LINKTO',
  // },
  // {
  //   name: '선정',
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
    title: '상태',
    dataIndex: 'pro_status',
    key: 'pro_status',
    width: 100,
    align: 'center',
  },
  {
    title: '고객명',
    dataIndex: 'customer',
    key: 'customer',
    width: 200,
    align: 'center',
  },
  {
    title: '지원사업',
    dataIndex: 'program_name',
    key: 'program_name',
    width: 250,
    align: 'center',
  },
  {
    title: '서비스',
    dataIndex: 'service',
    key: 'service',
    // width: 100,
    align: 'center',
  },
  {
    title: '금액',
    dataIndex: 'price',
    key: 'price',
    width: 100,
    align: 'center',
  },
  {
    title: '제안방법',
    dataIndex: 'pro_method',
    key: 'pro_method',
    width: 100,
    align: 'center',
  },
  {
    title: '제안자',
    dataIndex: 'user',
    key: 'user',
    width: 100,
    align: 'center',
  },
  {
    title: '제안일',
    dataIndex: 'proposal_date',
    key: 'proposal_date',
    width: 150,
    align: 'center',
  },
  {
    title: '신청기간',
    dataIndex: 'application_date',
    key: 'application_date',
    width: 200,
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
    const top_program = list.program.top_program.data.attributes.name;
    const program_name = `${top_program}-${list.program.name}`;

    const setTableRow = {
      key: list.id,
      id: list.id,
      no: index + 1,
      pro_status: list.pro_status.name,
      customer: list.customer.name,
      program_name: program_name,
      service: list.service
        ? list.service.map((item) => item.name).join('/')
        : '',
      pro_method: list.pro_method.name,
      user: list.user.username,
      proposal_date: list.proposal_date,
    };
    arrLists.push(setTableRow);
  });
  return arrLists;
};

//Drawer Form
export const proposalInfo = {
  title: '프로그램 제안 관리',
  width: 720,
  path: ['proposals'],
};

// 1: co_classification, 2: co_funnel, 3: business_tpe, 4: business_item, 5: region
// 6: fy, 7: pgm_stagus, 8: service
export const proposalDrawerFormItems = [
  // {
  //   name: 'program',
  //   label: '프로그램',
  //   coid: '7',
  //   form: 'SELECT',
  //   span: 4,
  // },
  // {
  //   name: 'customer',
  //   label: '고객명',
  //   req: true,
  //   form: 'SELECT',
  //   span: 8,
  //   editable: false,
  // },
  {
    name: 'customer',
    label: '고객명',
    // req: true,
    form: 'CUSTOMERAUTOCOMPLETE',
    span: 8,
    editable: false,
  },
  // {
  //   form: 'DIVIDER',
  //   span: 24,
  // },
  {
    name: 'pro_status',
    label: '상태',
    req: true,
    // coid: '10',
    form: 'SELECT',
    span: 4,
  },
  {
    name: 'service',
    label: '서비스',
    form: 'CHECKBOXFORM',
    checklist: 'service',
    editable: false,
    span: 24,
  },
  // { name: 'sub_program', label: '상세프로그램', form: 'SELECT' },
  {
    name: 'pro_method',
    label: '제안방법',
    req: true,
    form: 'SELECT',
  },
  {
    name: 'user',
    label: '제안자',
    req: true,
    form: 'SELECT-USER',
    editable: false,
  },
  { name: 'proposal_date', label: '제안일', req: true, form: 'DATE' },
  {
    name: 'description',
    label: '비고',
    span: 24,
    form: 'TEXTAREA',
  },
];

// 고객사 테이블폼 리스트
export const proposalTableColumns = [
  { title: 'customer', dataIndex: 'customer' },
  { title: '상태', dataIndex: 'pro_status' },
  { title: '제안방법', dataIndex: 'pro_method' },
  { title: '서비스', dataIndex: 'service' },
  { title: '제안일', dataIndex: 'proposal_date' },
];

// 고객사 테이블폼 리스트 Data
export const setProposalTableLists = (lists) => {
  console.log('>>>>>', lists);
  const arrLists = [];
  lists.map((list, index) => {
    const setTableRow = {
      key: list.id,
      customer: list.customer.name,
      pro_status: list.pro_status.name,
      pro_method: list.pro_method.name,
      // cb_services: list.cb_services,c
      service: list.service
        ? list.service.map((item) => item.name).join('/')
        : '',
      proposal_date: list.proposal_date,
    };
    arrLists.push(setTableRow);
  });
  return arrLists;
};
