const jsonFormatOptimize = (datas) => {
  const returnData = [];
  let parentKey = '';
  let pushReturnData = {};
  let tempObject = {};
  let keyCount = { index: null, data: 0, attributes: 0, moreinfo: 0 }; //{attributes:0, moreinfo:0, data:0}

  //키: value 생성
  function updateKeyValue(key, value, from) {
    // console.log(`(키저장)>>>>(key:${key}), (Value:${value}), (from:${from})`);
    pushReturnData[key] = value;
    parentKey = '';
  }

  //
  function composeJsonData({ index, call, arg }) {
    // console.log(`00>>>함수>>> (call:${call}), (idx:${index}), arg : `, arg);
    // console.log(`>>>>>>>>>>>>>>>  키카운트  >>>>>>>>>>>>>>>`, keyCount);

    for (const key in arg) {
      //
      // console.log(
      //   `11<<(for)>> (call:${call}), (key:${key}), (pkey:${parentKey}), (keyidx:${keyCount.index}), arg:`,
      //   arg[key],
      // );
      // 최상단 배열 여부 체크 & 초기화 / push
      if (call === 'init' && Number(key) === 0) {
        keyCount = { ...keyCount, index: 0, length: arg.length };
        composeJsonData({ arg: arg[key], call: 'start' });
        keyCount.index += 1;
        returnData.push(pushReturnData);
        continue;
      } else if (call === 'init' && Number(key) === keyCount.index) {
        // 초기화
        pushReturnData = {};
        keyCount = {
          ...keyCount,
          attributes: 0,
          data: 0,
          moreinfo: 0,
        };
        parentKey = '';
        composeJsonData({
          index: Number(key),
          arg: arg[key],
          call: 'array-loop',
        });
        keyCount.index += 1;
        returnData.push(pushReturnData);
        continue;
      }

      switch (key) {
        case 'id':
          // console.log(
          //   `(key)>>>>(key:${key}),(parentKey:${parentKey}) (Value:`,
          //   arg[key],
          // );
          if (!parentKey && keyCount.moreinfo === 0) {
            updateKeyValue(key, arg[key], 'id');
          } else if (keyCount.moreinfo === 1) {
            //moreinfo(추가정보) 있을경우 id 값만 별도 저장
            updateKeyValue('moreinfo', { id: arg[key] }, 'id-moreinfo');
            keyCount.data = 0;
            keyCount.moreinfo = 0;
            composeJsonData({ arg: arg[key], call: 'moreinfo>data' });
          } else {
            tempObject = { [key]: arg[key] };
          }
          break;

        case 'attributes':
          keyCount.attributes = 1;
          if (
            // 프로그램{att:{top_program:{data:{id:1, att:{in_out:'out, name:'...'}}}}}
            keyCount.moreinfo === 0 &&
            keyCount.data >= 1 &&
            Object.keys(arg[key]).length >= 2
          ) {
            //
            tempObject = { ...tempObject, ...arg[key] };
            updateKeyValue(parentKey, tempObject, 'attributes');
            // keyCount.data = 0;
            // tempObject = {};
            console.log(`@@@@@@@@@@@@확인코드@@@@@@@@@@@@@`);
            // composeJsonData({ arg: arg[key], call: 'attributes' });
          } else composeJsonData({ arg: arg[key], call: 'attributes' });
          break;

        case 'data':
          keyCount.data = 1;
          keyCount.attributes = 0;
          if (arg[key] === null) {
            // data:null -> 키저장 부모키 + null
            updateKeyValue(parentKey, null, 'data-null');
            // parentKey = '';
          } else if (Array.isArray(arg[key])) {
            // 값이 Array 형태일경우 data:[{..},{..}] -> Array 저장
            updateKeyValue(
              parentKey,
              arg[key].length > 0 ? arg[key] : null,
              'data>Array 저장',
            );
          } else if (typeof arg[key] === 'object') {
            // data:{id:1, attributes:{...}} -> 콜백
            // keyCount = {
            //   ...keyCount,
            //   data: keyCount.data + 1,
            // };
            composeJsonData({ arg: arg[key], call: 'data' });
          }
          break;

        case 'moreinfo':
          // console.log(`@@@@@@@@@@@@확인코드@@@@@@@@@@@@@`);
          keyCount.moreinfo = 1;
          if (arg[key].data === null) {
            // moreinfo:{data:null} 저장안함
            updateKeyValue(key, null, 'moreinfo-null');
          } else {
            composeJsonData({ arg: arg[key], call: 'moreinfo' });
          }
          break;

        default:
          // key 0:{id:1, attributes:{}}
          if (!isNaN(key)) {
            parentKey = '';
            keyCount.data = 0;
            tempObject = {};
            composeJsonData({ arg: arg[key], call: 'arr-start' });
          }
          // if (typeof arg[key] !== 'object' || arg[key] === null) {
          else if (arg[key] === null) {
            updateKeyValue(key, arg[key], 'default-null');
          } else if (typeof arg[key] !== 'object' && keyCount.data === 0)
            updateKeyValue(key, arg[key], 'default-!object');
          else if (typeof arg[key] !== 'object' && keyCount.data === 1) {
            tempObject = {
              ...tempObject,
              [key]: arg[key],
            };
            updateKeyValue(parentKey, tempObject, 'default-!object & data=1');
            keyCount.data = 0;
            tempObject = {};
          }
          // json 입력 데이터 array 체크 (23.07.10)
          else if (Array.isArray(arg[key])) {
            updateKeyValue(key, arg[key], 'json data - array');
          } else if (typeof arg[key] === 'object') {
            // value 가 object 일 경우 키정보 저장
            // 오브젝트 data:{} 형태일경우
            parentKey = key;
            keyCount.data = 0;
            tempObject = {};
            // console.log('--(parentkey)--', parentKey);
            composeJsonData({ arg: arg[key], call: 'object' });
          }
        // else if (typeof key === 'string')
        //   composeJsonData({ arg: arg[key], call: '!object' });
      }

      // setKeyCount(key, 'sub');
    }
  }
  composeJsonData({ index: 0, arg: datas, call: 'init' });
  return returnData;
};

export default jsonFormatOptimize;
