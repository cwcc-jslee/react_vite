// import moment from 'moment';
import dayjs from 'dayjs';

const startEndDay = (startMonth, endMonth) => {
  const startOfDay = dayjs(startMonth).startOf('month').format('YYYY-MM-DD');
  const endOfDay = dayjs(endMonth).endOf('month').format('YYYY-MM-DD');
  console.log('**start of day & end of day**', startOfDay, endOfDay);
  return [startOfDay, endOfDay];
};
export default startEndDay;
