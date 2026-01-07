// src/features/sfa/components/drawer/TeamSalesEditDrawer.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Drawer, DRAWER_SIZES } from '@shared/components/drawer';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';
import { transformToDBFields } from '../../utils/transformUtils';
import SfaEditItemForm from '../forms/SfaEditItemForm.jsx';
import { useCodebook } from '@shared/hooks/useCodebook';
import { apiService } from '@shared/api/apiService';

const TeamSalesEditDrawer = ({ visible, data, onClose, onSave }) => {
  const { actions, form } = useSfaStore();

  // Codebook needed for SfaEditItemForm
  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'sfaSalesType',
    'sfaClassification',
    'sfaItemType',
    'fy',
  ]);

  // Initialize draft items when visible becomes true
  useEffect(() => {
    if (visible && data?.sfaByItems) {
      // Copy existing items to draft
      const draftItems = (data.sfaByItems || []).map((item) => ({
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        teamId: item.teamId,
        teamName: item.teamName,
      }));
      actions.form.updateField('sfaDraftItems', draftItems);
    }
  }, [visible, data, actions.form]);

  /**
   * 저장 핸들러
   * @param {Array} updatedItems - 수정된 사업부/품목 목록
   * @param {Array} updatedPayments - 수정된 결제매출 할당 정보 목록
   */
  const handleSave = async (updatedItems, updatedPayments = []) => {
    try {
      const sfaId = data.documentId;
      
      // 1. 사업부/품목 정보 업데이트
      const transformedItems = transformToDBFields.transformSalesByItems(updatedItems);
      
      // 사업부 수량에 따라 isMultiTeam 값 결정
      const isMultiTeam = updatedItems.length > 1;

      const sfaBaseData = {
        sfa_by_items: transformedItems,
        is_multi_team: isMultiTeam, // 수량 기반으로 자동 설정
      };
      await sfaSubmitService.updateSfaBase(sfaId, sfaBaseData);

      // 2. 결제매출 할당 정보 업데이트 (있는 경우)
      if (updatedPayments.length > 0) {
        const updatePromises = updatedPayments.map(payment => {
          const paymentId = payment.id;
          const processedPayment = transformToDBFields.transformSalesByPaymentsEdit(payment);
          
          // team_allocations 키만 추출하여 전송
          const updateData = {
            team_allocations: processedPayment.team_allocations
          };
          
          return apiService.put(`/sfa-by-payment-withhistory/${paymentId}`, updateData);
        });
        await Promise.all(updatePromises);
      }
      
      // Refresh data
      await actions.data.fetchSfaDetail(data.id);
      
      if (onSave) onSave();
      onClose();
      alert('✅ 사업부 매출 및 결제 할당 정보가 수정되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('❌ 저장 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleCancel = () => {
    if (window.confirm('저장하지 않은 변경사항이 사라집니다. 취소하시겠습니까?')) {
      actions.form.updateField('sfaDraftItems', []);
      onClose();
    }
  };

  return (
    <Drawer
      visible={visible}
      title="사업부 매출 수정"
      onClose={handleCancel}
      width={DRAWER_SIZES.LG}
      level="secondary"
      enableOverlayClick={false}
      showCloseButton={true}
      animationEnabled={true}
      zIndex={60}
    >
      <div className="p-4">
        <SfaEditItemForm 
          data={form.data.sfaDraftItems}
          sfaByPayments={data?.sfaByPayments || []} // 결제매출 목록 전달
          onSave={handleSave}
          onCancel={handleCancel}
          codebooks={codebooks}
          isLoadingCodebook={isLoadingCodebook}
          isEditing={true}
          sfaClassificationId={data?.sfaClassification?.id}
        />
      </div>
    </Drawer>
  );
};

TeamSalesEditDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default TeamSalesEditDrawer;
