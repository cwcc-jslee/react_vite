const jsonFormatOptimize = (jsondata) => {
  const returnData = [];
  let previouskeyName = '';
  let tempOptimezeData = {};
  let keyCount = { attributes: 0, moreinfo: 0, data: 0 }; //{attributes:0, moreinfo:0, data:0}
  let tempKeyId = {};

  //키: value 생성
  function keysave(key, value, from) {
    console.log(`000000 keycount [ ${key}] 000000`, keyCount);
    if (key === 'id' && keyCount.data >= 1) {
      tempKeyId = { [key]: value };
    } else if (Object.keys(tempKeyId).includes('id')) {
      // moreinfo 아래 id 부분 pass
      if (keyCount.moreinfo !== 1) {
        //
        // console.log(`bbbbbbbbbbbbb 키저장 [ ${from}] bbbbbbbbbbbbb `, tempKeyId);
        // console.log(
        //   `bbbbbbbbbbbbb 키저장 [ ${from}] bbbbbbbbbbbbb `,
        //   tempKeyId.length,
        // );
        // console.log(`${key} : ${value}`);
        tempKeyId[key] = value;
        tempOptimezeData[previouskeyName] = tempKeyId;
        console.log(
          `bbbbbbbbbbbbb  키저장[${previouskeyName}]] bbbbbbbbbbbbb `,
          tempKeyId,
        );
      } else {
        keyCount.moreinfo = keyCount.moreinfo + 1;
      }
      // console.log(`bbbbbbbbbbbbb  키저장 [ ${from}] bbbbbbbbbbbbb `);
      tempKeyId = {};
    } else {
      // console.log(`ccccccccccccccc 키저장 [ ${from}] ccccccccccccccc `);
      // console.log(`${key} : ${value}`);
      console.log(`ccccccccccccccc  키저장 [ ${key}] ccccccccccccccc`, value);
      tempOptimezeData[key] = value;
    }
  }

  // temptest
  function objectkey(key, mode) {
    if (
      key === 'attributes' ||
      key === 'data' ||
      key === 'moreinfo' ||
      key >= 0
    ) {
      if (mode === 'sub' && key >= 0) {
        returnData.push(tempOptimezeData);
        tempOptimezeData = {};
        keyCount = { attributes: 0, moreinfo: 0, data: 0 };
        previouskeyName = '';
      } else if (mode === 'add') keyCount[key] = keyCount[key] + 1;
      else if (mode === 'sub') keyCount[key] = keyCount[key] - 1;
    }
  }

  //
  function dataFormatOptimize(arg1, arg2) {
    // console.log(`>>>>>>>>>>>>>>>  함수시작  >>>>>>>>>>>>>>>`);
    // console.log(arg1);
    // console.log(keyCount);
    // console.log(`>>>>>>>>>>>>>>>  호출키[ ${arg2} ]  >>>>>>>>>>>>>>>`);
    // console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);

    // 값이 null 일경우 처리
    // {호출키 : null} 로 저장
    if (arg1 === null) {
      keysave(arg2, null, 'null호출');
    }

    for (const key in arg1) {
      // console.log(`zzzzz keycount [ ${key}] zzzzz`);
      objectkey(key, 'add');
      // 키삭제&함수 호출시 2번재 인자에 부모키 전달
      if (key === 'attributes' || key === 'data') {
        // temptest[key] = temptest[key] + 1;
        // data value 가 어레이 일경우 저장
        if (key === 'data' && Array.isArray(arg1[key])) {
          // console.log('222222222 키삭제&키 저장2222222222222', key);
          // console.log(`222222222 키[${key}]삭제&키 저장222222222`, arg1[key]);
          keysave(previouskeyName, arg1[key], '어레이저장');
        } else {
          // console.log('111111111111 키삭제&함수호출 111111111111', key);
          // console.log('111111111111 키삭제&함수호출 111111111111');
          dataFormatOptimize(arg1[key], previouskeyName);
        }
      }
      // moreinfo(고객사 추가정보)
      // moreinfo : {data:null}, moreinfo : {data:{...}}
      else if (key === 'moreinfo') {
        if (arg1[key].data === null) {
          //키 저장안함
          // console.log('3333333 키&값 저장안함 333333333', key);
        } else {
          // console.log('4444444444444 함수호출 4444444444444', key);
          // console.log('4444444444444 함수호출 4444444444444');
          // previouskeyName = key;
          dataFormatOptimize(arg1[key], key);
        }
      }
      //키 저장
      else if (typeof arg1[key] !== 'object' || arg1[key] === null) {
        //
        keysave(key, arg1[key], '기본저장');
      } else {
        // console.log('9999999999999 함수호출 9999999999999', key);
        // console.log('9999999999999 함수호출 9999999999999');
        previouskeyName = key;
        dataFormatOptimize(arg1[key], key);
      }

      // 공통사향
      // console.log(
      //   `===========for문 종료 [${previouskeyName}-${key}]================`,
      // );
      // console.log(`(temp)=======for문 종료 [${tempkey}]================`);
      objectkey(key, 'sub');
    }
  }
  dataFormatOptimize(jsondata, '00');
  return returnData;
};

export default jsonFormatOptimize;
