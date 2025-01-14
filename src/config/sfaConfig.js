import dayjs from 'dayjs';
import setDayjsFormat from '../modules/common/setDayjsFormat';

// #############################################
// ## INFO  :                           ##
// #############################################
export const info = {
  path: 'sfa',
};

// #############################################
// ## 1 SUB MENU  :                           ##
// #############################################
export const subMenuItems = [
  {
    name: '등록',
    action: 'DRAWER',
    drawer: {
      title: 'SFA 등록',
      action: 'add',
      path: 'sfas',
      width: 900,
    },
  },
  {
    action: 'search',
    name: '상세조회',
    component: 'BUTTON',
  },
  // {
  //   name: 'SFA',
  //   action: 'LINKTO',
  //   linkto: '/sfa',
  // },
  {
    name: '월별매출현황',
    action: 'LINKTO',
    linkto: '/sfadashboard',
  },
  {
    name: '초기화',
    action: 'reset',
  },
];

export const dashboardMenuItems = [
  {
    name: 'SFA',
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
    width: 60,
  },
  {
    title: '확정여부',
    dataIndex: 'confirmed',
    key: 'confirmed',
    width: 60,
    align: 'center',
  },
  {
    title: '확률',
    dataIndex: 'sfa_percentage',
    key: 'sfa_percentage',
    width: 60,
    align: 'center',
  },
  {
    title: '고객사/매출처',
    dataIndex: 'customer',
    key: 'customer',
    width: 200,
  },
  {
    title: '건명',
    dataIndex: 'name',
    key: 'name',
    width: 320,
    // align: 'center',
  },
  {
    title: '결제구분',
    dataIndex: 're_payment_method',
    key: 're_payment_method',
    width: 100,
    align: 'center',
  },
  {
    title: '매출구분',
    dataIndex: 'sfa_classification',
    key: 'sfa_classification',
    width: 100,
    align: 'center',
  },
  {
    title: '매출품목',
    dataIndex: 'sfa_item',
    key: 'sfa_item',
    width: 100,
    align: 'center',
  },
  {
    title: '사업부',
    dataIndex: 'team',
    key: 'team',
    width: 100,
    align: 'center',
  },
  {
    title: '매출액',
    dataIndex: 'sales_revenue',
    key: 'sales_revenue',
    width: 100,
    align: 'right',
  },
  {
    title: '매출이익',
    dataIndex: 'sales_profit',
    key: 'sales_profit',
    width: 100,
    align: 'right',
  },
  {
    title: '매출인식일',
    dataIndex: 'sales_rec_date',
    key: 'sales_rec_date',
    width: 140,
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
    const sfa = list.sfa;
    const sfa_item_price = list.sfa.sfa_item_price;
    const _re_payment_method =
      list.re_payment_method.name === '일시불'
        ? ''
        : `(${list.re_payment_method.name})`;
    const setTableRow = {
      key: list.id,
      id: list.id,
      no: index + 1,
      confirmed: list.confirmed ? 'YES' : 'NO',
      sfa_percentage: list.sfa_percentage ? list.sfa_percentage.name : '__',
      name: `${sfa.name}${_re_payment_method}`,
      customer: list.sfa.customer ? list.sfa.customer.name : '__',
      //sfa_classification: sfa.sfa_classification.data.attributes.name,
      // sfa_item: sfa_service_prices.sfa_item.data.attributes.name,
      // team: sfa_service_prices.team.data.attributes.name,
      sfa_item: sfa_item_price
        ? sfa_item_price.map((i) => i.sfa_item_name).join('/')
        : '',
      team: sfa_item_price
        ? sfa_item_price.map((i) => i.team_name).join('/')
        : '',
      re_payment_method: list.re_payment_method.name,
      sales_revenue: list.sales_revenue.toLocaleString(),
      sales_profit: list.sales_profit.toLocaleString(),
      sales_rec_date: list.sales_rec_date,
    };
    arrLists.push(setTableRow);
  });
  return arrLists;
};

// #############################################
// ## 3-1 DRAWER FORM :  기본정보              ##
// #############################################
export const drawerInfo = {
  title: '매출현황',
  width: 900,
  path: ['sfas', ['sfa-moreinfos', 'sfa-change-records']],
  addkey: [null, ['sfa', 'sfa_moreinfo']],
  name: 'sfa',
};

