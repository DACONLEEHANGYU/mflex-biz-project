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
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import { getForeignKeyColumn } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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
      const { selectForeignKeyData } = storeToRefs(useSchemaSearchTabStore());

      const agGrid = ref(null);

      const showAnimate = ref(false);

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

      const columnDefs = reactive([
        {
          headerName: '순서',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '외래키 정보',
          field: 'foreignKeyInfo',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
          children: [
            {
              headerName: '테이블명',
              field: 'foreignKeyTableName',
              cellClass: 'grid-cell',
              width: 200,
              minWidth: 200,
            },
            {
              headerName: '테이블한글명',
              field: 'foreignKeyTableKoreanName',
              cellClass: 'grid-cell',
              width: 250,
              minWidth: 250,
            },
            {
              headerName: '컬럼명',
              field: 'foreignKeyColumnName',
              cellClass: 'grid-cell',
              width: 250,
              minWidth: 250,
            },
            {
              headerName: '컬럼한글명',
              field: 'foreignKeyColumnKoreanName',
              cellClass: 'grid-cell',
              width: 250,
              minWidth: 250,
            },
          ],
        },
        {
          headerName: '참조테이블 정보',
          children: [
            {
              headerName: '참조테이블명',
              field: 'referenceTableName',
              cellClass: 'grid-cell',
              width: 250,
              minWidth: 250,
            },
            {
              headerName: '참조 테이블한글명',
              field: 'referenceTableKoreanName',
              cellClass: 'grid-cell',
              width: 250,
              minWidth: 250,
            },
            {
              headerName: '기본키 컬럼명',
              field: 'referencePrimaryKeyColumnName',
              cellClass: 'grid-cell',
              width: 250,
              minWidth: 250,
            },
            {
              headerName: '기본키 컬럼한글명',
              field: 'referencePrimaryKeyColumnKoreanName',
              cellClass: 'grid-cell',
              width: 200,
              minWidth: 200,
            },
          ],
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async (value) => {
        const tempData = [];

        for (let i = 0; i < value.length; i++) {
          tempData.push({
            no: i + 1,
            foreignKeyTableName: value[i].foreignKeyTableName,
            foreignKeyTableKoreanName: value[i].foreignKeyTableKoreanName,
            foreignKeyColumnName: value[i].foreignKeyColumnName,
            foreignKeyColumnKoreanName: value[i].foreignKeyColumnKoreanName,
            referenceTableName: value[i].referenceTableName,
            referenceTableKoreanName: value[i].referenceTableKoreanName,
            referencePrimaryKeyColumnName:
              value[i].referencePrimaryKeyColumnName,
            referencePrimaryKeyColumnKoreanName:
              value[i].referencePrimaryKeyColumnKoreanName,
          });
        }
        rowData.value = tempData;
      };

      watch(
        selectForeignKeyData,
        async (value) => {
          console.log('selectForeignKeyData', value);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          if (value.instituteId) {
            const foreignKeyColumnQuery = {
              instituteId: value.instituteId,
              informationSystemId: value.informationSystemId,
              databaseId: value.databaseId,
              schemaName: value.schemaName,
              tableName: value.tableName,
              foreignKeyName: value.foreignKeyName,
            };

            const foreignKeyColumnList = await getForeignKeyColumn(
              foreignKeyColumnQuery
            );
            // const tableName = value.tableName;

            console.log('foreignKeyColumnList : ', foreignKeyColumnList);
            fetchData(foreignKeyColumnList);
          } else {
            rowData.value = [];
          }
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
