import dayjs from 'dayjs';

// 프로젝터 > project-tasks 데이터에서 plan_start_date, plan_end_date 추출

const getMinMaxDate = (start_key, end_key, datas) => {
  //
  let earliestStartDate = datas
    .map((item) => item[start_key])
    .reduce((a, b) => (dayjs(a).isBefore(dayjs(b)) ? a : b));

  let latestEndDate = datas
    .map((item) => item[end_key])
    .reduce((a, b) => (dayjs(a).isAfter(dayjs(b)) ? a : b));

  return { start_date: earliestStartDate, end_date: latestEndDate };
};

export default getMinMaxDate;
