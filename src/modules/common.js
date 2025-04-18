import { createAction, handleActions } from 'redux-actions';
import * as api from '../lib/api/api';
import { startLoading, finishLoading } from './loading';


// edit 버튼틀릭시 모드 변경 VIEW -> EDIT
const CHANGE_MODE = 'common/CHANGE_MODE';

// edit 버튼틀릭시 모드 변경 editmode false-> true
const CHANGE_EDITMODE = 'common/CHANGE_EDITMODE';

// subMenu ..project -> status - inputrate -
const CHANGE_SUBMENU = 'common/CHANGE_SUBMENU';

// add, edit 등 DRAWER FROM 관련..
const CHANGE_DRAWER = 'common/CHANGE_DRAWER';

// 월별 조회 관련 날짜 지정 기능
const SET_STARTENDOFMONTH = 'common/SET_STARTENDOFMONTH';

// 매출현황 테이블 확률&월별 조회 기능
const SET_PARAMS = 'common/SET_PARAMS';

// title 정보 저장
const SET_TITLE = 'common/SET_TITLE';

// 상세 검색 테이블
const SET_SEARCHTABLE = 'common/SET_SEARCHTABLE';

const SET_CUSTOMERID = 'common/SET_CUSTOMERID';

// webgl 필드 추가
const SET_WEBGLNAME = 'common/SET_WEBGLNAME';

// VIEW - EDIT 모드 변경
export const changeMode = createAction(CHANGE_MODE, (mode) => mode);

// VIEW - EDIT 모드 변경
export const changeEditMode = createAction(
  CHANGE_EDITMODE,
  (editmode) => editmode,
);

export const setTitle = createAction(SET_TITLE, (title) => title);

// sub menu 변경
export const changeSubMenu = createAction(CHANGE_SUBMENU, (submenu) => submenu);

export const changeDrawer = createAction(CHANGE_DRAWER, (value) => value);

// Autocomplete 기능 이용하여 고객 검색시 고객Id 등록
export const setCustomerId = createAction(SET_CUSTOMERID, (id) => id);

export const setStartEndOfMonth = createAction(
  SET_STARTENDOFMONTH,
  (month) => month,
);

export const setParams = createAction(SET_PARAMS, (params) => params);

export const setWebglName = createAction(SET_WEBGLNAME, (webgl) => webgl);

// 서브메뉴 상세검색 클릭시
export const setSearchTable = createAction(SET_SEARCHTABLE, (mode) => mode);

const initialState = {
  editmode: false,
  title: '',
  search: false,
  customerid: { id: null, name: null },
  month: [null, null],
  params: null,
  error: null,
  mode: 'VIEW',
  submenu: 'status',
  drawer: null,
};

const common = handleActions(
  {
    // 모드변경(VIEW - EDIT)
    [CHANGE_MODE]: (state, { payload }) => ({
      ...state,
      // mode: payload.mode,
      mode: payload,
    }),
    // 모드변경(VIEW - EDIT)
    [CHANGE_EDITMODE]: (state, { payload }) => ({
      ...state,
      editmode: payload.editmode,
    }),
    // sub menu 변경
    [CHANGE_SUBMENU]: (state, { payload }) => ({
      ...state,
      submenu: payload,
    }),
    // add/edit DRAWER Form 제어
    [CHANGE_DRAWER]: (state, { payload }) => ({
      ...state,
      drawer: payload,
    }),
    // Title 저장
    [SET_TITLE]: (state, { payload }) => ({
      ...state,
      title: payload,
    }),
    // 상세 조회 테이블
    [SET_SEARCHTABLE]: (state, { payload }) => ({
      ...state,
      search: !state.search,
    }),
    [SET_CUSTOMERID]: (state, { payload }) => ({
      ...state,
      customerid: payload,
    }),
    //start month & end month
    [SET_STARTENDOFMONTH]: (state, { payload }) => ({
      ...state,
      month: payload,
    }),
    [SET_PARAMS]: (state, { payload }) => ({
      ...state,
      params: payload,
    }),
    [SET_WEBGLNAME]: (state, { payload }) => ({
      ...state,
      webgl: payload,
    }),
  },
  initialState,
);

export default common;
