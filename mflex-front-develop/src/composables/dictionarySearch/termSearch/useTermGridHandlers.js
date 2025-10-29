// composables/dictionarySearch/termSearch/useTermGridHandlers.js
import { ref } from 'vue';
import {
  getNewColumnState,
  handleSortChange,
  firstRowSelectedEvent,
  getResearchQuery,
} from './useTermGrid.js';
import { addTermGridData } from '../useTermSearch.js';
import { getTermViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';

import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';

export function useTermGridHandlers() {
  const handleSetGridApi = (gridApiRef) => (params) => {
    gridApiRef.value = params;
  };

  const handleColumnStateChanged =
    (columnDefs, gridApi, uiStore) => (newColumnState) => {
      console.log('컬럼 이동 핸들러 동작 ====');
      const newColumnFcDefs = getNewColumnState(columnDefs, newColumnState);
      gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
      columnDefs.value = newColumnFcDefs;

      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage.MFGRD017 = newColumnFcDefs;
      saveGridInfoToStorage(gridStorage);
      uiStore.setGridColumnDefs('MFGRD017', newColumnFcDefs);
    };

  const handleSortChanged = (params) => async (newSortedState) => {
    const {
      useMetaMngInstId,
      useDctnryId,
      termDictionarySearchCode,
      termQuery,
      columnDefs,
      resultCount,
      rowData,
      agGrid,
    } = params;

    try {
      const sortParams = {
        useMetaMngInstId,
        useDctnryId,
        termDictionarySearchCode: termDictionarySearchCode.value,
        termQuery,
        columnDefs: columnDefs.value,
      };

      const result = await handleSortChange(
        newSortedState,
        sortParams,
        resultCount
      );

      if (result.success) {
        rowData.value = result.data;
        firstRowSelectedEvent(rowData, agGrid);
        console.log('Sort applied successfully:', result.sortQuery);
      } else {
        console.error('Sort operation failed:', result.error);
      }
    } catch (error) {
      console.error('Error in handleSortChanged:', error);
    }
  };

  const handleScrollChanged = (params) => (endScrollStaus) => {
    const {
      useMetaMngInstId,
      useDctnryId,
      columnDefs,
      rowData,
      termQuery,
      termDictionarySearchCode,
      addGridRowData,
    } = params;

    try {
      if (endScrollStaus === 'Y' && rowData.value != null) {
        const termResearchQuery = getResearchQuery(
          useMetaMngInstId,
          useDctnryId,
          columnDefs.value,
          rowData,
          termQuery,
          termDictionarySearchCode
        );
        addGridRowData(termResearchQuery);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    handleSetGridApi,
    handleColumnStateChanged,
    handleSortChanged,
    handleScrollChanged,
  };
}
