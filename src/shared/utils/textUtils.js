/**
 * 긴 텍스트를 지정된 길이로 자르고 말줄임표 추가
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 잘린 텍스트
 */
export const truncateText = (text, maxLength = 25) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
