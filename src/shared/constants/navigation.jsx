// src/shared/constants/navigation.js

// 사이드바 메뉴 항목
export const SIDEBAR_ITEMS = [
  {
    id: 'home',
    path: '/',
    label: 'HOME',
    permissions: ['user'],
    // icon: 'home',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    id: 'sfa',
    path: '/sfa',
    label: 'SFA',
    permissions: ['user'],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'customer',
    path: '/customer',
    label: 'CUSTOMER',
    permissions: ['user'],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'CONTACT',
    permissions: ['user'],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    ),
  },
  {
    id: 'project',
    path: '/project',
    label: 'PROJECT',
    permissions: ['user'],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2h10v10H4V5zm2 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  // 나머지 메뉴 항목들...
];

// 메뉴 리스트
export const PAGE_MENUS = {
  // 페이지별 상단 메뉴
  sfa: {
    defaultMenu: 'list',
    items: {
      list: {
        label: '현황',
        permissions: ['user'],
        visible: true, // 메뉴 표시 여부
        config: {
          layout: 'list', // 레이아웃 타입
          sections: {
            sfaHeader: true,
            sfaMonthlyStatus: true,
            sfaContent: true,
          },
          components: {
            monthlyStatus: true,
            sfaTable: true,
            searchForm: false,
            forecastTable: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
      search: {
        label: '상세조회',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'search',
          sections: {
            sfaHeader: true,
            sfaSearchForm: true,
            sfaContent: true,
          },
          components: {
            monthlyStatus: false,
            sfaTable: true,
            searchForm: true,
            forecastTable: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
      forecast: {
        label: '매출예측',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'forecast',
          sections: {
            sfaHeader: true,
            sfaForecast: true,
            sfaContent: true,
          },
          components: {
            monthlyStatus: false,
            sfaTable: true,
            searchForm: false,
            forecastTable: true,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
    },
  },
  //
  project: {
    defaultMenu: 'list',
    items: {
      list: {
        label: '현황',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'list',
          sections: {
            projectCharts: true,
            projectListTable: true,
            projectAddForm: false,
            projectDetailTable: false,
            projectTaskBoard: false,
          },
          components: {
            projectChart: true,
            projectTable: true,
            projectAddSection: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
      // add: {
      //   label: '등록',
      //   permissions: ['user'],
      //   config: {
      //     components: {
      //       projectChart: false,
      //       projectTable: false,
      //       projectAddSection: true,
      //     },
      //     drawer: {
      //       visible: false, // 드로어 표시 여부
      //     },
      //   },
      // },
      detail: {
        label: '상세정보',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'detail',
          sections: {
            projectDetailTable: true,
            projectTaskBoard: true,
            projectCharts: false,
            projectListTable: false,
            projectAddForm: false,
          },
          components: {
            projectChart: false,
            projectTable: false,
            projectAddSection: false,
            projectDetailContainer: true,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
    },
  },
  // CUSTOMER
  customer: {
    defaultMenu: 'list',
    items: {
      list: {
        label: '현황',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'list',
          sections: {
            customerHeader: true,
            customerTable: true,
            customerDetail: false,
          },
          components: {
            customerTable: true,
            //   searchForm: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
      search: {
        label: '상세조회',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'search',
          sections: {
            customerHeader: true,
            customerSearchForm: true,
            customerTable: true,
          },
          components: {
            customerTable: true,
            //   searchForm: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
    },
  },
  // CONTACT
  contact: {
    defaultMenu: 'list',
    items: {
      list: {
        label: '현황',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'list',
          sections: {
            contactHeader: true,
            contactSearch: true,
            contactTable: true,
            contactExcel: false,
          },
          components: {
            contactSearchForm: true,
            contactTable: true,
            contactExcelUpload: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
      search: {
        label: '상세조회',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'search',
          sections: {
            contactHeader: true,
            contactSearch: true,
            contactTable: true,
            contactExcel: false,
          },
          components: {
            contactSearchForm: true,
            contactTable: true,
            contactExcelUpload: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },
    },
  },
};

// 페이지별 하위 메뉴 정의
export const PAGE_SUB_MENUS = {
  // 프로젝트 상세 페이지의 하위 메뉴
  projectDetail: {
    defaultSubMenu: 'table', // 기본 하위 메뉴
    items: {
      table: {
        label: '테이블',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
              clipRule="evenodd"
            />
          </svg>
        ),
        config: {
          sections: {
            projectDetailTableSection: true,
            projectTaskTable: true,
            projectTaskBoard: false,
            projectTaskTimeline: false,
            projectTaskChart: false,
            projectTaskMembers: false,
          },
          components: {},
        },
      },
      board: {
        label: '보드',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
        config: {
          sections: {
            projectDetailTableSection: true,
            projectTaskTable: false,
            projectTaskBoard: true,
            projectTaskTimeline: false,
            projectTaskChart: false,
            projectTaskMembers: false,
          },
          components: {},
        },
      },
      timeline: {
        label: '타임라인',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        ),
        config: {
          sections: {
            projectDetailTableSection: true,
            projectTaskTable: false,
            projectTaskBoard: false,
            projectTaskTimeline: true,
            projectTaskChart: false,
            projectTaskMembers: false,
          },
          components: {},
        },
      },
      chart: {
        label: '차트',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        ),
        config: {
          sections: {
            projectDetailTableSection: true,
            projectTaskTable: false,
            projectTaskBoard: false,
            projectTaskTimeline: false,
            projectTaskChart: true,
            projectTaskMembers: false,
          },
          components: {},
        },
      },
      members: {
        label: '구성원',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
        ),
        config: {
          sections: {
            projectDetailTableSection: true,
            projectTaskTable: false,
            projectTaskBoard: false,
            projectTaskTimeline: false,
            projectTaskChart: false,
            projectTaskMembers: true,
          },
          components: {},
        },
      },
    },
  },
  // 필요한 경우 다른 페이지의 하위 메뉴도 추가 가능
  // sfaDetail: { ... }
};

// 메인 메뉴와 하위 메뉴의 매핑 관계
export const MENU_SUB_MENU_MAPPING = {
  project: {
    detail: 'projectDetail', // 'project' 페이지의 'detail' 메뉴는 'projectDetail' 하위 메뉴 사용
  },
};

// 각 페이지의 기본 메뉴 ID 정의
export const DEFAULT_MENU_IDS = {
  project: 'default',
  customer: 'view',
  sfa: 'list',
  // 기타 페이지...
};

// 각 페이지의 기본 레이아웃 정의
export const DEFAULT_LAYOUTS = {
  project: 'list',
  customer: 'list',
  sfa: 'list',
  contact: 'list',
  // 기타 페이지...
};
