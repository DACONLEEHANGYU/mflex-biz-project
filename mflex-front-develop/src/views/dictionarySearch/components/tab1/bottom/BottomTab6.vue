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
  import { getTermColumnInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { storeToRefs } from 'pinia';
  import GridSearch from '@/components/grid/GridSearch.vue';

  export default {
    components: {
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
      const uiStore = useUiStore();
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);

      // 초기 데이터, 선택 용어 데이터 상위에서 inject
      const { useInfoSysId } = userStngInfo.value;

      const agGrid = ref(null);

      const { termViewSelectData } = storeToRefs(useDictionarySearchStore());

      const showAnimate = ref(false);

      const rowData = reactive({});

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },

        {
          headerName: '구조유형',
          field: 'structureType',
          cellClass: 'grid-cell-centered',
          width: 140,
          minWidth: 140,
        },
        {
          headerName: '테이블명',
          field: 'tableName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '엔터티명',
          field: 'tableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '컬럼명',
          field: 'columnName',
          cellClass: 'ag-left-aligned-cell',
          width: 160,
          minWidth: 160,
        },
        {
          headerName: '속성명',
          field: 'columnKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '데이터타입',
          field: 'dataTypeName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '스키마명',
          field: 'schemaName',
          cellClass: 'ag-left-aligned-cell',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '주제영역',
          field: 'subjectArea',
          cellClass: 'ag-left-aligned-cell',
          width: 120,
          minWidth: 120,
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
        count: '',
        total: '',
      });

      const fetchData = async (termRelationColumn) => {
        const tempData = [];

        for (let i = 0; i < termRelationColumn.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            tableName: termRelationColumn[i].tableName,
            tableKoreanName: termRelationColumn[i].tableKoreanName,
            structureTypeCode: termRelationColumn[i].structureTypeCode,
            structureType: termRelationColumn[i].structureTypeName,
            schemaName: termRelationColumn[i].schemaName,
            columnName: termRelationColumn[i].columnName,
            columnKoreanName: termRelationColumn[i].columnKoreanName,
            dataTypeName: termRelationColumn[i].dataTypeName,
            subjectArea: termRelationColumn[i].subjectAreaName,
            updater: termRelationColumn[i].updater,
            updateDateTime: termRelationColumn[i].updateDateTime,
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
              informationSystemId: useInfoSysId,
              termName: newVal.termName[0].label,
              termAbbreviationName: newVal.termEngAbbreviationName,
              logicalDataTypeName: newVal.logicalDataTypeName,
            };

            const response = await getTermColumnInfo(requestParams);
            console.log('연관컬럼 조회  ===', response);
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
        showAnimate, // 애니메이션 효과
      };
    },
  };
</script>
