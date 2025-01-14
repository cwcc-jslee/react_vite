import * as api from '../../lib/api/api';
import { message } from 'antd';

const submitDrwaerToDB = async (submitArg) => {
  const { path, org_datas, drawer } = submitArg;
  console.log('>>>>> submitDrwaerToDB message:', drawer.mode, path, org_datas);
  // const path = drawerInfo.path;
  let index = 0;
  let tempId = null;
  let status = null;

  const callbackSubmit = async (datas) => {
    console.log(`>>>>>>>>>>>>>>submit_start-index(${index}), status: `, status);
    if (org_datas.length < index + 1) return '9999';
    const data = datas[index];
    const isNullData = Object.keys(data).length === 0 ? true : false;
    console.log(`>>>>>>>>>>>>>>(isnull:${isNullData}), data: `, data);

    if (drawer.mode === 'add' && index === 0 && !isNullData) {
      console.log(`>>>>>>(add, index-0) data:`, data);
      const request = await insertOrUpdateToDB(drawer.mode, path[index], data);
      if (request.status === 200) {
        // console.log(`(add-success) - (index 0) : `, request);
        tempId = request.data.data.id;
        status = true;
        console.log('======success__status', status);
        index += 1;
        callbackSubmit(org_datas);
      } else {
        status = false;
        console.log('======failfail__status', status);
      }
    } else if (drawer.mode === 'add' && index === 1 && !isNullData && status) {
      data.customer = tempId;
      const request = await insertOrUpdateToDB(drawer.mode, path[index], data);
      console.log(`(add-success) - (index 1) : `, request);
    } else if (drawer.mode === 'add' && index === 0 && isNullData) {
      status = false;
    } else if (drawer.mode === 'add' && index === 1 && isNullData) {
      // status = false;
    }

    // ************* //
    // EDIT MODE //
    // ************* //
    else if (drawer.mode === 'edit' && index === 0 && !isNullData) {
      // edit 모드일 경우 기존 ID 정보 에 update 작업
      // path 값 수정 필요...path/id...
      const request = await insertOrUpdateToDB(
        drawer.mode,
        `${path[index]}/${drawer.id}`,
        data,
      );
      if (request.status === 200) {
        // console.log(`(add-success) - (index 0) : `, request);
        tempId = request.data.data.id; //수정...
        status = true;
        console.log('======success__status', status);
        index += 1;
        callbackSubmit(org_datas);
      } else {
        status = false;
        console.log('======failfail__status', status);
      }
    } else if (drawer.mode === 'edit' && index === 0 && isNullData) {
      // status = false;
      index += 1;
      callbackSubmit(org_datas);
    } else if (drawer.mode === 'edit' && index === 1 && !isNullData) {
      if (drawer.moreinfo) {
        const request = await insertOrUpdateToDB(
          drawer.mode,
          `${path[index]}/${drawer.moreinfo}`,
          data,
        );
        if (request.status === 200) {
          // console.log(`(add-success) - (index 0) : `, request);
          tempId = request.data.data.id; //수정...
          status = true;
          console.log('======success__status', status);
          index += 1;
          callbackSubmit(org_datas);
        } else {
          status = false;
          console.log('======failfail__status', status);
        }
      } else if (!drawer.moreinfo) {
        // mode 를 insert
        data.customer = drawer.id;
        const request = await insertOrUpdateToDB('add', path[index], data);
        console.log(`(add-success) - (index 1) : `, request);
        if (request.status === 200) {
          // console.log(`(add-success) - (index 0) : `, request);
          tempId = request.data.data.id; //수정...
          status = true;
          console.log('======success__status', status);
        } else {
          status = false;
          console.log('======failfail__status', status);
        }
      }
    } else if (drawer.mode === 'edit' && index === 1 && isNullData) {
      // status = false;
    } else {
      console.log('======else__status', status);
    }
    return status;
  };

  const insertOrUpdateToDB = async (action_mode, action_path, insert_datas) => {
    const jwt_data = (insert_data) => {
      const user = sessionStorage.getItem('user');
      const jwt = JSON.parse(user).jwt;
      console.log('*** jwt ***', user, jwt);
      const result = [
        {
          data: insert_data,
        },
        {
          headers: {
            Authorization: 'Bearer ' + jwt,
          },
        },
      ];
      return result;
    };

    try {
      if (Object.keys(insert_datas).length === 0) return true;
      else if (action_mode === 'add') {
        const request = await api.createData(
          action_path,
          jwt_data(insert_datas),
        );
        message.success(`성공-${request.status}`, 3);
        console.log('>>>>> success message', request);
        return request;
      } else if (action_mode === 'edit') {
        //
        console.log('>>>>>(submitDrawerToDB--EDIT)');
        console.log(`>>>>>(path:${action_path}), data:`, insert_datas);
        const request = await api.updateData(
          action_path,
          jwt_data(insert_datas),
        );
        message.success(`성공-${request.status}`, 3);
        console.log('>>>>> success message', request);
        return request;
      }
    } catch (error) {
      console.log('>>>>> error message', error);
      message.error(
        `code:${error.response.status}, message:${error.response.data.error.message}`,
        5,
      );
      return error.response;
    }
  };

  const test = await callbackSubmit(org_datas);
  return test;
};

export default submitDrwaerToDB;
