<template>
  <div class="tab-inner">
    <div class="col">
      <div class="grid-wrap">
        <div class="grid-top"></div>
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
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import LogStatusCellRenderer from '@/utils/LogStatusCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTree from '@/components/ui/AppTree.vue';

  export default {
    components: {
      TypeCellRenderer,
      LogStatusCellRenderer,
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
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      // const uiStore = useUiStore();
      // const { setGridApis2 } = uiStore;

      const rowData = reactive({});
      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
        },
        {
          headerName: '접속상태',
          field: 'connectStatus',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'LogStatusCellRenderer',
          width: 110,
        },
        {
          headerName: '접속일시',
          field: 'connectDate',
          cellClass: 'grid-cell-centered',
          width: 150,
        },
        {
          headerName: '접속IP주소',
          field: 'connectIpAddress',
          cellClass: 'grid-cell-centered',
          width: 180,
        },
        {
          headerName: '접속 메타관리 기관명',
          field: 'connectMetaMngName',
          cellClass: 'grid-cell-centered',
          width: 300,
        },
        {
          headerName: '접속정보 시스템명',
          field: 'connectInfoSysName',
          cellClass: 'grid-cell-centered',
          width: 300,
        },
        {
          headerName: '접속 사전명',
          field: 'connectDicName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 450,
        },
      ]);

      const fetchData = async () => {
        const sampleData1 = [];
        for (let i = 0; i < 50; i++) {
          sampleData1.push({
            id: i,
            no: i + 1,
            connectStatus:
              Math.floor(Math.random() * 2) === 0 ? '로그인' : '로그아웃',
            connectDate: '2024-03-25 09:33:45',
            connectIpAddress: '1111.2222.3333.4444',
            connectMetaMngName: '데이콘 인피니티',
            connectInfoSysName: '통합정보시스템',
            connectDicName: [
              {
                id: 0,
                type: '개별표준',
                label: '데이콘 인피니티 표준 사전',
                color: '#fff',
                bgColor: '#24459e',
                size: 52,
              },
            ],
          });
        }
        rowData.value = sampleData1;
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
        rowData,
        columnDefs,
      };
    },
  };
</script>
