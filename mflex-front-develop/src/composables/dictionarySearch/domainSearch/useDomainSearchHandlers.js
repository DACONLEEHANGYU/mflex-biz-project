// composables/dictionarySearch/domainSearch/useDomainSearchHandlers.js
import { reactive, ref } from 'vue';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';
import { getDomainSearchV2 } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
import { bindingDomainGridData } from '@/utils/mflexApi/dictionarySearchApi';

export function useDomainSearchHandlers() {
  const handleSetGridApi = (gridApi) => (params) => {
    gridApi.value = params;
    console.log('gridApi.value : ', gridApi.value);
  };

  const handleChangeSearchType = (searchType) => (searchTypeData) => {
    console.log('handleChangeSearchType : ', searchTypeData);
    searchType.value = searchTypeData;
  };

  const handleColumnStateChanged = (params) => (newColumnState) => {
    const { columnDefs, gridApi, uiStore, newColumnDefs } = params;

    console.log('컬럼 이동 핸들러 동작 ====');
    console.log('newColumnState : ', newColumnState);

    const newColumnFcDefs = newColumnState
      .map((colState) => {
        const colDef = columnDefs.value.find(
          (col) => col.field === colState.colId
        );
        if (!colDef) {
          console.error(
            `No column definition found for colId: ${colState.colId}`
          );
          return null;
        }

        let valueFormatter = null;
        let cellRenderer = null;

        return {
          ...colDef,
          width: colState.width,
          hide: colState.hide,
          pinned: colState.pinned,
          sort: colState.sort,
          minWidth: colState.minWidth,
          sortIndex: colState.sortIndex,
          valueFormatter: valueFormatter,
          comparator: () => 0,
          cellRenderer: colDef.field === 'domainName' ? cellRenderer : null,
        };
      })
      .filter((colDef) => colDef != null);

    console.log('newColumnFcDefs : ', newColumnFcDefs);

    gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
    columnDefs.value = newColumnFcDefs;
    newColumnDefs.value = newColumnFcDefs;

    const gridStorage = JSON.parse(getGridInfoFromStorage());
    gridStorage.MFGRD009 = newColumnFcDefs;
    saveGridInfoToStorage(gridStorage);
    uiStore.setGridColumnDefs('MFGRD009', newColumnFcDefs);
  };

  const handleSortChanged = (params) => async (newSortedState) => {
    const {
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      searchInput,
      rowData,
      selectNode,
      sortStateQuery,
      getSortQuery, // utils에서 가져온 getSortQuery 사용
      columnDefs,
      firstRowSelectedEvent,
    } = params;

    console.log('newSortedState : ', newSortedState);
    console.log('selectNode in handleSortChanged : ', selectNode.value);

    const sortQuery = ref('');
    const sortState = reactive({});

    sortState.value = newSortedState
      .filter((state) => state.sort !== null)
      .sort((a, b) => {
        if (a.sortIndex === undefined && b.sortIndex === undefined) return 0;
        if (a.sortIndex === undefined) return 1;
        if (b.sortIndex === undefined) return -1;
        return a.sortIndex - b.sortIndex;
      });

    const currentDomainId = selectNode.value?.domainId || '0도메인사전';

    if (sortState.value.length == 0) {
      const researchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: domainDictionarySearchCode.value,
        domainId: currentDomainId,
        query: searchInput.value,
        sort: '',
      };

      const domainSortData = await getDomainSearchV2(researchQuery);
      const sortTermGridData = bindingDomainGridData(
        domainSortData,
        selectNode.value
      );
      console.log('sortTermGridData : ', sortTermGridData);
      rowData.value = sortTermGridData;
    } else {
      const sortParts = sortState.value.map(
        (column) => `${column.headerName} ${column.sort}`
      );
      sortQuery.value = sortParts.join(', ');
      sortStateQuery.value = sortQuery.value;

      console.log('getSortQuery : ', getSortQuery());

      const researchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: domainDictionarySearchCode.value,
        domainId: currentDomainId,
        query: searchInput.value,
        sort: sortQuery.value,
        // sort: getSortQuery(), // utils에서 가져온 함수 사용
      };

      const domainSortData = await getDomainSearchV2(researchQuery);
      console.log('domainSortData : ', domainSortData);

      const newDomainGridData = bindingDomainGridData(
        domainSortData,
        selectNode.value
      );
      console.log('newDomainGridData : ', newDomainGridData);
      rowData.value = newDomainGridData;
    }

    firstRowSelectedEvent();
  };

  const handleScrollChanged = (params) => (endScrollStaus) => {
    const {
      rowData,
      agGrid,
      columnDefs,
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      selectNode,
      inputQuery,
      currentRowIndex,
      addGridRowData,
      getSortQuery, // utils에서 가져온 getSortQuery 사용
    } = params;

    if (endScrollStaus === 'Y' && rowData.value != null) {
      const lastRowNode =
        agGrid.value.gridApi.getRenderedNodes()[
          agGrid.value.gridApi.getRenderedNodes().length - 1
        ];

      if (currentRowIndex) {
        currentRowIndex.value = lastRowNode.rowIndex;
      }

      const lastItem =
        rowData.value.length > 0
          ? rowData.value[rowData.value.length - 1]
          : null;
      console.log('lastItem =============', lastItem);

      const currentSelectNode = selectNode.value || {
        domainId: '0도메인사전',
        domainGroupName: null,
      };

      let researchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: domainDictionarySearchCode.value,
        domainGroupName:
          currentSelectNode.domainId === '0도메인사전'
            ? null
            : currentSelectNode.domainGroupName,
        domainId: currentSelectNode.domainId,
        lastItem: lastItem
          ? {
              dictionaryId: lastItem.dictionaryId,
              domainName: lastItem.domainName[0].label,
              domainClassName: lastItem.domainClassName,
              domainGroupName: lastItem.domainGroupName,
              dataPermissionValue: lastItem.dataPermissionValue,
              discardYn: lastItem.discardYn,
              revisionDate: lastItem.revisionDate,
              updater: lastItem.updater,
              updateDatetime: lastItem.updateDatetime,
            }
          : null,
        query: inputQuery.value,
        sort: getSortQuery(), // utils에서 가져온 함수 사용
      };

      addGridRowData(researchQuery);
    }
  };

  return {
    handleSetGridApi,
    handleChangeSearchType,
    handleColumnStateChanged,
    handleSortChanged,
    handleScrollChanged,
  };
}
