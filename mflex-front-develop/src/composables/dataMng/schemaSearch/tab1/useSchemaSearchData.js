// composables/dataMng/schemaSearch/useSchemaSearchData.js
import { nextTick } from 'vue';
import { getTableList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

export function useSchemaSearchData() {
  // 테이블 데이터 조회 함수
  const fetchData = (params) => async (filterSet) => {
    const {
      researchQuery,
      resultCount,
      rowData,
      setTableData,
      agGrid,
      getSortQuery,
      searchInput,
    } = params;

    console.log('researchQuery : ', researchQuery);

    if (filterSet) {
      researchQuery.query = filterSet.searchQuery;
      searchInput.value = filterSet.searchQuery;
      researchQuery.sort = filterSet.orderQuery;
    } else {
      researchQuery.sort = getSortQuery();
    }

    console.log('researchQuery.sort : ', researchQuery.sort);

    const response = await getTableList(researchQuery);
    console.log('response : ', response);

    // 조회 결과 수를 설정
    resultCount.value.count = response.searchCount;
    resultCount.value.total = response.totalCount;

    const tableList = response.items;

    // 새로운 데이터 구조에 맞게 매핑
    const tempData = tableList.map((item, index) => ({
      id: index,
      no: index + 1,
      instituteId: item.instituteId,
      informationSystemId: item.informationSystemId,
      databaseId: item.databaseId,
      schemaName: item.schemaName,
      tableName: item.tableName || '',
      tableKoreanName: item.tableKoreanName || '',
      tableColumnCount: item.tableColumnCount || 0,
      databaseSchemaInformation: item.databaseSchemaInformation || '',
      subjectAreaName: item.subjectAreaName || null,
      occurrenceCycleName: item.occurrenceCycleName || null,
      monthlyGenerationAmountContent:
        item.monthlyGenerationAmountContent || null,
      preservationPeriodName: item.preservationPeriodName || null,
      updater: item.updater || 'N/A',
      updateDateTime: item.updateDateTime || 'N/A',
    }));

    rowData.value = tempData;

    // 데이터가 있는 경우 첫 번째 행 선택
    if (rowData.value.length > 0) {
      nextTick(() => {
        const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

        // 첫 번째 행에 선택 효과 추가
        const nodesWithRowId0 = document.querySelector('[row-id="0"]');
        nodesWithRowId0.classList.add('ag-row-selected', 'ag-row-focus');
        nodesWithRowId0.setAttribute('aria-selected', true);

        setTableData(firstRowData.data);
      });
    }

    console.log('fetchData');
  };

  // 그리드 데이터 추가 함수
  const addGridRowData = (params) => async (lastItem) => {
    const {
      rowData,
      agGrid,
      currentRowIndex,
      resultCount,
      researchQuery,
      getSortQuery,
    } = params;

    try {
      // 추가 조회 전 데이터 저장
      let oldGridData = rowData.value;

      // 인덱스로 핀별하므로 길이에서 -1
      const lastRowIndex = oldGridData.length - 1;
      const lastRowNode =
        agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
      console.log('마지막 node ===========', lastRowNode);

      const lastDataItem =
        rowData.value.length > 0
          ? rowData.value[rowData.value.length - 1]
          : null;

      researchQuery.lastItem = lastDataItem;
      researchQuery.sort = getSortQuery();

      const response = await getTableList(researchQuery);
      const tableList = response.items;

      const newGridData = tableList.map((item, index) => ({
        id: index + oldGridData.length,
        no: index + oldGridData.length + 1,
        instituteId: item.instituteId,
        informationSystemId: item.informationSystemId,
        databaseId: item.databaseId,
        schemaName: item.schemaName,
        tableName: item.tableName || '',
        tableKoreanName: item.tableKoreanName || '',
        tableColumnCount: item.tableColumnCount || 0,
        databaseSchemaInformation: item.databaseSchemaInformation || '',
        subjectAreaName: item.subjectAreaName || null,
        occurrenceCycleName: item.occurrenceCycleName || null,
        monthlyGenerationAmountContent:
          item.monthlyGenerationAmountContent || null,
        preservationPeriodName: item.preservationPeriodName || null,
        updater: item.updater || 'N/A',
        updateDateTime: item.updateDateTime || 'N/A',
      }));

      rowData.value = [...oldGridData, ...newGridData];
      resultCount.value.count = Number(rowData.value.length);

      const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
      console.log('lastVisibleRowIndex =================', lastVisibleRowIndex);
      currentRowIndex.value = lastVisibleRowIndex;

      // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
      agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
    } catch (error) {
      console.error(error);
    }
  };

  // 테이블 조회 (필터 리서치)
  const searchDataBinding = (params) => (tableResearchResult) => {
    const { resultCount, rowData, setTableData, agGrid } = params;

    console.log('tableResearchResult : ', tableResearchResult);

    const tableList = tableResearchResult.items;

    if (tableList.length < 0) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
    } else {
      resultCount.value.count = tableResearchResult.searchCount;
      resultCount.value.total = tableResearchResult.totalCount;

      const tempData = tableList.map((item, index) => ({
        id: index,
        no: index + 1,
        instituteId: item.instituteId,
        informationSystemId: item.informationSystemId,
        databaseId: item.databaseId,
        schemaName: item.schemaName,
        tableName: item.tableName || '',
        tableKoreanName: item.tableKoreanName || '',
        tableColumnCount: item.tableColumnCount || 0,
        databaseSchemaInformation: item.databaseSchemaInformation || '',
        subjectAreaName: item.subjectAreaName || null,
        occurrenceCycleName: item.occurrenceCycleName || null,
        monthlyGenerationAmountContent:
          item.monthlyGenerationAmountContent || null,
        preservationPeriodName: item.preservationPeriodName || null,
        updater: item.updater || 'N/A',
        updateDateTime: item.updateDateTime || 'N/A',
      }));

      rowData.value = tempData;

      if (rowData.value.length > 0) {
        nextTick(() => {
          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
          console.log('firstRowData =============', firstRowData);

          // 첫 행 select 효과
          const nodesWithRowId0 = document.querySelector('[row-id="0"]');
          console.log('nodeWithRowId0 ========', nodesWithRowId0);

          nodesWithRowId0.classList.add('ag-row-selected');
          nodesWithRowId0.classList.add('ag-row-focus');
          nodesWithRowId0.setAttribute('aria-selected', true);

          setTableData(firstRowData.data);
        });
      }
    }
  };

  return {
    fetchData,
    addGridRowData,
    searchDataBinding,
  };
}
