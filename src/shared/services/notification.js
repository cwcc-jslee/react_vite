// src/shared/services/notification.js

/**
 * 메시지 객체를 문자열로 변환하는 함수
 * @param {string|object} message - 메시지 또는 메시지 객체
 * @returns {string} 변환된 문자열 메시지
 */
const getMessageString = (message) => {
  if (!message) return '';

  if (typeof message === 'string') return message;

  if (typeof message === 'object') {
    // message 객체에 description이 있는 경우
    if (message.description) return message.description;

    // message 객체에 message 속성이 있는 경우
    if (message.message) return message.message;

    // 객체를 문자열로 변환 시도
    try {
      return JSON.stringify(message);
    } catch (e) {
      return '오류가 발생했습니다.';
    }
  }

  return String(message);
};

/**
 * 알림 설정을 표준화하는 함수
 * @param {string|object} config - 알림 설정 또는 메시지
 * @returns {object} 표준화된 알림 설정
 */
const normalizeConfig = (config) => {
  if (typeof config === 'string') {
    return {
      message: '알림',
      description: config,
    };
  }

  if (typeof config === 'object') {
    return {
      message: getMessageString(config.message) || '알림',
      description: getMessageString(config.description) || '',
    };
  }

  return {
    message: '알림',
    description: getMessageString(config),
  };
};

export const notification = {
  success: (config) => {
    const normalizedConfig = normalizeConfig(config);
    alert(`✅ ${normalizedConfig.message}\n${normalizedConfig.description}`);
  },

  error: (config) => {
    const normalizedConfig = normalizeConfig(config);
    alert(`❌ ${normalizedConfig.message}\n${normalizedConfig.description}`);
  },

  warning: (config) => {
    const normalizedConfig = normalizeConfig(config);
    alert(`⚠️ ${normalizedConfig.message}\n${normalizedConfig.description}`);
  },

  info: (config) => {
    const normalizedConfig = normalizeConfig(config);
    alert(`ℹ️ ${normalizedConfig.message}\n${normalizedConfig.description}`);
  },
};
