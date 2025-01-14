import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import * as api from '../lib/api/api';
import * as CONF from '../config/sfaConfig';
import SfaDashboardTable from '../components/sfa/SfaDashboardTable';
import SfaDashboardChart from '../components/sfa/SfaDashboardChart';
import ActionButton from '../components/common/ActionButton';
import dayjs from 'dayjs';
import { qs_sfaConfirmedData } from '../lib/api/querySfa';
import fetchAllList from '../lib/api/fetchAllListR1';
import jsonFormatOptimize from '../modules/common/jsonFormatOptimize';

const Base = styled.div`
  width: 100%;
`;

const SfaDashboardContainer = () => {
  const qs = qs_sfaConfirmedData;
  const path = 'api/sfa-moreinfos';

  const [salesData, setSalesData] = useState();

  useEffect(() => {
    const startOfDay = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfDay = dayjs().endOf('month').format('YYYY-MM-DD');
    const filter = [
      {
        confirmed: {
          $eq: true,
        },
      },
      {
        sales_rec_date: {
          // $gte: startOfDay,
          $gte: '2024-01-01',
        },
      },
      {
        sales_rec_date: {
          $lte: '2024-12-31',
          // $lte: endOfDay,
        },
      },
    ];
    FetchSfaList(path, qs, filter);
    // drMoreinfoColumns.push(drSubAction);
  }, []);

  const FetchSfaList = async (path, qs, filter) => {
    try {
      const request = await fetchAllList({ path, qs, filter });
      // const optimize = jsonFormatOptimize(request);
      console.log(`@@@@@@@@@@@@@@@@@`, request);
      //
      const data = {
        확정: Array(12).fill(0),
      };
      request.forEach((item) => {
        const list = item.attributes;
        const month = new Date(list.sales_rec_date).getMonth();
        if (list.confirmed) {
          data['확정'][month] += list.sales_revenue;
        }
        // else {
        //   salesData[list.sfa_percentage.data.attributes.name + '%'][month] +=
        //     list.sales_revenue;
        // }
      });

      console.log(`@@@@@@(data)@@@@@@@@@@@`, data);
      setSalesData(data);
    } catch (error) {
      //
      console.error('>>>>>>>>>error', error);
    }
  };

  return (
    <>
      <Base>
        <ActionButton items={CONF.dashboardMenuItems} />
        <h3>SfaDashboard</h3>
        {salesData ? <SfaDashboardTable salesData={salesData} /> : ''}
        {/* <SfaDashboardChart /> */}
      </Base>
    </>
  );
};

export default SfaDashboardContainer;
