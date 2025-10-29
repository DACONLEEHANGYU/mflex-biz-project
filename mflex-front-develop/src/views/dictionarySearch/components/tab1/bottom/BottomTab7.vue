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
  import { reactive, ref, inject, watchEffect, watch } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { getTermHistoryInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

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
      const { termViewSelectData } = storeToRefs(useDictionarySearchStore());

      const showAnimate = ref(false);

      const agGrid = ref(null);

      const rowData = reactive({});

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
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '용어영문약어명',
          field: 'termAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '표준구분',
          field: 'termStandardYnName',
          cellClass: 'grid-cell-centered',
          width: 10,
          minWidth: 100,
        },
        {
          headerName: '용어유형',
          field: 'termTypeName',
          cellClass: 'grid-cell-centered',
          tooltipField: 'wordEngName',
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
          width: 120,
          minWidth: 120,
        },
        {
          headerName: '코드명',
          field: 'relationCodeName',
          cellClass: 'ag-left-aligned-cell',
          width: 120,
          minWidth: 120,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
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
          width: 150,
          minWidth: 150,
        },
      ]);

      const resultCount = ref({
        count: '',
        total: '',
      });

      const fetchData = async (termHistoryList) => {
        const tempData = [];

        console.log('termHistoryList ================= ', termHistoryList);

        for (let i = 0; i < termHistoryList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: termHistoryList[i].instituteId,
            dictionaryId: termHistoryList[i].dictionaryId,
            historyType: termHistoryList[i].historyDivisionName,
            termName: termHistoryList[i].termName,
            termAbbreviationName: termHistoryList[i].termAbbreviationName,
            termStandardYnName: termHistoryList[i].termStandardYnName,
            termTypeName: termHistoryList[i].termTypeName,
            domainName: termHistoryList[i].domainName,
            codeTypeName: termHistoryList[i].codeTypeName,
            relationCodeName: termHistoryList[i].relationCodeName,
            discardYn: termHistoryList[i].discardYn,
            revisionInfo: termHistoryList[i].revisionDate,
            updater: termHistoryList[i].updater,
            updateDateTime: termHistoryList[i].updateDateTime,
          });
        }
        rowData.value = tempData;
      };

      watch(
        termViewSelectData,
        async (newVal) => {
          console.log('termViewSelectData ===', newVal);
          if (newVal) {
            const requestParams = {
              instituteId: newVal.instituteId,
              dictionaryId: newVal.dictionaryId,
              termName: newVal.termName[0].label,
              termAbbreviationName: newVal.termEngAbbreviationName,
              domainName: newVal.domainName,
            };

            const response = await getTermHistoryInfo(requestParams);
            console.log('용어 히스토리 조회  ===', response);
            await fetchData(response);
          } else {
            rowData.value = [];
          }

          showAnimate.value = true;
          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);
        },
        { immediate: true }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        showAnimate,
      };
    },
  };
</script>
