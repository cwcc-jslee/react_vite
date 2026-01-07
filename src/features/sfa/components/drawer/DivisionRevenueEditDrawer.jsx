// src/features/sfa/components/drawer/DivisionRevenueEditDrawer.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Drawer, DRAWER_SIZES } from '@shared/components/drawer';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { sfaSubmitService } from '../../services/sfaSubmitService.js';
import { transformToDBFields } from '../../utils/transformUtils';
import SfaEditItemForm from '../forms/SfaEditItemForm.jsx';
import { useCodebook } from '@shared/hooks/useCodebook';

const DivisionRevenueEditDrawer = ({ visible, data, onClose, onSave }) => {
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
        amount: item.amount ?? item.itemPrice ?? '',
      }));
      actions.form.updateField('sfaDraftItems', draftItems);
    }
  }, [visible, data, actions.form]);

  const handleSave = async (updatedItems) => {
    try {
      const sfaId = data.documentId;
      // Transform to DB format
      const transformedItems = transformToDBFields.transformSalesByItems(updatedItems);
      const formData = {
        sfa_by_items: transformedItems,
      };

      await sfaSubmitService.updateSfaBase(sfaId, formData);
      
      // Refresh data
      await actions.data.fetchSfaDetail(data.id);
      
      if (onSave) onSave();
      onClose();
      alert('✅ 사업부 매출이 수정되었습니다.');
    } catch (error) {
      console.error('사업부 매출 저장 실패:', error);
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

DivisionRevenueEditDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default DivisionRevenueEditDrawer;