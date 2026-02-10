/**
 * BizRadar Discovery Dummy Data
 */

export const DISCOVERY_DATA = [
  {
    id: 1,
    classification: 'A',
    status: 'New',
    title: '[긴급] 2026년 지역특화 콘텐츠 개발 지원사업 공고',
    agency: '경남테크노파크',
    dDay: 'D-5',
    deadline: '2026-02-14',
    confidence: 'High',
    budget: {
      total: '3억원',
      maxSupport: '1억원',
    },
    tags: ['#미디어아트', '#홍보영상', '#최대1억'],
    reason: '영상 콘텐츠 제작 과업이 포함되어 있으며, 예산 규모가 적절하여 Type A로 분류함.',
    content: `
      1. 사업개요
      ㅇ 사 업 명 : 2026년 지역특화 콘텐츠 개발 지원사업
      ㅇ 사업목적 : 지역 고유의 문화자원을 활용한 콘텐츠 개발 지원
      ㅇ 지원규모 : 과제당 최대 1억원
      
      2. 지원내용
      ㅇ 지원대상 : 도내 콘텐츠 기업
      ㅇ 지원분야 : 실감형 콘텐츠, 영상, 게임 등
      
      3. 신청방법
      ㅇ 접수기간 : ~ 2026. 02. 14(금) 17:00
    `,
  },
  {
    id: 2,
    category: 'B',
    status: 'New',
    title: '공공데이터 활용 비즈니스 창출 지원사업',
    agency: '한국지능정보사회진흥원',
    dDay: 'D-12',
    deadline: '2026-02-21',
    confidence: 'Medium',
    budget: {
      total: '5억원',
      maxSupport: '5천만원',
    },
    tags: ['#공공데이터', '#앱개발', '#스타트업'],
    reason: '공공데이터 활용 요건이 있으나, 개발 역량 부합하여 Type B로 분류함.',
    content: `
      1. 사업개요
      ㅇ 사 업 명 : 공공데이터 활용 비즈니스 창출 지원사업
      
      2. 지원자격
      ㅇ 공공데이터를 활용한 비즈니스 모델을 보유한 기업
    `,
  },
  {
    id: 3,
    category: 'C',
    status: 'New',
    title: '2026년 스마트공장 보급확산 사업',
    agency: '중소벤처기업부',
    dDay: 'D-20',
    deadline: '2026-03-01',
    confidence: 'Low',
    budget: {
      total: '100억원',
      maxSupport: '2억원',
    },
    tags: ['#스마트공장', '#MES', '#ERP'],
    reason: '제조업 대상 사업으로 당사 주력 분야와 거리가 있어 Type C로 분류함.',
    content: `
      1. 사업개요
      ㅇ 사 업 명 : 2026년 스마트공장 보급확산 사업
    `,
  },
  {
    id: 4,
    classification: 'A',
    status: 'New',
    title: 'AI 바우처 지원사업 공급기업 모집 공고',
    agency: '정보통신산업진흥원',
    dDay: 'D-3',
    deadline: '2026-02-12',
    confidence: 'High',
    budget: {
      total: '200억원',
      maxSupport: '3억원',
    },
    tags: ['#AI솔루션', '#바우처', '#공급기업'],
    reason: 'AI 솔루션 공급 기업 모집으로, 당사 솔루션 등록 필수.',
    content: `
      1. 사업개요
      ㅇ 사 업 명 : AI 바우처 지원사업
    `,
  },
  {
    id: 5,
    category: 'B',
    status: 'New',
    title: '비대면 서비스 바우처 수요기업 모집',
    agency: '창업진흥원',
    dDay: 'D-30',
    deadline: '2026-03-11',
    confidence: 'Medium',
    budget: {
      total: '50억원',
      maxSupport: '400만원',
    },
    tags: ['#비대면', '#재택근무', '#화상회의'],
    reason: '수요기업 모집 건이나, 추후 공급기업 전환 가능성 있음.',
    content: `
      1. 사업개요
      ㅇ 사 업 명 : 비대면 서비스 바우처
    `,
  },
  {
    id: 6,
    category: 'D',
    status: 'New',
    title: '중소기업 해외 진출 역량 강화 지원사업',
    agency: 'KOTRA',
    dDay: 'D-15',
    deadline: '2026-02-24',
    confidence: 'Low',
    budget: {
      total: '10억원',
      maxSupport: '3천만원',
    },
    tags: ['#해외진출', '#수출지원'],
    reason: '분야가 모호하여 재검토가 필요한 건으로 Cat D로 분류함.',
    content: `
      1. 사업개요
      ㅇ 사 업 명 : 중소기업 해외 진출 지원
    `,
  },
  {
    id: 7,
    category: 'F',
    status: 'New',
    title: '2026년 농어촌 주거환경 개선 사업 모집',
    agency: '농림축산식품부',
    dDay: 'D-25',
    deadline: '2026-03-06',
    confidence: 'Low',
    budget: {
      total: '500억원',
      maxSupport: '1천만원',
    },
    tags: ['#농어촌', '#환경개선'],
    reason: '당사 사업 분야와 전혀 무관함(농어촌 주거환경).',
    content: `
      1. 사업개요
      ㅇ 사 업 명 : 농어촌 주거환경 개선
    `,
  },
];
