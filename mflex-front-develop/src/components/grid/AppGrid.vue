<template>
  <!-- style="height: 100%"  개발자 추가 : :multiSortKey="'ctrl'"  @sortChanged="onSortChanged" -->
  <ag-grid-vue
    class="ag-theme-balham-dark"
    :class="{ useHorizontalScroll: horizontalScroll }"
    :style="{ height: gridHeight, opacity: gridVisible }"
    :gridOptions="gridOptions"
    :columnDefs="columnDefs"
    :rowData="rowData.value"
    :defaultColDef="defaultColDef"
    :rowSelection="rowSelection"
    :suppressRowClickSelection="rowSelectDisabled"
    :suppressDragLeaveHidesColumns="true"
    :suppressColumnMoveAnimation="false"
    animateRows="true"
    enableServerSideSorting="true"
    :overlayLoadingTemplate="overlayLoadingTemplate"
    :context="context"
    :tooltipShowDelay="0"
    :tooltipHideDelay="5000"
    :tooltipMouseTrack="true"
    :multiSortKey="'ctrl'"
    @cellDoubleClicked="onCellDoubleClicked"
    @rowClicked="onRowClicked"
    @selectionChanged="onSelectionChanged"
    @sortChanged="onSortChanged"
    @grid-ready="onGridReady"
    @bodyScroll="onBodyScroll"
  >
  </ag-grid-vue>
</template>

