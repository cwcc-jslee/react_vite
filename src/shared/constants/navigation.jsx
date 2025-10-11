// src/shared/constants/navigation.js
import {
  FaHome,
  FaChartLine,
  FaBriefcase,
  FaAddressBook,
  FaProjectDiagram,
  FaUsers,
  FaUserFriends,
  FaTable,
  FaChartBar,
  FaThLarge,
} from 'react-icons/fa';
import { MdContacts, MdViewKanban, MdTimeline } from 'react-icons/md';
import { RiTimeLine } from 'react-icons/ri';
import { LuListTodo } from 'react-icons/lu';

// 사이드바 메뉴 항목
export const SIDEBAR_ITEMS = [
  {
    id: 'sfa',
    path: '/sfa',
    label: 'SFA',
    icon: <FaChartLine className="h-5 w-5" />,
  },
  {
    id: 'project',
    path: '/project',
    label: 'PROJECT',
    icon: <FaProjectDiagram className="h-5 w-5" />,
  },
  {
    id: 'todo',
    path: '/todo',
    label: 'ToDo',
    icon: <LuListTodo className="h-5 w-5" />,
  },
  {
    id: 'customer',
    path: '/customer',
    label: 'CUSTOMER',
    icon: <FaUsers className="h-5 w-5" />,
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'CONTACT',
    icon: <FaAddressBook className="h-5 w-5" />,
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
        label: '프로젝트',
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
      utilization: {
        label: '투입률',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'utilization',
          sections: {
            projectCharts: false,
            projectListTable: false,
            projectAddForm: false,
            projectDetailTable: false,
            projectTaskBoard: false,
            utilizationCharts: true,
          },
          components: {
            utilizationDashboard: true,
          },
          drawer: {
            visible: false,
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
            projectCharts: false,
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
      task: {
        label: 'TASK',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'task',
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
      work: {
        label: 'WORK',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'work',
          sections: {
            projectCharts: true,
            projectListTable: true,
            projectAddForm: false,
            projectDetailTable: false,
            projectTaskBoard: false,
          },
          components: {
            // projectChart: true,
            // projectTable: true,
            // projectAddSection: false,
          },
          drawer: {
            visible: false, // 드로어 표시 여부
          },
        },
      },

      detail: {
        label: '상세정보',
        permissions: ['user'],
        visible: false,
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
      // search: {
      //   label: '상세조회',
      //   permissions: ['user'],
      //   visible: true,
      //   config: {
      //     layout: 'search',
      //     sections: {
      //       customerHeader: true,
      //       customerSearchForm: true,
      //       customerTable: true,
      //     },
      //     components: {
      //       customerTable: true,
      //       //   searchForm: false,
      //     },
      //     drawer: {
      //       visible: false, // 드로어 표시 여부
      //     },
      //   },
      // },
    },
  },
  // ToDo
  todo: {
    defaultMenu: 'todayTasks',
    items: {
      todayTasks: {
        label: '오늘할일',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'todayTasks',
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
      searchTasks: {
        label: '할일검색',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'todayTasks',
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
      recentWork: {
        label: '최근작업',
        permissions: ['user'],
        visible: true,
        config: {
          layout: 'recentWork',
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
        icon: <FaTable className="h-5 w-5" />,
      },
      board: {
        label: '보드',
        icon: <FaThLarge className="h-5 w-5" />,
      },
      work: {
        label: '작업',
        icon: <FaUserFriends className="h-5 w-5" />,
      },
      timeline: {
        label: '타임라인',
        icon: <RiTimeLine className="h-5 w-5" />,
      },
      chart: {
        label: '차트',
        icon: <FaChartBar className="h-5 w-5" />,
      },
    },
  },
  // 필요한 경우 다른 페이지의 하위 메뉴도 추가 가능
  // sfaDetail: { ... }
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
