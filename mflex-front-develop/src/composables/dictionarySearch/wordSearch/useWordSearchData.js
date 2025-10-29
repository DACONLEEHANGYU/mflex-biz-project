// composables/dictionarySearch/wordSearch/useWordSearchData.js
import { nextTick } from 'vue';
import { getWordViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
import {
  pushWordSearchData,
  addWordGridData,
} from '@/composables/dictionarySearch/useWordSearch';

export function useWordSearchData() {
  // 단어 로우데이터 바인딩
  const bindingWordRowData = (getWordSearchResult, resultCount) => {
    console.log('wordSearchData ==================', getWordSearchResult);

    try {
      if (getWordSearchResult != null) {
        // resultCount.value.count = Number(
        //   getWordSearchResult.data.searchCount
        // ).toLocaleString();
        // resultCount.value.total = Number(
        //   getWordSearchResult.data.totalCount
        // ).toLocaleString();
      }

      const words = getWordSearchResult.data.items;
      const wordGridData = pushWordSearchData(words);

      return wordGridData;
    } catch (error) {
      console.error(error);
    }
  };

  // 첫 번째 행 선택 이벤트 (실제 실행 함수)
  const executeFirstRowSelection = (
    rowFcData,
    agGrid,
    emit,
    setWordViewSelectData
  ) => {
    if (rowFcData.value.length > 0) {
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
          emit('row-selected', firstRowData);
          setWordViewSelectData(firstRowData.data);
        }
      });
    }
  };

  // 첫 번째 행 선택 이벤트 (고차 함수)
  const firstRowSelectedEvent = (params) => () => {
    const { rowFcData, agGrid, emit, setWordViewSelectData } = params;
    executeFirstRowSelection(rowFcData, agGrid, emit, setWordViewSelectData);
  };

  // 단어 사전 데이터 조회
  const fetchData = (params) => async (researchQuery) => {
    const { resultCount, rowFcData, emit, setWordViewSelectData, agGrid } =
      params;

    let wordSearchData;
    wordSearchData = await getWordViewSearch(researchQuery);
    console.log('wordSearchData ==================', wordSearchData);

    if (wordSearchData.status === 409) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
      rowFcData.value = [];
      emit('row-selected', null);
      setWordViewSelectData(null);
    } else {
      resultCount.value.count = Number(
        wordSearchData.data.searchCount
      ).toLocaleString();
      resultCount.value.total = Number(
        wordSearchData.data.totalCount
      ).toLocaleString();
    }

    const words = wordSearchData.data.items;
    const gridData = pushWordSearchData(words);
    rowFcData.value = gridData;

    // 직접 실행 함수 사용
    executeFirstRowSelection(rowFcData, agGrid, emit, setWordViewSelectData);

    return gridData;
  };

  // 단어 그리드 데이터 추가 함수
  const addGridRowData = (params) => async (wordResearchQuery) => {
    const { rowFcData, resultCount, agGrid, currentRowIndex } = params;

    try {
      const oldGridData = rowFcData.value;
      let reLoadWordData;

      if (wordResearchQuery.query) {
        reLoadWordData = await getWordViewSearch(wordResearchQuery);
        console.log('reLoadWordData ===', reLoadWordData);
      } else {
        reLoadWordData = await getWordViewSearch(wordResearchQuery);
      }

      console.log('reLoadWordData ====================', reLoadWordData);
      const words = reLoadWordData.data.items;
      const newGridData = addWordGridData(words, oldGridData.length);

      rowFcData.value = [...oldGridData, ...newGridData];
      resultCount.value.count = Number(rowFcData.value.length);
      agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
    } catch (error) {
      console.error(error);
    }
  };

  return {
    bindingWordRowData,
    fetchData,
    addGridRowData,
    firstRowSelectedEvent,
    executeFirstRowSelection, // 직접 실행 함수도 export
  };
}
