// composables/dictionarySearch/domainSearch/useDomainSearchData.js
import { nextTick } from 'vue';
import { getDomainSearchV2 } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
import {
  pushDomainSearchData,
  addDomainGridData,
} from '@/composables/dictionarySearch/useDomainSearch.js';
import { bindingDomainGridData } from '@/utils/mflexApi/dictionarySearchApi';

export function useDomainSearchData() {
  // 그리드 데이터 할당
  const fetchData = (params) => async (domainResearchQuery) => {
    const {
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      rowData,
      resultCount,
      emit,
      setDomainViewSelectData,
      firstRowSelectedEvent,
      selectNode,
    } = params;

    console.log('domainResearchQuery : ', domainResearchQuery);

    // 헤더 데이터삭제 및 초기화 시
    if (domainResearchQuery.domainId === undefined) {
      domainResearchQuery.domainId = '0도메인사전';
      domainResearchQuery.treeDomainDictionaryId = 0;
    }

    const domainData = await getDomainSearchV2(domainResearchQuery);

    if (domainData.status === 409) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
      emit('row-selected', null);
      setDomainViewSelectData(null);
      rowData.value = [];
      return;
    } else {
      resultCount.value.count = Number(domainData.searchCount).toLocaleString();
      resultCount.value.total = Number(domainData.totalCount).toLocaleString();
    }

    const domain = domainData.items;
    const domainGridData = pushDomainSearchData(domain, selectNode.value);
    rowData.value = domainGridData;

    firstRowSelectedEvent();
  };

  const firstRowSelectedEvent = (params) => () => {
    const { rowData, agGrid, setDomainViewSelectData } = params;

    if (rowData.value.length > 0) {
      nextTick(() => {
        const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
        const nodesWithRowId0 = document.querySelector('[row-id="0"]');
        console.log('nodeWithRowId0 ========', nodesWithRowId0);

        if (nodesWithRowId0) {
          nodesWithRowId0.classList.add('ag-row-selected');
          nodesWithRowId0.classList.add('ag-row-focus');
          nodesWithRowId0.setAttribute('aria-selected', true);
        }

        if (firstRowData) {
          setDomainViewSelectData(firstRowData.data);
        }
      });
    }
  };

  // 도메인 그리드 데이터 추가 함수 (매개변수 검증 추가)
  const addGridRowData = (params) => async (researchQuery) => {
    const { rowData, agGrid, currentRowIndex, resultCount } = params;

    // 매개변수 유효성 검사
    if (!currentRowIndex) {
      console.error('currentRowIndex is not defined in addGridRowData');
      return;
    }

    console.log('currentRowIndex : ', currentRowIndex);
    console.log('currentRowIndex.value : ', currentRowIndex.value);

    try {
      let oldGridData = rowData.value;
      const lastRowIndex = oldGridData.length - 1;
      const lastRowNode =
        agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);

      const lastItem =
        rowData.value.length > 0
          ? rowData.value[rowData.value.length - 1]
          : null;
      console.log('lastItem =============', lastItem);

      const reloadDomainData = await getDomainSearchV2(researchQuery);
      const domains = reloadDomainData.items;
      console.log('domains ===', domains);

      const newGridData = addDomainGridData(
        domains,
        oldGridData.length,
        lastItem
      );
      rowData.value = [...oldGridData, ...newGridData];
      resultCount.value.count = Number(rowData.value.length);

      // currentRowIndex가 유효한지 확인 후 사용
      if (currentRowIndex && currentRowIndex.value !== undefined) {
        agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
      }
    } catch (error) {
      console.error('Error in addGridRowData:', error);
    }
  };

  return {
    fetchData,
    firstRowSelectedEvent,
    addGridRowData,
  };
}
