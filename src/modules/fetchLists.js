// 전체 or 개별 리스트 가져오는 코드
import * as api from '../lib/api/api';
import jsonFormatOptimize from './common/jsonFormatOptimize';

const fetchLists = async (path, query, useSelectedForm) => {
  try {
    if (!useSelectedForm) {
      // program > Drawer ('view') 에서 사용중
      const request = await api.getQueryString(path, query);
      console.log('****', request.data);
      // json 객체 최적화
      // jsonformatOptimeze 위치..이름 수정 필요
      const optimize = jsonFormatOptimize([request.data.data]);
      console.log('---jsonFormatOptimize--', optimize);
      return optimize;
    } else if (useSelectedForm) {
      // SELECT FORM 사용시 optimize 하지 않음
      const request = await api.getQueryString(path, query);
      return request.data.data;
    }
  } catch (error) {
    console.error(error);
  }
};

export default fetchLists;
