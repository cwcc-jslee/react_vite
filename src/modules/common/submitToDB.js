import * as api from '../../lib/api/api';
import { message } from 'antd';

// data 형태
// [{index:0, action:'add', path:'customers', id:null, data:{}}, {index:1, ...}]
// action 설명
// add, edit, pass(data없을경우 pass, customer > edit), _add(edit -> add 로 변경/customer>edit)

const submitToDB = async (submit_datas) => {
  let arrno = 0;
  // const { path, org_datas, drawer } = submit_datas;
  // console.log('>>>>> submitDrwaerToDB message:', drawer.mode, path, org_datas);
  // const path = drawerInfo.path;
  let status = null;
  let reponseId = null;
  const LENGTH = submit_datas.length;

  //
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
      // insert_data 형태가 array 일경우 처리
      if (Array.isArray(insert_datas)) {
        // project-tasks 관련 처리
      }
      if (Object.keys(insert_datas).length === 0) status = null;
      else if (action_mode === 'add' || action_mode === '_add') {
        const request = await api.createData(
          action_path,
          jwt_data(insert_datas),
        );
        // customer > 첫번째 insert 결과값을 moreinfo > customer 필드에 update
        if (arrno === 0) reponseId = request.data.data.id;
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
      } else if (action_mode === 'pass') {
        //
        console.log('>>>>> action pass');
      }
    } catch (error) {
      console.log('>>>>> error message', error);
      message.error(
        `code:${error.response.status}, message:${error.response.data.error.message}`,
        5,
      );
      return error.response;
    }
    return status;
  };

  const submitCallback = async (submit_data) => {
    const { index, path, action, id, data } = submit_data;
    const isNullData = Object.keys(data).length === 0 ? true : false;
    const nextData = submit_datas.length > index + 1 ? true : false;
    let newPath = null;
    console.log(`>>(isNullChedk), (isNullData:${isNullData})`);
    console.log(
      `>>(idx:${index}), (path:${path}), , (action:${action}), data: `,
      data,
    );

    // data 객체 빈객 이면서 다음 데이터 있을경우
    // if (isNullData && LENGTH > arrno + 1) {
    //   arrno += 1;
    //   submitCallback(submit_datas[arrno]);
    // }
    if (isNullData && nextData) {
      arrno += 1;
      submitCallback(submit_datas[arrno]);
    }
    // customer add > index 값이 1일 경우 responseId 값을 data 에 추가..
    // customer..edit 모드 -> add 로 변경시 _add 로 수정하여 구분됨
    if (action === 'add' && path.includes('-moreinfos')) {
      // **** 수정 필요 **** //
      // data.customer = reponseId;
      data[submit_data.name] = reponseId;
      //data[] = reponseId;
    }

    if (action === 'add') newPath = `api/${path}`;
    if (action === '_add') newPath = `api/${path}`;
    if (action === 'edit') newPath = `api/${path}/${id}`;
    if (action === 'edit' && index === 0) reponseId = id;

    console.log('>>check-before - request, data:', data);
    const request = await insertOrUpdateToDB(action, newPath, data);
    console.log('>>check - request', request);
    if (request.status === 200) {
      console.log(`>>(${action}-success), (index:${index}), request:`, request);
      // 다음 데이터 있을 경우...callback 실행
      if (LENGTH > arrno + 1) {
        arrno += 1;
        submitCallback(submit_datas[arrno]);
      }
      status = true;
      return status;
    } else {
      status = false;
      console.log('>>>>>>>>>>error>>>>>>', request);
      // return status;
    }
    return status;
  };

  // const test = await callbackSubmit(org_datas);
  const submitRequest = submitCallback(submit_datas[0]);
  return submitRequest;
};

export default submitToDB;
