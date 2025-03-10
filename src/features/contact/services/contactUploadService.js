// src/features/contact/services/contactUploadService.js
/**
 * 담당자 대량 등록 관련 서비스
 * Excel을 통한 담당자 일괄 등록 API 통신 및 데이터 처리
 */

import { notification } from '../../../shared/services/notification';
import { createContact } from './contactSubmitService';
import { apiService } from '../../../shared/api/apiService';

// 배치 크기 정의 (한 번에 처리할 항목 수)
const BATCH_SIZE = 50;

/**
 * 담당자 데이터에서 고객사 정보를 매핑하는 함수
 * 고객사 정보가 없는 경우에도 담당자 정보는 그대로 유지
 *
 * @param {Array} contacts - 담당자 데이터 배열
 * @returns {Promise<Object>} { mappedContacts, customerMappingResult }
 */
export const mapCustomersToContacts = async (contacts) => {
  try {
    // 1. 고객사가 있는 담당자와 없는 담당자 분리
    const contactsWithCompany = contacts.filter(
      (contact) =>
        contact.customer &&
        typeof contact.customer === 'string' &&
        contact.customer.trim() !== '',
    );

    const contactsWithoutCompany = contacts.filter(
      (contact) =>
        !contact.customer ||
        typeof contact.customer !== 'string' ||
        contact.customer.trim() === '',
    );

    console.log(
      `총 ${contacts.length}명의 담당자 중 ${contactsWithCompany.length}명은 고객사 정보 있음, ${contactsWithoutCompany.length}명은 고객사 정보 없음`,
    );

    // 고객사 정보가 있는 담당자가 없는 경우 바로 결과 반환
    if (contactsWithCompany.length === 0) {
      return {
        mappedContacts: contacts, // 원본 데이터 그대로 반환
        customerMappingResult: {
          totalCustomers: 0,
          mappedCustomers: 0,
          unmappedCustomers: 0,
          mappingDetails: [],
          contactsWithoutCompany: contactsWithoutCompany.length,
        },
      };
    }

    // 2. 고유한 회사명 목록 추출
    const uniqueCompanyNames = [
      ...new Set(contactsWithCompany.map((contact) => contact.customer)),
    ];

    // 3. 고객사 매핑 결과 저장용 객체
    const customerMappingResult = {
      totalCustomers: uniqueCompanyNames.length,
      mappedCustomers: 0,
      unmappedCustomers: 0,
      mappingDetails: [],
      contactsWithoutCompany: contactsWithoutCompany.length,
    };

    // 4. 글로벌 캐시 객체 생성 (함수 외부에 선언하여 재사용 가능)
    if (!window.customerCache) {
      window.customerCache = {};
    }

    // 5. 이미 캐시된 고객사 필터링
    const cachedCompanies = uniqueCompanyNames.filter(
      (name) => window.customerCache[name.toLowerCase()],
    );

    const companiesToFetch = uniqueCompanyNames.filter(
      (name) => !window.customerCache[name.toLowerCase()],
    );

    console.log(
      `총 ${uniqueCompanyNames.length}개 회사 중 ${cachedCompanies.length}개는 캐시됨, ${companiesToFetch.length}개 조회 필요`,
    );

    // 6. 아직 캐시되지 않은 고객사는 개별 API 호출
    if (companiesToFetch.length > 0) {
      // 진행 상황 출력용 카운터
      let processedCount = 0;

      // 각 회사명마다 개별 API 호출
      for (const companyName of companiesToFetch) {
        try {
          // 진행 상황 로깅 (20% 단위)
          processedCount++;
          if (
            processedCount %
              Math.max(1, Math.floor(companiesToFetch.length / 5)) ===
              0 ||
            processedCount === companiesToFetch.length
          ) {
            const percentage = Math.round(
              (processedCount / companiesToFetch.length) * 100,
            );
            console.log(
              `고객사 조회 진행 중: ${processedCount}/${companiesToFetch.length} (${percentage}%)`,
            );
          }

          // Strapi REST API 형식에 맞는 필터링 쿼리
          const response = await apiService.get('/customers', {
            params: {
              filters: {
                name: {
                  $eq: companyName,
                },
              },
            },
          });

          if (
            response.data &&
            response.data.data &&
            response.data.data.length > 0
          ) {
            const customer = response.data.data[0]; // 첫 번째 매칭 결과 사용
            window.customerCache[companyName.toLowerCase()] = customer;
          } else {
            console.log(`회사 "${companyName}"에 대한 검색 결과가 없습니다.`);

            // 검색 결과가 없는 경우 캐시에 빈 문자열 저장
            window.customerCache[companyName.toLowerCase()] = '';
          }
        } catch (error) {
          console.error(`Failed to fetch company: ${companyName}`, error);
        }

        // 선택적: API 요청 간에 약간의 지연 추가 (서버 부하 방지)
        if (processedCount < companiesToFetch.length) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms 지연
        }
      }
    }

    // 7. 고객사 매핑 결과 생성
    uniqueCompanyNames.forEach((companyName) => {
      const key = companyName.toLowerCase();
      const mappedCustomer = window.customerCache[key];

      customerMappingResult.mappingDetails.push({
        companyName,
        mapped: !!mappedCustomer,
        customerId: mappedCustomer?.id,
        source: cachedCompanies.includes(companyName) ? '캐시됨' : '새로 조회',
      });

      if (mappedCustomer) {
        customerMappingResult.mappedCustomers++;
      } else {
        customerMappingResult.unmappedCustomers++;
      }
    });

    // 8. 담당자 데이터에 고객사 객체 매핑 (고객사가 있는 경우만)
    const mappedContactsWithCompany = contactsWithCompany.map((contact) => {
      if (contact.customer) {
        const key = contact.customer.toLowerCase();
        const mappedCustomer = window.customerCache[key];

        if (mappedCustomer) {
          return {
            ...contact,
            customer: mappedCustomer.id,
            // customerId: mappedCustomer.id,
          };
        } else {
          // 검색 결과가 없는 경우 customer 필드를 빈 문자열로 설정
          return {
            ...contact,
            customer: '',
          };
        }
      }
      // 회사명은 있지만 매핑된 고객사가 없는 경우 원본 데이터 반환
      return contact;
    });

    // 9. 고객사 정보가 없는 담당자와 매핑된 담당자 합치기
    const mappedContacts = [
      ...mappedContactsWithCompany,
      ...contactsWithoutCompany,
    ];

    // 10. 매핑된 담당자 데이터와 매핑 결과 반환
    return {
      mappedContacts,
      customerMappingResult,
    };
  } catch (error) {
    console.error('Failed to map customers:', error);
    // 오류가 있어도 원본 데이터 반환
    return {
      mappedContacts: contacts,
      customerMappingResult: {
        totalCustomers: 0,
        mappedCustomers: 0,
        unmappedCustomers: 0,
        mappingDetails: [],
        contactsWithoutCompany: contacts.filter(
          (c) => !c.customer || c.customer === '',
        ).length,
        error: error.message,
      },
    };
  }
};

