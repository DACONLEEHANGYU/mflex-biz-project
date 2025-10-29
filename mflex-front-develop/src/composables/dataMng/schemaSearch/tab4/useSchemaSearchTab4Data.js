import { nextTick } from 'vue';
import { getForeignKeyList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

export function useSchemaSearchTab4Data() {
  // 외래키 데이터 조회 함수
  const fetchData = (params) => async (filterSet) => {
    const {
      researchQuery,
      resultCount,
      rowData,
      setForeignKeyData,
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

    const foreignKeyList = await getForeignKeyList(researchQuery);
    console.log('foreignKeyList : ', foreignKeyList);

    const list = foreignKeyList.items;

    resultCount.value.count = foreignKeyList.searchCount;
    resultCount.value.total = foreignKeyList.totalCount;

    const data = [];
    for (let i = 0; i < list.length; i++) {
      const isRelationEssential =
        list[i].isRelationEssential === true ? 'Y' : 'N';

      data.push({
        id: i,
        no: i + 1,
        informationSystemId: list[i].informationSystemId,
        instituteId: list[i].instituteId,
        databaseId: list[i].databaseId,
        databaseSchemaInformation: list[i].databaseSchemaInformation,
        databaseSchemaInformationId: list[i].databaseSchemaInformationId,
        foreignKeyCompositionContent: list[i].foreignKeyCompositionContent,
        foreignKeyName: list[i].foreignKeyName,
        isRelationEssential: isRelationEssential,
        relationTypeName: list[i].relationTypeName,
        schemaName: list[i].schemaName,
        tableKoreanName: list[i].tableKoreanName,
        tableName: list[i].tableName,
        updateDateTime: list[i].updateDateTime,
        updater: list[i].updater,
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

        setForeignKeyData(firstRowData.data);
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

      const response = await getForeignKeyList(researchQuery);
      const foreignKeyList = response.items;

      const newGridData = [];

      for (let i = 0; i < foreignKeyList.length; i++) {
        const isRelationEssential =
          foreignKeyList[i].isRelationEssential === true ? 'Y' : 'N';

        newGridData.push({
          id: oldGridData.length + i,
          no: oldGridData.length + i + 1,
          informationSystemId: foreignKeyList[i].informationSystemId,
          instituteId: foreignKeyList[i].instituteId,
          databaseId: foreignKeyList[i].databaseId,
          databaseSchemaInformation:
            foreignKeyList[i].databaseSchemaInformation,
          databaseSchemaInformationId:
            foreignKeyList[i].databaseSchemaInformationId,
          foreignKeyCompositionContent:
            foreignKeyList[i].foreignKeyCompositionContent,
          foreignKeyName: foreignKeyList[i].foreignKeyName,
          isRelationEssential: isRelationEssential,
          relationTypeName: foreignKeyList[i].relationTypeName,
          schemaName: foreignKeyList[i].schemaName,
          tableKoreanName: foreignKeyList[i].tableKoreanName,
          tableName: foreignKeyList[i].tableName,
          updateDateTime: foreignKeyList[i].updateDateTime,
          updater: foreignKeyList[i].updater,
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

  // 외래키 조회 (필터 리서치)
  const searchDataBinding = (params) => (fkResearchResult) => {
    const { resultCount, rowData, setForeignKeyData, agGrid, emit } = params;

    console.log('fkResearchResult : ', fkResearchResult);

    const fkList = fkResearchResult.items;

    if (fkList.length < 0) {
      resultCount.value.count = 0;
      resultCount.value.total = 0;
    } else {
      resultCount.value.count = fkResearchResult.searchCount;
      resultCount.value.total = fkResearchResult.totalCount;

      const tempData = [];

      for (let i = 0; i < fkList.length; i++) {
        const isRelationEssential =
          fkList[i].isRelationEssential === true ? 'Y' : 'N';

        tempData.push({
          no: i + 1,
          id: i,
          informationSystemId: fkList[i].informationSystemId,
          instituteId: fkList[i].instituteId,
          databaseId: fkList[i].databaseId,
          databaseSchemaInformation: fkList[i].databaseSchemaInformation,
          databaseSchemaInformationId: fkList[i].databaseSchemaInformationId,
          foreignKeyCompositionContent: fkList[i].foreignKeyCompositionContent,
          foreignKeyName: fkList[i].foreignKeyName,
          isRelationEssential: isRelationEssential,
          relationTypeName: fkList[i].relationTypeName,
          schemaName: fkList[i].schemaName,
          tableKoreanName: fkList[i].tableKoreanName,
          tableName: fkList[i].tableName,
          updateDateTime: fkList[i].updateDateTime,
          updater: fkList[i].updater,
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

          setForeignKeyData(firstRowData.data);

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
