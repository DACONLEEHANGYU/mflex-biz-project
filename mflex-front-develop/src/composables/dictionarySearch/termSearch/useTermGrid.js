import { ref, computed, nextTick } from 'vue';
import {
  getUserGridSetting, // 사용자별 Grid 세팅 조회
  setUserGridSetting, // 사용자별 Grid 세팅 설정
  getGridDefaultData, // 그리드 기본값 조회
} from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈
import { useGridIds } from '@/composables/useGridIds.js';
import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
import { getTermViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
import {
  transformTermGridData, // 용어 그리드 설정 변환 함수
  pushTermSearchData, // 용어 검색 데이터 배열 push 함수
  addTermGridData, // 용어 그리드 데이터 추가 함수
  newGridSettingFuc, // 새로운 그리드 설정 함수
  getSortQuery, // 정렬 쿼리 생성 함수
} from '@/composables/dictionarySearch/useTermSearch.js';

const { getGridId } = useGridIds();

// 특정 그리드 ID 가져오기
const termSearchTopGridId = computed(() =>
  getGridId('dictionarySearch', 'termSearchTopGrid')
);

const { setTermViewSelectData } = useDictionarySearchStore();

const getGridInfo = async () => {
  try {
    console.log('termSearchTopGridId:', termSearchTopGridId.value);
    const userGridData = await getUserGridSetting(termSearchTopGridId.value);
    console.log('userGridData:', userGridData);
    const transformedData = await transformTermGridData(userGridData);
    console.log('Transformed Grid Data:', transformedData);
    return transformedData; // transformedData를 반환
  } catch (error) {
    console.error('Error in getGridInfo:', error);
    throw error;
  }
};

const getResearchQuery = (
  useMetaMngInstId,
  useDctnryId,
  columnDefs,
  rowData,
  termQuery,
  termDictionarySearchCode
) => {
  const lastItem =
    rowData.value.length > 0 ? rowData.value[rowData.value.length - 1] : null;
  console.log('lastItem ===', lastItem);

  const termResearchQuery = {
    instituteId: useMetaMngInstId,
    dictionaryId: useDctnryId,
    dictionarySearchCode: termDictionarySearchCode.value,
    lastItem: {
      instituteId: lastItem.instituteId,
      dictionaryId: lastItem.dictionaryId,
      dictionaryName: lastItem.dictionaryName,
      dictionaryTypeName: lastItem.dictionaryTypeName,
      dictionaryTypeForegroundColorName: lastItem.termName[0].color,
      dictionaryTypeBackgroundColorName: lastItem.termName[0].bgColor,
      dictionarySourceCode: lastItem.dictionarySourceCode,
      termName: lastItem.termName[0].label,
      termAbbreviationName: lastItem.termEngAbbreviationName,
      termStandardYnName: lastItem.termStandardYnName,
      termTypeName: lastItem.termType,
      domainName: lastItem.domainName,
      logicalDataTypeName: lastItem.logicalDataTypeName,
      codeTypeName: lastItem.codeTypeName,
      relationCodeName: lastItem.relationCodeName,
      discardYn: lastItem.discardYn,
      revisionDate: lastItem.revisionDate,
      updater: lastItem.lastChangeInfo,
      updateDateTime: lastItem.lastChangeDate,
    },
    query: termQuery.query,
    sort: getSortQuery(columnDefs),
  };

  return termResearchQuery;
};

// 상단 row 선택 이벤트
const firstRowSelectedEvent = (rowData, agGrid) => {
  if (rowData.value.length > 0) {
    nextTick(() => {
      const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
      // 첫 행 select 효과
      const nodesWithRowId0 = document.querySelector('[row-id="0"]');
      // .ag-row-selected 클래스를 추가합니다.
      if (nodesWithRowId0) {
        nodesWithRowId0.classList.add('ag-row-selected');
        nodesWithRowId0.classList.add('ag-row-focus');
        nodesWithRowId0.setAttribute('aria-selected', true);
      }
      if (firstRowData) {
        console.log('emit first-row-selected 실행 ====');
        //emit('first-row-selected', firstRowData);
        // emit('row-selected', firstRowData);
        setTermViewSelectData(firstRowData.data);
      }
    });
  } else {
    setTermViewSelectData(null);
  }
};

const getMapColumnDefs = (columnDefs) => {
  columnDefs.value = columnDefs.value.map((col) => {
    let valueFormatter = null;
    let cellRenderer = null;
    // 필드 값에 따라 조건부로 valueFormatter 설정
    if (col.field === 'termName') {
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
      headerName: col.headerName,
      field: col.field,
      hide: col.hide,
      pinned: col.pinned,
      sortable: col.sortable,
      cellClass: col.cellClass,
      width: col.width,
      sort: col.sort,
      sortIndex: col.sortIndex,
      minWidth: col.minWidth,
      suppressSorting: true,
      comparator: () => 0,
      valueFormatter: valueFormatter,
      cellRenderer: cellRenderer,
    };
  });
};

const getNewColumnState = (columnDefs, newColumnState) => {
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

      // valueFormatter 및 cellRenderer 초기화
      let valueFormatter = null;
      let cellRenderer = null;

      // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정
      if (colDef.field === 'termName') {
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
        cellRenderer = 'TypeCellRenderer'; // 여기서 cellRenderer 설정
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
        valueFormatter: valueFormatter,
        cellRenderer: colDef.field === 'termName' ? cellRenderer : null,
      };
    })
    .filter((colDef) => colDef != null);

  return newColumnFcDefs;
};

