import { createAction, handleActions } from 'redux-actions';
import * as api from '../lib/api/api';
import {
  qs_getCodebook,
  qs_getCodetypes,
  qs_getTeamLists,
  qs_services,
} from '../lib/api/queryCommon';
import fetchAllList from '../lib/api/fetchAllList';
import jsonFormatOptimize from './common/jsonFormatOptimize';
import { qs_getSelectFormLists, qs_getUserLists } from '../lib/api/queryCommon';
import fetchLists from './fetchLists';
import fetchAllListR1 from '../lib/api/fetchAllListR1';
import { qs_getCustomerAll } from '../lib/api/queryCustomer';
import { qs_topPrograms } from '../lib/api/queryProgram';

// Drawer Form Visible
const CHANGE_DRAWER_VISIBLE = 'status/CHANGE_DRAWER_VISIBLE';
const INIT_DRAWER_VISIBLE = 'status/INIT_DRAWER_VISIBLE';

// 공통 데이터 가져오기
const GET_COMMONDATA = 'status/GET_COMMONDATA';
const GET_COMMONDATA_SUCCESS = 'statusGET_COMMONDATA_SUCCESS';
const GET_COMMONDATA_FAILURE = 'status/GET_COMMONDATA_FAILURE';

// codebook
const GET_CODEBOOK = 'status/GET_CODEKOOK';
const GET_CODEBOOK_SUCCESS = 'status/GET_CODEKOOK_SUCCESS';
const GET_CODEBOOK_FAILURE = 'status/GET_CODEKOOK_FAILURE';

// codebook
const FETCH_CODEBOOK = 'status/FETCH_CODEKOOK';
const FETCH_CODEBOOK_SUCCESS = 'status/FETCH_CODEKOOK_SUCCESS';
const FETCH_CODEBOOK_FAILURE = 'status/FETCH_CODEKOOK_FAILURE';

// mode 설정
// 프로젝트 > default, detailview, inputrate, 등
const CHANGE_MODE = 'status/CHANGE_MODE';

//프로젝트 detail mode 추가 정보
const ADD_MOREINFO = 'status/ADD_MOREINFO';
const INIT_MOREINFO = 'status/INIT_MOREINFO';

// 리스트 가져오기
// progrem,
const GET_LIST = 'stats/GET_LIST';
const GET_LIST_SUCCESS = 'status/GET_LIST_SUCCESS';
const GET_LIST_FAILURE = 'status/GET_LIST_FAILURE';

export const getList = (path, qs) => async (dispatch) => {
  dispatch({ type: GET_LIST });
  try {
    // const response = await apiCustomerList();
    const request = await fetchAllList({
      path,
      qs,
    });
    console.log(`---return-[${path}]---`, request);
    // json 객체 최적화
    const optimize = jsonFormatOptimize(request);
    console.log('---jsonFormatOptimize--', optimize);

    dispatch({
      type: GET_LIST_SUCCESS,
      payload: optimize,
      // payload: request,
      path: path,
    });
  } catch (error) {
    dispatch({
      type: GET_LIST_FAILURE,
      payload: error,
    });
    throw error;
  }
};

//
export const getCommonData = () => async (dispatch) => {
  dispatch({ type: GET_COMMONDATA });

  try {
    // 고객정보 : 분류 '지원기관' 제외 모든 고객사
    const customer_path = `api/customers`;
    const customer_filter = { co_classification: { id: { $ne: 3 } } };
    const customer_query = qs_getCustomerAll;
    // 사용자 리스트
    const user_path = `api/users`;
    const user_query = qs_getUserLists();
    // 팀 리스트
    const team_path = `api/teams`;
    const team_query = qs_getTeamLists();
    // 서비스
    const service_path = `api/sfa-items`;
    const service_query = qs_services();
    // 지원사업
    const support_path = `api/top-programs`;
    const support_query = qs_topPrograms();
    // fetch
    const customer_req = await fetchAllListR1({
      path: customer_path,
      qs: qs_getCustomerAll,
      filter: customer_filter,
    });
    const user_req = await api.getQueryString(user_path, user_query);
    const team_req = await api.getQueryString(team_path, team_query);
    const service_req = await api.getQueryString(service_path, service_query);
    const topprogram_req = await api.getQueryString(
      support_path,
      support_query,
    );

    dispatch({
      type: GET_COMMONDATA_SUCCESS,
      payload: {
        customer: customer_req,
        user: user_req.data,
        team: team_req.data.data,
        service: service_req.data.data,
        top_program: topprogram_req.data.data,
      },
      // payload: request,
      // path: path,
    });
  } catch (error) {
    dispatch({
      type: GET_COMMONDATA_FAILURE,
      payload: error,
    });
    throw error;
  }
};

