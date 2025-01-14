import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  qs_getSelectFormLists,
  qs_getUserLists,
} from '../../lib/api/queryCommon';
import fetchLists from '../../modules/fetchLists';
import * as api from '../../lib/api/api';
import { getCommonData } from '../../modules/status';

const CommonDataContainer = () => {
  const dispatch = useDispatch();

  const { commonData } = useSelector(({ status }) => ({
    commonData: status.commonData,
  }));

  useEffect(() => {
    if (!commonData) dispatch(getCommonData());
    // dispatch(getCommonData(user_path, user_query));
  }, []);

  //   const FetchCommonData = async () => {
  //     // 고객정보 : 분류 '지원기관' 제외 모든 고객사
  //     const customer_path = `api/customers`;
  //     const customer_filter = { co_classification: { id: { $ne: 3 } } };
  //     const customer_query = qs_getSelectFormLists(customer_filter);
  //     // 사용자 리스트
  //     const user_path = `api/users`;
  //     const user_query = qs_getUserLists();
  //     // fetch
  //     const customer_req = await fetchLists(customer_path, customer_query, true);
  //     const user_req = await api.getQueryString(user_path, user_query);
  //   };

  return <></>;
};

export default CommonDataContainer;
