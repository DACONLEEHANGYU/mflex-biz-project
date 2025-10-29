import { nextTick } from 'vue';
import { getColumnList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

export function useSchemaSearchTab2Data() {
  // 컬럼 데이터 조회 함수
  const fetchData = (params) => async (filterSet) => {
    const {
      researchQuery,
      resultCount,
      rowData,
      setColumnData,
      agGrid,
      getSortQuery,
      searchInput,
    } = params;

    console.log('fetchData');

    researchQuery.sort = getSortQuery();

    if (filterSet) {
      researchQuery.query = filterSet.searchQuery;
      researchQuery.sort = filterSet.orderQuery;
    }

    const responseData = await getColumnList(researchQuery);
    const columnList = responseData.items;

    resultCount.value.count = responseData.searchCount;
    resultCount.value.total = responseData.totalCount;

    console.log('columnList ==: ', columnList);

    const tempData = columnList.map((item, index) => ({
      id: index,
      no: index + 1,
      instituteId: item.instituteId,
      informationSystemId: item.informationSystemId,
      columnName: item.columnName,
      columnKoreanName: item.columnKoreanName,
      columnTableCount: item.columnTableCount,
      dataTypeName: item.dataTypeName,
      databaseId: item.databaseId,
      databaseSchemaInformation: item.databaseSchemaInformation,
      schemaName: item.schemaName,
      updateDateTime: item.updateDateTime,
      updater: item.updater,
    }));

    rowData.value = tempData;

    if (rowData.value.length > 0) {
      nextTick(() => {
        const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

        // 첫 번째 행에 선택 효과 추가
        const nodesWithRowId0 = document.querySelector('[row-id="0"]');
        nodesWithRowId0.classList.add('ag-row-selected', 'ag-row-focus');
        nodesWithRowId0.setAttribute('aria-selected', true);

        setColumnData(firstRowData.data);
      });
    }
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

      const response = await getColumnList(researchQuery);
      const columnList = response.items;

      const newGridData = columnList.map((item, index) => ({
        id: index + oldGridData.length,
        no: index + oldGridData.length + 1,
        instituteId: item.instituteId,
        informationSystemId: item.informationSystemId,
        columnName: item.columnName,
        columnKoreanName: item.columnKoreanName,
        columnTableCount: item.columnTableCount,
        dataTypeName: item.dataTypeName,
        databaseId: item.databaseId,
        databaseSchemaInformation: item.databaseSchemaInformation,
        schemaName: item.schemaName,
        updateDateTime: item.updateDateTime,
        updater: item.updater,
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

  // 컬럼 조회 (필터 리서치)
  const searchDataBinding = (params) => (columnResearchResult) => {
    const { resultCount, rowData, setColumnData, agGrid, emit } = params;

    console.log('columnResearchResult : ', columnResearchResult);

    const columnList = columnResearchResult.items;

    if (columnList.length < 0) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
    } else {
      resultCount.value.count = columnResearchResult.searchCount;
      resultCount.value.total = columnResearchResult.totalCount;

      const tempData = columnList.map((item, index) => ({
        id: index,
        no: index + 1,
        instituteId: item.instituteId,
        informationSystemId: item.informationSystemId,
        columnName: item.columnName,
        columnKoreanName: item.columnKoreanName,
        columnTableCount: item.columnTableCount,
        dataTypeName: item.dataTypeName,
        databaseId: item.databaseId,
        databaseSchemaInformation: item.databaseSchemaInformation,
        schemaName: item.schemaName,
        updateDateTime: item.updateDateTime,
        updater: item.updater,
      }));

      rowData.value = tempData;

      if (rowData.value.length > 0) {
        nextTick(() => {
          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
          console.log('firstRowData =============', firstRowData);

          // 첫 행 select 효과
          const nodesWithRowId0 = document.querySelector('[row-id="0"]');
          console.log('nodeWithRowId0 ========', nodesWithRowId0);

          nodesWithRowId0.classList.add('ag-row-selected', 'ag-row-focus');
          nodesWithRowId0.setAttribute('aria-selected', true);

          setColumnData(firstRowData.data);

          if (firstRowData) {
            console.log('emit row-selected 실행 ====');
            emit('row-selected', firstRowData);
          }
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
