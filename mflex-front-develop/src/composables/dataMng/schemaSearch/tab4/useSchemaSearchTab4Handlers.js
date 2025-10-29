import { reactive, ref } from 'vue';
import { handleColumnStateChanged as utilHandleColumnStateChanged } from '@/utils/js/searchModule';
import { getForeignKeyList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

export function useSchemaSearchTab4Handlers() {
  const handleSetGridApi = (gridApi) => (params) => {
    console.log('handleSetGridApi : ', params);
    gridApi.value = params;
    console.log('gridApi.value : ', gridApi.value);
  };

  const handleChangeSearchType = (searchType) => (searchTypeData) => {
    console.log('handleChangeSearchType : ', searchTypeData);
    searchType.value = searchTypeData;
  };

  const handleColumnStateChanged = (params) => (newColumnState) => {
    const {
      gridApi,
      columnDefs,
      tab4GridId,
      uiStore,
      saveGridInfoToStorage,
      getGridInfoFromStorage,
    } = params;

    console.log('컬럼 이동 핸들러 동작 ====');
    console.log('newColumnState : ', newColumnState);

    // 새 컬럼 헤드 정의
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

        return {
          ...colDef,
          width: colState.width,
          minWidth: colState.minWidth,
          hide: colState.hide,
          pinned: colState.pinned,
          sort: colState.sort,
          sortIndex: colState.sortIndex,
          suppressSorting: true,
          comparator: () => 0,
          valueFormatter: null,
          cellRenderer: null,
        };
      })
      .filter((colDef) => colDef != null);

    console.log('newColumnFcDefs : ', newColumnFcDefs);

    gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
    columnDefs.value = newColumnFcDefs;

    // localStorage에서 gridData json 파싱, MFGRD063에 대한 값 변경
    const gridStorage = JSON.parse(getGridInfoFromStorage());
    gridStorage.MFGRD063 = newColumnFcDefs;
    // 로컬스토레지에 저장
    saveGridInfoToStorage(gridStorage);
    // 스토어에 저장
    uiStore.setGridColumnDefs('MFGRD063', newColumnFcDefs);
  };

  const handleSortChanged = (params) => async (newSortedState) => {
    const {
      useMetaMngInstId,
      useInfoSysId,
      researchQuery,
      rowData,
      searchDataBinding,
    } = params;

    console.log('newSortedState : ', newSortedState);
    const sortQuery = ref('');
    const sortState = reactive({});

    // newSortedState를 sortIndex를 기준으로 오름차순 정렬
    sortState.value = newSortedState
      .filter((state) => state.sort !== null)
      .sort((a, b) => {
        if (a.sortIndex === undefined && b.sortIndex === undefined) return 0;
        if (a.sortIndex === undefined) return 1;
        if (b.sortIndex === undefined) return -1;
        return a.sortIndex - b.sortIndex;
      });

    console.log('Sorted state:', sortState.value);
    console.log('rowData:', rowData);

    const lastItem =
      rowData.value.length > 0 ? rowData.value[rowData.value.length - 1] : null;
    console.log('lastItem ===', lastItem);

    console.log('sortState :', sortState);

    // sort의 결과가 초기화 상태일 때,
    if (sortState.value.length == 0) {
      const sortResearchQuery = {
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        query: researchQuery.query,
      };

      const sortData = await getForeignKeyList(sortResearchQuery);
      searchDataBinding(sortData);
    } else {
      // 정렬 순서 배열 생성
      const sortParts = sortState.value.map(
        (column) => `${column.headerName} ${column.sort}`
      );

      // 배열의 원소를 문자열로 병합
      sortQuery.value = sortParts.join(', ');

      const sortResearchQuery = {
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        query: researchQuery.query,
        sort: sortQuery.value,
      };

      console.log('sortResearchQuery : ', sortResearchQuery);

      const sortData = await getForeignKeyList(sortResearchQuery);
      searchDataBinding(sortData);
    }
  };

  const handleScrollChanged = (params) => (endScrollStaus) => {
    const { rowData, addGridRowData } = params;

    try {
      if (endScrollStaus === 'Y' && rowData.value != null) {
        const lastItem =
          rowData.value.length > 0
            ? rowData.value[rowData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        addGridRowData(lastItem);
      }
    } catch (error) {
      console.error(error);
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
