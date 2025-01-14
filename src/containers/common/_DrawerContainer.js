import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Space, Divider, message, Radio, Drawer } from 'antd';
import DrawerForm from '../../components/templete/DrawerForm';
import fetchLists from '../../modules/fetchLists';
import { changeDrawerVisible, initDrawerVisible } from '../../modules/status';
import submitToDB from '../../modules/common/submitToDB';
import dayjs from 'dayjs';
import styled from 'styled-components';

const DrawerBlock = styled.div`
  //
`;

// sales..
const DrawerContainer = ({
  selectBook,
  drawerInfo,
  formItems,
  initialValues,
  setInitialValues,
  onChangeSubButton,
  pr_list,
  subMenuItems,
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

  // onsubmit null 체크 // 모듈화 필요
  // customer 의 경우 customers / moreinfo 등 2개의 path 처리
  const removeNullAndIndexClassfication = (value) => {
    // draserInfo > path 배열수 많큼 객체 생성
    const ACTION = drawer.mode;

    const returnValues = [{}];
    console.log('@@@@@@@@@@@@@@@@@@@@', value);

    // date type 형태 변경 & null 제거
    const deleteNullAndChangeDate = (key, value) => {
      const returnobj = {};
      const newKey = key.charAt(0) === '_' ? key.slice(1) : key;
      // null 제거
      if (!value) return;
      // date 형태 start & end 분리
      // {_date_start:'2023-05-14', _date_end:'2023-05-15}
      else if (key.indexOf('_date') !== -1 && Array.isArray(value)) {
        console.log(`>>array>>, (key:${key}`);
        returnobj[`${newKey}_start`] = dayjs(value[0]).format('YYYY-MM-DD');
        returnobj[`${newKey}_end`] = dayjs(value[1]).format('YYYY-MM-DD');
      }
      // date 형태 변경
      else if (key.indexOf('_date') !== -1) {
        returnobj[newKey] = dayjs(value).format('YYYY-MM-DD');
      } else {
        returnobj[newKey] = value;
      }
      return returnobj;
    };

    console.log(`>>(temp-0000)>>`, returnValues);
    // edit : 체크된 key 추출 및 [{},{}] 1단계 - 2단계(moreinfo) 구분작업
    // 방식 변경 _region -> _로 시작시 drawer.path[1] 정보 조회..
    // moreinfo 사용시 방식 변경
    // 키값이 '_' 로 시작시 2번째 배열에 추가 하게 변경
    for (const key in value) {
      if (value[key]) {
        const arrIndex = key.charAt(0) === '_' ? 1 : 0;
        // arrIndex 가 1일 & temp arr.length 1일 경우 temp배열 추가..
        if (arrIndex === 1 && returnValues.length === 1) {
          returnValues.push({});
        }
        // RANGE DATE 형태 데이터 처리 application_date['2023-04-30', 2023-06-30]
        // 기존키 삭제 후 start, end 등록
        if (key.indexOf('sfa-moreinfos') !== -1) {
          // sfa-moreinfos 부분 처리 - sfa-moreinfos, sfa-change-recore 로 분리
          const sfa_moreinfos = value[key];
          // temp[1]['data'] = sfa_moreinfos;
          let tempMoreinfo = {};
          const tempMoreinfoarr = [];
          sfa_moreinfos.map((minfo, index) => {
            for (const key2 in minfo) {
              const req = deleteNullAndChangeDate(key2, minfo[key2]);
              if (req) {
                console.log('@@@@@@@@@@@@@@@@@@@@', req);
                tempMoreinfo = { ...tempMoreinfo, ...req };
              }
            }
            tempMoreinfoarr.push(tempMoreinfo);
            tempMoreinfo = {};
          });
          returnValues[1]['data'] = tempMoreinfoarr;
        } else {
          const req = deleteNullAndChangeDate(key, value[key]);
          if (req) {
            returnValues[arrIndex]['data'] = {
              ...returnValues[arrIndex]['data'],
              ...req,
            };
          }
        }
      }
    }

    console.log(`>>(temp-before)>>`, returnValues);

    // 키 추가
    // case#1 [{0},{1}] => 0번 배열 data 키 없을 경우 // customer > edit 시 moreinfo 부분만 수정시
    const returnValuesTemp = returnValues;
    returnValuesTemp.map((value, index) => {
      const refid = drawer.id ? drawer.id : null;
      const addKeyValue = {};
      let addBaseInfo = {};

      if ('data' in value) {
        addKeyValue['index'] = index;
        addKeyValue['action'] = ACTION;
        addKeyValue['path'] = drawer.path[index];
        addKeyValue['id'] = refid ? refid[index] : null;
        addKeyValue['name'] = drawerInfo.name; //customer(add) > moreinfo -기준키customer 정보
        // customer > edit 모드 -> moreinfo id 정보 없을경우..edit -> _add 로 변경 & customer id 추가..
        if (ACTION === 'edit' && drawer.id[index] === null) {
          if (drawerInfo.path[index] === 'customer-moreinfos') {
            addKeyValue['action'] = '_add';
            // addKeyValue['data']['customer'] = drawer.id[0];
            addBaseInfo = { customer: drawer.id[0] };
          }
        }
        // case#2 project > proposal add 시...proposal 에 project id&value 추가 필요..
        if (ACTION === 'add' && drawer.path[index] === 'proposals') {
          //
          addBaseInfo = { program: drawer.id[0] };
        }
      } else {
        addKeyValue['index'] = index;
        addKeyValue['action'] = 'pass';
      }
      returnValues[index] = { ...returnValues[index], ...addKeyValue };
      returnValues[index]['data'] = {
        ...returnValues[index]['data'],
        ...addBaseInfo,
      };
    });

    console.log(`>>(temp-after)>>`, returnValues);
    return returnValues;
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

    if (mode === 'add') {
      // null 제거 & 테이블멸..insert, update 에 대한 분리작업
      // data 형식:[{path:'customer', action:'add', index:1, id:2 data:''}, {}]
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
      // console.log('>>(datas)', request);

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

    // setTimeout(() => {
    //   dispatch(
    //     changeDrawerVisible({
    //       btnDisabled: false,
    //     }),
    //   );
    // }, 5000);
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

  // DR SUB MENU
  const SubMenu = () => {
    return (
      <>
        <Radio.Group
          defaultValue="view"
          onChange={onChangeSubButton}
          buttonStyle="solid"
        >
          {subMenuItems.map((list, i) => (
            <Radio.Button key={i} value={list.value}>
              {list.name}
            </Radio.Button>
          ))}
        </Radio.Group>
        <Divider />
      </>
    );
  };

  return (
    <DrawerBlock>
      <Drawer
        title={drawerInfo.title}
        open={drawer.open}
        width={drawerInfo.width}
        onClose={handleOnclose}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {/* SUB MENU */}
        {drawer.id ? SubMenu() : ''}
        {/* SUB MENU */}

        {/* TABLE LIST */}
        {pr_list}
        {/* TABLE LIST */}

        {/* FORM */}
        <DrawerForm
          selectBook={selectBook}
          formItems={formItems}
          handleOnSubmit={handleOnSubmit}
          handleOnChange={handleOnChange}
          initialValues={initialValues}
          // pr_list={pr_list}
          // subMenu={subMenu()}
        />
        {/* FORM */}
      </Drawer>
    </DrawerBlock>
  );
};

export default DrawerContainer;