//
export const changeDrawerVisible = createAction(
  CHANGE_DRAWER_VISIBLE,
  (value) => value,
);

export const changeMode = createAction(CHANGE_MODE, (value) => value);

export const addMoreinfo = createAction(ADD_MOREINFO, (value) => value);
export const initMoreinfo = createAction(INIT_MOREINFO);

export const initDrawerVisible = createAction(INIT_DRAWER_VISIBLE);

export const getCodebook = () => async (dispatch) => {
  if (initialState.codebook === null) {
    console.log('****codebook 가져오기 ***');
    dispatch({ type: GET_CODEBOOK });
    try {
      const codebookArray = {};
      for (let i = 1; i <= 11; i++) {
        const query = qs_getCodebook(i);
        const request = await api.getQueryString(`api/codebooks`, query);
        codebookArray[i] = request.data.data;
      }
      dispatch({
        type: GET_CODEBOOK_SUCCESS,
        payload: codebookArray,
      });
    } catch (error) {
      dispatch({ type: GET_CODEBOOK_FAILURE, payload: error });
      throw error;
    }
  }
};

// sfa 적용중..programs..
export const fetchCodebook = (path) => async (dispatch) => {
  //

  dispatch({ type: FETCH_CODEBOOK });
  try {
    const codebookArray = {};
    const query = qs_getCodetypes(path);
    const request = await api.getQueryString(`api/codetypes`, query);
    console.log('****codetypes 가져오기 ***', request.data.data);
    const arrCodetypes = request.data.data;
    arrCodetypes.map(async (type) => {
      const query = qs_getCodebook(type.id);
      const request = await api.getQueryString(`api/codebooks`, query);
      // console.log('****codebooks 가져오기 ***', request.data.data);
      codebookArray[type.attributes.name] = request.data.data;
    });
    dispatch({
      type: FETCH_CODEBOOK_SUCCESS,
      payload: codebookArray,
      path: path,
    });
  } catch (error) {
    dispatch({ type: FETCH_CODEBOOK_FAILURE, payload: error });
    throw error;
  }
};

const initialState = {
  mode: 'default',
  codebook: null,
  commonData: null,
  cb: null, //codebook
  drawer: { open: false, loading: null, path: [''] },
  list: null,
  listPath: null,
};

const status = handleActions(
  {
    // DRAWER Form 상태
    [CHANGE_DRAWER_VISIBLE]: (state, { payload }) => ({
      ...state,
      drawer: { ...state.drawer, ...payload },
    }),
    [INIT_DRAWER_VISIBLE]: (state) => ({
      ...state,
      drawer: { open: false, loading: null },
    }),
    // DRAWER Form 상태
    [GET_CODEBOOK]: (state, { payload }) => ({
      ...state,
      codebook: payload,
    }),
    //codebook 가져오기 성공
    [GET_CODEBOOK_SUCCESS]: (state, { payload }) => ({
      ...state,
      codebook: payload,
    }),
    //codebook 가져오기 실패
    // [GET_CODEBOOK_FAILURE]: (state, { payload }) => ({
    //   ...state,
    //   data: payload,
    //   status: false,
    //   error: true,
    // }),
    //codebook 가져오기 성공
    [GET_COMMONDATA_SUCCESS]: (state, { payload, path }) => ({
      ...state,
      commonData: payload,
    }),
    [GET_COMMONDATA_FAILURE]: (state, { payload }) => ({
      ...state,
      commonData: 'error',
    }),
    //codebook 가져오기 성공
    [FETCH_CODEBOOK_SUCCESS]: (state, { payload, path }) => ({
      ...state,
      cb: payload,
    }),
    [FETCH_CODEBOOK_FAILURE]: (state, { payload }) => ({
      ...state,
      cb: 'error',
    }),
    // 리스트 가져오기 성공
    [GET_LIST_SUCCESS]: (state, { payload, path }) => ({
      ...state,
      list: payload,
      listPath: path,
    }),
    // 리스트 가져오기 실패
    // [GET_LIST_FAILURE]: (state, { payload }) => ({
    //   ...state,
    //   data: payload,
    // }),
    // mode 변경
    [CHANGE_MODE]: (state, { payload }) => ({
      ...state,
      mode: payload,
    }),
    [ADD_MOREINFO]: (state, { payload }) => ({
      ...state,
      moreinfo: { ...state.moreinfo, ...payload },
    }),
    [INIT_MOREINFO]: () => ({
      moreinfo: null,
    }),
  },
  initialState,
);

export default status;
