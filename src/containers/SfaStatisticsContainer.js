import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SfaStatisticsTable from '../components/SfaStatisticsTable';
import * as api from '../lib/api/api';
import sumSalesValueByMonth from '../modules/temp/sumSalesValueByMonth';
// import moment from 'moment';
import dayjs from 'dayjs';
import startEndDay from '../modules/common/startEndDay';
// import { getSalesList } from '../../modules/sales';
// import { qs_salesStatistics, qs_salesAdvanced } from '../../lib/api/query';
import { qs_sfaStatistics } from '../lib/api/querySfa';
import fetchAllList from '../lib/api/fetchAllListR1';

const SfaStatisticsContainer = ({ staticsOnClick }) => {
  // sales summary 정보 가져오기

  const [sumValue, setSumValue] = useState({});
  const [totalMonth, setTotalMonth] = useState([]);

  const get4MonthSalesList = async () => {
    const obj = [];
    const total4Month = [];
    // try {
    const qs = qs_sfaStatistics;
    const path = 'api/sfa-moreinfos';

    for (let i = 0; i <= 3; i++) {
      const month = dayjs()
        .add(i - 1, 'months')
        .format('YYYY-MM');
      const keyarr = {
        confirmed: {
          key: 0,
          percentage: '확정',
          sales_revenue: 0,
          sales_profit: 0,
          cm_sales: 0,
          cm_profit: 0,
        },
        100: { key: 1, percentage: '100%', sales_revenue: 0, sales_profit: 0 },
        90: { key: 2, percentage: '90%', sales_revenue: 0, sales_profit: 0 },
        70: { key: 3, percentage: '70%', sales_revenue: 0, sales_profit: 0 },
        50: { key: 4, percentage: '50%', sales_revenue: 0, sales_profit: 0 },
      };
      // 해당 시작일 종료일 계산하기, 시작월/종료월 인자로 전달
      const startEndOfDay = startEndDay(month, month);
      total4Month.push(startEndOfDay);
      const filter = {
        startDate: startEndOfDay[0],
        endDate: startEndOfDay[1],
      };
      const request = await fetchAllList({ qs, path, filter });
      // console.log(`--(${i}).queryString--`, request);
      // sfa_change_record[0]번 date 값과 기간 date 값 비교 하여
      // 값이포함될 경우 [0]을 제외한 나머지 data 삭제 후 리턴
      const filterReq = request.filter((list, index) => {
        const changeRecord = list.attributes.sfa_change_records.data;
        const date = dayjs(changeRecord[0].attributes.sales_rec_date);
        return date.isSame(startEndOfDay[0], 'month');
      });

      console.log(`--(filterReq)--`, filterReq);

      // change record 불필요 항목 제거 & 데이터 최적화
      const dataOptmize = filterReq.map((list, index) => {
        const changeRecord =
          list.attributes.sfa_change_records.data[0].attributes;
        const sfaPercentate = changeRecord.sfa_percentage.data.attributes.name;
        const sales_revenue = changeRecord.sales_revenue;
        const sales_profit = changeRecord.sales_profit;
        if (list.attributes.confirmed && i !== 1) {
          keyarr['confirmed']['sales_revenue'] =
            keyarr['confirmed']['sales_revenue'] + sales_revenue;
          keyarr['confirmed']['sales_profit'] =
            keyarr['confirmed']['sales_profit'] + sales_profit;
        } else if (list.attributes.confirmed && i === 1) {
          keyarr['confirmed']['cm_sales'] =
            keyarr['confirmed']['cm_sales'] + sales_revenue;
          keyarr['confirmed']['cm_profit'] =
            keyarr['confirmed']['cm_profit'] + sales_profit;
        } else {
          keyarr[sfaPercentate]['sales_revenue'] =
            keyarr[sfaPercentate]['sales_revenue'] + sales_revenue;
          keyarr[sfaPercentate]['sales_profit'] =
            keyarr[sfaPercentate]['sales_profit'] + sales_profit;
        }

        // return {
        //   id: list.id,
        //   ...changeRecord,
        // };
      });

      // datasource 형태로 변경 object -> array
      const arrpushdate = [
        keyarr['confirmed'],
        keyarr['100'],
        keyarr['90'],
        keyarr['70'],
        keyarr['50'],
      ];
      obj.push(arrpushdate);
    }
    // } catch (error) {
    //   console.log('error', error);
    // }

    console.log('obj', obj);
    console.log('4month', total4Month);
    // 천단위 콤마 적용
    const newobj = obj.map((arr) => {
      return arr.map((obj) => {
        return {
          ...obj,
          sales_revenue: obj.sales_revenue.toLocaleString(),
          sales_profit: obj.sales_profit.toLocaleString(),
          cm_sales: obj.cm_sales ? obj.cm_sales.toLocaleString() : '-',
          cm_profit: obj.cm_profit ? obj.cm_profit.toLocaleString() : '-',
        };
      });
    });
    console.log('newobj', newobj);
    setSumValue(newobj);
    setTotalMonth(total4Month);
  };

  useEffect(() => {
    get4MonthSalesList();
  }, []);

  const onClick = (record, month) => {
    console.log('eeee', record, month);
    // if (!record.month) return;
  };
  console.log('***sum value***', sumValue);

  return (
    <>
      {sumValue[2] && totalMonth.length !== 0 ? (
        <SfaStatisticsTable
          sumValue={sumValue}
          totalMonth={totalMonth}
          onClick={(record, mont) => staticsOnClick(record, mont)}
        />
      ) : (
        // <h1>테스트</h1>
        <h1>로딩중</h1>
      )}
    </>
  );
};

export default SfaStatisticsContainer;
