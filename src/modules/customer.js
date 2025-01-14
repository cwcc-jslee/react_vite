import { handleActions } from 'redux-actions';
// import { apiCustomerList } from '../lib/api/api';
import fetchAllList from '../lib/api/fetchAllListR1';
import { qs_customers } from '../lib/api/queryCustomer';
import jsonFormatOptimize from './common/jsonFormatOptimize';

const GET_CUSTOMERLIST = 'customer_lists/GET_CUSTOMERLIST';
const GET_CUSTOMERLIST_SUCCESS = 'customer_lists/GET_CUSTOMERLIST_SUCCESS';
const GET_CUSTOMERLIST_FAILURE = 'customer_lists/GET_CUSTOMERLIST_FAILURE';

export const getCustomerlist = () => async (dispatch) => {
  dispatch({ type: GET_CUSTOMERLIST });
  try {
    // const response = await apiCustomerList();
    const request = await fetchAllList({
      path: 'api/customers',
      qs: qs_customers,
      filter: [],
    });
    console.log('---return--', request);
    // json 객체 최적화
    const optimize = jsonFormatOptimize(request);
    console.log('---jsonFormatOptimize--', optimize);

    dispatch({
      type: GET_CUSTOMERLIST_SUCCESS,
      payload: optimize,
      // payload: request,
      status: true,
    });
  } catch (error) {
    dispatch({
      type: GET_CUSTOMERLIST_FAILURE,
      payload: error,
    });
    throw error;
  }
};

const initialState = {
  data: '',
  status: null,
  error: null,
};

const customer = handleActions(
  {
    // 고객리스트 가져오기 성공
    [GET_CUSTOMERLIST_SUCCESS]: (state, { payload, status }) => ({
      ...state,
      data: payload,
      status: status,
    }),
    // 고객리스트 가져오기 실패
    [GET_CUSTOMERLIST_FAILURE]: (state, { payload }) => ({
      ...state,
      data: payload,
      status: false,
      error: true,
    }),
  },
  initialState,
);

export default customer;
