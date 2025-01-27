// src/features/sfa/utils/fieldUtils.js
export const getCurrentValue = (fieldName, data) => {
  if (!data?.hasOwnProperty(fieldName)) return null;

  // id를 반환하는 필드들
  if (
    [
      'customer',
      'sfa_sales_type',
      'sfa_classification',
      'selling_partner',
    ].includes(fieldName)
  ) {
    return data[fieldName]?.id ?? null;
  }

  return data[fieldName];
};
