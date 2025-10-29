// composables/dictionarySearch/wordSearch/useWordSearchHandlers.js
import { reactive, ref } from 'vue';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';
import { getWordViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';

export function useWordSearchHandlers() {
  const handleSetGridApi = (gridApi) => (params) => {
    gridApi.value = params;
    console.log('gridApi.value : ', gridApi.value);
  };

  const handleChangeSearchType = (searchType) => (searchTypeData) => {
    console.log('handleChangeSearchType : ', searchTypeData);
    searchType.value = searchTypeData;
  };

  const handleColumnStateChanged = (params) => (newColumnState) => {
    const { columnDefs, gridApi, uiStore } = params;

    console.log('컬럼 이동 핸들러 동작 ====');

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

        if (colDef.field === 'wordName') {
          valueFormatter = (params) => {
            if (
              params.value &&
              Array.isArray(params.value) &&
              params.value.length > 0
            ) {
              return params.value[0].excVal;
            }
            return '';
          };
          cellRenderer = 'TypeCellRenderer';
        }

        return {
          ...colDef,
          width: colState.width,
          minWidth: colState.minWidth,
          hide: colState.hide,
          pinned: colState.pinned,
          sort: colState.sort,
          sortIndex: colState.sortIndex,
          valueFormatter: valueFormatter,
          comparator: () => 0,
          cellRenderer: colDef.field === 'wordName' ? cellRenderer : null,
        };
      })
      .filter((colDef) => colDef != null);

    console.log('newColumnFcDefs : ', newColumnFcDefs);

    gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
    columnDefs.value = newColumnFcDefs;

    const gridStorage = JSON.parse(getGridInfoFromStorage());
    gridStorage.MFGRD005 = newColumnFcDefs;
    saveGridInfoToStorage(gridStorage);
    uiStore.setGridColumnDefs('MFGRD005', newColumnFcDefs);
  };

  const handleSortChanged = (params) => async (newSortedState) => {
    const {
      useMetaMngInstId,
      useDctnryId,
      wordDictionarySearchCode,
      searchInput,
      rowFcData,
      bindingWordRowData,
      firstRowSelectedEvent,
      sortStateQuery,
    } = params;

    console.log('newSortedState : ', newSortedState);
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

    const lastItem =
      rowFcData.value.length > 0
        ? rowFcData.value[rowFcData.value.length - 1]
        : null;

    if (sortState.value.length == 0) {
      const researchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: wordDictionarySearchCode.value,
        query: searchInput.value,
      };

      const wordSortData = await getWordViewSearch(researchQuery);
      const sortTermGridData = bindingWordRowData(wordSortData);
      rowFcData.value = sortTermGridData;
    } else {
      const sortParts = sortState.value.map(
        (column) => `${column.headerName} ${column.sort}`
      );
      sortQuery.value = sortParts.join(', ');
      sortStateQuery.value = sortQuery.value;

      const researchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: wordDictionarySearchCode.value,
        query: searchInput.value,
        sort: sortQuery.value,
      };

      const wordSortData = await getWordViewSearch(researchQuery);
      const sortTermGridData = bindingWordRowData(wordSortData);
      rowFcData.value = sortTermGridData;
    }
    firstRowSelectedEvent();
  };

  const handleScrollChanged = (params) => (endScrollStaus) => {
    const {
      rowFcData,
      agGrid,
      currentRowIndex,
      columnDefs,
      useMetaMngInstId,
      useDctnryId,
      wordDictionarySearchCode,
      searchInput,
      addGridRowData,
    } = params;

    if (endScrollStaus === 'Y' && rowFcData.value != null) {
      const lastRowNode =
        agGrid.value.gridApi.getRenderedNodes()[
          agGrid.value.gridApi.getRenderedNodes().length - 1
        ];

      currentRowIndex.value = lastRowNode.rowIndex;

      const lastItem =
        rowFcData.value.length > 0
          ? rowFcData.value[rowFcData.value.length - 1]
          : null;

      const sortedColumns = columnDefs.value
        .filter((col) => col.sortIndex !== null && col.sort !== null)
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .map(
          (col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
        );

      const sortQuery = sortedColumns.join(', ');

      let wordResearchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: wordDictionarySearchCode.value,
        lastItem: {
          instituteId: lastItem.instituteId,
          dictionaryId: lastItem.dictionaryId,
          dictionaryName: lastItem.dictionaryName,
          dictionaryTypeName: lastItem.wordName[0].type,
          dictionaryTypeForegroundColorName: lastItem.wordName[0].color,
          dictionaryTypeBackgroundColorName: lastItem.wordName[0].bgColor,
          wordName: lastItem.wordName[0].label,
          wordAbbreviationName: lastItem.wordAbbreviationName,
          wordTypeName: lastItem.wordTypeName,
          domainClassName: lastItem.domainClassName,
          synonymList: lastItem.synonymList,
          revisionDate: lastItem.revisionDate,
          updater: lastItem.updater,
          updateDateTime: lastItem.updateDateTime,
        },
        query: searchInput.value,
        sort: sortQuery,
      };

      addGridRowData(wordResearchQuery);
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
