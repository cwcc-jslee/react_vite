// src/shared/services/authService.js

/**
 * JWT 토큰 저장
 * @param {string} token - JWT 토큰
 */
export const setAuthToken = (token) => {
  try {
    sessionStorage.setItem('jwt', token);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
};

/**
 * JWT 토큰 가져오기
 * @returns {string} JWT 토큰
 * @throws {Error} 토큰이 없거나 유효하지 않은 경우
 */
export const getAuthToken = () => {
  try {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
      throw new Error('토큰이 없습니다.');
    }
    return token;
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 사용자 정보 저장
 * @param {Object} userData - 사용자 정보
 */
export const setUserData = (userData) => {
  try {
    sessionStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('사용자 정보 저장 실패:', error);
    throw error;
  }
};

/**
 * 사용자 정보 가져오기
 * @returns {Object} 사용자 정보
 */
export const getCurrentUser = () => {
  try {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return null;
  }
};

/**
 * 토큰 유효성 확인
 * @returns {boolean} 토큰 유효 여부
 */
export const isTokenValid = () => {
  try {
    const token = getAuthToken();
    // 여기에 토큰 유효성 검사 로직 추가 가능
    // 예: 만료시간 체크 등
    return !!token;
  } catch {
    return false;
  }
};

/**
 * 로그아웃 처리
 */
export const removeAuthToken = () => {
  try {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('user');
  } catch (error) {
    console.error('로그아웃 처리 실패:', error);
    throw error;
  }
};
