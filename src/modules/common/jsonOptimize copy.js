const res = [];
const jsonOptimize = (jsondata) => {
  // 함수형 프로그램으로 변경 필요..
  let returntemp = [];
  let newarray = {};
  function deletekey(arg, arg2) {
    //
    let count = 0;
    console.log(`>>>>>>>>>>>>>>>  함수시작  >>>>>>>>>>>>>>>`);
    console.log(arg);
    console.log(`>>>>>>>>>>>>>>>  arg2[ ${arg2} ]  >>>>>>>>>>>>>>>`);
    // console.log(
    //   `>>>>>>>>>>>>>>>  returntemp - [${count} ]  >>>>>>>>>>>>>>>`,
    //   returntemp,
    // );
    // console.log(
    //   `>>>>>>>>>>>>>>>  ndwarray - [${count} ]  >>>>>>>>>>>>>>>`,
    //   newarray,
    // );

    // 배열 시작시 데이터 저장 기능
    if (arg2 === '배열') {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', newarray);
      newarray = {};
    }

    for (let key in arg) {
      const temparray = [];
      console.log(`===============for문 시작 [${key}]====================`);
      console.log(`===============for문 시작 [${key}]====================`);
      // if문 시작시 키 추가 후 종료시 키 삭제 기능 추가
      // value 값이 object 가 아닐경우 처리
      if (typeof arg[key] !== 'object' || arg[key] === null) {
        console.log('1.====pass*****====', key);
        // {data:null} 값 처리
        if (key === 'data' && arg[key] === null) {
          console.log(`1-1.====data null 처리==[${key}]==`, arg[key]);
        } else {
          console.log('1-2.ndwarray 키저장', key);
          newarray[key] = arg[key];
          // returntemp.push(key);
        }
      }
      // value 값이 object 일 경우 처리
      else if (
        typeof arg[key] === 'object' &&
        !(key === 'attributes' || key === 'data')
      ) {
        if (Number(key) === count) {
          // 배열일 경우 함수 호출..?? length 확인
          console.log(`2-1.====배열*****[${key}]====`, arg[key]);
          console.log(`2-1.====배열*****[${key}]====`, Number(key));
          console.log(`2-1.====배열*****[${key}]====`, count);
          count++;
          deletekey(arg[key], '배열');
        }
        // 오브젝트 & {data: null} 일경우
        // else if () {

        // }
        //
        else {
          console.log(`2-2.====오브젝트*****[${key}]====`, arg[key]);
          console.log(`2-2.====오브젝트*****[${key}]====`, Number(key));
          deletekey(arg[key], '오브젝트');
        }
      }
      // key 값이 'attributes', 'data' 일경우 처리 로직
      // data 아래 array 일경우 순회 중지..object 경우 순회..
      else if (key === 'attributes' || key === 'data') {
        // value : array 일경우 처리
        if (key === 'data' && Array.isArray(arg[key])) {
          console.log('3-1.====array 키 삭제만====', key);
          console.log('3-1.====array 키 삭제만====', arg[key]);
        } else {
          // value : array 아닐경우
          console.log(`3-2.====키 삭제=[${key}]===`);
          const temp = arg[key];
          console.log(`3-2.====키 삭제=[${key}]===`, temp);
          deletekey(arg[key], '키삭제');
        }
      }
      // 해당없을 경우 처리
      else {
        console.log('4.====확인요..*****====', key);
        console.log('4.====확인요..*****====', typeof arg[key]);
      }

      console.log(`================for문 종료 [${key}]===================`);
      console.log(`================for문 종료 [${key}]===================`);
    }
    console.log('***************for 문 전체종료***************', returntemp);
    console.log('***************for 문 전체종료***************', count);
  }
  //

  deletekey(jsondata, '원본');

  // const res = [];
  // jsondata.map((item) => {
  //   if ('attributes' in item) {
  //     const attributes = item.attributes;
  //     console.log('--attributes--', attributes);
  //     delete item.attributes;
  //     res.push({ ...item, ...attributes });
  //   }
  // });
  // console.log('--res--', res);
  // return res;
  // console.log('-1.====data*****====', jsondata);

  // for (let key in jsondata) {
  //   const temp = [];
  //   console.log('0.====key*****====', key);
  //   if (typeof jsondata[key] === 'object' && key !== 'attributes') {
  //     console.log('1.====key*****====', key);
  //     // console.log('1. ====*****====', jsondata[key]);

  //     jsonOptimize(jsondata[key]);
  //   } else if (key === 'attributes') {
  //     console.log('2.====삭제====', key);
  //     const attributes = jsondata[key];
  //     console.log('2.====삭제 attributes====', attributes);
  //     // res.push({ id: jsondata['id'], ...attributes });
  //     // jsonOptimize(jsondata[key]);
  //     for (let key2 in attributes) {
  //       console.log(`3-0.====key2**[${key2}]**====`, typeof attributes[key2]);
  //       if (typeof attributes[key2] == 'string' || attributes[key2] === null) {
  //         console.log(`3-1.====key2**[${key2}]**====`, typeof attributes[key2]);
  //       } else if (typeof attributes[key2] === 'object') {
  //         console.log(`3-2.====key2**[${key2}]data**====`, attributes[key2]);
  //         // jsonOptimize(attributes[key2]);
  //       }
  //     }
  //   } else {
  //     console.log('99.===========');
  //     // temp.push(key);
  //   }
  //   console.log(`====================${temp}============================`);
  // }
  // console.log(`====================${jsondata.id}============================`);
};

export default jsonOptimize;
