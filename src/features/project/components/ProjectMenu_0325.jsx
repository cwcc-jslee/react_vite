// src/features/project/components/ProjectMenu.jsx
import React, { useState } from 'react';
import {
  Group,
  Button,
  Input,
  Select,
} from '../../../shared/components/ui/index';
import { useProject } from '../context/ProjectProvider';

/**
 * 프로젝트트 메뉴 컴포넌트
 * @component
 * @description 매출 관련 주요 기능에 대한 네비게이션 메뉴를 제공합니다.
 * - 매출등록: 새로운 매출 정보를 등록하는 드로어를 엽니다.
 * - 상세조회: 매출 데이터의 상세 검색 화면으로 전환합니다.
 * - 매출예측: 매출 예측 분석 화면으로 전환합니다.
 * - 초기화: 모든 필터를 초기화하고 기본 화면으로 돌아갑니다.
 */
// const ProjectMenu = () => {
//   const { setLayout, setDrawer, resetFilters } = useProject();

//   return (
//     <Group direction="horizontal" spacing="sm" className="mb-1 mt-1 py-1">
//       <Button variant="outline" onClick={() => setLayout('default')}>
//         현황
//       </Button>
//       <Button variant="outline" onClick={() => setLayout('projectadd')}>
//         등록
//       </Button>
//       {/* <Button
//         variant="outline"
//         // onClick={() => setDrawer({ visible: true, baseMode: 'add' })}
//       >
//         상세조회
//       </Button> */}
//       {/* <Button
//         variant="outline"
//         // onClick={() => setDrawer({ visible: true, baseMode: 'add' })}
//       >
//         참여율
//       </Button> */}
//     </Group>
//   );
// };

// export default ProjectMenu;

const ProjectMenu = () => {
  const { setLayout, setDrawer, resetFilters } = useProject();
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  /**
   * 등록 버튼 클릭 핸들러
   * @description 등록 화면으로 전환하고 추가 필드를 표시합니다.
   */
  const handleRegisterClick = () => {
    setLayout('projectadd');
    setShowAdditionalFields(true);
  };

  /**
   * 현황 버튼 클릭 핸들러
   * @description 현황 화면으로 전환하고 추가 필드를 숨깁니다.
   */
  const handleStatusClick = () => {
    setLayout('default');
    setShowAdditionalFields(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row items-center justify-between">
        {/* 주 메뉴 버튼 그룹 */}
        <Group direction="horizontal" spacing="sm" className="mb-1 mt-1 py-1">
          <Button
            variant="outline"
            onClick={handleStatusClick}
            className="px-4 py-2"
          >
            현황
          </Button>
          <Button
            variant="outline"
            onClick={handleRegisterClick}
            className="px-4 py-2"
          >
            등록
          </Button>
          <div className="h-8 w-px bg-gray-300 mx-2"></div>{' '}
          {/* 시각적 분리선 */}
          <Button variant="outline" className="px-4 py-2 opacity-70" disabled>
            상세조회
          </Button>
          <Button variant="outline" className="px-4 py-2 opacity-70" disabled>
            참여율
          </Button>
        </Group>

        {/* 추가 필드 영역 - 등록 모드일 때만 표시 */}
        {showAdditionalFields && (
          <div className="flex items-center space-x-6 ml-6 py-1">
            <div className="flex items-center">
              <span className="text-sm font-medium w-12 text-right mr-2">
                고객사
              </span>
              <Input placeholder="고객사 입력" className="w-48 h-9" />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium w-12 text-right mr-2">
                SFA
              </span>
              <Select
                options={[
                  { value: 'sfa1', label: 'SFA 1' },
                  { value: 'sfa2', label: 'SFA 2' },
                  { value: 'sfa3', label: 'SFA 3' },
                ]}
                placeholder="SFA 선택"
                className="w-48 h-9"
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium w-12 text-right mr-2">
                템플릿
              </span>
              <Select
                options={[
                  { value: 'template1', label: '템플릿 1' },
                  { value: 'template2', label: '템플릿 2' },
                  { value: 'template3', label: '템플릿 3' },
                ]}
                placeholder="템플릿 선택"
                className="w-48 h-9"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMenu;
