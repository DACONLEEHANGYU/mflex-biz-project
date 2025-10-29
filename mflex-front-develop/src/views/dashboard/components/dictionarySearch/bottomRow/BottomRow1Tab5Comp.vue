<template>
  <div class="col col-2">
    <div class="inputs-wrap" style="flex: 0 0 42%">
      <div class="input-form">
        <table class="input-table">
          <colgroup>
            <col width="20%" />
            <col width="30%" />
            <col width="20%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>통합 코드명</th>
              <td colspan="3">
                <div class="td-col"></div>
              </td>
            </tr>
            <tr>
              <th>통합 코드 한글명</th>
              <td colspan="3"><div class="td-col"></div></td>
            </tr>
            <tr>
              <th>통합 코드 유형명</th>
              <td colspan="3"><div class="td-col"></div></td>
            </tr>
            <tr>
              <th>데이터 타입명</th>
              <td colspan="3"><div class="td-col"></div></td>
            </tr>
            <tr>
              <th>통합코드 설명</th>
              <td colspan="3" class="pd0 plr10">
                <div class="td-col">
                  <textarea style="height: 121px"></textarea>
                </div>
              </td>
            </tr>
            <tr>
              <th>관리 부서명</th>
              <td colspan="3"><div class="td-col">-</div></td>
            </tr>
            <tr>
              <th>제정 정보</th>
              <td><div class="td-col"></div></td>
              <th>최종 수정자 정보</th>
              <td><div class="td-col"></div></td>
            </tr>
            <tr>
              <th>개정 정보</th>
              <td><div class="td-col">-</div></td>
              <th>최종 수정 일시</th>
              <td><div class="td-col">-</div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
          width: 60,
        },
        {
          headerName: '통합 코드값',
          field: 'integratedCode',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
        {
          headerName: '통합 코드값 명',
          field: 'integratedCodeName',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
        {
          headerName: '제정 정보',
          field: 'enactmentInfo',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '개정 정보',
          field: 'revisionInformation',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEngName',
          width: 100,
        },
        {
          headerName: '최종 수정자 정보',
          field: 'lastModifiedInfo',
          cellClass: 'grid-cell-centered',
          width: 110,
        },
        {
          headerName: '최종 수정일시',
          field: 'lastModifiedDate',
          cellClass: 'grid-cell-centered',
          width: 120,
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
            integratedCode: '-',
            integratedCodeName: '-',
            enactmentInfo: '-',
            revisionInformation: '2022-07-28(2차)',
            lastModifiedInfo: '관리자(admin)',
            lastModifiedDate: '2022-07-28 09:02:57',
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