/**
 * 배치 단위로 담당자 데이터 처리
 * @param {Array} contacts - 처리할 담당자 데이터 배열
 * @param {number} batchSize - 배치 크기
 * @param {Function} progressCallback - 진행 상황 콜백 함수
 * @returns {Promise<Object>} 처리 결과
 */
const processBatch = async (contacts, batchSize, progressCallback = null) => {
  const results = {
    totalCount: contacts.length,
    successCount: 0,
    failCount: 0,
    successItems: [],
    failedItems: [],
    emptyCustomerCount: 0,
  };

  // 배치 단위로 분할하여 처리
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, Math.min(i + batchSize, contacts.length));
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1} (${i} - ${
        i + batch.length - 1
      } of ${contacts.length})`,
    );

    // 현재 배치의 진행률 계산
    const currentProgress = Math.round(
      ((i + batch.length) / contacts.length) * 100,
    );

    // 각 배치 내의 항목 처리
    for (const contact of batch) {
      try {
        // 불필요한 메타데이터 필드 제거
        const { _rowIndex, ...contactData } = contact;

        // 고객사 정보가 없는 경우 확인
        if (
          !contactData.customer ||
          (typeof contactData.customer === 'string' &&
            contactData.customer.trim() === '')
        ) {
          // 고객사 관련 필드를 제거 또는 null로 설정
          delete contactData.customer;
          delete contactData.customerId;
          results.emptyCustomerCount++;
        }

        // API 호출하여 담당자 등록
        console.log(`>>contactData : `, contactData);
        const response = await createContact(contactData);

        if (response && response.success) {
          results.successCount++;
          results.successItems.push({
            rowIndex: _rowIndex,
            id: response.data.id,
            fullName: contact.fullName,
          });
        } else {
          results.failCount++;
          results.failedItems.push({
            rowIndex: _rowIndex,
            fullName: contact.fullName,
            error: '등록 실패',
          });
        }
      } catch (error) {
        results.failCount++;
        results.failedItems.push({
          rowIndex: _rowIndex,
          fullName: contact.fullName,
          error: error.message || '등록 중 오류 발생',
        });
      }
    }

    // 진행 상황 콜백 호출 (있는 경우)
    if (progressCallback) {
      progressCallback(currentProgress, {
        processed: i + batch.length,
        total: contacts.length,
        successCount: results.successCount,
        failCount: results.failCount,
        emptyCustomerCount: results.emptyCustomerCount,
      });
    }

    // 배치 처리 완료 후 알림 (옵션)
    if (
      (i + batch.length) % (batchSize * 2) === 0 ||
      i + batch.length === contacts.length
    ) {
      notification.info({
        message: '담당자 일괄 등록 진행 중',
        description: `총 ${contacts.length}건 중 ${
          i + batch.length
        }건 처리 완료 (${results.successCount}건 성공)`,
        duration: 3,
      });
    }
  }

  return results;
};

/**
 * Excel에서 업로드한 담당자 데이터를 배치 단위로 등록
 * @param {Array} contactsData - 등록할 담당자 데이터 배열
 * @param {Function} progressCallback - 진행 상황 콜백 함수
 * @returns {Promise<Object>} 등록 결과
 */
export const uploadContactsInBatches = async (
  contactsData,
  progressCallback = null,
) => {
  try {
    // 1. 고객사 정보 매핑 (캐시 활용)
    const { mappedContacts, customerMappingResult } =
      await mapCustomersToContacts(contactsData);

    // 고객사 매핑 결과 출력
    console.log('===== 고객사 매핑 결과 =====');
    console.log(
      `총 ${customerMappingResult.totalCustomers}개 회사 중 ${customerMappingResult.mappedCustomers}개 매핑 성공, ${customerMappingResult.unmappedCustomers}개 매핑 실패`,
    );
    console.log('매핑 세부 정보:', customerMappingResult.mappingDetails);

    // 2. 배치 단위로 처리
    const results = await processBatch(
      mappedContacts,
      BATCH_SIZE,
      progressCallback,
    );

    // 3. 결과에 고객사 매핑 정보 추가
    results.customerMapping = customerMappingResult;

    // 4. 결과에 따른 알림 표시
    if (results.successCount > 0) {
      let successMessage = `총 ${results.totalCount}건 중 ${results.successCount}건 등록 성공`;

      if (results.emptyCustomerCount > 0) {
        successMessage += ` (고객사 없이 등록된 담당자: ${results.emptyCustomerCount}명)`;
      }

      notification.success({
        message: '담당자 일괄 등록 완료',
        description: successMessage,
      });
    }

    if (results.failCount > 0) {
      notification.warning({
        message: '일부 담당자 등록 실패',
        description: `${results.failCount}건의 등록에 실패했습니다.`,
      });
    }

    return results;
  } catch (error) {
    notification.error({
      message: '담당자 일괄 등록 실패',
      description: error.message || '담당자 등록 중 오류가 발생했습니다.',
    });

    throw error;
  }
};

/**
 * 기존 함수 이름 유지 (하위 호환성)
 */
// export const uploadContactsFromExcel = uploadContactsInBatches;

/**
 * 고객사 캐시 정보 반환
 * @returns {Object} 현재 캐시된 고객사 정보
 */
export const getCustomerCacheInfo = () => {
  if (!window.customerCache) {
    return { cacheSize: 0, companies: [] };
  }

  const companies = Object.values(window.customerCache);
  return {
    cacheSize: companies.length,
    companies: companies.map((c) => ({ id: c.id, name: c.name })),
  };
};

/**
 * 고객사 캐시 초기화
 */
export const clearCustomerCache = () => {
  window.customerCache = {};
  return { cleared: true, message: '고객사 캐시가 초기화되었습니다.' };
};

/**
 * 담당자 대량 등록 결과 보고서 생성
 * @param {Object} results - 등록 결과 데이터
 * @returns {Blob} Excel 파일 Blob
 */
export const generateResultReport = (results) => {
  // Excel 라이브러리 구현 필요
};

export default {
  uploadContactsInBatches,
  // uploadContactsFromExcel,
  mapCustomersToContacts,
  generateResultReport,
  clearCustomerCache,
};
