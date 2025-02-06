// src/shared/hooks/useTeamItems.js
import { useState, useEffect } from 'react';
import { api } from '../api/api';
/**
 * 팀과 매출품목 데이터를 관리하는 커스텀 훅
 *
 * @example
 * // 1. 기본 사용 (팀과 아이템 모두 조회)
 * const { teams, items, isLoading } = useTeamItems({
 *   classificationId: 1
 * });
 *
 * // 2. 팀 데이터만 조회
 * const { teams } = useTeamItems({
 *   include: ['teams']
 * });
 *
 * // 3. 분류ID 변경시 데이터 재조회
 * const { items, refetch } = useTeamItems({
 *   enabled: false
 * });
 *
 * useEffect(() => {
 *   if (codebook?.sfa_classification?.id) {
 *     refetch({
 *       classificationId: codebook.sfa_classification.id
 *     });
 *   }
 * }, [codebook.sfa_classification]);
 *
 */
export const useTeamItems = (options = {}) => {
  const {
    classificationId: initialClassificationId,
    enabled = true,
    include = ['teams', 'items'],
  } = options;

  const [classificationId, setClassificationId] = useState(
    initialClassificationId,
  );
  const [teams, setTeams] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 팀 데이터 조회
   */
  const fetchTeams = async () => {
    try {
      const response = await api.getTeams();
      setTeams(response);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setTeams([]);
      throw err;
    }
  };

  /**
   * 매출품목 데이터 조회
   */
  const fetchItems = async (id) => {
    if (!id) {
      setItems([]);
      return;
    }

    try {
      const response = await api.getSfaItems(id);
      setItems(response);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setItems([]);
      throw err;
    }
  };

  /**
   * 모든 데이터 조회
   */
  const fetchData = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchPromises = [];

      if (include.includes('teams')) {
        fetchPromises.push(fetchTeams());
      }

      if (include.includes('items')) {
        fetchPromises.push(fetchItems());
      }

      await Promise.all(fetchPromises);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // classificationId나 enabled 값이 변경될 때 데이터 재조회
  useEffect(() => {
    fetchData();
  }, [classificationId, enabled]);

  return {
    teams,
    items,
    isLoading,
    error,
    refetch: fetchData,
  };
};
