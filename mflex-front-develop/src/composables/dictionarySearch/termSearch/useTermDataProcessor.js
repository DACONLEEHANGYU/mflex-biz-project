// composables/dictionarySearch/termSearch/useTermDataProcessor.js
import {
  getSortQuery,
  addTermGridData,
  pushTermSearchData,
} from '../useTermSearch.js';
import { getTermViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';

import { firstRowSelectedEvent } from './useTermGrid.js';

export function useTermDataProcessor() {
  const getTermRowData = (getTermSearchResult, resultCount) => {
    try {
      console.log('getTermRowData ===================', getTermSearchResult);
      const terms = getTermSearchResult.data.items;
      resultCount.value.count = Number(getTermSearchResult.data.searchCount);
      resultCount.value.total = Number(getTermSearchResult.data.totalCount);
      return pushTermSearchData(terms);
    } catch (error) {
      console.error(error);
    }
  };

  const updateGridData = (params) => async (termQuery) => {
    const {
      useMetaMngInstId,
      useDctnryId,
      termDictionarySearchCode,
      columnDefs,
      rowData,
      agGrid,
      resultCount,
    } = params;

    const termResearchQuery = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      dictionarySearchCode: termDictionarySearchCode.value,
      query: termQuery.query,
      sort: getSortQuery(columnDefs.value),
    };

    const getTermSearchResult = await getTermViewSearch(termResearchQuery);
    const initTermRowData = getTermRowData(getTermSearchResult, resultCount);
    rowData.value = initTermRowData;
    firstRowSelectedEvent(rowData, agGrid);
  };

  const addGridRowData = (params) => async (termResearchQuery) => {
    const {
      rowData,
      agGrid,
      termQuery,
      useDctnryId,
      currentRowIndex,
      resultCount,
    } = params;

    try {
      let oldGridData = rowData.value;
      const lastRowIndex = oldGridData.length - 1;
      const lastRowNode =
        agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
      console.log('마지막 node ===========', lastRowNode);

      const lastItem =
        rowData.value.length > 0
          ? rowData.value[rowData.value.length - 1]
          : null;

      termQuery.dictionaryId = useDctnryId;
      termQuery.domainName = lastItem.domainName[0].label;
      termQuery.termName = lastItem.termName[0].label;
      termQuery.termAbbreviationName = lastItem.termEngAbbreviationName;
      termQuery.termDictionaryId = lastItem.dctnryId;

      console.log('termResearchQuery ===', termResearchQuery);

      const reLoadTermData = await getTermViewSearch(termResearchQuery);
      const terms = reLoadTermData.data.items;
      const newGridData = addTermGridData(terms, oldGridData.length);

      rowData.value = [...oldGridData, ...newGridData];
      resultCount.value.count = Number(rowData.value.length);

      const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
      currentRowIndex.value = lastVisibleRowIndex;
      agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
    } catch (error) {
      console.error(error);
    }
  };

  const serarchDataBinding = (params) => (termResearchResultData) => {
    const { resultCount, rowData, agGrid, emit, setTermViewSelectData } =
      params;

    console.log('serarchDataBinding 실행 ====');
    if (termResearchResultData.status != 200) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
      emit('row-selected', null);
      setTermViewSelectData(null);
    } else {
      resultCount.value.count = Number(termResearchResultData.data.searchCount);
      resultCount.value.total = Number(termResearchResultData.data.totalCount);
    }
    const terms = termResearchResultData.data.items;
    const termSearchGridData = pushTermSearchData(terms);
    rowData.value = termSearchGridData;
    firstRowSelectedEvent(rowData, agGrid);
  };

  return {
    getTermRowData,
    updateGridData,
    addGridRowData,
    serarchDataBinding,
  };
}
