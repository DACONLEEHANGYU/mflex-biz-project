<template>
  <div class="grid-wrap">
    <div class="grid-top"></div>
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
      const { setGridApis2 } = uiStore;

      const rowData = reactive({});

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 40,
        },
        {
          headerName: '단어영문 약어명',
          field: 'wordEngAbbreviationName',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          width: 130,
        },
        {
          headerName: '단어 유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 영문명',
          field: 'wordEngName',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEngName',
          width: 130,
        },
        {
          headerName: '이음 동의어 목록',
          field: 'jointSynonymList',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          width: 130,
        },
        {
          headerName: '금칙어 목록',
          field: 'forbiddenList',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 설명',
          field: 'wordExplan',
          cellClass: 'grid-cell-centered',
          tooltipField: 'wordExplan',
          width: 130,
        },
        {
          headerName: '도메인 분류명',
          field: 'domainClassificationName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          width: 130,
        },
        {
          headerName: '제정 정보',
          field: 'enactmentInfo',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '개정 정보',
          field: 'revisedInfo',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '최종 수정자정보',
          field: 'lastModifiedInfo',
          cellClass: 'grid-cell-centered',
          width: 115,
        },
        {
          headerName: '최종 수정일시',
          field: 'lastChangeDate',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async () => {
        // const { data } = await $vxHttp.get('./sampleData/ueMonitoringData.json');
        // rowData.value = data;
        const sampleData = [];
        for (let i = 0; i < 50; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            wordEngAbbreviationName: 'INDIV',
            wordName: '범정부/개별',
            wordType: '일반어',
            wordEngName: 'INDIVIDUAL INDIVIDUAL INDIVIDUAL' + i,
            jointSynonymList: '범정부/표준지공시지가',
            forbiddenList: '-',
            wordExplan: '여럿중에서 여런말을통해서 이어서',
            domainClassificationName: '범정부/가격',
            enactmentInfo: '2022-07-28(2차)',
            revisedInfo: '2022-07-28(2차)',
            lastModifiedInfo: '관리자(admin)',
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
          setGridApis2([agGrid.value.gridApi]);
        }, 200);
      });
      onActivated(() => {
        if (!mountedActive.value) {
          console.log('그리드 onActivated 실행?');
          setTimeout(() => {
            setGridApis2([agGrid.value.gridApi]);
          }, 200);
        }
      });

      onDeactivated(() => {
        console.log('그리드 onDeactivated 실행?');
        setGridApis2(null);
        mountedActive.value = false;
      });
      onUnmounted(() => {
        console.log('그리드 onUnmounted 실행?');
        setGridApis2(null);
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
