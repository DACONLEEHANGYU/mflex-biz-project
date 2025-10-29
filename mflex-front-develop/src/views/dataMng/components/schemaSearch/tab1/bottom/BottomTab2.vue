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
  import { getTableColumnInfo } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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
      const showAnimate = ref(false);

      const { selectTableData } = storeToRefs(useSchemaSearchTabStore());

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

      const fetchData = async (tableColumnData) => {
        const tempData = [];

        for (let i = 0; i < tableColumnData.length; i++) {
          tempData.push({
            no: i + 1,
            columnName: tableColumnData[i].columnName,
            columnKoreanName: tableColumnData[i].columnKoreanName,
            columnOrder: tableColumnData[i].columnOrder,
            dataTypeName: tableColumnData[i].dataTypeName,
            isPrimaryKey: tableColumnData[i].isPrimaryKey,
            isForeignKey: tableColumnData[i].isForeignKey,
            isNotNull: tableColumnData[i].isNotNull,
            privacyYn: tableColumnData[i].privacyYn,
            encryptYn: tableColumnData[i].encryptYn,
            releaseYn: tableColumnData[i].releaseYn,
            columnExplain: tableColumnData[i].columnExplain,
            defaultValue: tableColumnData[i].defaultValue,
            constraint: tableColumnData[i].constraint,
            updater: tableColumnData[i].updater,
            updateDateTime: tableColumnData[i].updateDateTime,
          });
        }

        rowData.value = tempData;
      };

      watch(
        selectTableData,
        async (value) => {
          console.log('bottomTa2 selectTableData.value ===', value);

          const tableBaseQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            tableName: value.tableName,
          };

          const tableColumnData = await getTableColumnInfo(tableBaseQuery);

          fetchData(tableColumnData);
          console.log('tableColumnData ===', tableColumnData);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);
        },
        { immediate: true }
      );

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '컬럼명',
          field: 'columnName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '컬럼한글명',
          field: 'columnKoreanName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '컬럼순서',
          field: 'columnOrder',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '데이터타입',
          field: 'dataTypeName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: 'PK',
          field: 'isPrimaryKey',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: 'FK',
          field: 'isForeignKey',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: 'NN',
          field: 'isNotNull',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '개인정보여부',
          field: 'privacyYn',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '공개여부',
          field: 'releaseYn',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '암호화여부',
          field: 'encryptYn',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },

        {
          headerName: '컬럼설명',
          field: 'columnExplain',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
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
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 110,
          minWidth: 110,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
      ]);

      const agGrid = ref(null);

      return {
        agGrid,
        rowData,
        columnDefs,
        gridDialogState,
        onClickCellData,
        showAnimate,
      };
    },
  };
</script>
