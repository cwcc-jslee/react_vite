// src/shared/utils/nameUtils.js
/**
 * 이름 관련 유틸리티 함수 모음
 * 이름 포맷팅, 파싱 등 이름 처리에 필요한 공통 기능을 제공
 */

/**
 * 성과 이름을 결합하여 전체 이름을 생성하는 함수
 * @param {string} lastName - 성
 * @param {string} firstName - 이름
 * @returns {string} 포맷된 전체 이름
 */
export const formatFullName = (lastName = '', firstName = '') => {
  // 성과 이름이 모두 존재하는 경우에만 공백을 추가하여 결합
  const formattedLastName = (lastName || '').trim();
  const formattedFirstName = (firstName || '').trim();

  // 성과 이름 둘 중 하나라도 있으면 결합, 없으면 빈 문자열 반환
  if (formattedLastName || formattedFirstName) {
    return [formattedLastName, formattedFirstName].filter(Boolean).join('');
  }

  return '';
};

/**
 * 전체 이름에서 성과 이름을 추출하는 함수
 * @param {string} fullName - 전체 이름
 * @returns {Object} { lastName, firstName } 형태의 객체
 */
export const parseFullName = (fullName = '') => {
  if (!fullName) {
    return { lastName: '', firstName: '' };
  }

  const trimmedName = fullName.trim();
  const nameParts = trimmedName.split(' ');

  if (nameParts.length === 0) {
    return { lastName: '', firstName: '' };
  }

  if (nameParts.length === 1) {
    // 한 단어만 있는 경우 성으로 간주
    return { lastName: nameParts[0], firstName: '' };
  }

  // 첫 단어를 성으로, 나머지를 이름으로 처리
  const lastName = nameParts[0];
  const firstName = nameParts.slice(1).join(' ');

  return { lastName, firstName };
};
