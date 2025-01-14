// src/features/codebook/services/cacheService.js

// 캐시 설정
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 기본 5분
  STORAGE_KEY_PREFIX: 'codebook_cache_',
};

// 메모리 캐시
const memoryCache = new Map();

class CacheService {
  constructor() {
    // 브라우저 새로고침해도 캐시 유지를 위해 sessionStorage 사용
    this.storage = window.sessionStorage;
    this.initializeFromStorage();
  }

  // sessionStorage에서 캐시 초기화
  initializeFromStorage() {
    Object.keys(this.storage).forEach((key) => {
      if (key.startsWith(CACHE_CONFIG.STORAGE_KEY_PREFIX)) {
        try {
          const value = JSON.parse(this.storage.getItem(key));
          if (this.isValid(value)) {
            const codeType = key.replace(CACHE_CONFIG.STORAGE_KEY_PREFIX, '');
            memoryCache.set(codeType, value);
          } else {
            this.storage.removeItem(key);
          }
        } catch (e) {
          console.warn('Invalid cache entry:', e);
          this.storage.removeItem(key);
        }
      }
    });
  }

  // 캐시 유효성 검사
  isValid(cacheEntry) {
    if (!cacheEntry || !cacheEntry.timestamp || !cacheEntry.data) {
      return false;
    }
    return Date.now() - cacheEntry.timestamp < CACHE_CONFIG.DEFAULT_TTL;
  }

  // 캐시 데이터 가져오기
  get(codeType) {
    // 먼저 메모리 캐시 확인
    const memoryData = memoryCache.get(codeType);
    if (memoryData && this.isValid(memoryData)) {
      return memoryData.data;
    }

    // 메모리에 없으면 sessionStorage 확인
    const storageKey = CACHE_CONFIG.STORAGE_KEY_PREFIX + codeType;
    const storageData = this.storage.getItem(storageKey);
    if (storageData) {
      try {
        const parsedData = JSON.parse(storageData);
        if (this.isValid(parsedData)) {
          memoryCache.set(codeType, parsedData);
          return parsedData.data;
        }
        // 만료된 데이터는 삭제
        this.storage.removeItem(storageKey);
      } catch (e) {
        console.warn('Error parsing cache:', e);
        this.storage.removeItem(storageKey);
      }
    }

    return null;
  }

  // 캐시 데이터 저장
  set(codeType, data) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };

    // 메모리 캐시에 저장
    memoryCache.set(codeType, cacheEntry);

    // sessionStorage에 저장
    const storageKey = CACHE_CONFIG.STORAGE_KEY_PREFIX + codeType;
    try {
      this.storage.setItem(storageKey, JSON.stringify(cacheEntry));
    } catch (e) {
      console.warn('Error saving to cache:', e);
    }
  }

  // 특정 코드타입의 캐시 삭제
  remove(codeType) {
    memoryCache.delete(codeType);
    const storageKey = CACHE_CONFIG.STORAGE_KEY_PREFIX + codeType;
    this.storage.removeItem(storageKey);
  }

  // 전체 캐시 삭제
  clear() {
    memoryCache.clear();
    Object.keys(this.storage).forEach((key) => {
      if (key.startsWith(CACHE_CONFIG.STORAGE_KEY_PREFIX)) {
        this.storage.removeItem(key);
      }
    });
  }
}

export const cacheService = new CacheService();
