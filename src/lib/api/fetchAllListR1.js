import * as api from '../api/api';

// api 전체 데이터 가져오기
// 22.06.26 프로젝트 상세 보기
const fetchAllList = async (arg) => {
  const path = arg.path;
  const qs = arg.qs;
  // const id = arg.id ? arg.id : null;
  const filter = arg.filter ? arg.filter : null;
  console.log('>>>>(filter', filter);
  let start = 0;
  const limit = 50;
  const resultArr = [];
  const query = qs(start, limit, filter);
  console.log('>>>>(query', query);
  const request = await api.getQueryString(path, query);
  resultArr.push(...request.data.data);
  const totalCount = request.data.meta.pagination.total;
  // const totalCount = 10;

  for (start = start + limit; start <= totalCount; start += limit) {
    // console.log('>>>>> start : ', start);
    const newQuery = qs(start, limit, filter);
    const newRequest = await api.getQueryString(path, newQuery);
    resultArr.push(...newRequest.data.data);
  }
  console.log('>>>>>>>> resultArr >>>>>>>>', resultArr, totalCount);
  return resultArr;
};

export default fetchAllList;
