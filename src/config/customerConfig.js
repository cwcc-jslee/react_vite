import dayjs from 'dayjs';
import checkInitValue from '../modules/common/checkInitValue';
import setDayjsFormat from '../modules/common/setDayjsFormat';
import { Space, Button } from 'antd';

// #############################################
// ## 1 SUB MENU  :                           ##
// #############################################
export const actionButton = [
  {
    name: '등록',
    action: 'DRAWER',
    drawer: {
      title: '고객 등록',
      action: 'add',
      path: 'customers',
      width: 900,
      open: true,
      loading: false,
    },
  },
  {
    action: 'search',
    name: '상세조회',
    component: 'BUTTON',
  },
  // {
  //   name: '월별매출현황',
  //   action: 'LINKTO',
  //   linkto: '/sfadashboard',
  // },
  {
    name: '초기화',
    action: 'reset',
  },
];

// 고객사 테이블폼 리스트
export const tableColumns = [
  {
    title: 'No',
    dataIndex: 'no',
    key: 'no',
    width: 60,
  },
  {
    title: '기업분류',
    dataIndex: 'co_classification',
    key: 'co_classification',
    width: 100,
  },
  {
    title: '고객명',
    dataIndex: 'name',
    key: 'name',
    idth: 200,
  },
  {
    title: '업태',
    dataIndex: 'business_type',
    key: 'business_type',
    idth: 200,
  },
  {
    title: '종목',
    dataIndex: 'business_item',
    key: 'business_item',
    idth: 200,
  },
  {
    title: '기업규모',
    dataIndex: 'business_scale',
    key: 'business_scale',
    idth: 200,
  },
  {
    title: '지역',
    dataIndex: 'region',
    key: 'region',
    idth: 150,
    align: 'center',
  },
  {
    title: '시/군/구',
    dataIndex: 'city',
    key: 'city',
    idth: 150,
    align: 'center',
  },
  {
    title: '유입경로',
    dataIndex: 'funnel',
    key: 'funnel',
    width: 200,
  },
  // {
  //   title: '종업원',
  //   dataIndex: 'employee',
  //   key: 'employee',
  // },
  {
    title: '등록일',
    dataIndex: 'createdAt',
    key: 'createdAt',
    idth: 200,
  },
];

// 고객사 테이블폼 리스트 Data
export const setTableLists = (lists) => {
  const arrLists = [];
  lists.map((list, index) => {
    const setTableRow = {
      key: list.id,
      id: list.id,
      no: index + 1,
      name: list.name,
      business_type: list.business_type
        ? list.business_type.map((item) => item.name).join('/')
        : '',
      // business_items: checkInitValue(list, 'business_items'),
      business_scale: list.business_scale ? list.business_scale.name : '',
      co_classification: checkInitValue(list, 'co_classification'),
      region: list.region ? list.region.name : '',
      city: list.city,
      funnel: list.funnel ? list.funnel.map((item) => item.name).join('/') : '',
      employee: list.employee,
      createdAt: dayjs(list.createdAt).format('YY-MM-DD'),
    };
    arrLists.push(setTableRow);
  });
  return arrLists;
};

// draswer > 연간매출 테이블

// //Drawer submit to DB
// export const submitPath = ['api/customers', 'api/customer-moreinfos'];

//Drawer Form
export const drawerInfo = {
  title: '고객 관리',
  width: 720,
  path: ['customers', 'customer-moreinfos'],
  name: 'customer',
};

// #############################################
// ## 3-2 DRAWER FORM :  FORM ITEMS           ##
// #############################################

