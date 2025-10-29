import { reactive, ref } from 'vue';
import { handleColumnStateChanged as utilHandleColumnStateChanged } from '@/utils/js/searchModule';
import { getColumnList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

export function useSchemaSearchTab2Handlers() {
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
    const { gridApi, columnDefs, tab2GridId } = params;

    utilHandleColumnStateChanged(
      gridApi,
      newColumnState,
      tab2GridId.value,
      columnDefs
    );
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

      const termSortData = await getColumnList(sortResearchQuery);
      console.log('termSortData : ', termSortData);

      // 정렬 조회결과 바인딩 및 rowData 할당
      searchDataBinding(termSortData);
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

      const tableSortData = await getColumnList(sortResearchQuery);
      console.log('tableSortData : ', tableSortData);

      searchDataBinding(tableSortData);
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