// #############################################
// ## 3-2 DRAWER FORM :  FORM ITEMS           ##
// #############################################
export const drawerFormItems = [
  {
    name: 'sfa_sales_type',
    label: '매출유형',
    form: 'SELECT',
    req: true,
  },
  {
    name: 'customer',
    label: '고객사',
    span: 10,
    req: true,
    form: 'SELECT',
    editable: false,
  },
  { name: 'isProject', label: '프로젝트', form: 'SWITCH', span: 4 },
  { name: 'name', label: '건명', req: true, span: 12 },
  {
    name: 'sfa_classification',
    label: '매출구분',
    form: 'SELECT',
    req: true,
    editable: false,
  },
  { name: 'sfaaddItemform', label: '', form: 'SFAADDITEMFORM', span: 24 },
  { name: 'sfaaddform', label: '', form: 'SFAADDFORM', span: 24 },
  {
    name: 'description',
    label: '비고',
    span: 24,
    form: 'TEXTAREA',
  },
];

// #############################################
// ## 3-2-02 DRAWER FORM :  FORM List ITEMS   ##
// #############################################
export const drawerFormListItems = [
  {
    name: 're_payment_method',
    label: '결제구분',
    form: 'SELECT',
    req: true,
    message: '선택',
  },
  { name: 'confirmed', label: '확정여부', req: true, form: 'SWITCH' },
  { name: 'sfa_percentage', label: '매출확률', form: 'SELECT' },
  {
    name: 'sales_revenue',
    label: '매출액',
    form: 'INPUTNUMBRE',
    req: true,
    message: '매출액을 입력하세요',
  },
  {
    name: 'sfa_profit_margin',
    label: '이익/마진',
    form: 'SELECT',
    req: true,
  },
  {
    name: 'profitMargin_value',
    label: '값입력',
    form: 'INPUTNUMBRE',
    req: true,
  },
  {
    name: 'sales_profit',
    label: '매출이익',
    form: 'INPUTNUMBRE',
    disabled: true,
  },
  { name: 'sales_rec_date', label: '매출인식일자', form: 'DATE', req: true },
  { name: 'payment_date', label: '결제일자', form: 'DATE' },
  {
    name: 'memo',
    label: '메모',
    form: 'TEXTAREA',
  },
];

// #############################################
// ## 3-3 DRAWER FORM :  InitialValues        ##
// #############################################

export const composeDrawerInitialValues = (value, action) => {
  console.log('@@@@@@@@@@@@', value);
  const sfa_item_price = value.sfa_item_price;
  let init = {};
  if (action === 'edit') {
    init = {
      key: value.id,
      id: value.id,
      name: value.name,
      sfa_sales_type: value.sfa_sales_type.id,
      customer: value.customer.id,
      program: value.program ? value.program.id : '',
      sellling_partner: value.sellling_partner ? value.sellling_partner.id : '',
      sfa_classification: value.sfa_classification.id,
      // sfa_item: sfa_service_prices.sfa_item.data.id,
      // team: sfa_service_prices.team.data.id,
      isProject: value.isProject,
      price: '',
      description: value.description,
      //
      // lead_agency: value.lead_agency ? value.lead_agency.id : '',
      // operation_org: value.operation_org ? value.operation_org.id : '',
      // sales_rec_date: setDayjsFormat(value.expected_result_date),
    };
  }
  if (action === 'view') {
    init = {
      key: value.id,
      id: value.id,
      name: value.name,
      sfa_sales_type: value.sfa_sales_type.name,
      customer: value.customer.name,
      program: value.program ? value.program.name : '',
      sellling_partner: value.sellling_partner
        ? value.sellling_partner.name
        : '',
      sfa_classification: value.sfa_classification.name,
      // sfa_item: sfa_service_prices.sfa_item.data.attributes.name,
      // team: sfa_service_prices.team.data.attributes.name,
      sfa_item_price: sfa_item_price
        ? sfa_item_price
            .map((i) => {
              return `(${i.sfa_item_name}/${i.team_name}:${i.item_price})`;
            })
            .join(', ')
        : '',
      isProject: value.isProject ? 'Yes' : 'No',
      price: '',
      description: value.description,
    };
  }
  return init;
};

// #############################################
// ## 3-4 DRAWER FORM :  Sub MENU BUTTON      ##
// #############################################

export const dfAction = [
  {
    value: 'view',
    name: 'view',
  },
  {
    value: 'edit',
    name: 'edit',
  },
  {
    value: 'sfa-add',
    name: '매출추가',
  },
];

