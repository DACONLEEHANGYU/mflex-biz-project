import { ref } from 'vue';
import { columnDefsUpdate } from '@/utils/js/searchModule';
import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
import { getIndexList } from '@/utils/mflexApi/dataMng/schemaSearchApi';
import {
  getUserGridSetting,
  setUserGridSetting,
  getGridDefaultData,
} from '@/utils/mflexApi/common/commonApi';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';

export function useSchemaSearchTab5Utils() {
  // 그리드 정보 조회
  const getGridInfo = (tab5GridId) => async () => {
    try {
      const userGridData = await getUserGridSetting(tab5GridId.value);
      const transformedData = await transformGridData(userGridData);
      console.log('Transformed Grid Data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error in getGridInfo:', error);
      throw error;
    }
  };

  // 그리드 데이터 변환
  const transformGridData = (data) => {
    console.log('transformGridData-data : ', data);

    const fieldMapping = {
      NO: 'no',
      TBL_NM: 'tableName',
      TBL_KORN_NM: 'tableKoreanName',
      DB_SCHM_INFO: 'databaseSchemaInformation',
      INDX_NM: 'indexName',
      INDX_CPST_CN: 'indexCompositionContent',
      UNQ_YN: 'isUnique',
      UPDR_INFO: 'updater',
      UPD_DTM: 'updateDateTime',
    };

    return data.map((item) => {
      const fieldName =
        fieldMapping[item.gridArticleName] ||
        item.gridArticleName.toLowerCase();

      return {
        cellClass:
          fieldName === 'no' ||
          fieldName === 'updater' ||
          fieldName === 'databaseSchemaInformation' ||
          fieldName === 'isUnique' ||
          fieldName === 'updateDateTime'
            ? 'grid-cell-centered'
            : 'ag-left-aligned-cell',
        cellRenderer: null,
        field: fieldName,
        headerName: item.gridArticleKoreanName,
        hide: !item.articleDisplayYn,
        minWidth: item.articleColumnWidth,
        pinned: item.articleFixedCode || '',
        sort: item.articleDataSortCode,
        sortIndex: item.articleDataSortOrder,
        sortable: item.articleDataSortYn,
        suppressSorting: !item.articleDataSortYn,
        valueFormatter: null,
        width: item.articleColumnWidth,
      };
    });
  };

  // 정렬 쿼리 생성
  const getSortQuery = (columnDefs) => () => {
    if (!columnDefs || !columnDefs.value) {
      console.warn('columnDefs is not defined');
      return '';
    }

    // 정렬이 적용된 모든 열을 찾습니다.
    const sortedColumns = columnDefs.value
      .filter((col) => col.sort && col.sortIndex !== undefined)
      .sort((a, b) => a.sortIndex - b.sortIndex);

    console.log('sortedColumns : ', sortedColumns);

    // 정렬 쿼리 문자열을 생성합니다.
    const sortQuery =
      sortedColumns.length > 0
        ? sortedColumns.map((col) => `${col.headerName} ${col.sort}`).join(', ')
        : '';

    console.log('Generated sortQuery:', sortQuery);
    return sortQuery;
  };

  // 검색 쿼리 변환
  const transformQuery = (query) => {
    const regex =
      /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
    return query.replace(
      regex,
      (match, column, operator, searchTerm, logicalOperator) => {
        if (column === '최종수정자') {
          return `${column} ${operator.toUpperCase()} '${searchTerm}'${
            logicalOperator ? logicalOperator.toUpperCase() : ''
          }`;
        }
        const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
          word.toUpperCase()
        );
        return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
          logicalOperator ? logicalOperator.toUpperCase() : ''
        }`;
      }
    );
  };

  // 검색 함수
  const onSearchEnter = (params) => async (value) => {
    const {
      searchType,
      tab5GridId,
      researchQuery,
      searchInput,
      useMetaMngInstId,
      useInfoSysId,
      columnDefs,
      gridApi,
      searchDataBinding,
      getSortQuery,
      rowData,
    } = params;

    console.log('onSearchEnter', value);

    const transformedQuery = transformQuery(value);

    if (searchType.value === 'natural-query' && value !== '') {
      const searchInfo = {
        gridId: tab5GridId.value,
        query: transformedQuery,
      };
      const llmAnswer = await getCreateQuery(searchInfo);

      await columnDefsUpdate(
        llmAnswer.data.sort,
        columnDefs,
        tab5GridId.value,
        gridApi
      );

      researchQuery.query = llmAnswer.data.where;
      searchInput.value = value;

      const researchQueryData = {
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        query: llmAnswer.data.where,
        sort: llmAnswer.data.sort,
      };

      rowData.value = [];
      const indexResearchResult = await getIndexList(researchQueryData);
      console.log('indexResearchResult : ', indexResearchResult);
      searchDataBinding(indexResearchResult);
    } else {
      const researchQueryData = {
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        query: transformedQuery,
        sort: getSortQuery(),
      };

      researchQuery.query = transformedQuery;
      searchInput.value = value;
      rowData.value = [];

      const indexResearchResult = await getIndexList(researchQueryData);
      console.log('indexResearchResult : ', indexResearchResult);
      searchDataBinding(indexResearchResult);
    }
  };

  // 필터 창 닫기
  const onFilterWindowClosed = (params) => (filterSet) => {
    const { fetchData, columnDefs, gridApi } = params;

    console.log('필터 창이 닫혔습니다.');
    console.log('filterSet : ', filterSet);

    if (filterSet) {
      fetchData(filterSet);
    }

    const gridStorage = JSON.parse(getGridInfoFromStorage());
    console.log('gridStorage.MFGRD064 : ', gridStorage.MFGRD064);
    columnDefs.value = gridStorage.MFGRD064;

    gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD064);
  };

  // 사용자 그리드 설정 저장
  const onSetUserGridSetting = (params) => async () => {
    const { columnDefs, tab5GridId } = params;

    console.log('columnDefs.value : ', columnDefs.value);

    const fieldMapping = {
      no: 'NO',
      tableName: 'TBL_NM',
      tableKoreanName: 'TBL_KORN_NM',
      databaseSchemaInformation: 'DB_SCHM_INFO',
      indexName: 'INDX_NM',
      indexCompositionContent: 'INDX_CPST_CN',
      isUnique: 'UNQ_YN',
      updater: 'UPDR_INFO',
      updateDateTime: 'UPD_DTM',
    };

    const newGridStting = columnDefs.value.map((item, index) => {
      const articleName = fieldMapping[item.field];

      return {
        gridArticleName: articleName,
        gridArticleKoreanName: item.headerName,
        articlePositionOrder: index + 1,
        articleColumnWidth: item.width,
        articleDisplayYn: !item.hide,
        articleFixedCode: item.pinned,
        articleDataSortYn: item.sortable,
        articleDataSortOrder: item.sortIndex,
        articleDataSortCode: item.sort,
      };
    });

    console.log('newGridStting : ', newGridStting);
    await setUserGridSetting(tab5GridId.value, newGridStting);
  };

  // 검색 조건 초기화
  const onSearchRemove = (params) => async () => {
    const { tab5GridId, columnDefs, gridApi, uiStore } = params;

    console.log('onSearchRemove 함수 실행 ===');

    // 그리드 기본값 호출
    const gridDefaultData = await getGridDefaultData(tab5GridId.value);
    console.log('gridDefaultData : ', gridDefaultData);

    // 기본값 설정
    await setUserGridSetting(tab5GridId.value, gridDefaultData);

    const transformedData = transformGridData(gridDefaultData);
    console.log('transformedData : ', transformedData);

    columnDefs.value = transformedData;

    const gridStorage = JSON.parse(getGridInfoFromStorage());
    gridStorage[tab5GridId.value] = transformedData;
    saveGridInfoToStorage(gridStorage);

    uiStore.setGridColumnDefs(tab5GridId.value, columnDefs.value);
    gridApi.value.setGridOption('columnDefs', columnDefs.value);
  };

  // 챗봇 쿼리 바인딩
  const handleBindQuery = (params) => async (llmAnswer) => {
    const {
      chatbotWindowView,
      researchQuery,
      searchInput,
      columnDefs,
      tab5GridId,
      gridApi,
      fetchData,
      getSortQuery,
    } = params;

    chatbotWindowView.value = false;
    researchQuery.query = llmAnswer.where;
    searchInput.value = llmAnswer.where;

    await columnDefsUpdate(
      llmAnswer.sort,
      columnDefs,
      tab5GridId.value,
      gridApi
    );

    researchQuery.query = llmAnswer.where;
    researchQuery.sort = getSortQuery();

    await fetchData();
  };

  return {
    getGridInfo,
    transformGridData,
    getSortQuery,
    transformQuery,
    onSearchEnter,
    onFilterWindowClosed,
    onSetUserGridSetting,
    onSearchRemove,
    handleBindQuery,
  };
}
