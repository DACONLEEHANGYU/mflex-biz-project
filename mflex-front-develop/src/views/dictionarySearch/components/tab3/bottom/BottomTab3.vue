<template>
  <div class="tab-inner bottom-tab">
    <div class="grid-wrap" :class="{ 'highlight-grid': showAnimate }">
      <div class="grid-top"></div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="single"
          @cellClicked="onCellClicked"
          @rowDoubleClicked="onRowDoubleClicked"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
      <AppDialog
        v-model:view="gridDialogState.view"
        :title="gridDialogState.title"
        :message="gridDialogState.message"
        :type="gridDialogState.type"
        :selectCellTypeObject="gridDialogState.selectCell"
      />
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, watchEffect, inject, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';

  import { useDictionarySearchStore } from '@/stores/dictionarySearch';
  import { getDomainHistoryInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
  import { storeToRefs } from 'pinia';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getDoaminHistoryInfo } from '@/utils/mflexApi/dictionarySearchApi';

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
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
      onCellClicked(value) {
        console.log('onCellClicked', value);
        this.selecteCell = value;
        this.onClickCellData(value);
        console.log('====================', this.selecteCell);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props) {
      const authStore = useAuthStore();
      const { domainViewSelectData } = storeToRefs(useDictionarySearchStore());

      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

      const rowData = reactive({});

      const showAnimate = ref(false);

      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 단어설명
        if (data.column.colId === 'explan') {
          gridDialogState.view = true;
          gridDialogState.message = data.value;
          gridDialogState.selectCell = false;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
          /* if (typeof data === 'object') {
            gridDialogState.selectCell = true;
          } else {
            gridDialogState.selectCell = false;
          } */

          // 이음동의어 목록
        } else if (
          data.column.colId === 'jointSynonymList' &&
          data.value[0] != null
        ) {
          gridDialogState.view = true;
          gridDialogState.selectCell = true;
          gridDialogState.message = data.value;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
        } else if (
          data.column.colId === 'forbiddenList' &&
          data.value[0] != null
        ) {
          gridDialogState.view = true;
          gridDialogState.selectCell = true;
          gridDialogState.message = data.value;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
        }
      };

      const gridDialogState = reactive({
        view: false,
        title: '선택 Cell',
        message: '',
        type: 'alert',
        selectCell: false,
      });

      // 임시 저장 데이터
      let domainHistoray = reactive({});

      /*   watch(selectedTab3Data, async (newTab3Value, oldTab3Value) => {
        // selectedTab3Data의 변화가 있을 경우
        if (newTab3Value !== oldTab3Value) {
          let doaminHistoryData = {
            domainDictionaryId: newTab3Value.dictionaryId,
            domainName: newTab3Value.domainName[0].label,
          };
          doaminHistoryData.value = await getDoaminHistoryInfo(
            doaminHistoryData
          );
          fetchData();
        }
      }); */

      // watchEffect(async () => {
      //   // firstRowData 변경에 대한 추가적인 처리가 필요하다면 여기에 로직 추가

      //   if (selectedTab3Data.value === null) {
      //     rowData.value = [];
      //     return;
      //   }

      //   console.log('selectedTab3Data ===', selectedTab3Data);
      //   if (selectedTab3Data.value.data) {
      //     let domainHistoryQuery = {
      //       domainDictionaryId: selectedTab3Data.value.data.dictionaryId,
      //       domainName: selectedTab3Data.value.data.domainName[0].label,
      //     };
      //     domainHistoray.value = await getDoaminHistoryInfo(domainHistoryQuery);
      //   } else {
      //     let domainHistoryQuery = {
      //       domainDictionaryId: selectedTab3Data.value.dictionaryId,
      //       domainName: selectedTab3Data.value.domainName[0].label,
      //     };
      //     domainHistoray.value = await getDoaminHistoryInfo(domainHistoryQuery);
      //   }

      //   fetchData();

      //   showAnimate.value = true;

      //   setTimeout(() => {
      //     showAnimate.value = false;
      //   }, 1000);
      // });

      const fetchData = async (historyParams) => {
        const sampleData = [];

        const historyList = await getDomainHistoryInfo(historyParams);

        console.log('historyList : ', historyList);

        for (let i = 0; i < historyList.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            historyType: historyList[i].historyDivisionName,
            domainName: historyList[i].domainName,
            domainGroupName: historyList[i].domainGroupName,
            domainClassName: historyList[i].domainClassName,
            logicalDataTypeName: historyList[i].logicalDataTypeName,
            dataPermissionValue: historyList[i].dataPermissionValue,
            explain: historyList[i].domainExplain,
            revisionDate: historyList[i].revisionDate,
            updater: historyList[i].updater,
            updateDateTime: historyList[i].updateDateTime,
          });
        }

        rowData.value = sampleData;
      };

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          minWidth: 60,
        },
        {
          headerName: '구분',
          field: 'historyType',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '도메인그룹명',
          field: 'domainGroupName',
          cellClass: 'ag-left-aligned-cell',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '논리데이터타입',
          field: 'logicalDataTypeName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '데이터허용값',
          field: 'dataPermissionValue',
          cellClass: 'grid-cell-centered',
          width: 220,
          minWidth: 220,
        },
        {
          headerName: '도메인설명',
          field: 'explain',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'domainClassName',
          width: 350,
          minWidth: 350,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
      ]);

      const agGrid = ref(null);

      watch(
        domainViewSelectData,
        async (newVal) => {
          console.log('domainViewSelectData : ', newVal);

          if (newVal === null) {
            rowData.value = [];
            return;
          }

          const requestParams = {
            instituteId: useMetaMngInstId,
            dictionaryId: newVal.dictionaryId,
            domainName: newVal.domainName[0].label,
          };

          await fetchData(requestParams);

          showAnimate.value = true;
          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);
        },
        {
          immediate: true,
        }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        onClickCellData,
        gridDialogState,
        showAnimate,
      };
    },
  };
</script>