export const drawerMenuItems = [
  {
    name: 'View',
    action: 'SUB',
    drawer: {
      title: 'SFA View',
      action: 'view',
      path: 'sfas',
    },
  },
  {
    name: 'edit',
    action: 'SUB',
    drawer: {
      title: 'SFA edit',
      action: 'edit',
      path: 'sfas',
    },
  },
  {
    name: '매출추가',
    action: 'SUB',
    drawer: {
      title: 'SFA 매출추가',
      action: 'sfa-add',
      path: 'sfas',
    },
  },
];

// #############################################
// ## 3-4 DRAWER FORM :  View > 리스트 컬럼      ##
// #############################################

export const drMoreinfoColumns = [
  // {
  //   title: 'NO',
  //   dataIndex: 'no',
  //   key: 'no',
  //   align: 'center',
  // },
  {
    title: '구분',
    key: 're_payment_method',
    dataIndex: 're_payment_method',
  },
  {
    title: '확정여부',
    key: 'confirmed',
    dataIndex: 'confirmed',
    align: 'center',
  },
  {
    title: '확률',
    key: 'sfa_percentage',
    dataIndex: 'sfa_percentage',
  },
  {
    title: '매출액',
    key: 'sales_revenue',
    dataIndex: 'sales_revenue',
    align: 'right',
  },
  {
    title: '매출이익',
    key: 'sales_profit',
    dataIndex: 'sales_profit',
    align: 'right',
  },
  // {
  //   title: '이익/마진',
  //   key: 'profit',
  //   dataIndex: 'profit',
  // },
  // {
  //   title: '입력값',
  //   key: 'margin',
  //   dataIndex: 'margin',
  // },
  {
    title: '매출인식일',
    key: 'sales_rec_date',
    dataIndex: 'sales_rec_date',
  },
  // {
  //   title: '결제일자',
  //   key: 'payment_date',
  //   dataIndex: 'payment_date',
  // },
  // {
  //   title: 'Action',
  //   key: 'action',
  //   align: 'center',
  //   render: (_, record) => (
  //     <Space size="middle">
  //       <a>View</a>
  //       <a>Edit</a>
  //     </Space>
  //   ),
  // },
  // {
  //   title: '메모',
  //   key: 'description',
  //   dataIndex: 'description',
  // },
];

export const drRecordColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'center',
  },
  {
    title: '확정여부',
    key: 'confirmed',
    dataIndex: 'confirmed',
    align: 'center',
  },
  {
    title: '확률',
    key: 'sfa_percentage',
    dataIndex: 'sfa_percentage',
    align: 'right',
  },
  {
    title: '매출액',
    key: 'sales_revenue',
    dataIndex: 'sales_revenue',
    align: 'right',
  },
  {
    title: '이익/마진',
    key: 'sfa_profit_margin',
    dataIndex: 'sfa_profit_margin',
    align: 'center',
  },
  {
    title: 'Value',
    key: 'profitMargin_value',
    dataIndex: 'profitMargin_value',
    align: 'right',
  },
  {
    title: '매출인식일',
    key: 'sales_rec_date',
    dataIndex: 'sales_rec_date',
  },
  {
    title: '결제일',
    key: 'payment_date',
    dataIndex: 'payment_date',
  },
  {
    title: '메모',
    key: 'memo',
    dataIndex: 'mome',
  },
];

// #############################################
// ## 3-2-02 DRAWER FORM :  매출정보 수정 Form   ##
// #############################################
export const drMoreFormItems = [
  {
    name: 're_payment_method',
    label: '결제구분',
    req: true,
    form: 'SELECT',
    span: 4,
  },
  {
    name: 'confirmed',
    label: '확정여부',
    req: true,
    form: 'SWITCH',
    span: 4,
  },
  { name: 'sfa_percentage', label: '확률', req: true, span: 4, form: 'SELECT' },
  {
    name: 'sales_revenue',
    label: '매출액',
    req: true,
    span: 4,
    form: 'NUMBER',
  },
  {
    name: 'sfa_profit_margin',
    label: '이익/마진',
    req: true,
    span: 4,
    form: 'SELECT',
  },
  {
    name: 'profitMargin_value',
    label: '값입력',
    form: 'NUMBER',
    req: true,
    span: 4,
  },
  {
    name: 'sales_profit',
    label: '매출이익',
    form: 'TYPOGRAPHY',
    span: 4,
  },
  { name: 'sales_rec_date', label: '매출인식일자', form: 'DATE', span: 4 },
  { name: 'payment_date', label: '결제일자', form: 'DATE', span: 4 },
  {
    name: 'memo',
    label: '메모',
    form: 'TEXTAREA',
    span: 12,
  },
];
