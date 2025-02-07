import { combineReducers } from 'redux';
import auth from './auth';
// import loading from './loading';
import status from './status';
// import codebook from './codebook';
// import project from './project';
//
// import projectlist from './projectList';
// import addProject from './addPorject';
// import projectForm from './projectForm';
// import customerList from './customerList';
// import work from './work';
// import sales from './sales';
// import common from './common';
import customer from './customer';
// import apiGetList from './apiGetList';

const rootReducer = combineReducers({
  auth,
  status,
  // loading,
  // project,
  // projectlist,
  // codebook,
  // addProject,
  // projectForm,
  // customerList,
  // work,
  // sales,
  // common,
  customer,
  // apiGetList,
});

export default rootReducer;
