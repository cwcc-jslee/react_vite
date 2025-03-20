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

// Proejct Task 초기 상태
export const projectTaskInitialState = [
  {
    bucket: '프로젝트 관리',
    tasks: [
      {
        name: '행정 업무',
        days: '65',
        taskScheduleType: false,
        planEndDate: '2025-03-01',
        isDueDateRed: false,
        taskProgress: { id: 97, code: '100', name: '100%' },
      },
      {
        name: '내부 조율',
        days: '1',
        dueDate: '2025-03-28',
      },
      { name: '미팅 및 보고' },
      { name: '품질 관리', taskScheduleType: false },
    ],
  },
  {
    bucket: '기획 단계',
    tasks: [
      {
        name: '프로젝트 준비',
        taskScheduleType: true,
        priorityLevel: { id: 118, name: '긴급' },
        taskProgress: { id: 97, code: '100', name: '100%' },
        days: '5',
        planEndDate: '2025-03-07',
        assignedUsers: ['red-900', 'indigo-500'],
      },
      {
        name: '사이트 기획',
        days: '5',
        priorityLevel: { id: 115, name: '낮음' },
        taskProgress: { id: 94, code: '50', name: '50%' },
        planEndDate: '2025-03-14',
        isDueDateRed: false,
      },
    ],
  },
];
