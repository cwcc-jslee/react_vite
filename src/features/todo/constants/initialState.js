/**
 * @file initialState.js
 * @description Todo 관련 Redux 스토어의 초기 상태 상수 정의
 */

export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 20,
  total: 0,
};

export const DEFAULT_FILTERS = {
  $and: [
    {
      project: {
        pjt_status: {
          id: {
            $in: [88],
          },
        },
      },
    },
    {
      task_schedule_type: { $eq: 'scheduled' },
    },
    { task_progress: { $ne: 97 } },
  ],
};

export const FORM_INITIAL_STATE = {
  data: {
    // projectTask: '',
    // taskProgress: '',
    // workDate: '',
    // workHours: '',
    // nonBillableHours: '',
    // revisionNumber: '',
    // user: '',
    // team: '',
    // notes: '',
  },
  errors: null,
  isSubmitting: false,
  isValid: true,
};
