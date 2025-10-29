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
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import { getTableUpperForeignKey } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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
      const { selectTableData } = storeToRefs(useSchemaSearchTabStore());

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
          headerName: '외래키명',
          field: 'foreignKeyName',
          cellClass: 'ag-left-aligned-cell',
          width: 180,
          minWidth: 180,
        },
        {
          headerName: '외래키 컬럼 구성 내역',
          field: 'foreignKeyComposition',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          minWidth: 300,
        },
        {
          headerName: '상위 테이블명',
          field: 'referencedTableName',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEngName',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '상위 테이블한글명',
          field: 'referencedTableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '상위 기본키 컬럼 구성 내역',
          field: 'referencedPrimaryKeyComposition',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
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
          width: 230,
          minWidth: 230,
        },
      ]);

      const resultCount = ref({
        count: '',
        total: '',
      });

      const fetchData = async (upperForeignKey) => {
        const tempData = [];

        for (let i = 0; i < upperForeignKey.length; i++) {
          tempData.push({
            no: i + 1,
            foreignKeyName: upperForeignKey[i].foreignKeyName,
            foreignKeyComposition: upperForeignKey[i].foreignKeyComposition,
            isRelationshipEssential: upperForeignKey[i].isRelationshipEssential,
            referencedPrimaryKeyComposition:
              upperForeignKey[i].referencedPrimaryKeyComposition,
            referencedTableKoreanName:
              upperForeignKey[i].referencedTableKoreanName,
            referencedTableName: upperForeignKey[i].referencedTableName,
            relationshipTypeName: upperForeignKey[i].relationshipTypeName,
          });
        }

        rowData.value = tempData;
      };

      watch(
        selectTableData,
        async (value) => {
          console.log('BottomTab4 - selectTableData', value);

          const tableBaseQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            tableName: value.tableName,
          };

          const upperForeignKey = await getTableUpperForeignKey(tableBaseQuery);

          console.log('upperForeignKey ===', upperForeignKey);

          fetchData(upperForeignKey);

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
