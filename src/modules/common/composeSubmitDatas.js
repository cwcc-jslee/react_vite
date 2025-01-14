//
// action : add / view / edit / sfa-add
// subaction : edit
// path : sfa
import dayjs from 'dayjs';
import getMinMaxDate from './getMinMaxDate';

const composeSubmitDatas = (props) => {
  const { pathName, drawer, submit_data, selectBook } = props;
  const isChecked = props.isChecked ? props.isChecked : null;
  const action = drawer.subaction ? drawer.subaction : drawer.action;
  const subAction = drawer.sub ? drawer.sub.action : null;

  //
  // **************************************************** //

  // **************************************************** //
  // 키값이 '_' 로 시작시 2번째 배열에 추가 하게 변경
  // RANGE DATE 형태 데이터 처리 application_date['2023-04-30', 2023-06-30]
  // 기존키 삭제 후 start, end 등록
  // checkboxgroup 추가(23.07.10) checkboxgroup_service
  const step1DeleteNull = (object) => {
    const returnStep1Values = {};
    // null 제거 & date 형태 변경
    const deleteNull = (key, value) => {
      const deleteNullObj = {};
      // null 제거
      if (value === undefined || value === '') return;
      // 키 '_' 로 시작시 '_' 제거
      const newKey = key.charAt(0) === '_' ? key.substr(1) : key;
      // console.log('>>(newkey)>>', newKey);
      // date 형태 start & end 분리
      // {_date_start:'2023-05-14', _date_end:'2023-05-15}
      if (key.indexOf('_date') !== -1 && Array.isArray(value)) {
        console.log(`>>array>>, (key:${key}`);
        deleteNullObj[`${newKey}_start`] = dayjs(value[0]).format('YYYY-MM-DD');
        deleteNullObj[`${newKey}_end`] = dayjs(value[1]).format('YYYY-MM-DD');
      }
      // date 형태 변경
      else if (key.indexOf('_date') !== -1) {
        deleteNullObj[newKey] = dayjs(value).format('YYYY-MM-DD');
      }
      // checkboxgroup
      else if (key.indexOf('checkboxgroup_') !== -1) {
        //
        const checkboxKey = key.replace('checkboxgroup_', '');
        const coid = checkboxKey.startsWith('_')
          ? checkboxKey.slice(1)
          : checkboxKey;
        const newvalue = value
          .map((val) => {
            // console.log('>>val>>', val);
            return selectBook[coid].filter((f) => val === f.id);
          })
          .map((map) => {
            // console.log('>>m>>', map);
            return { id: map[0].id, name: map[0].attributes.name };
          });
        // console.log('>>newvalue>>', JSON.stringify(newvalue));
        deleteNullObj[checkboxKey] = newvalue;
      }
      // sfa > sfa_item_price json data 처리
      else if (key.indexOf('sfa_item_price') !== -1) {
        console.log('>>>>>>>>>>>>>>>>>>', value);
        value.map((v, i) => {
          const sfa_item_name = selectBook['sfa_item'].filter(
            (f) => f.id === v.sfa_item,
          )[0].attributes.name;
          const team_name = selectBook['team'].filter((f) => f.id === v.team)[0]
            .attributes.name;

          value[i]['sfa_item_name'] = sfa_item_name;
          value[i]['team_name'] = team_name;
        });
        // console.log('>>>>>>>(value)>>>>>>>>>>>', value);
        deleteNullObj[key] = value;
      } else {
        deleteNullObj[newKey] = value;
      }
      return deleteNullObj;
    };

    for (const key in object) {
      if (object[key] !== undefined) {
        const arrIndex = key.charAt(0) === '_' ? 1 : 0;
        const req = deleteNull(key, object[key]);
        // console.log('@@@@@@@@@@@@@@@@@@@@', req);
        if (req) {
          returnStep1Values[arrIndex] = {
            ...returnStep1Values[arrIndex],
            ...req,
          };
        }
      }
    }

    console.log(`>>>>returnStep1Values`, returnStep1Values);
    return returnStep1Values;
  };

  // 매출이익 계산
  const salesProfitCalculation = (saleValue) => {
    const returnObj = {};
    const salesRevenue =
      saleValue.sfa_profit_margin === 79
        ? saleValue.profitMargin_value
        : Math.round(
            (saleValue.sales_revenue * saleValue.profitMargin_value) / 100,
          );
    returnObj['sales_profit'] = salesRevenue;

    // 확정여부 확정시 퍼센트 100 으로 변경 100% : 84
    const isConfirmed = saleValue.confirmed === true ? true : false;
    if (isConfirmed) {
      returnObj['sfa_percentage'] = 84;
    }
    return returnObj;
  };

  // **************************************************** //
  // action : edit 일 경우 unchecked 항목 제거
  let step0ComposeValues = {};
  if (action === 'edit') {
    for (const key in isChecked) {
      if (isChecked[key]) {
        step0ComposeValues[key] = submit_data[key];
      }
    }
  } else {
    step0ComposeValues = { ...submit_data };
  }
  // **************************************************** //
  console.log(`>>>>step0ComposeValues`, step0ComposeValues);
  const step1ComposeValues = step1DeleteNull(step0ComposeValues);
  console.log(`>>>>step1ComposeValues`, step1ComposeValues);
  // **************************************************** //

  let returnComposeSubmitDats = {};
  switch (pathName) {
    case '/sfa':
      if (action === 'add') {
        // values & sfa-moreinfos 데이터 분리
        const sfaMoreinfos = step1ComposeValues[0]['sfa-moreinfos'];
        delete step1ComposeValues[0]['sfa-moreinfos'];
        // sfa-moreinfos 데이터 null제거 & data 형태 변경
        // 매출이익계산, 매출확정시 percentage 100으로 변경
        // 키추가..
        console.log(`>>>>step2(sfamoreinfos)`, sfaMoreinfos);
        const step1SfaMoreinfors = sfaMoreinfos.map((data, index) => {
          const values = step1DeleteNull(data)[0];
          const addkey = salesProfitCalculation(data);
          // [step1SfaMoreinfors, step1SfaMoreinfors] -> sfa-moreinfo, sfa-change-record
          console.log(`>>>>step2(values)`, values);
          return { ...values, ...addkey };
        });
        // step1ComposeValues[1] = step1SfaMoreinfors;
        console.log(`>>>>step2(step1SfaMoreinfors)`, step1SfaMoreinfors);

        const step2ComposeValues_1 = {
          index: 0,
          action: 'add',
          path: 'sfas',
          data: step1ComposeValues[0],
        };

        const step2ComposeValues_2 = {
          index: 1,
          action: 'add',
          path: ['sfa-moreinfos', 'sfa-change-records'],
          data: step1SfaMoreinfors,
          relationKey: [
            { key: 'sfa', value: '00' },
            { key: 'sfa_moreinfo', value: '10' },
          ],
        };

        // console.log(`>>>>step2ComposeValues`, step2ComposeValues);
        returnComposeSubmitDats = [step2ComposeValues_1, step2ComposeValues_2];
      } else if (action === 'view' && subAction === 'edit') {
        // subaction edit -> sfa-moreinfo(updat), sfa-change-record(add)
        // moreinfo(체크된 컬럼만 update),
        // change-record( 기존데이터 & 체크된 항목 값 업데이트 후 insert)
        // moreinfo 시에도 전체 업데이트 하게 처리..매출이익계산등 분리시 복잡
        // const composePreInitvalues = step1DeleteNull(preiousInitialValues);
        const addSalesProfit = salesProfitCalculation(step1ComposeValues[0]);
        const composeMoreinfoData = {
          index: 0,
          action: 'edit',
          path: `sfa-moreinfos/${drawer.sub.id}`,
          data: { ...step1ComposeValues[0], ...addSalesProfit },
        };

        const composeRecordData = {
          index: 1,
          action: 'add',
          path: `sfa-change-records`,
          data: {
            ...step1ComposeValues[0],
            sfa_moreinfo: drawer.sub.id,
            ...addSalesProfit,
          },
        };
        returnComposeSubmitDats = {
          0: composeMoreinfoData,
          1: composeRecordData,
        };
      } else if (action === 'edit') {
        returnComposeSubmitDats = {
          0: {
            index: 0,
            action: action,
            path: `sfas/${drawer.id}`,
            data: step1ComposeValues[0],
          },
        };
      } else if (action === 'sfa-add') {
        const addSalesProfit = salesProfitCalculation(step1ComposeValues[0]);
        // addSalesProfit['sfa'] = drawer.id[0];
        returnComposeSubmitDats = {
          0: {
            index: 0,
            action: 'add',
            path: `sfa-moreinfos`,
            data: {
              ...step1ComposeValues[0],
              ...addSalesProfit,
              sfa: drawer.id,
            },
          },
          1: {
            index: 1,
            action: 'add',
            path: `sfa-change-records`,
            data: { ...step1ComposeValues[0], ...addSalesProfit },
            relationKey: { key: 'sfa_moreinfo', value: '10' },
          },
        };
      }
      break;

    case '/program':
      if (action === 'add') {
        const step2ComposeValues = {
          index: 0,
          action: action,
          path: drawer.path,
          data: step1ComposeValues[0],
        };
        returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
      }
      if (drawer.subaction === 'edit' && drawer.path === 'proposals') {
        const step2ComposeValues = {
          index: 0,
          action: action,
          path: `${drawer.path}/${drawer.proposalId}`,
          data: step1ComposeValues[0],
        };
        returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
      }
      if (action === 'edit' && drawer.path !== 'proposals') {
        const step2ComposeValues = {
          index: 0,
          action: action,
          path: `${drawer.path}/${drawer.id}`,
          data: step1ComposeValues[0],
        };
        returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
      }

      if (action === 'proposal-add') {
        const step2ComposeValues = {
          index: 0,
          action: 'add',
          path: `${drawer.path}`,
          data: { ...step1ComposeValues[0], program: drawer.id },
        };
        returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
      }

      break;

    case '/customer':
      if (action === 'add') {
        const step2ComposeValues = {
          index: 0,
          action: action,
          path: 'customers',
          data: step1ComposeValues[0],
        };
        returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
        //
        if ('1' in step1ComposeValues) {
          const step2ComposeValues = {
            index: 1,
            action: action,
            path: 'customer-moreinfos',
            data: step1ComposeValues[1],
            relationKey: { key: 'customer', value: '10' },
          };
          returnComposeSubmitDats = {
            ...returnComposeSubmitDats,
            1: { ...step2ComposeValues },
          };
        }
      }

      if (action === 'edit') {
        if ('0' in step1ComposeValues) {
          const step2ComposeValues = {
            index: 0,
            action: action,
            path: `${drawer.path}/${drawer.id}`,
            data: step1ComposeValues[0],
          };
          returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
        } else {
          const step2ComposeValues = {
            index: 0,
            action: action,
            path: '',
            data: '',
          };
          returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
        }
        if ('1' in step1ComposeValues && drawer.moreinfo) {
          const step2ComposeValues = {
            index: 1,
            action: 'edit',
            path: `customer-moreinfos/${drawer.moreinfo}`,
            data: step1ComposeValues[1],
          };
          returnComposeSubmitDats = {
            ...returnComposeSubmitDats,
            1: { ...step2ComposeValues },
          };
        }
        if ('1' in step1ComposeValues && !drawer.moreinfo) {
          const step2ComposeValues = {
            index: 1,
            action: 'add',
            path: `customer-moreinfos`,
            data: { ...step1ComposeValues[1], customer: drawer.id },
          };
          returnComposeSubmitDats = {
            ...returnComposeSubmitDats,
            1: { ...step2ComposeValues },
          };
        }
      }
      if (action === 'add-sales') {
        const step2ComposeValues = {
          index: 0,
          action: 'add',
          path: 'customer-year-datas',
          data: { ...step1ComposeValues[0], customer: drawer.id },
        };
        returnComposeSubmitDats = { 0: { ...step2ComposeValues } };
      }
      break;

    case '/project':
      if (action === 'add') {
        // values & project-taks 데이터 분리
        const project_tasks = step1ComposeValues[0]['project-tasks'];
        delete step1ComposeValues[0]['project-tasks'];
        const projectValues = step1ComposeValues[0];

        const step1ProjectTasks = project_tasks.map((data, index) => {
          // null 값 제거
          const values = step1DeleteNull(data)[0];
          // planning_time 계산
          const input_rate = data['input_rate'] ? data['input_rate'] : 1;
          const total_planning_time =
            data['input_person'] * data['planning_day'] * input_rate;
          console.log(`>>index ${index} --`, values);
          console.log(
            `>>planning-time >> index ${index} --`,
            total_planning_time,
          );
          values['total_planning_time'] = total_planning_time;

          // [step1SfaMoreinfors, step1SfaMoreinfors] -> sfa-moreinfo, sfa-change-record
          return values;
        });
        step1ComposeValues[1] = step1ProjectTasks;
        console.log(`>>>>step2(데이터분리)`, projectValues, step1ProjectTasks);
        // project : plan_start_date, plan_end_date
        // project_tasks : planning_time
        const get_plan_date = getMinMaxDate(
          'plan_start_date',
          'plan_end_date',
          step1ProjectTasks,
        );
        projectValues['plan_start_date'] = get_plan_date.start_date;
        projectValues['plan_end_date'] = get_plan_date.end_date;
        console.log('>>>(plan_date)>>', get_plan_date);

        const step2ComposeValues_0 = {
          index: 0,
          action: action,
          path: 'projects',
          data: projectValues,
        };
        const step2ComposeValues_1 = {
          index: 1,
          action: action,
          path: 'project-tasks',
          data: step1ProjectTasks,
          relationKey: { key: 'project', value: '10' },
        };

        returnComposeSubmitDats = {
          0: { ...step2ComposeValues_0 },
          1: { ...step2ComposeValues_1 },
        };
        // console.log(`>>>>step2ComposeValues`, step2ComposeValues);
        // returnComposeSubmitDats = { ...step2ComposeValues };
      }
      break;

    default:
  }
  return returnComposeSubmitDats;
};

export default composeSubmitDatas;
