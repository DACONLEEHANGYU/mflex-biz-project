<template>
  <div class="grid-wrap">
    <div class="grid-top">
      <div class="top-row">
        <GridSearch
          :resultCount="resultCount"
          @enter="onSearchEnter"
          @save="onSearchSave"
          @setup="onSearchSetup"
          @remove="onSearchRemove"
        />
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
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { $vxHttp } from '@/api';

  export default {
    components: {
      GridSearch,
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

      const rowData = reactive({});

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어영문 약어명',
          field: 'wordEnAbbreviationName',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 영문명',
          field: 'wordEnName',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 설명',
          field: 'wordExplan',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
        },
        {
          headerName: '단어유형',
          field: 'wordCategory',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '도메인 분류명',
          field: 'domainDivisionName',
          cellClass: 'grid-cell-centered',
          width: 90,
        },
        {
          headerName: '유사어 여부',
          field: 'similarWord',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '유사어 구분코드',
          field: 'similarWordDivisionCode',
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
          field: 'lastReg',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '최종변경일',
          field: 'lastChangeDate',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
      ]);

      const fetchData = async () => {
        const { data } = null; //await $vxHttp.get('./sampleData/dummyData.json');
        rowData.value = data;
      };

      fetchData();

      const onSearchEnter = (value) => {
        console.log('onSearchEnter', value);
      };
      const onSearchSave = () => {
        console.log('onSearchSave');
      };
      const onSearchSetup = () => {
        console.log('onSearchSetup');
      };
      const onSearchRemove = () => {
        console.log('onSearchRemove');
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

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      return {
        agGrid,
        rowData,
        columnDefs,
        optionSelected,
        searchOptions,
        resultCount,
        onSearchEnter,
        onSearchSave,
        onSearchSetup,
        onSearchRemove,
      };
    },
  };
</script>
