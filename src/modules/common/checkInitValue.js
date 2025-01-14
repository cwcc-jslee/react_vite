const checkInitValue = (value, key) => {
  //
  return value[key] ? value[key].name : '-';
};

export default checkInitValue;