/**
 * 정렬 상태를 처리하고 정렬된 배열을 반환하는 함수
 * @param {Array} newSortedState - AG Grid에서 전달된 정렬 상태 배열
 * @returns {Array} 정렬된 상태 배열
 */
const processSortState = (newSortedState) => {
  return newSortedState
    .filter((state) => state.sort !== null) // sort가 null이 아닌 항목만 선택
    .sort((a, b) => {
      // sortIndex가 없는 경우 맨 뒤로 보냄
      if (a.sortIndex === undefined && b.sortIndex === undefined) return 0;
      if (a.sortIndex === undefined) return 1;
      if (b.sortIndex === undefined) return -1;
      // sortIndex를 기준으로 오름차순 정렬
      return a.sortIndex - b.sortIndex;
    });
};

/**
 * 정렬 쿼리 문자열을 생성하는 함수
 * @param {Array} sortState - 정렬된 상태 배열
 * @returns {String} 정렬 쿼리 문자열
 */
const generateSortQuery = (sortState) => {
  const sortParts = sortState.map(
    (column) => `${column.headerName} ${column.sort}`
  );
  return sortParts.join(', ');
};

/**
 * 정렬이 초기화된 경우의 조회 쿼리를 생성하는 함수
 * @param {Object} params - 조회에 필요한 매개변수들
 * @returns {Object} 조회 쿼리 객체
 */
const createResetSortQuery = (params) => {
  const {
    useMetaMngInstId,
    useDctnryId,
    termDictionarySearchCode,
    termQuery,
    columnDefs,
  } = params;

  return {
    instituteId: useMetaMngInstId,
    dictionaryId: useDctnryId,
    dictionarySearchCode: termDictionarySearchCode,
    query: termQuery.query,
    sort: getSortQuery(columnDefs),
  };
};

/**
 * 정렬이 적용된 경우의 조회 쿼리를 생성하는 함수
 * @param {Object} params - 조회에 필요한 매개변수들
 * @param {String} sortQuery - 정렬 쿼리 문자열
 * @returns {Object} 조회 쿼리 객체
 */
const createSortedQuery = (params, sortQuery) => {
  const { useMetaMngInstId, useDctnryId, termDictionarySearchCode, termQuery } =
    params;

  return {
    instituteId: useMetaMngInstId,
    dictionaryId: useDctnryId,
    dictionarySearchCode: termDictionarySearchCode,
    query: termQuery.query,
    sort: sortQuery,
  };
};

/**
 * 용어 데이터 조회 결과를 처리하는 함수
 * @param {Object} termSortData - API 응답 데이터
 * @param {Object} resultCount - 결과 카운트 참조 객체
 * @returns {Array} 변환된 그리드 데이터
 */
const processTermSortData = (termSortData, resultCount) => {
  try {
    console.log('processTermSortData ===================', termSortData);

    const terms = termSortData.data.items;

    // resultCount 업데이트
    if (resultCount) {
      resultCount.value.count = Number(termSortData.data.searchCount);
      resultCount.value.total = Number(termSortData.data.totalCount);
    }

    return pushTermSearchData(terms);
  } catch (error) {
    console.error('Error processing term sort data:', error);
    throw error;
  }
};

/**
 * 정렬 변경 처리를 위한 통합 함수
 * @param {Array} newSortedState - AG Grid에서 전달된 정렬 상태
 * @param {Object} params - 조회에 필요한 모든 매개변수들
 * @param {Object} resultCount - 결과 카운트 참조 객체
 * @returns {Object} { success: boolean, data: Array, error?: Error }
 */
const handleSortChange = async (newSortedState, params, resultCount) => {
  try {
    console.log('handleSortChange - newSortedState:', newSortedState);

    // 정렬 상태 처리
    const sortState = processSortState(newSortedState);

    let researchQuery;

    // 정렬이 초기화된 경우
    if (sortState.length === 0) {
      researchQuery = createResetSortQuery(params);
    } else {
      // 정렬이 적용된 경우
      const sortQuery = generateSortQuery(sortState);
      researchQuery = createSortedQuery(params, sortQuery);
    }

    console.log('Sort research query:', researchQuery);

    // API 호출
    const termSortData = await getTermViewSearch(researchQuery);

    // 데이터 처리
    const sortTermGridData = processTermSortData(termSortData, resultCount);

    return {
      success: true,
      data: sortTermGridData,
      sortQuery: sortState.length > 0 ? generateSortQuery(sortState) : '',
    };
  } catch (error) {
    console.error('Error in handleSortChange:', error);
    return {
      success: false,
      data: [],
      error,
    };
  }
};

// 그리드 선택 효과 리셋
const resetGridSelection = (value) => {
  const selectedRow = document.querySelectorAll('[class~="ag-row-selected"]');
  // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
  selectedRow.forEach((node) => {
    node.classList.remove('ag-row-selected');
  });
  const clickNode = value.id;
  const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
  clickedNode.classList.add('ag-row-selected');
};

export {
  getGridInfo,
  getResearchQuery,
  handleSortChange,
  getMapColumnDefs,
  processSortState,
  generateSortQuery,
  createSortedQuery,
  getNewColumnState,
  resetGridSelection,
  processTermSortData,
  createResetSortQuery,
  firstRowSelectedEvent,
};
