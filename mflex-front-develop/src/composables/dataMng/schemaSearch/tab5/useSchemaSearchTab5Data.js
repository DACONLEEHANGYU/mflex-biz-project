import { nextTick } from 'vue';
import { getIndexList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

export function useSchemaSearchTab5Data() {
  // 인덱스 데이터 조회 함수
  const fetchData = (params) => async (filterSet) => {
    const {
      researchQuery,
      resultCount,
      rowData,
      setIndexData,
      agGrid,
      getSortQuery,
      searchInput,
    } = params;

    console.log('fetchData');

    researchQuery.sort = getSortQuery();

    if (filterSet) {
      researchQuery.query = filterSet.searchQuery;
      searchInput.value = filterSet.searchQuery;
      researchQuery.sort = filterSet.orderQuery;
    }

    const response = await getIndexList(researchQuery);
    console.log('index- response : ', response);

    resultCount.value.count = response.searchCount;
    resultCount.value.total = response.totalCount;

    const indexList = response.items;

    const data = [];
    for (let i = 0; i < indexList.length; i++) {
      const isUnique = indexList[i].isUnique === true ? 'Y' : 'N';

      data.push({
        no: i + 1,
        id: i,
        instituteId: indexList[i].instituteId,
        databaseId: indexList[i].databaseId,
        informationSystemId: indexList[i].informationSystemId,
        indexName: indexList[i].indexName,
        databaseSchemaInformation: indexList[i].databaseSchemaInformation,
        schemaName: indexList[i].schemaName,
        tableName: indexList[i].tableName,
        tableKoreanName: indexList[i].tableKoreanName,
        indexCompositionContent: indexList[i].indexCompositionContent,
        isUnique: isUnique,
        updater: indexList[i].updater,
        updateDateTime: indexList[i].updateDateTime,
      });
    }
    rowData.value = data;

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

        setIndexData(firstRowData.data);
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

      // 마지막 데이터의 isUnique 값이 Y면 true, N이면 false
      if (lastDataItem) {
        lastDataItem.isUnique = lastDataItem.isUnique === 'Y' ? true : false;
      }

      researchQuery.lastItem = lastDataItem;
      researchQuery.sort = getSortQuery();

      const response = await getIndexList(researchQuery);
      const indexList = response.items;

      const newGridData = [];

      for (let i = 0; i < indexList.length; i++) {
        const isUnique = indexList[i].isUnique === true ? 'Y' : 'N';

        newGridData.push({
          id: oldGridData.length + i,
          no: oldGridData.length + i + 1,
          instituteId: indexList[i].instituteId,
          databaseId: indexList[i].databaseId,
          informationSystemId: indexList[i].informationSystemId,
          indexName: indexList[i].indexName,
          databaseSchemaInformation: indexList[i].databaseSchemaInformation,
          schemaName: indexList[i].schemaName,
          tableName: indexList[i].tableName,
          tableKoreanName: indexList[i].tableKoreanName,
          indexCompositionContent: indexList[i].indexCompositionContent,
          isUnique: isUnique,
          updater: indexList[i].updater,
          updateDateTime: indexList[i].updateDateTime,
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

  // 인덱스 조회 (필터 리서치)
  const searchDataBinding = (params) => (indexResearchResult) => {
    const { resultCount, rowData, setIndexData, agGrid, emit } = params;

    console.log('indexResearchResult : ', indexResearchResult);

    const indexList = indexResearchResult.items;

    if (indexList.length < 0) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
    } else {
      resultCount.value.count = indexResearchResult.searchCount;
      resultCount.value.total = indexResearchResult.totalCount;

      const tempData = [];

      for (let i = 0; i < indexList.length; i++) {
        const isUnique = indexList[i].isUnique === true ? 'Y' : 'N';

        tempData.push({
          id: i,
          no: i + 1,
          instituteId: indexList[i].instituteId,
          databaseId: indexList[i].databaseId,
          informationSystemId: indexList[i].informationSystemId,
          indexName: indexList[i].indexName,
          databaseSchemaInformation: indexList[i].databaseSchemaInformation,
          schemaName: indexList[i].schemaName,
          tableName: indexList[i].tableName,
          tableKoreanName: indexList[i].tableKoreanName,
          indexCompositionContent: indexList[i].indexCompositionContent,
          isUnique: isUnique,
          updater: indexList[i].updater,
          updateDateTime: indexList[i].updateDateTime,
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

          setIndexData(firstRowData.data);

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
