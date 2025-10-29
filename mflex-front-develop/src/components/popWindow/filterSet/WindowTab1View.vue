<template>
  <div class="grid-wrap" style="height: 400px">
    <div class="grid-list">
      <AppGrid
        :rowData="rowData"
        :columnDefs="columnDefs"
        :context="context"
        rowSelection="single"
        @rowDoubleClicked="onRowDoubleClicked"
        @cellClicked="onCellClicked"
        @rowClicked="onRowClicked"
        ref="agGrid"
      />
    </div>
    <div class="grid-bottom">
      <div class="grid-set__bottom">
        <button
          class="btn-gridfn top"
          title="최상단으로"
          @click="moveToTop(selectedRow)"
        >
          <i class="icon"></i>
        </button>
        <button
          class="btn-gridfn up"
          title="상단으로"
          @click="moveUp(selectedRow)"
        >
          <i class="icon"></i>
        </button>
        <button
          class="btn-gridfn down"
          title="하단으로"
          @click="moveDown(selectedRow)"
        >
          <i class="icon"></i>
        </button>
        <button
          class="btn-gridfn bottom"
          title="최하단으로"
          @click="moveToBottom(selectedRow)"
        >
          <i class="icon"></i>
        </button>
        <!-- <button class="btn-gridfn sort" title="정렬(오름차순)">
          <i class="icon"></i>
        </button>
        <button class="btn-gridfn view" title="전체표시">
          <i class="icon"></i>
        </button>
        <button class="btn-gridfn hide" title="전체 미표시">
          <i class="icon"></i>
        </button> -->
        <button
          class="btn-gridfn refresh"
          title="조건 초기화"
          @click="resetGrid"
        >
          <i class="icon"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, markRaw, ref, toRaw, nextTick } from 'vue';
  import ColumnTypeCellRenderer from '@/utils/ColumnTypeCellRenderer.js';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useUiStore } from '@/stores/ui';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';
  import { $vxHttp } from '@/api';

  export default {
    components: {},
    props: {
      columnFcDefs: Array,
      filterGridDefs: {
        type: Object,
        default: () => {},
      },
    },
    mounted() {
      //console.log('columnFcDefs000000 :', this.columnFcDefs);
      //console.log('filterGridDefs Windows:', this.filterGridDefs);
    },
    data() {
      return {
        context: null,
        windowView: false,
        selectedRow: {},
        ColumnTypeCellRenderer: markRaw(ColumnTypeCellRenderer),
        lastSortIndex: 0, // 마지막으로 할당한 sortIndex1 값을 저장
        sortedCells: [], // 정렬 기준이 설정된 셀들의 목록
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
        //this.windowView = false;
        this.windowView = true;
      },
      onCloseWindow() {
        this.windowView = false;
        this.selectedRow = {};
      },
      onRowClicked(row) {
        console.log('onRowClicked', row);
        this.selectedRow = row;
      },
      onCellClicked(event) {
        console.log('onCellClicked', event);
        this.selectedRow = event.data;

        // 'order' 컬럼이 클릭된 경우에만 정렬 기준을 변경
        if (event.colDef.field === 'sortYn') {
          let newOrder = '';
          switch (event.value) {
            case '':
              newOrder = 'asc';
              break;
            case 'asc':
              newOrder = 'desc';
              break;
            case 'desc':
              newOrder = '';
              break;
          }

          // 현재 셀의 값을 업데이트
          event.node.setDataValue('sortYn', newOrder);

          // 셀의 식별자 생성 (예: "row3:order")
          const cellId = `row${event.rowIndex}:sortYn`;

          // 정렬 순서가 있는 경우, sortIndex1 업데이트
          if (newOrder !== '') {
            const existingIndex = this.sortedCells.findIndex(
              (cell) => cell.id === cellId
            );
            if (existingIndex === -1) {
              // 새로운 셀인 경우
              this.lastSortIndex++;
              event.node.setDataValue('sortIndex1', this.lastSortIndex);
              this.sortedCells.push({ id: cellId, index: this.lastSortIndex });
            } else {
              // 이미 정렬 기준이 설정된 셀인 경우
              const existingCell = this.sortedCells[existingIndex];
              event.node.setDataValue('sortIndex1', existingCell.index);
            }
          } else {
            // 정렬 기준이 제거된 경우
            event.node.setDataValue('sortIndex1', null);
            this.sortedCells = this.sortedCells.filter(
              (cell) => cell.id !== cellId
            );
          }

          // 변경 사항을 그리드에 반영
          event.api.refreshCells({
            force: true,
            columns: ['sortYn', 'sortIndex1'],
            rowNodes: [event.node],
          });
        }
      },
      /* onCellClicked(event) {
        console.log('onCellClicked', event);
        this.selectedRow = event.data;

        // 'order' 컬럼이 클릭된 경우에만 정렬 기준을 변경
        if (event.colDef.field === 'order') {
          let newOrder = '';
          switch (event.value) {
            case '':
              newOrder = 'asc';
              break;
            case 'asc':
              newOrder = 'desc';
              break;
            case 'desc':
              newOrder = '';
              break;
          }

          // 현재 셀의 값을 업데이트
          event.node.setDataValue('order', newOrder);

          // 정렬 순서가 있는 경우, sortIndex1 업데이트
          if (newOrder !== '') {
            let maxSortIndex = 0;
            this.$refs.agGrid.api.forEachNode((node) => {
              if (
                node.data.order !== '' &&
                node.data.sortIndex1 > maxSortIndex
              ) {
                maxSortIndex = node.data.sortIndex1;
              }
            });
            event.node.setDataValue('sortIndex1', maxSortIndex + 1);
          } else {
            event.node.setDataValue('sortIndex1', null);
          }

          // 변경 사항을 그리드에 반영
          event.api.refreshCells({
            force: true,
            columns: ['order', 'sortIndex1'],
            rowNodes: [event.node],
          });
        }
      }, */
    },
    beforeMount() {
      console.log('columnFcDefs000000 :', this.columnFcDefs);
      this.context = { componentParent: this };
    },
    setup(props) {
      const apiUrl = import.meta.env.VITE_APP_API_URL;
      const uiStore = useUiStore();
      const authStore = useAuthStore();

      const { userInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;

      const rowData = reactive({});
      //const originalRowData = reactive([]);
      const originalRowData = reactive([]);

      const columnDefs = reactive([
        // 컬럼 정의
        {
          headerName: '번호',
          field: 'no1',
          cellClass: 'grid-cell-centered',
          editable: false,
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '컬럼명',
          field: 'headerName1',
          cellClass: 'ag-left-aligned-cell',
          //cellRenderer: 'ColumnTypeCellRenderer',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '순서(#)',
          field: 'seq1',
          cellClass: 'grid-cell-centered',
          editable: true,
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '표시 여부',
          field: 'hide1',
          cellClass: 'grid-cell-centered',
          cellEditor: 'agCheckboxCellEditor',
          editable: true,
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '틀 고정',
          field: 'pinned1',
          cellClass: 'grid-cell-centered',
          cellEditor: 'agSelectCellEditor',
          editable: true,
          cellEditorParams: {
            values: ['', 'left', 'right'],
          },
          width: 100,
          minWidth: 100,
        },
        /* {
          headerName: '정렬 여부',
          field: 'sortable1',
          cellClass: 'grid-cell-centered',
          cellEditor: 'agCheckboxCellEditor',
          editable: true,
          width: 100,
        }, */
        /*
          // 원본
        {
          headerName: '정렬',
          field: 'sortYn',
          cellClass: 'grid-cell-centered',
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: ['', 'asc', 'desc'],
          },
          width: 100,
        }, */
        {
          headerName: '정렬',
          field: 'sortYn',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '정렬순서',
          field: 'sortIndex1',
          cellClass: 'grid-cell-centered',
          //editable: true,
          width: 100,
          minWidth: 100,
        },
        /*   {
          headerName: 'Order',
          field: 'order',
          cellClass: 'grid-cell-centered',
          //editable: true,
          width: 100,
        }, */
        {
          headerName: '칼럼 크기',
          field: 'width1',
          cellClass: 'grid-cell-centered',
          editable: true,
          width: 200,
          minWidth: 100,
        },
      ]);

      // 최상단 이동
      const moveToTop = (row) => {
        if (row) {
          const index = rowData.value.indexOf(row);
          const newRowData = [...rowData.value];
          newRowData.splice(index, 1);
          newRowData.unshift(row);
          newRowData.forEach((r, i) => (r.seq1 = i + 1));
          rowData.value = newRowData;
        }
      };

      // 상단 이동
      const moveUp = (row) => {
        if (row) {
          const index = rowData.value.indexOf(row);
          if (index > 0) {
            const newRowData = [...rowData.value];
            const temp = newRowData[index - 1];
            newRowData[index - 1] = row;
            newRowData[index] = temp;
            newRowData.forEach((r, i) => (r.seq1 = i + 1));
            rowData.value = newRowData;
          }
        }
      };

      // 하단 이동
      const moveDown = (row) => {
        if (row) {
          const index = rowData.value.indexOf(row);
          if (index < rowData.value.length - 1) {
            const newRowData = [...rowData.value];
            const temp = newRowData[index + 1];
            newRowData[index + 1] = row;
            newRowData[index] = temp;
            newRowData.forEach((r, i) => (r.seq1 = i + 1));
            rowData.value = newRowData;
          }
        }
      };

      // 최하단 이동
      const moveToBottom = (row) => {
        if (row) {
          const index = rowData.value.indexOf(row);
          const newRowData = [...rowData.value];
          newRowData.splice(index, 1);
          newRowData.push(row);
          newRowData.forEach((r, i) => (r.seq1 = i + 1));
          rowData.value = newRowData;
        }
      };

      /*    const resetGrid = () => {
        console.log('resetGrid 호출');
        console.log('originalRowData.value : ', originalRowData.value);
        rowData.value = [...toRaw(originalRowData.value)];
      };  */

      /*      const resetGrid = async () => {
        console.log('resetGrid 호출');
        console.log('originalRowData : ', originalRowData);

        // rowData.value를 초기화
        //rowData.value = [...toRaw(originalRowData.value)];
        rowData.value = [...originalRowData];

        // DOM 업데이트 대기
        await nextTick();

        // 필요한 추가 작업 수행
      }; */
      /*
      const resetGrid = async () => {
        console.log('resetGrid 호출');
        console.log('originalRowData :', originalRowData.value);

        // rowData.value를 originalRowData.value의 복사본으로 초기화
        rowData.value = [...originalRowData.value].map((row, index) => ({
          ...row,
          seq1: index + 1,
        }));

        // DOM 업데이트 대기
        await nextTick();

        // 필요한 추가 작업 수행
      }; */

      const resetGrid = () => {
        console.log('resetGrid 호출');

        // rowData.value를 originalRowData.value의 복사본으로 초기화
        rowData.value = [...originalRowData.value].map((row, index) => ({
          ...row,
          seq1: index + 1,
        }));
      };

      const sendDataToBackend = () => {
        /*  console.log('sendDataToBackend 호출');
        console.log('this.rowData.value :', rowData.value);
        console.log('props.columnFcDefs :', props.columnFcDefs);

        try {
          if (rowData.value != null) {
            const checkRowData = [];
            const agGridHeadrData = [];
            checkRowData.value = rowData.value;
            console.log('DataCnt : ', checkRowData.value.length);
            console.log('checkRowData : ', checkRowData);
            console.log('sortIndex1 : ', checkRowData.value[1].sortIndex1);
            for (let i = 0; i < checkRowData.value.length; i++) {
              agGridHeadrData.push({
                gridColumnHeaderNm: checkRowData.value[i].headerName1,
                gridColumnOrd: checkRowData.value[i].seq1,
                gridColumnWidth: checkRowData.value[i].width1,
                gridColumnIndct:
                  checkRowData.value[i].hide1 === true ? 'Y' : 'N',
                gridColumnPinned: checkRowData.value[i].pinned1,
                gridColumnSortable:
                  checkRowData.value[i].sortable1 === true ? 'Y' : 'N',
                gridColumnSort:
                  typeof checkRowData.value[i].sortYn === 'string'
                    ? checkRowData.value[i].sortYn.toUpperCase()
                    : '',
                gridColumnSortindex:
                  checkRowData.value[i].sortIndex1 === '' ||
                  checkRowData.value[i].sortIndex1 === null
                    ? -1
                    : checkRowData.value[i].sortIndex1,
                gridColumnFilter: '',
              });
            }

            console.log('agGridHeadrData', agGridHeadrData);
            console.log('gridDefs :', props.filterGridDefs.scrnGridId);

            const gridHeadrSetData = {
              paramGridId: props.filterGridDefs.scrnGridId,
              paramUserId: userId,
              paramUserNm: userNm,
              paramUserAgGridHeadrList: agGridHeadrData,
            };

            console.log('gridHeadrSetData :', gridHeadrSetData);

            const newFilterGridData = props.columnFcDefs.map((col, index) => {
              const newCol = agGridHeadrData[index];
              return {
                headerName: newCol.gridColumnHeaderNm,
                field: col.field,
                cellClass: col.cellClass || null,
                cellRenderer: col.cellRenderer || null,
                valueFormatter: col.valueFormatter || null,
                width: newCol.gridColumnWidth,
                hide: newCol.gridColumnIndct === 'N',
                pinned: newCol.gridColumnPinned || undefined,
                sortable: newCol.gridColumnSortable === 'Y',
                sort: newCol.gridColumnSort || '',
                sortIndex:
                  newCol.gridColumnSortindex === -1
                    ? ''
                    : `${newCol.gridColumnSortindex}`,
              };
            });

            console.log('newFilterGridData : ', newFilterGridData);
            const gridStorage = JSON.parse(getGridInfoFromStorage());
            console.log('gridStorage : ', gridStorage);
            gridStorage[props.filterGridDefs.scrnGridId] = newFilterGridData;
            console.log(
              'gridStorage[props.filterGridDefs.scrnGridId] : ',
              gridStorage[props.filterGridDefs.scrnGridId]
            );

            uiStore.setGridColumnDefs(
              `${props.filterGridDefs.scrnGridId}`,
              newFilterGridData
            );
            saveGridInfoToStorage(gridStorage);

            if (gridHeadrSetData != null) {
              console.log('헤더 설정 성공');
              return 'Y';
            } else {
              console.log('헤더 설정 실패');
              return 'N';
            }
          }
        } catch (error) {
          console.error('데이터 전송 중 에러 발생:', error);
        } */

        console.log('sendDataToBackend 호출');
        console.log('this.rowData.value :', rowData.value);
        console.log('props.columnFcDefs :', props.columnFcDefs);

        try {
          if (rowData.value != null) {
            const checkRowData = rowData.value;
            console.log('DataCnt : ', checkRowData.length);
            console.log('checkRowData : ', checkRowData);

            const agGridHeadrData = checkRowData.map((row, index) => ({
              gridColumnHeaderNm: row.headerName1,
              gridColumnOrd: row.seq1 || index + 1,
              gridColumnWidth: row.width1,
              gridColumnIndct: row.hide1 === true ? 'Y' : 'N',
              gridColumnPinned: row.pinned1,
              gridColumnSortable: row.sortable1 === true ? 'Y' : 'N',
              gridColumnSort: typeof row.sortYn === 'string' ? row.sortYn : '',
              gridColumnSortindex:
                row.sortIndex1 === '' || row.sortIndex1 === null
                  ? -1
                  : row.sortIndex1,
              gridColumnFilter: '',
            }));

            // gridColumnOrd 값에 따라 정렬
            agGridHeadrData.sort(
              (a, b) => (a.gridColumnOrd || 0) - (b.gridColumnOrd || 0)
            );

            console.log('agGridHeadrData', agGridHeadrData);
            console.log('gridDefs :', props.filterGridDefs.scrnGridId);

            const gridHeadrSetData = {
              paramGridId: props.filterGridDefs.scrnGridId,
              paramUserId: userId,
              paramUserNm: userNm,
              paramUserAgGridHeadrList: agGridHeadrData,
            };

            console.log('gridHeadrSetData :', gridHeadrSetData);

            // agGridHeadrData의 순서를 기반으로 newFilterGridData 생성
            const newFilterGridData = agGridHeadrData
              .map((newCol, index) => {
                const col = props.columnFcDefs.find(
                  (c) => c.headerName === newCol.gridColumnHeaderNm
                );
                if (!col) {
                  console.error(
                    `Column not found: ${newCol.gridColumnHeaderNm}`
                  );
                  return null;
                }
                return {
                  headerName: newCol.gridColumnHeaderNm,
                  field: col.field,
                  cellClass: col.cellClass || null,
                  cellRenderer: col.cellRenderer || null,
                  valueFormatter: col.valueFormatter || null,
                  minWidth: col.minWidth || null,
                  width: newCol.gridColumnWidth,
                  hide: newCol.gridColumnIndct === 'N',
                  pinned: newCol.gridColumnPinned || undefined,
                  sortable: newCol.gridColumnSortable === 'Y',
                  sort: newCol.gridColumnSort || '',
                  sortIndex:
                    newCol.gridColumnSortindex === -1
                      ? ''
                      : `${newCol.gridColumnSortindex}`,
                  headerCheckboxSelection:
                    col.field === 'checkbox' ? true : false,
                  checkboxSelection: col.field === 'checkbox' ? true : false,
                };
              })
              .filter((col) => col !== null); // null 값 제거

            console.log(
              '필터 변경사항 반영 newFilterGridData : ',
              newFilterGridData
            );
            const gridStorage = JSON.parse(getGridInfoFromStorage());
            console.log('gridStorage : ', gridStorage);
            gridStorage[props.filterGridDefs.scrnGridId] = newFilterGridData;
            console.log(
              'gridStorage[props.filterGridDefs.scrnGridId] : ',
              gridStorage[props.filterGridDefs.scrnGridId]
            );

            uiStore.setGridColumnDefs(
              `${props.filterGridDefs.scrnGridId}`,
              newFilterGridData
            );
            saveGridInfoToStorage(gridStorage);

            // ... (기존 코드 생략)

            if (gridHeadrSetData != null) {
              console.log('헤더 설정 성공');
              return 'Y';
            } else {
              console.log('헤더 설정 실패');
              return 'N';
            }
          }
        } catch (error) {
          console.error('데이터 전송 중 에러 발생:', error);
        }
      };

      const fetchData = async () => {
        //Server에서 GridHeader 정보 가져오기

        console.log('props.filterGridDefs : ', props.filterGridDefs);

        const userGridHeadrParamData = {
          paramGridId: props.filterGridDefs.scrnGridId,
          paramUserId: userId,
        };

        console.log('userGridHeadrParamData :', userGridHeadrParamData);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage ==', gridStorage);
        console.log(
          'gridStorage[props.filterGridDefs.scrnGridId] ==',
          gridStorage[props.filterGridDefs.scrnGridId]
        );

        // 그리드 헤더 정보 가져오기 API
        /* const popGridHeadrData = await $vxHttp.post(
          `${apiUrl}/grid/user/grdHeadr`,
          userGridHeadrParamData
        );
        //Server 에서 가져온 Grid header 정보
        console.log(
          'popGridHeadrData1 : ',
          popGridHeadrData.data.gridHeadrList
        ); */
        console.log('popGridHeadrData2 : ', props.columnFcDefs);

        if (props.columnFcDefs && props.columnFcDefs.length > 0) {
          const gridFormatData = [];
          for (let i = 0; i < props.columnFcDefs.length; i++) {
            gridFormatData.push({
              no1: i + 1,
              headerName1: props.columnFcDefs[i].headerName,
              seq1: i + 1,
              hide1: props.columnFcDefs[i].hide === false ? true : false,
              pinned1:
                props.columnFcDefs[i].pinned === 'left'
                  ? 'left'
                  : props.columnFcDefs[i].pinned === 'right'
                  ? 'right'
                  : '',
              sortable1: props.columnFcDefs[i].sortable,
              sortYn:
                props.columnFcDefs[i].sort === 'asc'
                  ? 'asc'
                  : props.columnFcDefs[i].sort === 'desc'
                  ? 'desc'
                  : '',
              sortIndex1:
                props.columnFcDefs[i].sortIndex !== null &&
                props.columnFcDefs[i].sortIndex !== '' &&
                parseInt(props.columnFcDefs[i].sortIndex, 10) > -1
                  ? props.columnFcDefs[i].sortIndex
                  : null,
              width1: props.columnFcDefs[i].width,
            });
          }
          rowData.value = gridFormatData;

          originalRowData.value = [...gridFormatData];
          console.log('originalRowData : ', originalRowData);
        }
      };

      fetchData();
      resetGrid();

      // 리스트 갯수 셀렉트
      return {
        rowData,
        columnDefs,
        sendDataToBackend,
        fetchData,
        moveToTop,
        moveUp,
        moveDown,
        moveToBottom,
        resetGrid,
      };
    },
  };
</script>
