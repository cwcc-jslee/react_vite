import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProposalDrForm from '../../components/program/ProposalDrForm';
import { changeDrawerVisible, initDrawerVisible } from '../../modules/status';
import submitToDB from '../../modules/common/submitToDB';
import dayjs from 'dayjs';

const ProposalDrFormContainer = ({
  selectBook,
  drawerLists,
  initialValues,
  setInitialValues,
  drawerInfo,
}) => {
  const dispatch = useDispatch();
  const { open, mode, drloading, drawer } = useSelector(({ status }) => ({
    open: status.drawer.open,
    mode: status.drawer.mode,
    drloading: status.drawer.loading,
    drawer: status.drawer,
  }));

  useEffect(() => {
    //
    return () => {
      // dispatch(initDrawerVisible());
    };
  }, []);

  //(공통) Drawer Form -> Close 시
  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setInitialValues();
  };

  // (공통)view draser form 에서 모드 선택버튼 클릭시(view/edit)
  const handleModeButton = (e) => {
    console.log('>>>>', e.target.value);
    dispatch(changeDrawerVisible({ mode: e.target.value }));
  };

  // onsubmit null 체크 // 모듈화 필요
  // customer 의 경우 customers / moreinfo 등 2개의 path 처리
  const removeNullAndIndexClassfication = (value) => {
    // draserInfo > path 배열수 많큼 객체 생성
    const ACTION = drawer.mode;
    const refid = drawer.id ? drawer.id : null;
    const temp = [];
    drawerInfo['path'].map((p, i) => {
      const temp1 = {
        index: i,
        action: ACTION,
        path: p,
        id: refid ? refid[i] : null,
        data: {},
      };
      // customer>'edit' -> moreinfo 정보 없을 경우 처리
      if (ACTION === 'edit' && i === 1 && !refid[i]) {
        //
        console.log('@@@@@@@@@@@@@@@@@@@@');
        temp1.action = 'add';
        // **** 수정 필요 **** //
        temp1.customer = refid[0];
      }
      temp.push(temp1);
    });
    console.log(`>>(temp-before)>>`, temp);
    // edit : 체크된 key 추출 및 [{},{}] 1단계 - 2단계(moreinfo) 구분작업
    for (const key in value) {
      if (value[key]) {
        // drawerLists 에 'submit_index' 값 체크후 없을경우 [0]
        const indexno = drawerLists.filter((v, i) => v['name'] === key)[0];
        if ('submit_index' in indexno) {
          const index = indexno.submit_index;
          temp[index]['data'][key] = value[key];
        } else {
          // RANGE DATE 형태 데이터 처리 application_date['2023-04-30', 2023-06-30]
          // 기존키 삭제 후 start, end 등록
          // RANGE DATE 형태 사용시 'submit_index' 키 사용 안됨
          if (key.indexOf('_date') !== -1 && Array.isArray(value[key])) {
            console.log(`>>array>>, (key:${key}`);
            temp[0]['data'][`${key}_start`] = dayjs(value[key][0]).format(
              'YYYY-MM-DD',
            );
            temp[0]['data'][`${key}_end`] = dayjs(value[key][1]).format(
              'YYYY-MM-DD',
            );
          } else if (key.indexOf('_date') !== -1) {
            // DATE 형태 데이터 처리
            temp[0]['data'][key] = dayjs(value[key]).format('YYYY-MM-DD');
          } else {
            // drawerLists 에 'submit_index' 값 체크후 없을경우 [0]
            temp[0]['data'][key] = value[key];
          }
        }
      }
    }
    for (const key in temp[0]['data']) {
      if (Array.isArray(temp[0]['data'][key])) {
        // console.log(`>>array>>, (key:${key}`);
      }
    }

    console.log(`>>(temp-after)>>`, temp);
    return temp;
  };

  // (공통) Drawer Form 에서 onsubmit 시
  // onsubmit 단계 설정
  // name, cb_classification, cb_funnel, funnel_suffix, business_number, homepage, description
  // cb_bu_type, cb_by_tiems, representative_name, sales_revenue, exports, employee, commencemtnt_date, cb_region, address
  const handleOnSubmit = async (value, isChacked) => {
    console.log(`>>>>onsubmit mode:(${mode}), value:`, value);
    console.log(`>>>>onsubmit isChecked`, isChacked);
    //
    dispatch(
      changeDrawerVisible({
        btnDisabled: true,
      }),
    );
    //
    if (mode === 'add') {
      // data 형식
      // [{path:'', action:'', id:'', data:''}, {}]
      const request_datas = removeNullAndIndexClassfication(value);
      const request = await submitToDB(request_datas);

      //결과
      console.log('>>>>> message', request);
      // if (customer_update && moreinfo_update) {
      if (request) {
        dispatch(initDrawerVisible());
      } else {
        setTimeout(() => {
          dispatch(
            changeDrawerVisible({
              btnDisabled: false,
            }),
          );
        }, 5000);
      }
    } else if (mode === 'edit') {
      const arrIschecked = {};
      // edit 체크된 값만 추출
      for (const key in isChacked) {
        if (isChacked[key]) {
          arrIschecked[key] = value[key];
        }
      }
      console.log(`>>>>onsubmit mode:(${mode}) > result`, arrIschecked);
      const edit_datas = removeNullAndIndexClassfication(arrIschecked);
      console.log('>>(datas)>>', edit_datas);
      const request = await submitToDB(edit_datas);
      // ID 값 추가..
      console.log('>>(datas)', request);

      //결과
      console.log('>>>>> message', request);
      // if (customer_update && moreinfo_update) {
      if (request) {
        dispatch(initDrawerVisible());
      } else {
        setTimeout(() => {
          dispatch(
            changeDrawerVisible({
              btnDisabled: false,
            }),
          );
        }, 5000);
      }
    }
  };

  // (공통) drawer form 에서 수정 체크 박스 변경시
  const handleCheck = (e) => {
    const name = e.target['data-id'];
    console.log('>>>(handleCheck', e);
    // setCheckbox({ ...checkbox, [name]: e.target.checked });
  };

  // 코드북 2단계
  const handleOnChange = async (value) => {
    console.log('--value----', value);
  };

  return (
    <ProposalDrForm
      selectBook={selectBook}
      drawerLists={drawerLists}
      drawerInfo={drawerInfo}
      initialValues={initialValues}
      handleOnSubmit={handleOnSubmit}
      handleOnclose={handleOnclose}
      handleOnChange={handleOnChange}
      handleModeButton={handleModeButton}
      handleCheck={handleCheck}
    />
  );
};

export default ProposalDrFormContainer;
