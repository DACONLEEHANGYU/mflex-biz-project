<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div class="col col-2">
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
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, inject, watch, watchEffect } from 'vue';
  import { DragCol } from 'vue-resizer';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import { getTableChildForeignKey } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },
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
      const { selectTableData } = storeToRefs(useSchemaSearchTabStore());
      const searchState = ref(false);

      const showAnimate = ref(false);

      const rowData = reactive([]);

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          minWidth: 60,
        },
        {
          headerName: '기본키 컬럼 구성 내역',
          field: 'primaryKeyComposition',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          minWidth: 300,
        },
        {
          headerName: '하위 테이블명',
          field: 'childTableName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '하위 테이블한글명',
          field: 'childTableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          minWidth: 300,
        },
        {
          headerName: '하위 외래키 컬럼 구성 내역',
          field: 'foreignKeyComposition',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          minWidth: 300,
        },
        {
          headerName: '필수여부',
          field: 'isRelationshipEssential',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '관계유형',
          field: 'relationshipTypeName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // rowData 에 조회된 데이터 할당
      const fetchData = async (tableFKQuery) => {
        console.log('tableFKQuery :', tableFKQuery);

        const tempData = [];

        for (let i = 0; i < tableFKQuery.length; i++) {
          tempData.push({
            no: i + 1,
            primaryKeyComposition: tableFKQuery[i].primaryKeyComposition,
            childTableName: tableFKQuery[i].childTableName,
            childTableKoreanName: tableFKQuery[i].childTableKoreanName,
            foreignKeyComposition: tableFKQuery[i].foreignKeyComposition,
            isRelationshipEssential: tableFKQuery[i].isRelationshipEssential,
            relationshipTypeName: tableFKQuery[i].relationshipTypeName,
          });
        }

        rowData.value = tempData;
      };

      const agGrid = ref(null);

      watch(
        selectTableData,
        async (value) => {
          console.log('BottomTab5 - selectTableData', value);

          const tableBaseQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            tableName: value.tableName,
          };

          const childForeignKey = await getTableChildForeignKey(tableBaseQuery);

          fetchData(childForeignKey);

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
        searchState,
        DragCol,
        showAnimate,
      };
    },
  };
</script>
