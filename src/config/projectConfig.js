import dayjs from 'dayjs';
import setDayjsFormat from '../modules/common/setDayjsFormat';

// #############################################
// ## INFO  :                           ##
// #############################################
export const info = {
  path: 'project',
};

// #############################################
// ## 1 SUB MENU  :                           ##
// #############################################
export const subMenuItems = [
  {
    name: '등록',
    action: 'DRAWER',
    drawer: {
      title: '프로젝트등록',
      action: 'add',
      path: 'projects',
      width: 900,
    },
  },
  {
    name: '조회',
    action: 'search',
  },
  {
    name: '현황',
    action: 'search',
  },
  {
    name: '참여율',
    action: 'sfa',
  },
  {
    name: '/sfa',
    action: 'LINKTO',
    linkto: '/sfa',
  },
];

// #############################################
// ## 2-1 리스트 : 테이블폼 컬럼                ##
// #############################################
export const tableColumns = [
  {
    title: 'No',
    dataIndex: 'no',
    key: 'no',
    width: 50,
  },
  {
    title: '고객사',
    dataIndex: 'customer',
    key: 'customer',
    // width: 70,
    align: 'center',
  },
  {
    title: '프로젝트명',
    dataIndex: 'name',
    key: 'name',
    // width: 70,
    align: 'center',
  },
  {
    title: 'RISK',
    dataIndex: 'risk',
    key: 'risk',
    // width: 300,
  },
  {
    title: 'ISSUE',
    dataIndex: 'issue',
    key: 'issue',
    // width: 120,
    // align: 'center',
  },
  {
    title: '서비스',
    dataIndex: 'service',
    key: 'service',
    // width: 200,
    align: 'center',
  },
  {
    title: '진행률',
    dataIndex: 'progress',
    key: 'progress',
    // width: 100,
    align: 'center',
  },
  {
    title: '시작',
    dataIndex: 'start_date',
    key: 'start_date',
    // width: 100,
    align: 'center',
  },
  {
    title: '종료(계획)',
    dataIndex: 'end_date',
    key: 'end_date',
    // width: 100,
    align: 'center',
  },
  {
    title: '최근작업일',
    dataIndex: 'last_working_date',
    key: 'last_working_date',
    // width: 100,
    align: 'center',
  },
  {
    title: '계획',
    dataIndex: 'sales_rec_date',
    key: 'sales_rec_date',
    // width: 100,
    align: 'center',
  },
  {
    title: '작업',
    dataIndex: 'sales_rec_date',
    key: 'sales_rec_date',
    // width: 100,
    align: 'center',
  },
  {
    title: '금액',
    dataIndex: 'price',
    key: 'price',
    // width: 100,
    align: 'center',
  },
];

// #############################################
// ## 2-2 리스트 :  테이블폼 Data              ##
// #############################################
export const setTableLists = (lists) => {
  const arrLists = [];
  lists.map((list, index) => {
    // const sfa_record = list.sfa_change_records[0].attributes;
    const tasks = list.tasks;
    // const _re_payment_method =
    //   list.re_payment_method.name === '일시불'
    //     ? ''
    //     : `(${list.re_payment_method.name})`;
    const setTableRow = {
      key: list.id,
      id: list.id,
      no: index + 1,
      name: list.name,
      customer: `${list.sfa.customer.data.attributes.name}`,
      service: list.service.name,
      start_date: list.start_date
        ? list.start_date
        : `${list.plan_start_date}(예정)`,
      end_date: list.end_date ? list.start_date : `${list.plan_end_date}(예정)`,
      // team: sfa.team.data.attributes.name,
    };
    arrLists.push(setTableRow);
  });
  return arrLists;
};

// #############################################
// ## 3-1 DRAWER FORM :  기본정보              ##
// #############################################
export const drawerInfo = {
  // title: '프로젝트',
  // width: 900,
  // path: ['sfas', ['sfa-moreinfos', 'sfa-change-records']],
  // addkey: [null, ['sfa', 'sfa_moreinfo']],
  // name: 'sfa',
};

// #############################################
// ## 3-2 DRAWER FORM :  FORM ITEMS           ##
// #############################################
export const drawerFormItems = [
  {
    key: 1,
    name: 'fy',
    label: '구분',
    form: 'SELECT',
    span: 4,
  },
  {
    key: 2,
    name: 'customer',
    label: '고객사',
    form: 'SELECT',
    coid: 'sfa_customer',
    req: true,
  },
  { key: 3, name: 'sfa', label: 'SFA', span: 10, form: 'SELECT', req: true },
  { key: 4, name: 'name', label: '프로제트명', span: 10, req: true },
  // { name: 'service', label: '서비스', span: 10, req: true },
  {
    key: 5,
    name: 'pjt_status',
    label: '상태',
    form: 'SELECT',
    span: 8,
    req: true,
  },
  {
    key: 6,
    name: 'team',
    label: '사업부',
    span: 10,
    form: 'SELECT',
    req: true,
  },
  {
    key: 7,
    name: 'service',
    label: '서비스',
    span: 10,
    form: 'SELECT',
    req: true,
  },
  // {
  //   name: 'plan_date',
  //   label: '사업기간',
  //   form: 'RANGE',
  //   span: 12,
  //   // req: true,
  // },
  // 프로젝트 task 등록
  {
    key: 8,
    name: 'projecttaskaddform',
    label: '--TASK 등록--',
    form: 'PROJECTTASKADDFORM',
    span: 24,
  },
  // 프로젝트 task 등록
  // { name: 'plan_date', label: '프로젝트기간', req: true, span: 12 },
  {
    key: 9,
    name: 'description',
    label: '비고',
    span: 24,
    form: 'TEXTAREA',
  },
];
