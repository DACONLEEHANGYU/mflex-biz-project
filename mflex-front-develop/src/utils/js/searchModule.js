import { useUiStore } from '@/stores/ui';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';
import { storeToRefs } from 'pinia';

import {
  getUserGridSetting, // 사용자별 Grid 세팅 조회
  setUserGridSetting, // 사용자별 Grid 세팅 설정
  getGridDefaultData, // 그리드 기본값 조회
} from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

const uiStore = useUiStore();

// 그리드 초기화
const initializeGridColumnDefs = (gridId) => {
  console.log('그리드 초기화 모듈 실행 ===');

  console.log('gridId : ', gridId);
  const storedColumnDefs = JSON.parse(getGridInfoFromStorage());

  console.log('storedColumnDefs : ', storedColumnDefs);
  console.log('storedColumnDefs.gridId : ', storedColumnDefs.gridId);

  if (storedColumnDefs && storedColumnDefs.gridId) {
    uiStore.setGridColumnDefs(gridId, storedColumnDefs);
  }
};

//그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
function handleColumnStateChanged(gridApi, newColumnState, gridId, columnDefs) {
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

      // valueFormatter 및 cellRenderer 초기화
      let valueFormatter = null;
      let cellRenderer = null;

      console.log('colDef.field : ', colDef.field);

      // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정
      // if (
      //   colDef.field === 'termName' ||
      //   colDef.field === 'domainName' ||
      //   colDef.field === 'relatedCodeName'
      // ) {
      //   valueFormatter = (params) => {
      //     if (
      //       params.value &&
      //       Array.isArray(params.value) &&
      //       params.value.length > 0
      //     ) {
      //       return params.value[0].excVal;
      //     }
      //     return '';
      //   };
      //   cellRenderer = 'TypeCellRenderer'; // 여기서 cellRenderer 설정
      // }
      // else if (colDef.field === 'rvsnDt') {
      //   valueFormatter = (params) => {
      //     const value = params.value;
      //     if (value && value.length === 8) {
      //       return `${value.substring(0, 4)}-${value.substring(
      //         4,
      //         6
      //       )}-${value.substring(6)}`;
      //     }
      //     return value;
      //   };
      // }

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
        cellRenderer: null,
      };
    })
    .filter((colDef) => colDef != null);

  //columnFcDefs.value = newColumnFcDefs; */

  console.log('newColumnFcDefs : ', newColumnFcDefs);

  gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

  columnDefs.value = newColumnFcDefs;

  // localStorage에 에서 gridData json 파싱, MFGRD017에 대한 값 변경
  const gridStorage = JSON.parse(getGridInfoFromStorage());
  gridStorage[gridId] = newColumnFcDefs;

  console.log('새 저장 - gridStorage : ', gridStorage);

  // 로컬스토레지에 저장
  saveGridInfoToStorage(gridStorage);
  // 스토어에 저장
  uiStore.setGridColumnDefs(gridId, newColumnFcDefs);
}

// 스크롤 변경 이벤트
const handleScrollChanged = (endScrollStaus, rowData) => {
  try {
    if (endScrollStaus === 'Y' && rowData.value != null) {
      const lastItem =
        rowData.value.length > 0
          ? rowData.value[rowData.value.length - 1]
          : null;
      console.log('lastItem ===', lastItem);
      return lastItem;
    }
  } catch (error) {
    console.error(error);
  }
};

// 필터 및 정렬 삭제
const onSearchRemove = async (gridApi, gridId, columnDefs, gridDefaultData) => {
  console.log('onSearchRemove 함수 실행 ===');
  console.log('gridApi : ', gridApi);
  console.log('gridId : ', gridId);

  console.log('gridDefaultData : ', gridDefaultData);

  columnDefs.value = gridDefaultData[gridId];

  const gridStorage = JSON.parse(getGridInfoFromStorage());
  gridStorage[gridId] = gridDefaultData[gridId];
  saveGridInfoToStorage(gridStorage);

  uiStore.setGridColumnDefs(gridId, columnDefs.value);
  gridApi.setGridOption('columnDefs', columnDefs.value);

  // await updateGridData(termQuery);
};

// 팝업 필터 저장 핸들러
const onFilterWindowClosed = (filterSet, gridApi, gridId, columnDefs) => {
  // 필터 창이 닫힐 때 수행하고 싶은 로직
  console.log('필터 창이 닫혔습니다.');
  console.log('filterSet : ', filterSet);

  const gridStorage = JSON.parse(getGridInfoFromStorage());

  columnDefs.value = gridStorage[gridId];

  // gridApi.value.setGridOption('columnDefs', gridStorage[gridId]);
};

// 쿼리생성기 컬럼 업데이트
const columnDefsUpdate = (sortString, columnDefs, gridId, gridApi) => {
  console.log('쿼리생성기 컬럼 업데이트');

  console.log('sortString : ', sortString);
  console.log('columnDefs : ', columnDefs);
  console.log('gridId : ', gridId);
  console.log('gridApi : ', gridApi);

  if (!sortString) return;

  const columns = columnDefs.value ? columnDefs.value : columnDefs;
  const gridApis = gridApi.value ? gridApi.value : gridApi;

  const sortConditions = sortString.split(',').map((condition) => {
    const [field, order] = condition.trim().split(' ');
    return {
      field: field,
      order: order.toLowerCase(), // desc 또는 asc
    };
  });

  // columnDefs 업데이트
  const updateColumnDefs = columns.map((column) => {
    // 해당 컬럼의 정렬 조건 찾기
    const sortCondition = sortConditions.find(
      (condition) => column.headerName === condition.field
    );

    if (sortCondition) {
      return {
        ...column,
        sort: sortCondition.order, // desc 또는 asc 설정
        sortIndex: sortConditions.indexOf(sortCondition), // 정렬 순서 설정
      };
    }
    return {
      ...column,
      sort: null, // 정렬 조건이 없는 컬럼은 초기화
    };
  });

  uiStore.setGridColumnDefs(gridId, updateColumnDefs);

  const gridStorage = JSON.parse(getGridInfoFromStorage());
  gridStorage[gridId] = updateColumnDefs;
  saveGridInfoToStorage(gridStorage);

  gridApis.setGridOption('columnDefs', updateColumnDefs);

  return updateColumnDefs;
};

// 정렬 쿼리 생성
const getSortQuery = (columnDefs) => {
  // 정렬이 적용된 모든 열을 찾습니다.
  const sortedColumns = columnDefs.value
    .filter((col) => col.sort && col.sortIndex !== undefined)
    .sort((a, b) => a.sortIndex - b.sortIndex);

  console.log('sortedColumns : ', sortedColumns);

  // 정렬 쿼리 문자열을 생성합니다.
  const sortQuery =
    sortedColumns.length > 0
      ? sortedColumns.map((col) => `${col.headerName} ${col.sort}`).join(', ')
      : '';

  return sortQuery;
};

export {
  initializeGridColumnDefs, // 그리드 초기화
  handleColumnStateChanged, // 그리드 컬럼 이동 및 사이즈 변경 이벤트
  onSearchRemove, // 필터 및 정렬 삭제
  onFilterWindowClosed, // 팝업 필터 저장 핸들러
  handleScrollChanged, // 스크롤 변경 이벤트
  columnDefsUpdate, // 쿼리생성기 컬럼 업데이트
  getSortQuery, // 정렬 쿼리 생성
};
