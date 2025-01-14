// #############################################
// ## INFO  :                           ##
// #############################################
export const info = {
  path: 'work',
};

// #############################################
// ## 1 SUB MENU  :                           ##
// #############################################
export const subMenuItems = [
  {
    name: '등록',
    action: 'DRAWER',
    drawer: {
      title: '작업등록',
      action: 'add',
      path: 'work',
      width: 900,
    },
  },
  {
    name: '프로젝트',
    action: 'search',
  },
  {
    name: '유지보수',
    action: 'search',
  },
];

// #############################################
// ## 2-1 리스트 : 테이블폼 컬럼                ##
// #############################################
export const tableColumns = [
  {
    title: '고객사',
    dataIndex: 'customer',
    key: 'customer',
    // width: 70,
    align: 'center',
  },
  {
    title: '건명',
    dataIndex: 'name',
    key: 'name',
    // width: 70,
    align: 'center',
  },
  {
    title: '서비스/지원종류',
    dataIndex: 'risk',
    key: 'risk',
    // width: 300,
  },
  {
    title: 'task/내용',
    dataIndex: 'issue',
    key: 'issue',
    // width: 120,
    // align: 'center',
  },
  {
    title: 'Rev',
    dataIndex: 'service',
    key: 'service',
    // width: 200,
    align: 'center',
  },
  {
    title: '작업자',
    dataIndex: 'progress',
    key: 'progress',
    // width: 100,
    align: 'center',
  },
  {
    title: '작업일',
    dataIndex: 'start_date',
    key: 'start_date',
    // width: 100,
    align: 'center',
  },
  {
    title: '시간',
    dataIndex: 'end_date',
    key: 'end_date',
    // width: 100,
    align: 'center',
  },
];

// #############################################
// ## 3-2 DRAWER FORM :  FORM ITEMS           ##
// #############################################
export const drawerFormItems = [
  { name: 'customer', label: '고객사', span: 10, req: true, form: 'SELECT' },
  {
    name: 'name',
    label: '프로젝트명',
    form: 'SELECT',
    span: 8,
  },
  { name: 'switch', label: '작업명', span: 4, form: 'CHECKBOX' },
  {
    name: 'sellling_partner',
    label: '작업일',
    coid: 'customer',
    span: 10,
    form: 'SELECT',
  },
  { name: 'name', label: '작업시간', req: true, span: 12 },
  {
    name: 'sfa_classification',
    label: '이동/기타',
    form: 'SELECT',
    req: true,
  },
  { name: 'sfa_item', label: '진행상태', form: 'SELECT', req: true },
  { name: 'team', label: 'Revision Count', form: 'SELECT', req: true },
  { name: 'isProject', label: '프로젝트', form: 'CHECKBOX' },
  { name: 'sfaaddform', label: '--매출--', form: 'SFAADDFORM', span: 24 },
  {
    name: 'description',
    label: '비고',
    span: 24,
    form: 'TEXTAREA',
  },
];
