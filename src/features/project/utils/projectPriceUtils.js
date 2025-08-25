/**
 * @file projectPriceUtils.js
 * @description 프로젝트 금액 계산 관련 유틸리티 함수들
 */

/**
 * 프로젝트의 사업부/서비스 정보와 SFA 데이터에서 일치하는 항목의 금액을 계산
 * @param {Object} projectData - 프로젝트 데이터
 * @param {Object} projectData.team - 사업부 정보 (id, name)
 * @param {Object} projectData.service - 서비스 정보 (id, name)
 * @param {Object} projectData.sfa - SFA 데이터
 * @param {Array} projectData.sfa.sfaByItems - SFA 항목 배열
 * @returns {number} - 계산된 프로젝트 금액
 */
export const calculateProjectPrice = (projectData) => {
  // 필요한 데이터가 없으면 0 반환
  if (!projectData?.sfa?.sfaByItems || !Array.isArray(projectData.sfa.sfaByItems)) {
    return 0;
  }

  const { team, service, sfa } = projectData;
  const sfaByItems = sfa.sfaByItems;

  // team과 service 정보가 없으면 0 반환
  if (!team || !service) {
    return 0;
  }

  let totalPrice = 0;

  // sfaByItems 배열을 순회하면서 team과 service가 일치하는 항목들의 itemPrice 합계
  sfaByItems.forEach((item) => {
    // team 매칭 (id 또는 name으로)
    const teamMatched = 
      (team.id && item.teamId && team.id === item.teamId) ||
      (team.name && item.teamName && team.name === item.teamName);

    // service 매칭 (id 또는 name으로)  
    const serviceMatched =
      (service.id && item.itemId && service.id === item.itemId) ||
      (service.name && item.itemName && service.name === item.itemName);

    // team과 service 모두 일치하는 경우 itemPrice 합산
    if (teamMatched && serviceMatched) {
      totalPrice += item.itemPrice || 0;
    }
  });

  return totalPrice;
};

/**
 * 프로젝트 금액을 형식화하여 문자열로 반환
 * @param {number} price - 프로젝트 금액
 * @returns {string} - 형식화된 금액 문자열
 */
export const formatProjectPrice = (price) => {
  if (!price || price === 0) {
    return '-';
  }

  return `${price.toLocaleString()}원`;
};

/**
 * 프로젝트 금액과 관련된 상세 정보를 반환
 * @param {Object} projectData - 프로젝트 데이터
 * @returns {Object} - 프로젝트 금액 관련 상세 정보
 */
export const getProjectPriceDetails = (projectData) => {
  const totalPrice = calculateProjectPrice(projectData);
  const formattedPrice = formatProjectPrice(totalPrice);

  // 매칭된 항목들 추출
  const matchedItems = [];
  
  if (projectData?.sfa?.sfaByItems && Array.isArray(projectData.sfa.sfaByItems)) {
    const { team, service, sfa } = projectData;
    
    if (team && service) {
      sfa.sfaByItems.forEach((item) => {
        const teamMatched = 
          (team.id && item.teamId && team.id === item.teamId) ||
          (team.name && item.teamName && team.name === item.teamName);

        const serviceMatched =
          (service.id && item.itemId && service.id === item.itemId) ||
          (service.name && item.itemName && service.name === item.itemName);

        if (teamMatched && serviceMatched) {
          matchedItems.push({
            itemId: item.itemId,
            itemName: item.itemName,
            teamId: item.teamId,
            teamName: item.teamName,
            itemPrice: item.itemPrice,
            formattedPrice: formatProjectPrice(item.itemPrice)
          });
        }
      });
    }
  }

  return {
    totalPrice,
    formattedPrice,
    matchedItems,
    hasMatchedItems: matchedItems.length > 0
  };
};

/**
 * 프로젝트 금액 유효성 검사
 * @param {Object} projectData - 프로젝트 데이터
 * @returns {Object} - 유효성 검사 결과
 */
export const validateProjectPriceData = (projectData) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // 프로젝트 데이터 확인
  if (!projectData) {
    validation.isValid = false;
    validation.errors.push('프로젝트 데이터가 없습니다');
    return validation;
  }

  // SFA 데이터 확인
  if (!projectData.sfa) {
    validation.warnings.push('SFA 데이터가 없습니다');
  } else if (!projectData.sfa.sfaByItems || !Array.isArray(projectData.sfa.sfaByItems)) {
    validation.warnings.push('SFA 항목 데이터가 없거나 올바르지 않습니다');
  }

  // team 정보 확인
  if (!projectData.team) {
    validation.warnings.push('사업부 정보가 없습니다');
  }

  // service 정보 확인
  if (!projectData.service) {
    validation.warnings.push('서비스 정보가 없습니다');
  }

  return validation;
};