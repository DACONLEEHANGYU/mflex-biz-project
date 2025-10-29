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
  import { reactive, ref, watch } from 'vue';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import { getColumnRelatedForeignKey } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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
      const { selectColumnData } = storeToRefs(useSchemaSearchTabStore());

      // 데이터 변경 애니메이션 상태
      const showAnimate = ref(false);

      const agGrid = ref(null);

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
          headerName: '테이블명',
          field: 'tableName',
          cellClass: 'ag-left-aligned-cell',
          width: 180,
          minWidth: 180,
        },
        {
          headerName: '테이블한글명',
          field: 'tableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          minWidth: 300,
        },
        {
          headerName: '외래키 컬럼 구성 내역',
          field: 'foreignKeyCompositionContent',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEngName',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '상위 테이블명',
          field: 'referenceTableName',
          cellClass: 'gag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '상위 테이블한글명',
          field: 'referenceTableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '상위 기본키 컬럼 구성 내역',
          field: 'referencePrimaryKeyComposition',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '필수여부',
          field: 'isRelationEssential',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '관계유형',
          field: 'relationTypeName',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
      ]);

      const resultCount = ref({
        count: '',
        total: '',
      });

      let termSynonym = reactive({});

      const fetchData = (foreignKeyList) => {
        const tempData = [];

        console.log('foreignKeyList : ', foreignKeyList);

        for (let i = 0; i < foreignKeyList.length; i++) {
          const data = foreignKeyList[i];

          tempData.push({
            no: i + 1,
            tableName: data.tableName,
            tableKoreanName: data.tableKoreanName,
            foreignKeyCompositionContent: data.foreignKeyCompositionContent,
            referenceTableName: data.upperTabreferenceTableNameleName,
            referenceTableKoreanName: data.referenceTableKoreanName,
            referencePrimaryKeyComposition: data.referencePrimaryKeyComposition,
            isRelationEssential: data.isRelationEssential,
            relationTypeName: data.relationTypeName,
          });
        }

        rowData.value = tempData;
      };

      watch(
        selectColumnData,
        async (value) => {
          console.log('bottomTab4 - selectColumnData', value);
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          console.log('bottomTab4 - selectColumnData', value);

          const researchQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            columnName: value.columnName,
            columnKoreanName: value.columnKoreanName,
            dataTypeName: value.dataTypeName,
          };

          // TesQuery
          // const researchQuery = {
          //   instituteId: 6,
          //   informationSystemId: 6,
          //   databaseId: 6,
          //   schemaName: 'SBCWEB',
          //   columnName: 'SBSC_NO',
          // };

          const foreignKeyList = await getColumnRelatedForeignKey(
            researchQuery
          );

          fetchData(foreignKeyList);
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
