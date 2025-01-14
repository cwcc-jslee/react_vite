import * as api from '../../lib/api/api';
import { message } from 'antd';

// data 형태
// [{index:0, action:'add', path:'customers', id:null, data:{}}, {index:1, ...}]

const submitToDB2Sfa = async (submit_datas) => {
  let submitIndex = 0;
  let parentId = null;
  let reponseId = null;
  const totalCount = Object.keys(submit_datas).length;

  //
  let arrno = 0;
  // const { path, org_datas, drawer } = submit_datas;
  // console.log('>>>>> submitDrwaerToDB message:', drawer.mode, path, org_datas);
  // const path = drawerInfo.path;
  let status = null;
  const LENGTH = submit_datas.length;

  //
  const insertOrUpdateToDB = async (action_mode, action_path, insert_datas) => {
    console.log(`-------------(DB)-------------`);
    console.log(
      `--(action_mode:${action_mode}), (action_path:${action_path}), insert_datas:`,
      insert_datas,
    );
    console.log(`-------------(DB)-------------`);
    let returnmessage = null;
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
      else if (action_mode === 'add') {
        const request = await api.createData(
          action_path,
          jwt_data(insert_datas),
        );
        // customer > 첫번째 insert 결과값을 moreinfo > customer 필드에 update
        // if (arrno === 0) parentId = request.data.data.id;
        message.success(`성공-${request.status}`, 3);
        console.log('>>>>> success message', request);
        returnmessage = request;
        // return request;
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
        returnmessage = request;
        // return request;
      }
    } catch (error) {
      console.log('>>>>> error message', error);
      message.error(
        `code:${error.response.status}, message:${error.response.data.error.message}`,
        5,
      );
      // return error.response;
      returnmessage = error.response;
    }
    return returnmessage;
  };

  const arrDataCallback = async (submit_data, arr, arrno) => {
    //
    const { path, action, relationKey } = submit_data;
    const newPath = `api/${path[arrno]}`;
    const newData = { ...arr };
    const newAddKey = relationKey[arrno];
    if (newAddKey['value'] === '00') newData[newAddKey['key']] = parentId;
    if (newAddKey['value'] === '10') newData[newAddKey['key']] = reponseId;
    console.log('***********************************************');
    console.log(action[arrno], newAddKey, newPath, newData);
    console.log('***********************************************');
    const request = await insertOrUpdateToDB(action[arrno], newPath, newData);
    return request;
  };

  // relation key 추가
  const addRelationKey = (submit_data) => {
    const { data, relationKey } = submit_data;
    const newData = { ...data };
    if (relationKey['value'] === '00') newData[relationKey['key']] = parentId;
    if (relationKey['value'] === '10') newData[relationKey['key']] = reponseId;
    console.log('****(submit_data)****', newData);
    const return_data = { ...submit_data, data: newData };
    return return_data;
  };

  const submitCallback = async (submit_data) => {
    const { index, path, action, data, relationKey } = submit_data;
    const isNullData = Object.keys(data).length === 0 ? true : false;
    const isArray = Array.isArray(path);
    const hasNexts = index + 1 < totalCount;
    console.log(
      `>>>>>>>>>>Callback(index:${index})/(total:${totalCount}) >>>>>>>>>>>`,
      submit_data,
    );

    let newPath = null;
    console.log(`>>(isNullChedk), (isNullData:${isNullData})`);
    console.log(
      `>>(idx:${index}), (path:${path}), , (action:${action}), data: `,
      data,
    );

    if (isNullData && hasNexts) {
      submitIndex += 1;
      console.log('****(datanull)****');
      submitCallback(submit_datas[submitIndex]);
      return;
    }
    if (action === 'add') newPath = `api/${path}`;
    if (action === 'edit') newPath = `api/${path}`;

    if (index === 0 && !isArray) {
      // if (action === 'edit') newPath = `api/${path}/${id}`;
      // if (action === 'edit' && index === 0) reponseId = id;

      console.log('>>check-before - request, data:', data);
      const request = await insertOrUpdateToDB(action, newPath, data);
      console.log('>>check - request', request);
      if (request.status === 200) {
        console.log(
          `>>(${action}-success), (index:${index}), (next: ${hasNexts}), request:`,
          request,
        );
        status = request;
        reponseId = request.data.data.id;
        parentId = request.data.data.id;
        // relation key 없을 경우
        // 수정필요.....***  Array.isArray(action)
        if (hasNexts && 'relationKey' in submit_datas[submitIndex]) {
          submitIndex += 1;
          const new_submit_data = addRelationKey(submit_datas[submitIndex]);
          submitCallback(new_submit_data);
        } else if (hasNexts) {
          submitIndex += 1;
          submitCallback(submit_datas[submitIndex]);
        }
        // return status;
      } else {
        status = request;
        console.log('>>>>>>>>>>error>>>>>>', request);
        // return status;
      }
    }
    // 매출현황 > 신규등록 sfa-moreinfos insert 처리
    // path 배열일 경우 ['sfa-moreinfos', 'sfa-change-records']
    // 동일 데이터를 'sfa-moreinfos', 'sfa-change-records' 에 각각 insert 처리
    else if (index >= 1 && Array.isArray(path)) {
      console.log('>>>>>>>>>>data>>>>>>', data);
      data.map(async (arr1, index1) => {
        console.log('>>>>>>>>>>(arr1)>>>>>>', arr1);

        // sfa-moreinfos 처리
        let newData = { ...arr1 };
        // relationkey 값 여부
        if (relationKey[0] && 'key' in relationKey[0]) {
          if (relationKey[0]['value'] === '00')
            newData[relationKey[0]['key']] = parentId;
          if (relationKey[0]['value'] === '10')
            newData[relationKey[0]['key']] = reponseId;
        }
        //
        const path_moreinfo = `api/${path[0]}`;
        const request = await insertOrUpdateToDB(
          action,
          path_moreinfo,
          newData,
        );
        console.log('>>check - request', request);
        if (request.status === 200) {
          console.log(
            `>>(${action}-success), (index:${index}), (next: ${hasNexts}), request:`,
            request,
          );
          reponseId = request.data.data.id;

          // sfa-change-records 처리
          let newData2 = { ...arr1 };
          if (relationKey[1] && 'key' in relationKey[0]) {
            if (relationKey[1]['value'] === '00')
              newData2[relationKey[1]['key']] = parentId;
            if (relationKey[1]['value'] === '10')
              newData2[relationKey[1]['key']] = reponseId;
          }
          const path_moreinfo = `api/${path[1]}`;
          const request2 = await insertOrUpdateToDB(
            action,
            path_moreinfo,
            newData2,
          );
          console.log('>>check - request', request2);
        } else {
          console.log('>>>>>>>>>>error>>>>>>', request);
          // return status;
        }
        status = request;
      });
    } else if (index > 0 && !isArray) {
      console.log('>>check-before - request, data:', data);
      let newData = { ...data };
      // relationkey 값 여부
      if (relationKey && 'key' in relationKey) {
        if (relationKey['value'] === '10')
          newData[relationKey['key']] = reponseId;
      }
      //
      const request = await insertOrUpdateToDB(action, newPath, newData);
      console.log('>>check - request', request);
      if (request.status === 200) {
        console.log(
          `>>(${action}-success), (index:${index}), (next: ${hasNexts}), request:`,
          request,
        );
        if (hasNexts) {
          reponseId = request.data.data.id;
          submitIndex += 1;
          submitCallback(submit_datas[submitIndex]);
        }
      } else {
        console.log('>>>>>>>>>>error>>>>>>', request);
        // return status;
      }
      status = request;
    }

    return status;
  };

  const test = await submitCallback(submit_datas[submitIndex]);
  console.log(
    `************************************************(db insert return test>>>)`,
    test,
  );
  return test;
};

export default submitToDB2Sfa;
