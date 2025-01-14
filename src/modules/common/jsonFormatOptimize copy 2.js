const jsonFormatOptimize = (datas) => {
  const returnData = [];
  let parentKey = '';
  let pushReturnData = {};
  let tempObject = {};
  let keyCount = { index: null, data: 0, attributes: 0, moreinfo: 0 }; //{attributes:0, moreinfo:0, data:0}

  //키: value 생성
  function setKeyValue(key, value, from) {
    console.log(`(키저장)>>>>(key:${key}), (Value:${value}), (from:${from})`);
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
          if (!parentKey && keyCount.moreinfo === 0) {
            setKeyValue(key, arg[key], 'id');
          } else if (keyCount.moreinfo >= 1) {
            //moreinfo(추가정보) 있을경우 id 값만 별도 저장
            setKeyValue('moreinfo', { id: arg[key] }, 'id-moreinfo');
            keyCount.data = 0;
            composeJsonData({ arg: arg[key], call: 'moreinfo>data' });
          } else {
            tempObject = { [key]: arg[key] };
          }
          break;

        case 'attributes':
          if (
            // 프로그램{att:{top_program:{data:{id:1, att:{in_out:'out, name:'...'}}}}}
            keyCount.moreinfo === 0 &&
            keyCount.data >= 1 &&
            Object.keys(arg[key]).length >= 2
          ) {
            //
            tempObject = { ...tempObject, ...arg[key] };
            setKeyValue(parentKey, tempObject, 'attributes');
            keyCount.data = 0;
            tempObject = {};
            console.log(`@@@@@@@@@@@@확인코드@@@@@@@@@@@@@`);
            // composeJsonData({ arg: arg[key], call: 'attributes' });
          } else composeJsonData({ arg: arg[key], call: 'attributes' });
          break;

        case 'data':
          if (arg[key] === null) {
            // data:null -> 키저장 부모키 + null
            setKeyValue(parentKey, null, 'data-null');
            // parentKey = '';
          } else if (Array.isArray(arg[key])) {
            // 값이 Array 형태일경우 data:[{..},{..}] -> Array 저장
            setKeyValue(
              parentKey,
              arg[key].length > 0 ? arg[key] : null,
              'data>Array 저장',
            );
          } else if (typeof arg[key] === 'object') {
            // data:{id:1, attributes:{...}} -> 콜백
            keyCount = {
              ...keyCount,
              data: keyCount.data + 1,
            };
            composeJsonData({ arg: arg[key], call: 'data' });
          }
          break;

        case 'moreinfo':
          // console.log(`@@@@@@@@@@@@확인코드@@@@@@@@@@@@@`);
          keyCount = { ...keyCount, moreinfo: 1 };
          if (arg[key].data === null) {
            // moreinfo:{data:null} 저장안함
            setKeyValue(key, null, 'moreinfo-null');
          } else {
            composeJsonData({ arg: arg[key], call: 'moreinfo' });
          }
          break;

        default:
          // if (typeof arg[key] !== 'object' || arg[key] === null) {
          if (arg[key] === null) {
            setKeyValue(key, arg[key], 'null');
          } else if (typeof arg[key] !== 'object' && keyCount.data === 0)
            setKeyValue(key, arg[key], '!object');
          else if (typeof arg[key] !== 'object' && keyCount.data === 1) {
            tempObject = {
              ...tempObject,
              [key]: arg[key],
            };
            setKeyValue(parentKey, tempObject, '!object & data=1');
            keyCount.data = 0;
            tempObject = {};
          } else if (typeof arg[key] === 'object') {
            // value 가 object 일 경우 키정보 저장
            // 오브젝트 data:{} 형태일경우
            parentKey = key;
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
