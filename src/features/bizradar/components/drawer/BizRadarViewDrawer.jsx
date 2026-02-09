import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Edit } from 'lucide-react';
import { closeDrawer } from '@/store/slices/uiSlice';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import { Drawer, DrawerMenu } from '@shared/components/drawer_new';
import {
  hasUpdatePermission,
  hasDeletePermission,
} from '@shared/utils/permissionUtils';

// 섹션 컴포넌트
import BizInfoSection from './sections/BizInfoSection';
import ReviewActionPanel from './sections/ReviewActionPanel';

const BizRadarViewDrawer = ({ visible, mode, data, onClose }) => {
  const dispatch = useDispatch();
  const { actions, filters } = useBizRadarStore();

  // 권한 정보 조회
  const authUser = useSelector((state) => state.auth.user);
  const userAccessControl = authUser?.user?.user_access_control;

  const permissions = useMemo(() => ({
    canUpdate: hasUpdatePermission(userAccessControl, 'bizradar'),
    canDelete: hasDeletePermission(userAccessControl, 'bizradar'),
  }), [userAccessControl]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 리뷰/편집 데이터 상태
  const [localType, setLocalType] = useState('');
  const [localNote, setLocalNote] = useState('');

  // 데이터 초기화
  useEffect(() => {
    if (data) {
      setLocalType(data.confirmed_category || data.confirmedCategory || data.analyzed_category || data.analyzedCategory || '');
      setLocalNote(data.review_note || data.reviewNote || '');
    }
  }, [data]);

  if (!visible || !data) return null;

  // 리뷰 확정 처리
  const handleReviewAction = async (newStatus) => {
    setIsSubmitting(true);
    try {
      await actions.data.confirm(data.id, {
        review_status: newStatus,
        confirmed_category: localType,
        notes: localNote
      });

      const currentFilterType = filters?.type || 'A,B,C,D';
      actions.data.fetchList({ type: currentFilterType });
      dispatch(closeDrawer());
    } catch (err) {
      console.error('Review action failed:', err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 공고를 삭제하시겠습니까?')) return;
    try {
      await actions.data.update(data.id, { is_deleted: true });
      actions.data.fetchList({ type: filters?.type || 'A,B,C,D' });
      dispatch(closeDrawer());
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // 상단 액션 메뉴 설정
  const menuItems = [
    {
      key: 'edit',
      label: '수정하기',
      icon: Edit,
      onClick: () => alert('수정 기능 준비중입니다.'),
      requiredPermission: 'update',
      disabled: !permissions.canUpdate
    },
    {
      key: 'delete',
      label: '삭제하기',
      icon: Trash2,
      onClick: handleDelete,
      className: 'text-red-500 hover:bg-red-50',
      requiredPermission: 'delete',
      disabled: !permissions.canDelete
    }
  ];

  return (
    <Drawer
      visible={visible}
      title={mode === 'review' ? 'AI 분석 결과 검토' : '공고 상세 정보'}
      width="LG"
      onClose={onClose}
      headerActions={
        <DrawerMenu
          type="dropdown"
          items={menuItems.filter(item => {
            if (item.key === 'edit') return permissions.canUpdate;
            if (item.key === 'delete') return permissions.canDelete;
            return true;
          })}
        />
      }
      footer={
        mode === 'review' ? (
          <ReviewActionPanel
            localType={localType}
            setLocalType={setLocalType}
            localNote={localNote}
            setLocalNote={setLocalNote}
            isSubmitting={isSubmitting}
            onAction={handleReviewAction}
            canReview={permissions.canUpdate}
          />
        ) : null
      }
    >
      <BizInfoSection data={data} />
    </Drawer>
  );
};

export default BizRadarViewDrawer;
