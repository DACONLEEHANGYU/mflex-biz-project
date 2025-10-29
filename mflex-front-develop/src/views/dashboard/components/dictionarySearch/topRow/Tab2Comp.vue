<template>
  <div class="grid-wrap">
    <div class="grid-top">
      <div class="top-row">
        <div class="btn-top inner-tab">
          <button class="btn-s file-down">
            <i class="icon"></i>단어목록 내려받기
          </button>
        </div>
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
        :useContextMenu="true"
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
  import AppWindow from '@/components/ui/AppWindow.vue';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { $vxHttp } from '@/api';

  export default {
    components: {
      AppWindow,
      TypeCellRenderer,
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
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
        this.$emit('searchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
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
          width: 40,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'TypeCellRenderer',
          width: 100,
        },
        {
          headerName: '단어영문 약어명',
          field: 'wordEngAbbreviationName',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 영문명',
          field: 'wordEngName',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '도메인 분류명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'TypeCellRenderer',
          width: 100,
        },
        {
          headerName: '유사어 구분',
          field: 'similarClass',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '개정일자',
          field: 'revisionDate',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '수정자 정보',
          field: 'modifierInfo',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '수정일시',
          field: 'lastChangeDate',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
      ]);

      const resultCount = ref({
        count: 50,
        total: '4,563',
      });

      const fetchData = async () => {
        // const { data } = await $vxHttp.get('./sampleData/ueMonitoringData.json');
        // rowData.value = data;
        const sampleData = [];
        for (let i = 0; i < 50; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            wordName: '범정부/감가상각률',
            wordEngAbbreviationName: 'IDRCO',
            wordEngName: 'DEPRECIATION COST',
            wordType: '일반어',
            domainName: '범정부/비용',
            similarClass: '-',
            revisionDate: '2022-07-28(5차)',
            modifierInfo: '관리자(admin)',
            lastChangeDate: '2022-07-28 09:02:57',
          });
        }
        rowData.value = sampleData;
      };

      fetchData();

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
        resultCount,
      };
    },
  };
</script>
