<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div
      class="col col-2 bottom-box"
      :class="{ 'highlight-grid': showAnimate }"
    >
      <div class="inputs-wrap" style="flex: 0 0 42%">
        <div class="input-form">
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="30%" />
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th>DB명/스키마명</th>
                <td colspan="3">
                  <div class="td-col">{{ indexInfo.databaseSchemaName }}</div>
                </td>
              </tr>
              <tr>
                <th>주제영역</th>
                <td colspan="3">
                  <div class="td-col">{{ indexInfo.subjectAreaName }}</div>
                </td>
              </tr>
              <tr>
                <th>테이블명</th>
                <td colspan="3">
                  <div class="td-col">{{ indexInfo.tableInformation }}</div>
                </td>
              </tr>
              <tr>
                <th>인덱스명</th>
                <td colspan="3">
                  <div class="td-col">{{ indexInfo.indexName }}</div>
                </td>
              </tr>
              <tr>
                <th>인덱스컬럼구성</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ indexInfo.indexCompositionContent }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>Unique여부</th>
                <td colspan="3">
                  <div class="td-col">{{ indexInfo.isUnique }}</div>
                </td>
              </tr>
              <tr>
                <th>수집일시</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ indexInfo.indexCollectionDateTime }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td colspan="3">
                  <div class="td-col">{{ indexInfo.updater }}</div>
                </td>
              </tr>
              <tr>
                <th>최종수정일시</th>
                <td colspan="3">
                  <div class="td-col">{{ indexInfo.updateDateTime }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-wrap">
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
  import { reactive, ref, watch } from 'vue';
  import { DragCol } from 'vue-resizer';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import {
    getIndexBaseInfo,
    getIndexColumn,
  } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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
      const searchState = ref(false);

      // 데이터 변경 애니메이션 상태
      const showAnimate = ref(false);

      const { selectIndexData } = storeToRefs(useSchemaSearchTabStore());

      const agGrid = ref(null);

      const rowData = reactive([]);

      const columnDefs = reactive([
        {
          headerName: '키순서',
          field: 'indexColumnOrder',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '컬럼명',
          field: 'indexColumnName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '컬럼한글명',
          field: 'indexColumnKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '정렬방식',
          field: 'sortWayCode',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const indexInfo = reactive({
        databaseSchemaName: '',
        indexCollectionDateTime: '',
        indexCompositionContent: '',
        indexName: '',
        isUnique: true,
        subjectAreaName: null,
        tableInformation: '',
        updateDateTime: '',
        updater: '',
      });

      // rowData 에 조회된 데이터 할당
      const fetchData = async (indexColumnList) => {
        const tempData = [];

        for (let i = 0; i < indexColumnList.length; i++) {
          tempData.push({
            indexColumnOrder: indexColumnList[i].indexColumnOrder,
            indexColumnName: indexColumnList[i].indexColumnName,
            indexColumnKoreanName: indexColumnList[i].indexColumnKoreanName,
            sortWayCode: indexColumnList[i].sortWayCode,
          });
        }

        rowData.value = tempData;
      };

      const bindingIndexBaseInfo = (value) => {
        indexInfo.databaseSchemaName = value.databaseSchemaName;
        indexInfo.indexCollectionDateTime = value.indexCollectionDateTime;
        indexInfo.indexCompositionContent = value.indexCompositionContent;
        indexInfo.indexName = value.indexName;
        indexInfo.isUnique = value.isUnique;
        indexInfo.subjectAreaName = value.subjectAreaName;
        indexInfo.tableInformation = value.tableInformation;
        indexInfo.updateDateTime = value.updateDateTime;
        indexInfo.updater = value.updater;
      };

      watch(
        selectIndexData,
        async (value) => {
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          if (value.instituteId) {
            const indexQuery = {
              instituteId: value.instituteId,
              informationSystemId: value.informationSystemId,
              databaseId: value.databaseId,
              schemaName: value.schemaName,
              columnName: value.columnName,
              tableName: value.tableName,
              indexName: value.indexName,
            };

            const indexBaseData = await getIndexBaseInfo(indexQuery);

            console.log('indexBaseData', indexBaseData);

            bindingIndexBaseInfo(indexBaseData);

            const indexColumnList = await getIndexColumn(indexQuery);

            console.log('indexColumnList', indexColumnList);

            fetchData(indexColumnList);
          } else {
            rowData.value = [];
            return;
          }
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
        indexInfo,
        showAnimate,
      };
    },
  };
</script>