<script setup>
  import { AgGridVue } from 'ag-grid-vue3';
  import {
    onMounted,
    onBeforeUnmount,
    onUnmounted,
    ref,
    onActivated,
    onDeactivated,
    watch,
  } from 'vue';
  import CustomTooltip from '@/utils/CustomTooltip.js';

  const gridVisible = ref(1);

  const props = defineProps({
    columnDefs: {
      type: Array,
      required: true,
      default: () => [],
    },
    rowData: {
      type: Object,
      required: true,
      default: () => {},
    },
    rowSelection: {
      type: String,
      default: 'single', //single, multiple
    },
    rowSelectDisabled: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Object,
      default: () => {},
    },
    domLayout: {
      type: String,
      default: 'normal', // autoHeight, normal
    },
    gridHeight: {
      type: String,
      default: '100%', // domLayout:normal -> 100%, domLayout:autoHeight -> auto
    },
    //가로 스크롤
    horizontalScroll: {
      type: Boolean,
      default: true,
    },
    tooltipComponent: {
      type: String,
      default: '',
    },
    resultCount: {
      type: Object,
      default: () => {},
    },
    newSetColumnDefs: {
      type: Array,
      default: () => [],
    },
  });

  //'sort-changed', 개발자 추가 sort 관련 이벤트
  //'rowClicked', LEEHANGYU 추가 행 클릭 이벤트
  const emit = defineEmits([
    'rowClicked',
    'rowDoubleClicked',
    'rowOver',
    'rowOut',
    'sort-changed',
    'body-scroll',
    'column-state-changed',
    'cellDoubleClicked',
    'cell-doubbleClick',
    'cellWasClicked',
    'gridApi',
    'selectionChanged',
  ]);

  const gridApi = ref(null);
  const gridColumnApi = ref(null); //개발자 추가

  const onGridReady = (params) => {
    gridApi.value = params.api;
    gridColumnApi.value = params.columnApi; //개발자 추가

    emit('gridApi', gridApi.value);
    console.log('gridColumnApi.value : ', gridColumnApi.value);

    // defaultColDef 초기 설정
    gridOptions.defaultColDef = defaultColDef.value;

    /* initializeDragAndDrop(); */
    /* // defaultColDef 초기 설정
      gridApi.value.setColumnDefs(props.columnDefs, defaultColDef.value); */

    // 스크롤 이벤트 핸들러 등록
    gridApi.value.addEventListener('bodyScroll', onBodyScroll);
    //gridApi.value.addEventListener('columnMoved', onColumnMoved);
    gridApi.value.addEventListener('columnMoved', onColumnMoved);

    //gridApi.value.addEventListener('columnPivotModeChanged', onRowDragEnter);
    gridApi.value.addEventListener('columnPinned', onRowDragEnd);
    // 칼럼 위치 변경 이벤트 리스너 추가

    gridApi.value.addEventListener(
      'columnHeaderMouseOver',
      initializeDragAndDrop
    );

    //칼럼 사이즈 변경 이벤트 리스너 추가
    gridApi.value.addEventListener('columnResized', onColumnResized);
    //드레그 앤 드랍 추가
    //initializeDragAndDrop();
    //this.$refs.agGrid.initializeDragAndDrop();

    // 스크롤 동작 API 추가
    gridApi.value.ensureIndexVisible(0, 'top');
    setTimeout(sizeToFit, 150);

    //gridApi.value.setGridOption('columnDefs', newColumnDefs);
  };

  const defaultColDef = ref({
    suppressMovable: true, // false : 칼럼 이동 가능, true : 칼럼 고정 개발자 변경 : true > false
    sortable: false,
    filter: false,
    // flex: 1,
    resizable: true,
    suppressSorting: true,
    //comparator: () => 0,
    // tooltipComponent: props.tooltipComponent,
    tooltipComponent: CustomTooltip,
    headerComponentParams: (params) => {
      const baseTemplate = `
      <div class="ag-cell-label-container" role="presentation">
        <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
        <span ref="eFilterButton" class="ag-header-icon ag-header-cell-filter-button"></span>
        <div ref="eLabel" class="ag-header-cell-label" role="presentation">
          <span ref="eSortOrder" class="ag-header-icon ag-sort-order"></span>
          <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>
          <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>
          <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"></span>

          <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
          <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
        </div>
      </div>`;

      const dragIconTemplate = `
        <div class="ag-cell-label-container" role="presentation">
          <div class="drag-icon-container"><div class="drag-icon">&#8285</div></div>
                <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
                <span ref="eFilterButton" class="ag-header-icon ag-header-cell-filter-button"></span>
                <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                  <span ref="eSortOrder" class="ag-header-icon ag-sort-order"></span>
                  <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>
                  <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>
                  <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"></span>
                  <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
                  <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
                </div>
              </div>
    `;

      return {
        template:
          params.column.colDef.headerName === '번호' ||
          params.column.colDef.headerName === '순서' ||
          params.column.colDef.headerName === '' ||
          params.column.colDef.dragStatus === false
            ? baseTemplate
            : dragIconTemplate,
      };
    },
  });

  // 복사 이벤트 핸들러 등록
  const handleKeydown = (event) => {
    // AG Grid 셀 내부인지 확인
    const isAgGridCell = event.target && event.target.closest('.ag-cell');

    if (event.ctrlKey && event.key === 'c') {
      if (isAgGridCell) {
        // AG Grid 셀 내부에서의 복사 동작
        const selectedCell = gridApi.value.getFocusedCell();
        if (selectedCell) {
          const rowNode = gridApi.value.getRowNode(selectedCell.rowIndex);
          const cellValue = Array.isArray(
            rowNode.data[selectedCell.column.getId()]
          )
            ? rowNode.data[selectedCell.column.getId()][0]?.label
            : rowNode.data[selectedCell.column.getId()];
          copyToClipboard(cellValue, event);
          event.preventDefault(); // 기본 복사 동작 방지
        }
      } else {
        // AG Grid 셀 외부에서는 기본 브라우저 복사 기능 사용
        // 아무 작업도 하지 않음 (기본 동작 유지)
      }
    }
  };

  let lastSelectedNode = null;
  const gridOptions = {
    pagination: false,
    paginationAutoPageSize: false,
    domLayout: props.domLayout,
    headerHeight: 30,
    enableCellTextSelection: true,
    rowHeight: 27,
    localeText: { noRowsToShow: '데이터가 없습니다.' },
    alwaysShowHorizontalScroll: false,
    popupParent: document.querySelector('body'),
    // 스크롤 상단 이동 억제 option
    suppressScrollOnNewData: true,

    navigateToNextCell: (params) => {
      const nextRowIndex = params.nextCellPosition.rowIndex;
      const node = gridApi.value.getRowNode(
        gridApi.value.getDisplayedRowAtIndex(nextRowIndex).id
      );
      console.log('navigeteNode : ', node.data);
      emit('rowClicked', node.data);
      if (node) {
        if (lastSelectedNode) {
          lastSelectedNode.setSelected(false);
        }
        node.setSelected(true);
        lastSelectedNode = node;
        gridApi.value.ensureIndexVisible(nextRowIndex);
      }
      return params.nextCellPosition;
    },

    // onRowDoubleClicked: onDoubleClicked,
    onRowClicked: (event) => onRowClicked(event),
    onRowDoubleClicked: (event) => onRowDoubleClicked(event),
    onCellDoubleClicked: (event) => onCellDoubleClicked(event),
    onCellMouseOver: (event) => onRowOver(event),
    onCellMouseOut: (event) => onRowOut(event),
  };

  const overlayLoadingTemplate =
    '<span class="ag-overlay-loading-center"><div class="loader"></div></div></span>';

  // Row 클릭(항상 실행)
  const onRowClicked = (event) => {
    console.log('onRowClicked event ', event.event.target.style);
    emit('rowClicked', event.data);
  };

  const onCellDoubleClicked = (event) => {
    console.log('onCellDoubleClicked event ', event);

    // 클립보드에 복사할 값
    let clipboardText = '';
    if (Array.isArray(event.value) && event.value.length) {
      console.log(event.value[0].label);
      clipboardText = event.value[0].label;
    } else {
      console.log('event.node.value', event.value);
      clipboardText = event.value;
    }

    copyToClipboard(clipboardText, event);
    emit('cellDoubleClicked', event);
  };

  const copyToClipboard = (text, event) => {
    console.log('클립보드 카피 이벤트 : ', event);

    // target 요소에서 가장 가까운 상위 셀(div) 요소를 찾습니다.
    const targetCell = event.event
      ? event.event.target.closest('.ag-cell')
      : event.target.closest('.ag-cell');

    console.log('copy-text : ', text);

    if (navigator.clipboard) {
      // 클립보드 API가 지원되는 경우
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log('Text copied to clipboard:', text);

          // 셀의 원래 배경색을 저장하고, 임시로 변경

          console.log('targetCell.style : ', targetCell.style);
          console.log(
            'targetCell.style.backgroundColor; : ',
            targetCell.style.backgroundColor
          );

          targetCell.style.backgroundColor = '#F3D2AB'; // 원하는 색상으로 변경
          targetCell.style.transition = 'background-color 0.3s ease'; // 1초 동안 천천히 배경색이 변화하도록 설정

          // 일정 시간 후에 원래 색상으로 천천히 복구
          setTimeout(() => {
            targetCell.style.backgroundColor = '';
          }, 1000);
        })
        .catch((error) => {
          console.error('Failed to copy text to clipboard:', error);
        });
    } else {
      // 클립보드 API가 지원되지 않는 경우
      try {
        // document.execCommand('copy')를 사용하여 텍스트 복사
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();

        const result = document.execCommand('copy');
        if (result) {
          console.log('Text copied to clipboard:', text);

          // 셀의 원래 배경색을 저장하고, 임시로 변경
          const originalBackgroundColor = targetCell.style.backgroundColor;
          targetCell.style.backgroundColor = '#df820a7d'; // 원하는 색상으로 변경
          targetCell.style.transition = 'background-color 0.1s ease'; // 1초 동안 천천히 배경색이 변화하도록 설정

          // 일정 시간 후에 원래 색상으로 천천히 복구
          setTimeout(() => {
            targetCell.style.backgroundColor = originalBackgroundColor;
          }, 1000);
        } else {
          console.error('Failed to copy text to clipboard');
        }
        document.body.removeChild(tempInput);
      } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
      }
    }
  };

  // Row 클릭(선택 Row가 변경시에만 실행)
  const onSelectionChanged = () => {
    emit('selectionChanged', gridApi.value.getSelectedRows());
    console.log('행선택 변경');
  };

  const sizeToFit = () => {
    // autoSizeAll(); < 원래 주석
    //if (props.horizontalScroll) { //이하 최신 변경 주석
    //  autoSizeAll();
    //} else {
    //  gridApi.value.sizeColumnsToFit();
    //  console.log('resize~~~', props.horizontalScroll);
    // }
  };

  const onColumnResized = (event) => {
    // 변경된 칼럼 사이즈 정보 처리
    //console.log('Column resized', event);
    let columnState = gridApi.value.getColumnState();
    console.log('Column resized', columnState);
    console.log('ag-gird props.columnDefs : ', props.columnDefs);

    // columnState에 minWidth 추가
    columnState = columnState.map((state) => {
      const matchingDef = props.columnDefs.find(
        (def) => def.field === state.colId
      );
      if (matchingDef && matchingDef.minWidth) {
        return { ...state, minWidth: matchingDef.minWidth };
      }
      return state;
    });

    console.log('Updated Column State', columnState);

    //TopComp로 전달용
    emit('column-state-changed', columnState);
  };

  const onColumnMoved = (event) => {
    // 변경된 칼럼 위치 정보 처리
    // console.log('Column moved', event);
    let columnState = gridApi.value.getColumnState();
    // 칼럼 상태 정보를 DB에 보낼 로직 구현

    console.log('Column moved', columnState);
    console.log('ag-gird props.columnDefs : ', props.columnDefs);
    // toggleHeaderDraggable(false);
    // columnState에 minWidth 추가
    columnState = columnState.map((state) => {
      const matchingDef = props.columnDefs.find(
        (def) => def.field === state.colId
      );
      if (matchingDef && matchingDef.minWidth) {
        return { ...state, minWidth: matchingDef.minWidth };
      }
      return state;
    });

    console.log(
      'document.querySelector("ag-header-cell-moving")',
      document.querySelectorAll('.ag-header-cell-moving')
    );

    const headMoveCell = document.querySelectorAll('.ag-header-cell-moving');

    //onRemoveAttribute();
    //TopComp로 전달용
    columnHeaderDragState.value = true;
    initializeDragIconEvents();
    emit('column-state-changed', columnState);
    console.log('headMoveCell.length : ', headMoveCell.length);

    if (headMoveCell.length === 0) {
      isDragState.value = false;
      // toggleBodySelectCSS(false);
      removeUserDragEvent();
    }
  };

  const onRowDoubleClicked = (event) => {
    emit('rowDoubleClicked', event.data);
  };

  const onRowOver = (event) => {
    emit('rowOver', event.data);
  };
  const onRowOut = (event) => {
    emit('rowOut', event.data);
  };

  onMounted(() => {
    // autoSizeAll();
    window.addEventListener('keydown', handleKeydown);

    setTimeout(sizeToFit, 100);
    //window.addEventListener('resize', sizeToFit);
    setTimeout(() => {
      gridVisible.value = 1;
    }, 150);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    console.log('onUnmounted~~~');
    window.removeEventListener('resize', sizeToFit);
  });

  onActivated(() => {
    console.log('onActivated AppGrid');
    setTimeout(sizeToFit, 100);
    window.addEventListener('resize', sizeToFit);
    setTimeout(() => {
      gridVisible.value = 1;
    }, 100);
  });
  onDeactivated(() => {
    console.log('onDeactivated AppGrid');
    window.removeEventListener('resize', sizeToFit);
    gridApi.value.setGridOption('columnDefs', props.columnDefs);
    console.log('props.columnDefs :', props.columnDefs);
  });

  const onSortChanged = (event) => {
    console.log('event :', event);
    console.log('props.columnDefs :', props.columnDefs);

    window.colState = gridApi.value.getColumnState();
    let lastRowIndex = gridApi.value.getDisplayedRowCount() - 1;
    console.log(
      'gridApi.value.getDisplayedRowAtIndex(lastRowIndex) : ',
      gridApi.value.getDisplayedRowAtIndex(lastRowIndex)
    );

    let columnDefs = gridApi.value.getColumnState();

    // columnState에 minWidth 추가
    columnDefs = columnDefs.map((state) => {
      const matchingDef = props.columnDefs.find(
        (def) => def.field === state.colId
      );
      if (matchingDef && matchingDef.minWidth) {
        return { ...state, minWidth: matchingDef.minWidth };
      }
      return state;
    });

    let newSortedState = window.colState
      .filter((s) => s.sort != null)
      .map((s) => {
        let columnDef = columnDefs.find((def) => def.colId === s.colId);
        console.log('columnDefs : ', columnDefs);
        console.log('columnDef :', columnDef);
        console.log('s :', s);
        let sorted = true;

        // headerName 설정 로직
        let headerName;
        if (event.columns && event.columns.length > 0) {
          // event.columns 배열에서 현재 칼럼과 일치하는 항목 찾기
          const matchingColumn = event.columns.find(
            (col) => col.colDef.field === s.colId
          );
          console.log('matchingColumn : ', matchingColumn);
          // 일치하는 항목이 있다면 그 headerName 사용, 없다면 props.columnDefs에서 colId와 일치하는 항목의 headerName 사용
          headerName = matchingColumn
            ? matchingColumn.colDef.headerName
            : props.columnDefs.find((def) => def.field === s.colId)?.headerName;
        } else {
          // event.columns가 없거나 비어있다면 props.columnDefs에서 colId와 일치하는 항목의 headerName 사용
          headerName = props.columnDefs.find(
            (def) => def.field === s.colId
          )?.headerName;
        }

        return {
          colId: s.colId,
          headerName: headerName,
          field: columnDef ? columnDef.field : null,
          sort: s.sort,
          sortIndex: s.sortIndex,
          suppressSorting: true,
          sorted: sorted,
        };
      });

    // sortIndex에 따라 정렬
    newSortedState.sort((a, b) => {
      // sortIndex가 없는 경우 맨 뒤로 보냄
      if (a.sortIndex === undefined && b.sortIndex === undefined) return 0;
      if (a.sortIndex === undefined) return 1;
      if (b.sortIndex === undefined) return -1;
      // sortIndex를 기준으로 오름차순 정렬
      return a.sortIndex - b.sortIndex;
    });

    emit('sort-changed', newSortedState);
    emit('column-state-changed', columnDefs);
  };

  //개발자 추가 AG Grid CSV파일 다운로드
  const exportCsv = (prefix = 'Data') => {
    if (gridApi.value) {
      const now = new Date();
      const datetime = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now
        .getHours()
        .toString()
        .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;
      const fileName = `${prefix}_${datetime}.csv`;
      gridApi.value.exportDataAsCsv({ fileName });
    }
  };

  const onBodyScroll = (event) => {
    console.log('onBodyScroll : ', event);

    if (event.direction === 'vertical') {
      const displayedRowCount = gridApi.value.getDisplayedRowCount();
      const rowHeight = 27; //
      const viewportHeight = displayedRowCount * rowHeight;
      const scrollPosition = gridApi.value.getVerticalPixelRange();
      const maxScrollTop = scrollPosition.bottom - viewportHeight;

      let endScrollStaus = 'N';
      // 스크롤이 끝에 도달했는지 확인
      //if (scrollPosition.top >= maxScrollTop) {

      console.log('scrollPosition : ', scrollPosition);
      console.log('viewportHeight : ', viewportHeight);

      if (scrollPosition.bottom >= viewportHeight) {
        //console.log('스크롤 끝에 도달함');
        endScrollStaus = 'Y';
      }

      // console.log('endScrollStaus : ', endScrollStaus);
      emit('body-scroll', endScrollStaus);
      // console.log('동작해요 onBodyScroll');
    }
  };

  ////
  const columnHeaderDragState = ref(false);

  // 드래그 시작 시 스타일 적용 함수
  const addUserDragEvent = () => {
    const body = document.body;
    const agGridCells = document.querySelectorAll('.ag-cell');

    body.classList.add('no-select');
    agGridCells.forEach((cell) => cell.classList.add('no-select'));
  };

  let preventSelectTimeout;

  // 사용자 드래그불가 이벤트 삭제
  const removeUserDragEvent = () => {
    console.log('removeUserDragEvent ==================');
    if (preventSelectTimeout) {
      clearTimeout(preventSelectTimeout);
    }

    preventSelectTimeout = setTimeout(() => {
      const body = document.body;
      const agGridCells = document.querySelectorAll('.ag-cell');

      body.classList.remove('no-select');
      body.style.removeProperty('user-select');

      agGridCells.forEach((cell) => cell.classList.remove('no-select'));

      // 현재 선택된 텍스트 취소
      if (window.getSelection) {
        console.log('window.getSelection() : ', window.getSelection());
        if (window.getSelection().empty) {
          // Chrome
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
          // Firefox
          window.getSelection().removeAllRanges();
        }
      } else if (document.selection) {
        // IE
        document.selection.empty();
      }

      // 추가적인 선택 방지
      const preventSelect = (e) => {
        e.preventDefault();
      };

      document.addEventListener('selectstart', preventSelect);
      setTimeout(() => {
        document.removeEventListener('selectstart', preventSelect);
      }, 100);
    }, 50);
  };

  const isDragState = ref(false);

  //드레그 앤 드랍 설정 추가
  const initializeDragAndDrop = () => {
    // // const headMoveCell = document.querySelectorAll('.ag-header-cell-moving');
    // 컬럼이 움직이지 않고 있고, grid 설정이 드래그 가능하도록 되어있고, 드래그 상태가 true인 경우 드래그 설정 불가하도록 설정

    if (
      document.querySelectorAll('.ag-header-cell-moving').length == 0 &&
      gridOptions.defaultColDef.suppressMovable === false &&
      columnHeaderDragState.value == true
    ) {
      toggleHeaderDraggable(false);
      return;
    }

    // 헤더 셀에 드래그 이벤트 리스너를 등록합니다.
    const headers = document.querySelectorAll('.ag-header-cell-label');
    // //const headers = document.querySelectorAll('.ag-header-cell-text');
    headers.forEach((header) => {
      //console.log('initializeDragAndDrop >>>');
      header.setAttribute('draggable', true);
      header.addEventListener('dragstart', onDragStart);
      header.addEventListener('dragend', onDragEnd); // 추가된 부분
      //header.hasEventListener = true;
    });
    // // 드래그아이콘 에 이벤트 추가
    initializeDragIconEvents();
    // // headerEventListenersAdded = true;
    columnHeaderDragState.value = false;
  };

  // 드래그 아이콘에 대한 이벤트 처리를 별도의 함수로 분리
  const initializeDragIconEvents = () => {
    const dragIcons = document.querySelectorAll('.drag-icon');
    // const dragIcon = document.querySelector('.drag-icon');

    const headers = document.querySelectorAll('.ag-header-cell-label');

    dragIcons.forEach((dragIcon) => {
      //dragIcon.addEventListener('mouseenter', onDragIconMouseEnter);

      dragIcon.addEventListener('mousedown', onDragIconMouseEnter);
      dragIcon.addEventListener('mouseup', onDragIconMouseUp);

      // dragIcon.addEventListener('dragstart', onDragStart);
      dragIcon.addEventListener('dragend', onDragEnd);
      //dragIcon.addEventListener('mouseleave', onDragIconMouseLeave);
    });
  };

  const onDocumentMouseUp = (event) => {
    console.log('document mouseup ==================');
    console.log('isDragState.value : ', isDragState.value);

    if (isDragState.value) {
      onDragIconMouseUp(event);
    }
  };

  // .drag-icon에 마우스가 올려졌을 때 실행되는 함수
  const onDragIconMouseEnter = (event) => {
    isDragState.value = true;
    console.log('헤더 드래그 가능');
    const style = document.body.style;

    style.setProperty('user-select', 'none');
    style.setProperty('-webkit-user-select', 'none');
    style.setProperty('-moz-user-select', 'none');
    style.setProperty('-ms-user-select', 'none');

    const agCells = document.querySelectorAll('.ag-cell');
    toggleHeaderDraggable(true);
    console.log('gridOptions.defaultColDef ==', gridOptions.defaultColDef);
  };

  const onDragIconMouseUp = (event) => {
    console.log('헤더 드래그 불가능');

    const style = document.body.style;

    removeUserDragEvent();

    toggleHeaderDraggable(false);
  };

  const onDragStart = (event) => {
    const dragIcon = event.target.closest('.drag-icon');
    const headerCell = event.target.closest('.ag-header-cell');

    console.log('dragIcon', dragIcon);
    if (dragIcon) {
      console.log('dragIcon dragStart');
      console.log('dragIcon');
    } else if (headerCell) {
      //toggleHeaderDraggable(false);
      console.log('headerCell dragStart');
      const colId = headerCell.getAttribute('col-id');
      const column = gridApi.value.getColumn(colId);
      if (column) {
        console.log('Dragged Column:', column);
        event.dataTransfer.setData(
          'text/plain',
          `${column.colDef.headerName} = ''`
        );
      }
    }
  };

  // const onDragStart = (event) => {
  //   const dragIcon = event.target.closest('.drag-icon');
  //   const headerCell = event.target.closest('.ag-header-cell');

  //   if (dragIcon) {
  //     console.log('dragIcon dragStart');
  //   } else if (headerCell) {
  //     const colId = headerCell.getAttribute('col-id');
  //     const column = gridApi.value.getColumn(colId);

  //     if (column) {
  //       // 컬럼의 데이터 타입에 따라 적절한 검색 템플릿 제공
  //       const searchTemplates = generateSearchTemplates(column);

  //       // 드래그 시 메뉴를 표시하기 위한 커스텀 드래그 이미지 생성
  //       createDragMenu(event, searchTemplates);

  //       // 기본 텍스트는 가장 기본적인 검색 조건으로 설정
  //       event.dataTransfer.setData(
  //         'text/plain',
  //         `${column.colDef.headerName} = ''`
  //       );

  //       // 추가 데이터 설정 (드롭 시 활용 가능)
  //       event.dataTransfer.setData(
  //         'application/json',
  //         JSON.stringify({
  //           colId,
  //           headerName: column.colDef.headerName,
  //           dataType: column.colDef.type || 'string',
  //           templates: searchTemplates,
  //         })
  //       );
  //     }
  //   }
  // };

  // // 컬럼 타입별 검색 템플릿 생성
  // const generateSearchTemplates = (column) => {
  //   const columnName = column.colDef.headerName;
  //   const dataType = column.colDef.type || 'string';

  //   const commonTemplates = [
  //     { label: 'NULL', value: `${columnName} IS NULL` },
  //     { label: '정확히 일치', value: `${columnName} = ''` },
  //     { label: 'NOT NULL', value: `${columnName} IS NOT NULL` },
  //   ];

  //   const typeSpecificTemplates = {
  //     string: [
  //       { label: '포함', value: `${columnName} LIKE '%_%'` },
  //       { label: '시작', value: `${columnName} LIKE '_%'` },
  //       { label: '끝남', value: `${columnName} LIKE '%_'` },
  //       { label: '여러 값', value: `${columnName} IN ('', '')` },
  //     ],
  //     number: [
  //       { label: '크다', value: `${columnName} > ` },
  //       { label: '작다', value: `${columnName} < ` },
  //       { label: '이상', value: `${columnName} >= ` },
  //       { label: '이하', value: `${columnName} <= ` },
  //       { label: '범위', value: `${columnName} BETWEEN AND ` },
  //     ],
  //     date: [
  //       { label: '이후', value: `${columnName} >= ''` },
  //       { label: '이전', value: `${columnName} <= ''` },
  //       { label: '기간', value: `${columnName} BETWEEN '' AND ''` },
  //       { label: '오늘', value: `${columnName} = CURRENT_DATE` },
  //       {
  //         label: '이번 달',
  //         value: `${columnName} BETWEEN TRUNC(CURRENT_DATE, 'MM') AND LAST_DAY(CURRENT_DATE)`,
  //       },
  //     ],
  //     boolean: [
  //       { label: '참', value: `${columnName} = true` },
  //       { label: '거짓', value: `${columnName} = false` },
  //     ],
  //   };

  //   return [...commonTemplates, ...(typeSpecificTemplates[dataType] || [])];
  // };

  // const createDragMenu = (event, templates) => {
  //   // 기존 드래그 이미지 제거
  //   const emptyImg = new Image();
  //   event.dataTransfer.setDragImage(emptyImg, 0, 0);

  //   let currentIndex = 0; // 현재 선택된 템플릿 인덱스
  //   let currentTemplate = templates[currentIndex];

  //   // 커스텀 드래그 메뉴 생성
  //   const menu = document.createElement('div');
  //   menu.className = 'drag-search-menu';
  //   menu.style.cssText = `
  //       position: fixed;
  //       background: white;
  //       border: 1px solid #ddd;
  //       border-radius: 4px;
  //       padding: 8px;
  //       box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  //       z-index: 9999;
  //   `;

  //   // 현재 선택된 템플릿 표시 요소
  //   const selectedDisplay = document.createElement('div');
  //   selectedDisplay.className = 'selected-template';
  //   selectedDisplay.style.cssText = `
  //       font-weight: bold;
  //       padding: 4px 8px;
  //       background: #e6f3ff;
  //       margin-bottom: 4px;
  //       border-radius: 4px;
  //   `;

  //   // 템플릿 목록 표시
  //   const templateList = document.createElement('div');
  //   templateList.style.cssText = `
  //       max-height: 150px;
  //       overflow-y: auto;
  //   `;

  //   const updateSelectedTemplate = () => {
  //     selectedDisplay.textContent = `${templates[currentIndex].label} (${
  //       currentIndex + 1
  //     }/${templates.length})`;

  //     // 드래그 데이터 업데이트
  //     event.dataTransfer.setData('text/plain', templates[currentIndex].value);

  //     // 템플릿 목록 업데이트
  //     templateList.innerHTML = '';
  //     templates.forEach((template, index) => {
  //       const option = document.createElement('div');
  //       option.className = 'drag-search-option';
  //       option.textContent = template.label;
  //       option.style.cssText = `
  //               padding: 4px 8px;
  //               cursor: pointer;
  //               ${
  //                 index === currentIndex
  //                   ? 'background: #e6f3ff; font-weight: bold;'
  //                   : ''
  //               }
  //           `;
  //       templateList.appendChild(option);
  //     });
  //   };

  //   menu.appendChild(selectedDisplay);
  //   menu.appendChild(templateList);

  //   // 휠 이벤트 처리
  //   document.addEventListener('wheel', (e) => {
  //     if (e.deltaY > 0) {
  //       // 아래로 스크롤
  //       currentIndex = (currentIndex + 1) % templates.length;
  //     } else {
  //       // 위로 스크롤
  //       currentIndex = (currentIndex - 1 + templates.length) % templates.length;
  //     }
  //     updateSelectedTemplate();
  //   });

  //   // 메뉴 위치 설정 및 표시
  //   document.body.appendChild(menu);
  //   const updateMenuPosition = (e) => {
  //     menu.style.left = `${e.pageX + 10}px`;
  //     menu.style.top = `${e.pageY + 10}px`;
  //   };

  //   document.addEventListener('dragover', updateMenuPosition);
  //   document.addEventListener('dragend', () => {
  //     document.removeEventListener('dragover', updateMenuPosition);
  //     document.removeEventListener('wheel', null);
  //     menu.remove();
  //   });

  //   // 초기 템플릿 표시
  //   updateSelectedTemplate();
  // };

  // // 드롭 이벤트 처리
  // const onDrop = (event) => {
  //   event.preventDefault();
  //   const text = event.dataTransfer.getData('text/plain');

  //   // 드롭된 위치가 입력 필드인 경우
  //   if (event.target.classList.contains('search-input')) {
  //     event.target.value = text;
  //   } else {
  //     // 새로운 입력 필드 생성 또는 기존 필드에 값 설정
  //     const input = document.querySelector('.search-input');
  //     if (input) {
  //       input.value = text;
  //     }
  //   }
  // };

  const onDragEnd = (event) => {
    //toggleBodySelectCSS(false);
    console.log('Drag ended ===============================');
    const target = event.target.closest('.ag-header-cell');
    const isDroppedOnHeader = !!target;
    const draggedText = event.dataTransfer.getData('text/plain');

    if (isDroppedOnHeader) {
      //  드래그가 헤더 셀 위에서 끝난 경우, 기존의 헤더 이동 이벤트를 발생시킵니다.
      console.log('Drag ended on header cell');
      const inputBox = document.querySelector('.input-text');
      const mouseDownEvent = new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      inputBox.dispatchEvent(mouseDownEvent);
      const mouseUpEvent = new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      inputBox.dispatchEvent(mouseUpEvent);
      //헤더 이동과 관련된 로직을 추가할 수 있습니다.
    } else {
      // 드래그가 입력 상자 위에서 끝난 경우, 텍스트를 복사합니다.
      console.log('Drag ended on input box');
      const inputBox = document.querySelector('.input-text');

      if (inputBox) {
        inputBox.focus();
        inputBox.value = draggedText;

        // 마우스 클릭 이벤트 시뮬레이션
        const mouseDownEvent = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        inputBox.dispatchEvent(mouseDownEvent);

        const mouseUpEvent = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        inputBox.dispatchEvent(mouseUpEvent);
      }
    }

    // 헤더의 드래그 가능 여부 초기화
    //onRemoveAttribute();
    toggleHeaderDraggable(false);
    // headerEventListenersAdded = false;
  };

  // 헤더 드래그 가능/불가능 상태 변경 메서드
  const toggleHeaderDraggable = (isDraggable) => {
    console.log('toggleHeaderDraggable =====================');
    console.log('isDraggable =====================', isDraggable);

    if (isDraggable) {
      addUserDragEvent();
      // toggleBodySelectCSS(true);
    } else {
      // nextTick(() => {
      removeUserDragEvent();
      // });
      // toggleBodySelectCSS(false);
    }

    const headers = document.querySelectorAll('.ag-header-cell-label');
    //console.log('헤더 드래그 토글');
    headers.forEach((header) => {
      header.draggable = !isDraggable;
    });
    defaultColDef.value.suppressMovable = !isDraggable;

    // defaultColDef를 새로운 객체로 할당
    const newDefaultColDef = {
      ...defaultColDef.value,
      suppressMovable: !isDraggable,
    };

    //console.log('newDefaultColDef', newDefaultColDef);
    // gridOptions에서 columnDefs 업데이트
    gridOptions.defaultColDef = newDefaultColDef;

    // 그리드 옵션 업데이트
    gridApi.value.updateGridOptions({ columnDefs: props.columnDefs });
  };

  const onRowDragEnd = (event) => {
    console.log('row dragg End', event);
  };

  let isDragging = false;

  const onMouseMove = (event) => {
    if (!isDragging) {
      isDragging = true;
      // 여기에 드래그 시작 시 필요한 추가 로직을 넣을 수 있습니다.
    }
  };

  const onMouseUp = (event) => {
    // toggleBodySelectCSS(false);
    removeUserDragEvent();
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  //개발자 추가 영역 End
  //개발자 추가 gridColumnApi, exportCsv,
  //이하 퍼블 원본 소스
  /* defineExpose({
          gridApi,
          sizeToFit,
        }); */

  //const newSetColumnDefs2 = inject('newSetColumnDefs');
  //console.log('newSetColumnDefs2 :', newSetColumnDefs2);
  console.log('props.columnDefs :', props.columnDefs);
  console.log('props.newSetColumnDefs :', props.newSetColumnDefs);

  watch(
    [props.rowData, props.columnDefs],
    ([newRowData, newSetColumnDefs], [oldNewRowData, oldSetColumnDefs]) => {
      /*  if (newSetColumnDefs !== oldSetColumnDefs) {
          console.log('newSetColumnDefs==', newSetColumnDefs);
        } */
      console.log('그리드 데이터 변경', props.rowData.value);
    },
    { deep: true }
  );

  defineExpose({
    gridApi,
    gridColumnApi,
    sizeToFit,
    exportCsv,
    initializeDragAndDrop,
    onDragStart,
    onDragEnd,
    onRowDragEnd,
    initializeDragIconEvents,
    copyToClipboard,
  });
</script>

<style lang="scss" scoped></style>
