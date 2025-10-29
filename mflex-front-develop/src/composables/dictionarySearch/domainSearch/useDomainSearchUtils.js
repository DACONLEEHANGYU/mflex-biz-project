// composables/dictionarySearch/domainSearch/useDomainSearchUtils.js
import { ref } from 'vue';
import { basicWhereQueryCheck } from '@/utils/utils.js';
import { columnDefsUpdate } from '@/utils/js/searchModule';
import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
import {
  getUserGridSetting,
  setUserGridSetting,
  getGridDefaultData,
} from '@/utils/mflexApi/common/commonApi';
import {
  transformQuery,
  newGridSettingFuc,
  transformDomianGridData,
} from '@/composables/dictionarySearch/useDomainSearch.js';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';

export function useDomainSearchUtils() {
  const getGridInfo = (domainSearchGridId) => async () => {
    try {
      const userGridData = await getUserGridSetting(domainSearchGridId.value);
      const transformedData = await transformDomianGridData(userGridData);
      console.log('Transformed Grid Data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error in getGridInfo:', error);
      throw error;
    }
  };

  // getSortQuery 함수 추가
  const getSortQuery = (columnDefs) => () => {
    if (!columnDefs || !columnDefs.value) {
      console.warn('columnDefs is not defined');
      return '';
    }

    const sortedColumns = columnDefs.value
      .filter((col) => col.sort && col.sortIndex !== undefined)
      .sort((a, b) => a.sortIndex - b.sortIndex);

    const sortQuery =
      sortedColumns.length > 0
        ? sortedColumns.map((col) => `${col.headerName} ${col.sort}`).join(', ')
        : '';

    console.log('Generated sortQuery:', sortQuery);
    return sortQuery;
  };

  // 검색 함수
  const onGridSearchClicked = (params) => async (textValue) => {
    const {
      rowData,
      searchType,
      domainSearchGridId,
      inputQuery,
      searchInput,
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      selectNode,
      columnDefs,
      gridApi,
      fetchData,
      getSortQuery, // utils에서 가져온 getSortQuery 사용
    } = params;

    rowData.value = [];

    if (searchType.value === 'natural-query' && textValue !== '') {
      const searhInfo = {
        gridId: domainSearchGridId.value,
        query: textValue,
      };
      const llmAnswer = await getCreateQuery(searhInfo);

      await columnDefsUpdate(
        llmAnswer.data.sort,
        columnDefs,
        domainSearchGridId.value,
        gridApi
      );

      inputQuery.value = llmAnswer.data.where;
      searchInput.value = textValue;

      const domainResearchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: domainDictionarySearchCode.value,
        domainId: selectNode.value?.domainId || '0도메인사전',
        query: inputQuery.value,
        sort: getSortQuery(), // 함수 호출
      };

      if (llmAnswer.data.sort == '') {
        await fetchData(domainResearchQuery);
      }
    } else {
      const chgTextValue = textValue.replace(/\n/g, ' ');
      if (textValue != null) {
        const upperTextValue = transformQuery(chgTextValue).trim();
        if (basicWhereQueryCheck(upperTextValue) === 'PASS') {
          console.log('PASS WORD');

          inputQuery.value = upperTextValue;
          searchInput.value = upperTextValue;

          const domainResearchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            dictionarySearchCode: domainDictionarySearchCode.value,
            domainId: selectNode.value?.domainId || '0도메인사전',
            query: searchInput.value,
            sort: getSortQuery(), // 함수 호출
          };

          fetchData(domainResearchQuery);
          console.log('upperTextValue ===', upperTextValue);
        }
      } else {
        inputQuery.value = '';
        searchInput.value = '';

        const domainResearchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          dictionarySearchCode: domainDictionarySearchCode.value,
          domainId: selectNode.value?.domainId || '0도메인사전',
          query: '',
          sort: getSortQuery(), // 함수 호출
        };

        fetchData(domainResearchQuery);
      }
    }
  };

  const onFilterWindowClosed = (params) => (filterSet) => {
    const {
      inputQuery,
      searchInput,
      columnDefs,
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      selectNode,
      fetchData,
      gridApi,
      getSortQuery, // utils에서 가져온 getSortQuery 사용
    } = params;

    console.log('필터 창이 닫혔습니다.');

    if (filterSet) {
      inputQuery.value = filterSet.searchQuery;
      searchInput.value = filterSet.searchQuery;

      const sortedColumns = columnDefs.value
        .filter((col) => col.sortIndex !== null && col.sort !== null)
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .map(
          (col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
        );

      const sortQuery = sortedColumns.join(', ');

      let filterSortQuery;
      if (sortQuery != '') {
        filterSortQuery =
          filterSet.orderQuery != ''
            ? `${sortQuery}, ${filterSet.orderQuery}`
            : sortQuery;
      } else {
        filterSortQuery = filterSet.orderQuery;
      }

      const domainResearchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: domainDictionarySearchCode.value,
        domainId: selectNode.value?.domainId || '0도메인사전',
        query: inputQuery.value,
        sort: filterSortQuery,
      };

      fetchData(domainResearchQuery);
    } else {
      const gridStorage = JSON.parse(getGridInfoFromStorage());
      console.log('gridStorage : ', gridStorage);
      columnDefs.value = gridStorage.MFGRD009;
      gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD009);
    }
  };

  // 필터 및 정렬 삭제
  const onSearchRemove = (params) => async () => {
    const {
      inputQuery,
      searchInput,
      domainSearchGridId,
      columnDefs,
      gridApi,
      uiStore,
      focusRootNode,
    } = params;

    console.log('onSearchRemove');
    console.log('정렬 초기화');

    inputQuery.value = '';
    searchInput.value = '';

    const gridDefaultData = await getGridDefaultData(domainSearchGridId.value);
    const transformGrid = await transformDomianGridData(gridDefaultData);

    await setUserGridSetting(domainSearchGridId.value, gridDefaultData);
    console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

    columnDefs.value = transformGrid;

    const gridStorage = JSON.parse(getGridInfoFromStorage());
    gridStorage[domainSearchGridId.value] = transformGrid;
    saveGridInfoToStorage(gridStorage);

    uiStore.setGridColumnDefs('MFGRD009', columnDefs.value);
    gridApi.value.setGridOption('columnDefs', columnDefs.value);

    focusRootNode();
  };

  const onSetUserGridSetting = (params) => async () => {
    const { columnDefs, domainSearchGridId } = params;

    console.log('columnDefs.value : ', columnDefs.value);

    const gridStorage = JSON.parse(getGridInfoFromStorage());
    console.log(
      'gridStorage[domainSearchGridId.value] : ',
      gridStorage[domainSearchGridId.value]
    );

    const newGridSetting = newGridSettingFuc(columnDefs);
    await setUserGridSetting(domainSearchGridId.value, newGridSetting);
  };

  // 챗봇 팝업창에서 쿼리 바인딩
  const handleBindQuery = (params) => async (llmAnswer) => {
    const {
      chatbotWindowView,
      inputQuery,
      searchInput,
      columnDefs,
      domainSearchGridId,
      gridApi,
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      selectNode,
      fetchData,
      getSortQuery, // utils에서 가져온 getSortQuery 사용
    } = params;

    chatbotWindowView.value = false;
    inputQuery.value = llmAnswer.where;
    searchInput.value = llmAnswer.where;

    await columnDefsUpdate(
      llmAnswer.sort,
      columnDefs,
      domainSearchGridId.value,
      gridApi
    );

    const domainResearchQuery = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      dictionarySearchCode: domainDictionarySearchCode.value,
      domainId: selectNode.value?.domainId || '0도메인사전',
      query: inputQuery.value,
      sort: getSortQuery(), // 함수 호출
    };

    await fetchData(domainResearchQuery);
  };

  return {
    getGridInfo,
    getSortQuery, // 추가
    onGridSearchClicked,
    onFilterWindowClosed,
    onSearchRemove,
    onSetUserGridSetting,
    handleBindQuery,
  };
}
