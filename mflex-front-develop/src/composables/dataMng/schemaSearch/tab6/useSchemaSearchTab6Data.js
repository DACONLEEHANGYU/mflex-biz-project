import { nextTick } from 'vue';
import { getTriggerList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

export function useSchemaSearchTab6Data() {
  // 트리거 데이터 조회 함수
  const fetchData = (params) => async (filterSet) => {
    const {
      researchQuery,
      resultCount,
      rowData,
      setTriggerData,
      agGrid,
      getSortQuery,
      searchInput,
    } = params;

    console.log('fetchData');

    if (filterSet) {
      researchQuery.query = filterSet.searchQuery;
      searchInput.value = filterSet.searchQuery;
      researchQuery.sort = filterSet.orderQuery;
    } else {
      researchQuery.sort = getSortQuery();
    }

    const response = await getTriggerList(researchQuery);
    console.log('trigger - response : ', response);

    const triggerList = response.items;

    resultCount.value.count = response.searchCount;
    resultCount.value.total = response.totalCount;

    const tempData = [];
    for (let i = 0; i < triggerList.length; i++) {
      tempData.push({
        id: i,
        no: i + 1,
        instituteId: triggerList[i].instituteId,
        informationSystemId: triggerList[i].informationSystemId,
        databaseId: triggerList[i].databaseId,
        databaseSchemaInformation: triggerList[i].databaseSchemaInformation,
        schemaName: triggerList[i].schemaName,
        tableName: triggerList[i].tableName,
        tableKoreanName: triggerList[i].tableKoreanName,
        triggerName: triggerList[i].triggerName,
        triggerExplain: triggerList[i].triggerExplain,
        updater: triggerList[i].updater,
        updateDateTime: triggerList[i].updateDateTime,
      });
    }

    rowData.value = tempData;

    if (rowData.value.length > 0) {
      console.log('agGrid.value :', agGrid.value);
      nextTick(() => {
        console.log('agGrid.value.gridApi : ', agGrid.value.gridApi);
        const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

        // 첫 행 select 효과
        const nodesWithRowId0 = document.querySelector('[row-id="0"]');
        nodesWithRowId0.classList.add('ag-row-selected');
        nodesWithRowId0.classList.add('ag-row-focus');
        nodesWithRowId0.setAttribute('aria-selected', true);

        setTriggerData(firstRowData.data);
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

      const response = await getTriggerList(researchQuery);
      const triggerList = response.items;

      const newGridData = [];

      for (let i = 0; i < triggerList.length; i++) {
        newGridData.push({
          id: oldGridData.length + i,
          no: oldGridData.length + i + 1,
          instituteId: triggerList[i].instituteId,
          informationSystemId: triggerList[i].informationSystemId,
          databaseId: triggerList[i].databaseId,
          databaseSchemaInformation: triggerList[i].databaseSchemaInformation,
          schemaName: triggerList[i].schemaName,
          tableName: triggerList[i].tableName,
          tableKoreanName: triggerList[i].tableKoreanName,
          triggerName: triggerList[i].triggerName,
          triggerExplain: triggerList[i].triggerExplain,
          updater: triggerList[i].updater,
          updateDateTime: triggerList[i].updateDateTime,
        });
      }

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

  // 트리거 조회 (필터 리서치)
  const searchDataBinding = (params) => (triggerResearchResult) => {
    const { resultCount, rowData, setTriggerData, agGrid, emit } = params;

    console.log('triggerResearchResult : ', triggerResearchResult);

    const triggerList = triggerResearchResult.items;

    if (triggerList.length < 0) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
    } else {
      resultCount.value.count = triggerResearchResult.searchCount;
      resultCount.value.total = triggerResearchResult.totalCount;

      const tempData = [];

      for (let i = 0; i < triggerList.length; i++) {
        tempData.push({
          id: i,
          no: i + 1,
          instituteId: triggerList[i].instituteId,
          informationSystemId: triggerList[i].informationSystemId,
          databaseId: triggerList[i].databaseId,
          databaseSchemaInformation: triggerList[i].databaseSchemaInformation,
          schemaName: triggerList[i].schemaName,
          tableName: triggerList[i].tableName,
          tableKoreanName: triggerList[i].tableKoreanName,
          triggerName: triggerList[i].triggerName,
          triggerExplain: triggerList[i].triggerExplain,
          updater: triggerList[i].updater,
          updateDateTime: triggerList[i].updateDateTime,
        });
      }

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

          setTriggerData(firstRowData.data);

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
