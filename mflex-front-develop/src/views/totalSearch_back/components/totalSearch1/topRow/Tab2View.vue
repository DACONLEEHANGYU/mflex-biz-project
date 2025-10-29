<template>
  <div class="grid-wrap">
    <div class="grid-top">
      <div class="top-row">
        <div class="btn-top inner-tab">
          <span style="margin-right: 100px; color: red; font-weight: 600">
            일반 쿼리 사용
          </span>
          <button class="btn-s" @click="addGridRowData">
            50개 추가 가져오기
          </button>
          <button class="btn-s">버튼</button>
        </div>
      </div>
    </div>
    <div class="grid-list">
      <AppGrid
        :rowData="rowData"
        :columnDefs="columnDefs"
        :context="context"
        rowSelection="single"
        @rowDoubleClicked="onRowDoubleClicked"
        ref="agGrid"
      />
    </div>
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

      //const rowData = reactive({});
      const rowData = reactive([]);
      const lastGridData = reactive([]);

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'seq',
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
        let paramData = {
          paramMetaMngInstId: '1',
          paramDctnryId: '1',
          paramFetchCnt: '50',
          paramWhereQuery: '',
          paramOrderByQuery: '',
          paramCompareOperation: '',
          paramLastWrdTypeNm: '',
          paramLastWrdEabbrNm: '',
          paramLastWrdNm: '',
        };
        const loadData = await $vxHttp.post(
          `${apiUrl}/dcntry/wrd/srch`,
          paramData
        );

        rowData.value = loadData.data.gridWordList;
      };

      fetchData();

      const addGridRowData = async () => {
        //기존데이터 가져오기
        let oldGridData = rowData.value;
        let lastIndex = oldGridData.length - 1;

        //조회 parameter 생성
        let gridParamData = reactive({
          paramMetaMngInstId: '1',
          paramDctnryId: '1',
          paramFetchCnt: '50',
          paramWhereQuery: '',
          paramOrderByQuery: '',
          paramCompareOperation: '',
          paramLastWrdTypeNm: oldGridData[lastIndex].wrdTypeNm,
          paramLastWrdEabbrNm: oldGridData[lastIndex].wrdEabbrNm,
          paramLastWrdNm: oldGridData[lastIndex].wrdNm,
        });

        // 새로운 데이터 로드
        const { data } = await $vxHttp.post(
          `${apiUrl}/dcntry/wrd/srch`,
          gridParamData
        );
        let newData = data.gridWordList;
        //데이터가 있을 경우에 데이터 합치기
        if (newData != null) {
          rowData.value = [...oldGridData, ...newData];
        }
      };

      // 리스트 갯수 셀렉트
      const optionSelected = ref(10);
      const searchOptions = reactive([
        { label: '10개', value: 10 },
        { label: '20개', value: 20 },
        { label: '30개', value: 30 },
      ]);

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
        rowData,
        columnDefs,
        optionSelected,
        searchOptions,
        lastGridData,
        addGridRowData,
      };
    },
  };
</script>
