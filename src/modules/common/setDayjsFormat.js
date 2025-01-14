import dayjs from 'dayjs';

const setDayjsFormat = (date) => {
  //
  const result = date ? dayjs(date, 'YYYY-MM-DD') : '';
  return result;
};

export default setDayjsFormat;
