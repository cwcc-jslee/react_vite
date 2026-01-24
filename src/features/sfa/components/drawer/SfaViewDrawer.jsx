/**
 * SFA(Sales Force Automation) 상세보기/수정 전용 Drawer 컴포넌트입니다.
 * 섹션별 컨텍스트 편집 방식을 사용하여 기본정보와 결제매출을 독립적으로 수정할 수 있습니다.
 * - 기본정보 섹션: "수정하기" 버튼으로 인라인 편집 활성화
 * - 결제매출 섹션: "매출내역 추가" / "매출내역 수정" 버튼으로 기능 분리
 */

import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { Drawer, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';
import { useQuery } from '@tanstack/react-query';
import { projectApiService } from '@features/project/services/projectApiService.js';
import { useProjectStore } from '@features/project/hooks/useProjectStore.js';
import {
  hasCreatePermission,
  hasUpdatePermission,
  hasDeletePermission,
} from '@shared/utils/permissionUtils';

// 섹션 컴포넌트 import
import DrawerActionsMenu from './sections/DrawerActionsMenu.jsx';
import BasicInfoSection from './sections/BasicInfoSection.jsx';
import PaymentListSection from './sections/PaymentListSection.jsx';
import ProjectRelationSection from './sections/ProjectRelationSection.jsx';
import PaymentEditDrawer from './PaymentEditDrawer.jsx';
import TeamSalesEditDrawer from './TeamSalesEditDrawer.jsx';
import RevenueSummaryCard from '../../../../shared/components/cards/RevenueSummaryCard.jsx';
import { CircleDollarSign, Briefcase } from 'lucide-react';

const SfaViewDrawer = React.memo(
  ({ drawer }) => {
    const { visible, data: initialData } = drawer;
    const { close } = useDrawer();
    const { actions: sfaActions } = useSfaStore();

    // Redux store에서 최신 상세 데이터 구독
    const sfaDetail = useSelector((state) => state.sfa.sfaDetail);

    // 사용자 권한 정보 조회
    // state.auth.user 구조: { jwt, user: { ...userInfo, user_access_control } }
    // ⚠️ user_access_control은 snake_case로 저장됨 (API 응답 그대로)
    const authUser = useSelector((state) => state.auth.user);
    const userAccessControl = authUser?.user?.user_access_control;

    // SFA 페이지 권한 체크
    const sfaPermissions = useMemo(() => ({
      canCreate: hasCreatePermission(userAccessControl, 'sfa'),
      canUpdate: hasUpdatePermission(userAccessControl, 'sfa'),
      canDelete: hasDeletePermission(userAccessControl, 'sfa'),
    }), [userAccessControl]);

    // 화면에 표시할 데이터 결정 (Store 데이터 우선 사용)
    const data = (sfaDetail && initialData && String(sfaDetail.id) === String(initialData.id)) 
      ? sfaDetail 
      : initialData;

    // 프로젝트 상세 조회를 위한 ProjectStore 액션
    const { actions: projectActions } = useProjectStore();

    // ==================== 탭 상태 관리 ====================
    const [activeTab, setActiveTab] = React.useState('payment'); // 'payment' | 'project'

    // ==================== 연계 프로젝트 데이터 조회 (Lazy Loading) ====================
    const { 
      data: projectsData, 
      isLoading: isProjectsLoading,
      error: projectsError 
    } = useQuery({
      queryKey: ['projects', 'sfa', data?.id],
      queryFn: () => projectApiService.getProjectsBySfaId(data?.id),
      enabled: !!data?.id && data?.isProject && activeTab === 'project',
      staleTime: 1000 * 60 * 5, // 5분
    });

    const projects = projectsData?.data || [];

    // 프로젝트 여부에 따른 탭 제어
    React.useEffect(() => {
      if (!data?.isProject && activeTab === 'project') {
        setActiveTab('payment');
      }
    }, [data?.isProject, activeTab]);

    // ==================== 섹션별 편집 상태 관리 ====================
    const [editingSection, setEditingSection] = React.useState(null); // 'base' | null
    const [paymentMode, setPaymentMode] = React.useState('view'); // 'view' | 'add' | 'edit' | 'delete'
    const [editingPaymentId, setEditingPaymentId] = React.useState(null);

    // ==================== 결제매출 Drawer 상태 관리 ====================
    const [paymentDrawer, setPaymentDrawer] = React.useState({
      visible: false,
      mode: null, // 'add' | 'edit'
      payment: null, // 수정할 payment 데이터
    });

    const [teamSalesDrawerVisible, setTeamSalesDrawerVisible] = React.useState(false);

    // ==================== 기본정보 편집 핸들러 ====================
    const handleStartEditBase = () => {
      // 결제매출 편집 중이면 경고
      if (paymentMode !== 'view') {
        const shouldContinue = window.confirm(
          `결제매출 ${
            paymentMode === 'add' ? '추가' : '수정'
          } 모드입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?`,
        );
        if (!shouldContinue) return;

        // 결제매출 모드 초기화
        setPaymentMode('view');
        sfaActions.form.updateField('sfaDraftPayments', []);
      }

      setEditingSection('base');
    };

    const handleFinishEditBase = () => {
      setEditingSection(null);
    };

    const handleCancelEditBase = () => {
      setEditingSection(null);
    };

    // ==================== 사업부 매출 수정 핸들러 ====================
    const handleStartEditTeamSales = () => {
      // 1. 기본정보 편집 확인
      if (editingSection === 'base') {
        const shouldContinue = window.confirm(
          '기본정보를 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?',
        );
        if (!shouldContinue) return;
        setEditingSection(null);
      }

      // 2. 결제매출 편집 모드 확인
      if (paymentMode === 'edit' || paymentMode === 'delete') {
        const shouldContinue = window.confirm(
          `결제매출 ${
            paymentMode === 'edit' ? '수정' : '삭제'
          } 모드입니다.\n모드를 종료하고 사업부 매출을 수정하시겠습니까?`,
        );
        if (!shouldContinue) return;
        setPaymentMode('view');
      }

      setTeamSalesDrawerVisible(true);
    };

    // ==================== 결제매출 Drawer 핸들러 ====================
    const openPaymentDrawer = (mode, payment = null) => {
      // 기본정보 편집 중이면 경고
      if (editingSection === 'base') {
        const shouldContinue = window.confirm(
          '기본정보를 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?',
        );
        if (!shouldContinue) return;

        // 기본정보 편집 종료
        setEditingSection(null);
      }

      setPaymentDrawer({
        visible: true,
        mode,
        payment,
      });
    };

    const closePaymentDrawer = () => {
      setPaymentDrawer({
        visible: false,
        mode: null,
        payment: null,
      });
    };

    const handlePaymentDrawerSave = async () => {
      // Drawer 닫기만 수행 (모드 변경 없음)
      closePaymentDrawer();
    };

    // ==================== 결제매출 편집 핸들러 (헤더 메뉴용) ====================
    const handleStartAddPayment = () => {
      // 탭 전환 (결제매출 탭으로)
      setActiveTab('payment');

      // 기본정보 편집 중이면 경고
      if (editingSection === 'base') {
        const shouldContinue = window.confirm(
          '기본정보를 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?',
        );
        if (!shouldContinue) return;

        // 기본정보 편집 종료
        setEditingSection(null);
      }

      // 결제매출 수정/삭제 모드이면 경고 후 종료
      if (paymentMode === 'edit' || paymentMode === 'delete') {
        const shouldContinue = window.confirm(
          `결제매출 ${
            paymentMode === 'edit' ? '수정' : '삭제'
          } 모드입니다.\n모드를 종료하고 매출내역을 추가하시겠습니까?`,
        );
        if (!shouldContinue) return;
        setPaymentMode('view');
      }

      // PaymentEditDrawer 열기 (add 모드)
      openPaymentDrawer('add', null);
    };

    const handleStartEditPayment = () => {
      setActiveTab('payment');
      
      // 기본정보 편집 중이면 경고
      if (editingSection === 'base') {
        const shouldContinue = window.confirm(
          '기본정보를 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?',
        );
        if (!shouldContinue) return;

        // 기본정보 편집 종료
        setEditingSection(null);
      }
      setPaymentMode('edit');
    };

    const handleStartDeletePayment = () => {
      setActiveTab('payment');

      // 기본정보 편집 중이면 경고
      if (editingSection === 'base') {
        const shouldContinue = window.confirm(
          '기본정보를 편집 중입니다.\n저장하지 않은 변경사항이 있을 수 있습니다.\n계속하시겠습니까?',
        );
        if (!shouldContinue) return;

        // 기본정보 편집 종료
        setEditingSection(null);
      }
      setPaymentMode('delete');
    };

    const handlePaymentModeChange = (newMode) => {
      setPaymentMode(newMode);

      // view 모드로 돌아갈 때 초안 초기화
      if (newMode === 'view') {
        sfaActions.form.updateField('sfaDraftPayments', []);
      }
    };

    // ==================== 프로젝트 연동 핸들러 ====================
    const handleConnectProject = () => {
      alert('프로젝트 연결 기능 준비중입니다.');
    };

    const handleCreateProject = () => {
      alert('프로젝트 생성 기능 준비중입니다.');
    };

    // 프로젝트 상세 보기 핸들러 (디버깅용 로그 추가)
    const handleViewProjectDetail = (projectId) => {
      console.log('🖱️ [SfaViewDrawer] 프로젝트 상세 보기 클릭:', projectId);
      if (projectId) {
        projectActions.detail.fetchDetailForDrawer(projectId);
      } else {
        console.warn('⚠️ [SfaViewDrawer] 유효하지 않은 프로젝트 ID:', projectId);
      }
    };

    // ==================== 메뉴 액션 핸들러 ====================
    const handleDelete = async () => {
      try {
        console.log('=== SFA 삭제 시작 ===');
        console.log('삭제 대상 데이터:', data);
        console.log('매출정보:', data?.sfaByPayments);

        // sfaByPayments 배열 존재 확인
        if (data?.sfaByPayments && data.sfaByPayments.length > 0) {
          window.alert(
            '⚠️ 경고\n\n모든 결제매출 정보를 먼저 삭제해야 합니다.\n\n현재 등록된 결제매출: ' +
              data.sfaByPayments.length +
              '건',
          );
          console.log('=== 삭제 취소: 매출정보 존재 ===');
          return;
        }

        // 삭제 확인 메시지
        if (
          !window.confirm(
            '🗑️ SFA 삭제 확인\n\n정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.\n\n건명: ' +
              (data.name || '-'),
          )
        ) {
          console.log('=== 삭제 취소: 사용자 취소 ===');
          return;
        }

        const sfaId = data.documentId;
        const formData = { is_deleted: true };

        console.log('삭제 요청 - ID:', sfaId);
        console.log('삭제 요청 - 데이터:', formData);

        await sfaSubmitService.updateSfaBase(sfaId, formData);

        console.log('=== SFA 삭제 성공 ===');

        close();

        setTimeout(() => {
          alert('✅ 삭제가 완료되었습니다.');
        }, 100);
      } catch (error) {
        console.error('=== SFA 삭제 실패 ===');
        console.error('에러 내용:', error);
        alert('❌ 삭제 중 오류가 발생했습니다.\n\n' + (error.message || ''));
      }
    };

    const handleCopy = () => {
      alert('구현 예정');
    };

    // 수정 모드 취소 핸들러
    const handleCancelEditMode = () => {
      if (
        window.confirm(
          '수정을 취소하시겠습니까?\n저장하지 않은 변경사항은 사라집니다.',
        )
      ) {
        setEditingSection(null);
      }
    };

    const handleCancelPaymentEditMode = () => {
      if (
        window.confirm(
          '수정을 취소하시겠습니까?\n저장하지 않은 변경사항은 사라집니다.',
        )
      ) {
        setPaymentMode('view');
      }
    };

    // ==================== 렌더링 ====================
    return (
      <Drawer
        visible={visible}
        title={
          <div className="flex items-center gap-2">
            <span>SFA 상세정보</span>
            {editingSection === 'base' && (
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded border border-blue-300">
                  기본정보 수정중
                </span>
                <button
                  onClick={handleCancelEditMode}
                  className="p-1 rounded hover:bg-red-50 transition-colors group"
                  title="수정 취소"
                >
                  <X className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            )}
            {paymentMode === 'edit' && (
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded border border-blue-300">
                  결제매출 수정중
                </span>
                <button
                  onClick={handleCancelPaymentEditMode}
                  className="p-1 rounded hover:bg-red-50 transition-colors group"
                  title="수정 취소"
                >
                  <X className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            )}
          </div>
        }
        onClose={close}
        width={DRAWER_SIZES.XL}
        enableOverlayClick={false}
        mode="view"
        animationEnabled={true}
        headerActions={
          <DrawerActionsMenu
            onDelete={handleDelete}
            onCopy={handleCopy}
            onEditBase={handleStartEditBase}
            isEditingBase={editingSection === 'base'}
            onEditTeamSales={handleStartEditTeamSales}
            onAddPayment={handleStartAddPayment}
            onEditPayment={handleStartEditPayment}
            onDeletePayment={handleStartDeletePayment}
            paymentMode={paymentMode}
            permissions={sfaPermissions}
          />
        }
      >
        <div className="space-y-6">
          {/* 1. 기본 정보 섹션 (고정) */}
          <BasicInfoSection
            data={data}
            isEditing={editingSection === 'base'}
            onStartEdit={handleStartEditBase}
            onFinishEdit={handleFinishEditBase}
            onCancelEdit={handleCancelEditBase}
            onSaveField={() => setEditingSection(null)}
            showBox={false}
          />

          {/* 2. 매출정보 요약 카드 (고정) */}
          <RevenueSummaryCard
            sfaByPayments={data?.sfaByPayments || []}
            sfaByItems={data?.sfaByItems || []}
          />

          {/* 3. 탭 메뉴 (Tab Menu) */}
          <div className="border-b border-gray-200">
            <div className="flex items-center -mb-px space-x-6">
              <button
                onClick={() => setActiveTab('payment')}
                className={`
                  flex items-center gap-2 pb-3 px-1 border-b-2 text-sm font-medium transition-colors
                  ${activeTab === 'payment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <CircleDollarSign className="h-4 w-4" />
                결제매출
                <span className={`
                  ml-1 py-0.5 px-2 rounded-full text-xs
                  ${activeTab === 'payment' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                `}>
                  {data?.sfaByPayments?.length || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  if (data?.isProject) {
                    setActiveTab('project');
                  }
                }}
                disabled={!data?.isProject}
                className={`
                  flex items-center gap-2 pb-3 px-1 border-b-2 text-sm font-medium transition-colors
                  ${!data?.isProject ? 'cursor-not-allowed opacity-40 border-transparent text-gray-400' : 
                    activeTab === 'project'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                title={!data?.isProject ? '프로젝트 여부가 YES인 경우에만 활성화됩니다.' : ''}
              >
                <Briefcase className="h-4 w-4" />
                연계 프로젝트
                {data?.isProject && (
                  <span className={`
                    ml-1 py-0.5 px-2 rounded-full text-xs
                    ${activeTab === 'project' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {data?.projects?.length || projects.length || 0}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 4. 상세 컨텐츠 영역 (가변) */}
          <div className="min-h-[300px]">
            {activeTab === 'payment' ? (
              <PaymentListSection
                data={data}
                mode={paymentMode}
                onModeChange={handlePaymentModeChange}
                onOpenPaymentDrawer={openPaymentDrawer}
                editingPaymentId={editingPaymentId}
                setEditingPaymentId={setEditingPaymentId}
                showBox={false}
              />
            ) : (
              <ProjectRelationSection
                data={data}
                projects={projects}
                isLoading={isProjectsLoading}
                error={projectsError}
                onViewDetail={handleViewProjectDetail}
                onCreateProject={handleCreateProject}
                showBox={false}
              />
            )}
          </div>
        </div>

        {/* 결제매출 추가/수정 Drawer */}
        <PaymentEditDrawer
          visible={paymentDrawer.visible}
          mode={paymentDrawer.mode}
          data={data}
          payment={paymentDrawer.payment}
          onClose={closePaymentDrawer}
          onSave={handlePaymentDrawerSave}
        />

        {/* 사업부 매출 수정 Drawer */}
        <TeamSalesEditDrawer
          visible={teamSalesDrawerVisible}
          data={data}
          onClose={() => setTeamSalesDrawerVisible(false)}
        />
      </Drawer>
    );
  },
  (prevProps, nextProps) => {
    // React.memo 비교 함수
    const prevDrawer = prevProps.drawer;
    const nextDrawer = nextProps.drawer;

    const isEqual =
      prevDrawer.visible === nextDrawer.visible &&
      prevDrawer.data === nextDrawer.data;

    return isEqual;
  },
);

SfaViewDrawer.displayName = 'SfaViewDrawer';

export default SfaViewDrawer;
