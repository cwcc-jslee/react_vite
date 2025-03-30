// shared/constants/initialFormState.js

// Customer 모듈 초기 상태
export const customerInitialState = {
  name: '',
  coClassfication: '',
  businessNumber: '',
  homepage: '',
  businessType: [],
  businessItem: [],
  representativeName: '',
  commencementDate: '',
  region: '',
  city: '',
  address: '',
  employee: '',
  businessScale: '',
  funnel: [],
};

// Contact 모듈 초기 상태
export const contactInitialState = {
  lastName: '',
  firstName: '',
  fullName: '',
  customer: '',
  position: '',
  department: '',
  email: '',
  phone: '',
  mobile: '',
  contactType: '',
  relationshipStatus: '',
  note: '',
  tags: [],
};

// Project 모듈 초기 상태
export const projectInitialState = {
  name: '',
  customer: '',
  sfa: '',
  service: '',
  team: '',
};

// Proejct Task 초기 상태
export const projectTaskInitialState = [
  {
    bucket: '프로젝트 관리',
    tasks: [
      {
        name: '행정 업무',
        days: '65',
        taskScheduleType: false,
      },
      {
        name: '내부 조율',
        taskScheduleType: false,
      },
      { name: '미팅 및 보고', taskScheduleType: false },
      { name: '품질 관리', taskScheduleType: false },
    ],
  },
];