// draserFormItems -> drawerForms 로 변경
export const drawerForms = {
  default: [
    { name: 'name', label: '고객명', req: true },
    {
      name: 'co_classification',
      label: '기업분류',
      req: true,
      form: 'SELECT',
    },
    {
      name: 'business_scale',
      label: '기업규모',
      form: 'SELECT',
    },
    { name: 'business_number', label: 'business_number' },
    { name: 'funnel', label: '유입경로', form: 'FUNNEFORM', span: 12 },
    { name: 'homepage', label: 'homepage' },
    {
      name: 'business_type',
      label: '업태',
      form: 'CHECKBOXFORM',
      checklist: 'business_type', //checkbox list > selectBook[business_type]
      span: 24,
    },
    // {
    //   name: 'business_item',
    //   label: '업종',
    //   form: 'CHECKBOXFORM',
    //   checklist: 'business_item',
    //   span: 24,
    // },
    {
      name: 'commencement_date',
      label: '설립일',
      form: 'DATE',
      span: 6,
    },
    { name: 'representative_name', label: '대표자', span: 6 },
    {
      name: 'employee',
      label: '종업원',
      form: 'RADIOFORM',
      checklist: 'employee',
      span: 12,
    },
    {
      name: 'region',
      label: '지역',
      coid: 'region',
      form: 'SELECT',
      span: 4,
    },
    {
      name: 'city',
      label: '시/군/구',
      span: 4,
    },
    { name: 'address', label: '상세주소', span: 16 },
    {
      name: 'support_program',
      label: '지원사업',
      form: 'CHECKBOXCOMPONENT',
      span: 24,
    },
    { name: 'description', label: 'description', span: 20, form: 'TEXTAREA' },
  ],
  year_table_columns: [
    {
      title: '년도',
      key: 'fy',
      dataIndex: 'fy',
    },
    {
      title: '매출액',
      key: 'revenue',
      dataIndex: 'revenue',
      align: 'center',
    },
    {
      title: '수출액',
      key: 'exports',
      dataIndex: 'exports',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          {/* handleDrawer : /명령-add, view, edit / id */}
          <Button
          // onClick={() =>
          //   handleButtonOnclick(
          //     {
          //       action: 'DRAWER',
          //       drawer: {
          //         action: 'edit',
          //         path: 'customer-year-datas',
          //         title: '고객 View',
          //         width: 900,
          //       },
          //     },
          //     record.id,
          //   )
          // }
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ],
  memubutton: [
    {
      name: 'View',
      action: 'SUB',
      drawer: {
        title: '고객사 View',
        action: 'view',
        path: 'customers',
      },
    },
    {
      name: 'edit',
      action: 'SUB',
      drawer: {
        title: '고객사 edit',
        action: 'edit',
        path: 'customers',
      },
    },
    {
      name: '매출등록',
      action: 'SUB',
      drawer: {
        title: '고객사 매출등록',
        action: 'add-sales',
        path: 'customer-year-datas',
      },
    },
  ],
  submenubutton: [
    {
      value: '매출',
      name: '매출',
    },
    {
      value: '인증',
      name: '인증',
    },
    // {
    //   value: 'edit',
    //   name: 'edit',
    // },
  ],
  salesForm: [
    { name: 'fy', label: 'fy', form: 'SELECT' },
    { name: 'revenue', label: 'revenue', req: true },
    { name: 'exports', label: 'exports' },
  ],
};

// #############################################
// ## 3-3 DRAWER FORM :  InitialValues        ##
// #############################################

// Drawer Form InitialValues 설정
export const composeDrawerInitialValues = (value, action) => {
  // 연간매출 현황 테이블
  const setTableLists = (lists) => {
    const arrLists = [];
    console.log('>>>>(lists)>>>', lists);
    lists.map((list, index) => {
      const setTableRow = {
        key: list.id,
        id: list.id,
        fy: list.attributes.fy.data.attributes.name,
        revenue: list.attributes.revenue,
        exports: list.attributes.exports,
      };
      arrLists.push(setTableRow);
    });
    return arrLists;
  };
  // value 체크 모듈 추가..
  let init = {};
  if (action === 'edit') {
    init = {
      key: value.id,
      id: value.id,
      name: value.name,
      co_classification: value.co_classification
        ? value.co_classification.id
        : '',
      business_number: value.business_number,
      homepage: value.homepage,
      // commencement_date: value.commencement_date,
      commencement_date: value.commencement_date
        ? dayjs(value.commencement_date, 'YYYY-MM-DD')
        : '',
      // business_types:'',
      // _business_items:'',
      representative_name: value.representative_name,
      region: value.region ? value.region.id : '',
      address: value.address,
      employee: value.employee ? value.employee.id : '',
      used: value.used,
      description: value.description,
      //
    };
  }
  if (action === 'view') {
    init = {
      key: value.id,
      id: value.id,
      name: value.name,
      co_classification: checkInitValue(value, 'co_classification'),
      funnel: value.funnel
        ? value.funnel.map((item) => item.name).join('/')
        : '',
      business_number: value.business_number,
      homepage: value.homepage,
      // commencement_date: value.commencement_date,
      commencement_date: value.commencement_date ? value.commencement_date : '',
      business_type: value.business_type
        ? value.business_type.map((item) => item.name).join('/')
        : '',
      // business_items: business_item,
      representative_name: value.representative_name,
      region: value.region ? value.region.name : '',
      city: value.city,
      address: value.address,
      employee: value.employee ? value.employee.name : '',
      used: value.used,
      customer_year_datas: value.customer_year_datas
        ? setTableLists(value.customer_year_datas)
        : [],
      description: value.description,
      //
    };
  }
  return init;
};

// DR sub menu
export const drawerSubMenuItems_ = [
  {
    value: 'view',
    name: 'view',
  },
  {
    value: 'edit',
    name: 'edit',
  },
];

// #############################################
// ## 3-4 DRAWER FORM :  Sub MENU BUTTON      ##
// #############################################

export const drawerMenuItems_ = [
  {
    name: 'View',
    action: 'SUB',
    drawer: {
      title: '고객사 View',
      action: 'view',
      path: 'customers',
    },
  },
  {
    name: 'edit',
    action: 'SUB',
    drawer: {
      title: '고객사 edit',
      action: 'edit',
      path: 'customers',
    },
  },
];
