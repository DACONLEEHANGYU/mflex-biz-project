// composables/useGridIds.js
import { computed } from 'vue';
import { useGridIdsStore } from '@/stores/gridIds';

export function useGridIds() {
  const gridIdsStore = useGridIdsStore();

  // 편의 함수들
  const getDictionarySearchGrids = computed(
    () => gridIdsStore.getDictionarySearchGridIds
  );

  const getUserManagementGrids = computed(
    () => gridIdsStore.getUserManagementGridIds
  );

  const getSystemManagementGrids = computed(
    () => gridIdsStore.getSystemManagementGridIds
  );

  // 특정 그리드 ID 가져오기
  const getGridId = (category, gridName) => {
    return gridIdsStore.getGridId(category, gridName);
  };

  // 모든 그리드 ID 가져오기
  const getAllGridIds = computed(() => gridIdsStore.getAllGridIds);

  // 그리드 정보 찾기
  const findGridInfo = (gridId) => {
    return gridIdsStore.findGridInfo(gridId);
  };

  return {
    // Getters
    getDictionarySearchGrids,
    getUserManagementGrids,
    getSystemManagementGrids,
    getAllGridIds,

    // Methods
    getGridId,
    findGridInfo,
  };
}
