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
  import { reactive, ref, inject, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';

  import { useDictionarySearchStore } from '@/stores/dictionarySearch';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { storeToRefs } from 'pinia';

  import { getDomainRelatedTermList } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';

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
      const showAnimate = ref(false);

      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 단어설명
        if (data.column.colId === 'termExplain') {
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

      const rowData = reactive({});

      // 임시 저장 데이터
      let domainRelationTerm = reactive({});

      // watchEffect(async () => {
      //   // firstRowData 변경에 대한 추가적인 처리가 필요하다면 여기에 로직 추가

      //   console.log('selectedTab3Data ===', selectedTab3Data);

      //   if (selectedTab3Data.value === null) {
      //     rowData.value = [];
      //     return;
      //   }

      //   if (selectedTab3Data.value.data) {
      //     let domainRelationCodeQuery = {
      //       dictionaryId: selectedTab3Data.value.data.dictionaryId,
      //       domainName: selectedTab3Data.value.data.domainName[0].label,
      //     };
      //     domainRelationTerm.value = await getDomainRelationInfo(
      //       domainRelationCodeQuery
      //     );
      //   } else {
      //     let domainRelationCodeQuery = {
      //       dictionaryId: selectedTab3Data.value.dictionaryId,
      //       domainName: selectedTab3Data.value.domainName[0].label,
      //     };
      //     domainRelationTerm.value = await getDomainRelationInfo(
      //       domainRelationCodeQuery
      //     );
      //   }

      //   fetchData();

      //   showAnimate.value = true;

      //   setTimeout(() => {
      //     showAnimate.value = false;
      //   }, 1000);
      // });

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          minWidth: 60,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '용어영문약어명',
          field: 'termEngAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '표준구분',
          field: 'termStandardYnName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '용어유형',
          field: 'termType',
          cellClass: 'grid-cell-centered',
          width: 120,
          minWidth: 120,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '코드유형',
          field: 'codeTypeName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '코드명',
          field: 'codeName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
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
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async (relatedParams) => {
        // const { data } = await $vxHttp.get('./sampleData/ueMonitoringData.json');
        // rowData.value = data;

        const relationTermList = await getDomainRelatedTermList(relatedParams);

        console.log('relationTermList ===', relationTermList);

        const sampleData = [];
        for (let i = 0; i < relationTermList.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            termName: relationTermList[i].termName,
            termEngAbbreviationName: relationTermList[i].termAbbreviationName,
            termType: relationTermList[i].termTypeName,
            domainName: relationTermList[i].domainName,
            termStandardYnName: relationTermList[i].termStandardYnName,
            revisionDate: relationTermList[i].revisionDate,
            codeTypeName: relationTermList[i].codeTypeName,
            codeName: relationTermList[i].codeName,
            updater: relationTermList[i].updater,
            updateDateTime: relationTermList[i].updateDateTime,
          });
        }
        rowData.value = sampleData;
      };

      const agGrid = ref(null);

      watch(
        domainViewSelectData,
        async (newVal) => {
          if (newVal === null) {
            rowData.value = [];
            return;
          }

          console.log('domainViewSelectData : ', newVal);

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
        resultCount,
        onClickCellData,
        gridDialogState,
        showAnimate,
      };
    },
  };
</script>
