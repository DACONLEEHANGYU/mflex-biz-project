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
          @cellClicked="onCellClicked"
          @rowClicked="onRowClicked"
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
  import { reactive, ref, watch } from 'vue';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import { getColumnRelatedTable } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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
      onCellClicked(value) {
        console.log('onCellClicked', value);
        this.selectedRow = value;
        this.onClickCellData(value);
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked 구성단어', value);
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

      const showAnimate = ref(false);

      const agGrid = ref(null);

      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 단어설명
        if (data.column.colId === 'wordExplan') {
          gridDialogState.view = true;
          gridDialogState.message = data.value;
          gridDialogState.selectCell = false;
          gridDialogState.title = data.column.userProvidedColDef.headerName;

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

      let termStructureWord = reactive({});

      //ag-left-aligned-cell
      //grid-cell-centered
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
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '테이블한글명',
          field: 'tableKoreanName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: 'DB명/스키마명',
          field: 'databaseSchemaInformation',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '컬럼위치',
          field: 'columnSequenceNumber',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: 'PK',
          field: 'primaryKeyOrderName',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: 'NN',
          field: 'notNullStatus',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '기본값',
          field: 'defaultValue',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '제약조건',
          field: 'constraint',
          cellClass: 'grid-cell-centered',
          width: 120,
          minWidth: 120,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 120,
          minWidth: 120,
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
        count: 10,
        total: 20,
      });

      const fetchData = (tableList) => {
        const tempData = [];

        for (let i = 0; i < tableList.length; i++) {
          tempData.push({
            no: i + 1,
            tableName: tableList[i].tableName,
            tableKoreanName: tableList[i].tableKoreanName,
            databaseSchemaInformation: tableList[i].databaseSchemaInformation,
            columnSequenceNumber: tableList[i].columnSequenceNumber,
            primaryKeyOrderName: tableList[i].primaryKeyOrderName,
            notNullStatus: tableList[i].notNullStatus,
            defaultValue: tableList[i].defaultValue,
            constraint: tableList[i].constraint,
            updater: tableList[i].updater,
            updateDateTime: tableList[i].updateDateTime,
          });
        }

        rowData.value = tempData;
      };

      watch(
        selectColumnData,
        async (value) => {
          console.log('컬럼조회 BottomTab2 value', value);

          // 애니메이션 선 적용
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          const columnTableInfo = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            columnName: value.columnName,
            columnKoreanName: value.columnKoreanName,
            dataTypeName: value.dataTypeName,
          };

          const tableList = await getColumnRelatedTable(columnTableInfo);

          fetchData(tableList);
        },
        { immediate: true }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        gridDialogState,
        onClickCellData,
        showAnimate,
      };
    },
  };
</script>
