<template>
  <div class="grid-wrap">
    <div class="grid-top">
      <div class="top-row">
        <div class="btn-top inner-tab">
          <span style="margin-right: 100px; color: blue; font-weight: 600">
            함수 사용
          </span>
          <button class="btn-s" @click="viewGridHeaderIndex">
            컬럼 이동 정보
          </button>
          <button class="btn-s" @click="DownloadGridDataToCsv">
            CSV 다운로드
          </button>
          <button class="btn-s" @click="fetchData">조회</button>
        </div>
      </div>
    </div>
    <div class="grid-list">
      <AppGrid
        :rowData="rowFcData"
        :columnDefs="columnFcDefs"
        :context="context"
        rowSelection="single"
        @rowDoubleClicked="onRowDoubleClicked"
        @sort-changed="handleSortChanged"
        @body-scroll="handleScrollChanged"
        ref="agGrid"
      />
    </div>
    <!-- <div class="grid-bottom"></div> -->
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    reactive,
    ref,
    onActivated,
    onDeactivated,
    onUnmounted,
    onMounted,
  } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import { $vxHttp } from '@/api';
  import { camelToSnakeCaseUpper } from '@/utils/utils.js';

  export default {
    components: {
      AppWindow,
    },

    data() {
      return {
        context: null,
        windowView: false,
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
        this.windowView = true;
      },
      onCloseWindow() {
        this.windowView = false;
        this.selectedRow = {};
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const uiStore = useUiStore();
      const { setGridApis } = uiStore;

      const rowFcData = reactive([]);
      const lastFcGridData = reactive([]);

      //사용자 기존 설정 데이터
      const paramWhereDataInt = ref('');
      const paramOrderByDataInt = ref('');

      //정렬 변경 여부
      const sortChangeYn = ref('');
      //추가 조회 관련 데이터
      const paramWhereData = ref('');
      const paramOrderByData = ref('');
      const paramLastClmnInfoData = ref('');
      const paramLastCmprInfoData = ref('');
      const paramLastDataInfoData = ref('');
      const refLastClmnInfoData = ref('');
      const defaultParamData = {
        paramMetaMngInstId: '1',
        paramDctnryId: '1',
        paramFetchCnt: '50',
        paramWhereQuery: '',
        paramOrderByQuery: '',
        paramLastClmnInfo: '',
        paramLastCmprInfo: '',
        paramLasDataInfo: '',
      };
      const addParamData = reactive(defaultParamData);

      const columnFcDefs = reactive([
        {
          headerName: '번호',
          field: 'seq',
          hide: true,
          cellClass: 'grid-cell-centered',
          valueGetter: 'node.rowIndex + 1',
          width: 70,
        },
        {
          headerName: '단어명',
          field: 'wrdNm',
          cellClass: 'grid-cell-centered',
          width: 100,
          sortable: true,
        },
        {
          headerName: '단어영문 약어명',
          field: 'wrdEabbrNm',
          cellClass: 'grid-cell-centered',
          width: 100,
          sortable: true,
        },
        {
          headerName: '단어 영문명',
          field: 'wrdEngNm',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 설명',
          field: 'wrdExpln',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
        },
        {
          headerName: '단어유형',
          field: 'wrdTypeNm',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '도메인 분류명',
          field: 'dmnClsNm',
          cellClass: 'grid-cell-centered',
          width: 90,
          sortable: true,
        },
        {
          headerName: '유사어 여부',
          field: 'wrdSmlwrdYn',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '유사어 구분코드',
          field: 'wrdSmlwrdDvCd',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '사용여부',
          field: 'useCheck',
          cellClass: 'grid-cell-centered',
          width: 70,
        },
        {
          headerName: '최종 등록자',
          field: 'updrInfo',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '최종변경일',
          field: 'updDtm',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
      ]);

      const apiUrl = import.meta.env.VITE_APP_API_URL;

      const fetchData = async () => {
        console.log('fetchData >>');

        const loadData = await $vxHttp.post(
          `${apiUrl}/dcntry/wrd/srchFc`,
          defaultParamData
        );

        rowFcData.value = loadData.data.gridWordList;
        //정렬 변경 초기화
        sortChangeYn.value = 'N';
      };

      fetchData();

      //추가 데이터 불러오기
      const addGridRowData = async () => {
        //기존데이터 가져오기
        console.log('sortChangeYn : ', sortChangeYn.value);
        console.log('paramLastClmnInfoData : ', paramLastClmnInfoData.value);
        console.log('refLastClmnInfoData : ', refLastClmnInfoData.value);
        let LastChangeClumnData = '';
        let oldFcGridData = rowFcData.value;
        if (oldFcGridData) {
          paramLastDataInfoData.value = '';
          let lastFcIndex = agGrid.value.gridApi.getDisplayedRowCount() - 1;
          let lastChangeClumnData = [];
          let lastValue = '';
          if (refLastClmnInfoData.value != '') {
            if (refLastClmnInfoData.value.includes('|')) {
              lastChangeClumnData = refLastClmnInfoData.value.split('|');
            } else {
              lastChangeClumnData.push(refLastClmnInfoData.value);
            }
            for (let k = 0; k < lastChangeClumnData.length; k++) {
              lastValue =
                agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
                  lastChangeClumnData[k]
                ];
              if (paramLastDataInfoData.value != '') {
                paramLastDataInfoData.value =
                  paramLastDataInfoData.value + '|' + lastValue;
              } else {
                paramLastDataInfoData.value = lastValue;
              }
            }
          } else {
            // 없을 경우 추가 가져오기를 못하여 기본 값 설정
            paramLastClmnInfoData.value = 'WRD_TYPE_NM|WRD_EABBR_NM|WRD_NM';
            paramLastCmprInfoData.value = 'ASC|ASC|ASC';
            lastValue =
              agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
                'wrdTypeNm'
              ] +
              '|' +
              agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
                'wrdEabbrNm'
              ] +
              '|' +
              agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
                'wrdNm'
              ];
            paramLastDataInfoData.value = lastValue;
          }
          //새로 불러올 경우 정렬 순번 정하는 부분 - 화요일 작업 필요
          addParamData.paramLastClmnInfo = paramLastClmnInfoData.value;
          addParamData.paramLastCmprInfo = paramLastCmprInfoData.value;
          addParamData.paramLastDataInfo = paramLastDataInfoData.value;
        }

        console.log('addParamData :', addParamData);

        // 새로운 데이터 로드
        const addNewData = await $vxHttp.post(
          `${apiUrl}/dcntry/wrd/srchFc`,
          addParamData
        );
        let newFcData = addNewData.data.gridWordList;
        console.log('newFcData :', newFcData);
        //데이터가 있을 경우에 데이터 합치기
        if (newFcData) {
          rowFcData.value = [];
          if (oldFcGridData) {
            rowFcData.value = [...oldFcGridData, ...newFcData];
          } else {
            rowFcData.value = [...newFcData];
          }
        }
      };

      // 리스트 갯수 셀렉트
      const optionSelected = ref(10);
      const searchOptions = reactive([
        { label: '10개', value: 10 },
        { label: '20개', value: 20 },
        { label: '30개', value: 30 },
      ]);

      //CSV 다운로드
      const DownloadGridDataToCsv = () => {
        if (agGrid.value) {
          agGrid.value.exportCsv('WordList');
        }
      };

      const viewGridHeaderIndex = () => {
        const cols = agGrid.value.gridApi.getAllGridColumns();
        const colToNameFunc = (col, index) => index + ' = ' + col.getId();
        const colNames = cols.map(colToNameFunc).join(', ');
        console.log('columns are: ' + colNames);
      };

      function handleSortChanged(newSortedState) {
        let gridSortState = ref([]);
        let sortStateField = ref({});
        paramOrderByData.value = '';
        paramLastClmnInfoData.value = '';
        paramLastCmprInfoData.value = '';
        refLastClmnInfoData.value = '';

        // 정렬이 변경된 컬럼을 찾음
        newSortedState.forEach((state) => {
          console.log('state', state);
          sortStateField = {
            sort: state.sort.toUpperCase(),
            colId: state.colId,
            field: state.field,
            sortIndex: state.sortIndex,
            tbName: camelToSnakeCaseUpper(state.colId).toUpperCase(), //카멜표기를 스네이크표기법으로 변환
          };
          //정렬 배열에 담기
          gridSortState.value.push(sortStateField);
        });

        if (gridSortState.value.length > 0) {
          gridSortState.value.sort((a, b) => a.sortIndex - b.sortIndex);
          paramOrderByData.value = gridSortState.value
            .map((item) => `${item.tbName} ${item.sort}`)
            .join(',');
          paramLastClmnInfoData.value = gridSortState.value
            .map((item) => `${item.tbName}`)
            .join('|');
          paramLastCmprInfoData.value = gridSortState.value
            .map((item) => `${item.sort}`)
            .join('|');
          refLastClmnInfoData.value = gridSortState.value
            .map((item) => `${item.field}`)
            .join('|');
          sortChangeYn.value = 'Y';
        }
        console.log('paramOrderByData:', paramOrderByData.value);
        console.log('paramLastClmnInfoData:', paramLastClmnInfoData.value);
        console.log('paramLastCmprInfoData:', paramLastCmprInfoData.value);
        console.log('refLastClmnInfoData:', refLastClmnInfoData.value);
      }

      function handleScrollChanged(endScrollStaus) {
        if (endScrollStaus === 'Y') {
          if (sortChangeYn.value === 'N') {
            addGridRowData();
          } else {
            defaultParamData.paramOrderByQuery = paramOrderByData.value;
            fetchData();
          }
        }
      }
      const agGrid = ref(null);
      const mountedActive = ref(false);
      onMounted(() => {
        console.log('그리드 onMounted 실행?');
        mountedActive.value = true;
        setTimeout(() => {
          setGridApis([agGrid.value.gridApi]);
        }, 200);
      });
      onActivated(() => {
        if (!mountedActive.value) {
          console.log('그리드 onActivated 실행?');
          setTimeout(() => {
            setGridApis([agGrid.value.gridApi]);
          }, 200);
        }
      });

      onDeactivated(() => {
        console.log('그리드 onDeactivated 실행?');
        setGridApis(null);
        mountedActive.value = false;
      });
      onUnmounted(() => {
        console.log('그리드 onUnmounted 실행?');
        setGridApis(null);
        mountedActive.value = false;
      });

      return {
        agGrid,
        rowFcData,
        columnFcDefs,
        optionSelected,
        searchOptions,
        paramWhereDataInt,
        paramOrderByDataInt,
        defaultParamData,
        sortChangeYn,
        paramWhereData,
        paramOrderByData,
        paramLastClmnInfoData,
        paramLastCmprInfoData,
        paramLastDataInfoData,
        refLastClmnInfoData,
        addParamData,
        lastFcGridData,
        addGridRowData,
        DownloadGridDataToCsv,
        handleSortChanged,
        handleScrollChanged,
        viewGridHeaderIndex,
      };
    },
  };
</script>
