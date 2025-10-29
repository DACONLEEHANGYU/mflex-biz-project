<template>
  <div class="tab-inner">
    <div class="col col-2">
      <div class="grid-wrap">
        <div class="grid-top">
          <div class="title-s">부모 구성</div>
        </div>
        <div class="grid-list">
          <AppGrid
            :rowData="rowDataLeft"
            :columnDefs="columnDefsLeft"
            :context="context"
            rowSelection="single"
            @rowDoubleClicked="onRowDoubleClicked"
            ref="agGrid"
          />
        </div>
        <!-- <div class="grid-bottom"></div> -->
      </div>
      <div class="grid-wrap">
        <div class="grid-top">
          <div class="title-s">자식 구성</div>
        </div>
        <div class="grid-list">
          <AppGrid
            :rowData="rowDataRight"
            :columnDefs="columnDefsRight"
            :context="context"
            rowSelection="single"
            @rowDoubleClicked="onRowDoubleClicked"
            ref="agGrid"
          />
        </div>
        <!-- <div class="grid-bottom"></div> -->
      </div>
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
// import { useUiStore } from '@/stores/ui';
import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
import GridSearch from '@/components/grid/GridSearch.vue';
import AppTree from '@/components/ui/AppTree.vue';

export default {
  components: {
    TypeCellRenderer,
    GridSearch,
    AppTree,
  },

  data() {
    return {
      context: null,
      selectedRow: {},
    };
  },
  methods: {
    onRowDoubleClicked(value) {
      console.log('onRowDoubleClicked ', value);
      this.selectedRow = value;
    },
    onSearchEnter(value) {
      console.log('onSearchEnter', value);
    },
    onSearchSave() {
      console.log('onSearchSave');
    },
    onSearchSetup() {
      console.log('onSearchSetup');
    },
    onSearchRemove() {
      console.log('onSearchRemove');
    },
  },
  beforeMount() {
    this.context = { componentParent: this };
  },

  setup(props) {
    // const uiStore = useUiStore();
    // const { setGridApis2 } = uiStore;

    const rowDataLeft = reactive({});
    const rowDataRight = reactive({});

    const columnDefsLeft = reactive([
      {
        headerName: '키명',
        field: 'keyName',
        cellClass: 'grid-cell-centered',
        width: 160,
      },
      {
        headerName: '부모 테이블',
        field: 'parentTable',
        cellClass: 'grid-cell-centered',
        width: 200,
      },
      {
        headerName: '부모 기본키',
        field: 'parentBasicKey',
        cellClass: 'grid-cell-centered',
        width: 200,
      },
      {
        headerName: '자식 외래키',
        field: 'childForeignKey',
        cellClass: 'grid-cell-centered',
        width: 200,
      },
    ]);
    const columnDefsRight = reactive([
      {
        headerName: '키명',
        field: 'keyName',
        cellClass: 'grid-cell-centered',
        width: 160,
      },
      {
        headerName: '자식 테이블',
        field: 'childTable',
        cellClass: 'grid-cell-centered',
        width: 200,
      },
      {
        headerName: '자식 기본키',
        field: 'childBasicKey',
        cellClass: 'grid-cell-centered',
        width: 200,
      },
      {
        headerName: '부모 외래키',
        field: 'parentForeignKey',
        cellClass: 'grid-cell-centered',
        width: 200,
      },
    ]);

    const resultCount = ref({
      count: 10,
      total: 20,
    });

    const fetchData = async () => {
      // const { data } = await $vxHttp.get('./sampleData/ueMonitoringData.json');
      // rowData.value = data;
      const sampleData1 = [];
      for (let i = 0; i < 50; i++) {
        sampleData1.push({
          id: i,
          keyName: '-',
          parentTable: '-',
          parentBasicKey: '-',
          childForeignKey: '-',
        });
      }
      rowDataLeft.value = sampleData1;

      const sampleData2 = [];
      const random = Math.floor(Math.random() * 100);
      for (let i = 0; i < 50; i++) {
        sampleData2.push({
          id: i,
          keyName: '-',
          childTable: '-',
          childBasicKey: '-',
          parentForeignKey: '-',
        });
      }
      rowDataRight.value = sampleData2;
    };

    fetchData();

    const agGrid = ref(null);

    // const mountedActive = ref(false);
    // onMounted(() => {
    //   console.log('그리드 onMounted 실행?');
    //   mountedActive.value = true;
    //   setTimeout(() => {
    //     setGridApis2([agGrid.value.gridApi]);
    //   }, 200);
    // });
    // onActivated(() => {
    //   if (!mountedActive.value) {
    //     console.log('그리드 onActivated 실행?');
    //     setTimeout(() => {
    //       setGridApis2([agGrid.value.gridApi]);
    //     }, 200);
    //   }
    // });

    // onDeactivated(() => {
    //   console.log('그리드 onDeactivated 실행?');
    //   setGridApis2(null);
    //   mountedActive.value = false;
    // });
    // onUnmounted(() => {
    //   console.log('그리드 onUnmounted 실행?');
    //   setGridApis2(null);
    //   mountedActive.value = false;
    // });

    return {
      agGrid,
      rowDataLeft,
      rowDataRight,
      columnDefsLeft,
      columnDefsRight,
      resultCount,
    };
  },
};
</script>
