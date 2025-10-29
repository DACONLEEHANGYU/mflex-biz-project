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
  import { reactive, ref, inject, watch, watchEffect } from 'vue';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getCodeNameHistoryInfo } from '@/utils/mflexApi/dictionarySearchApi';

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
      const agGrid = ref(null);
      const rowData = reactive({});

      const showAnimate = ref(false);

      const selectedTab5Data = inject('selectedData');

      watchEffect(async () => {
        // firstRowData 변경에 대한 추가적인 처리가 필요하다면 여기에 로직 추가

        if (selectedTab5Data.value === null) {
          rowData.value = [];
          return;
        }

        if (selectedTab5Data.value.data) {
          console.log('selectedTab5Data.value ===', selectedTab5Data.value);
          const historyQuery = {
            unityCodeDictionaryId:
              selectedTab5Data.value.data.unityCodeDictionaryId,
            unityCodeName: selectedTab5Data.value.data.unityCodeName,
          };
          const codeNameHistoryTemp = await getCodeNameHistoryInfo(
            historyQuery
          );
          fetchData(codeNameHistoryTemp);
        } else {
          console.log('selectedTab5Data.value ===', selectedTab5Data.value);
          const historyQuery = {
            unityCodeDictionaryId: selectedTab5Data.value.unityCodeDictionaryId,
            unityCodeName: selectedTab5Data.value.unityCodeName,
          };
          const codeNameHistoryTemp = await getCodeNameHistoryInfo(
            historyQuery
          );
          fetchData(codeNameHistoryTemp);
        }

        showAnimate.value = true;

        setTimeout(() => {
          showAnimate.value = false;
        }, 1000);
      });

      // rowData에 조회한 연관용어 push
      const fetchData = (codeNameHistoryTemp) => {
        const codeNameHistorys = codeNameHistoryTemp.data;

        const sampleData = [];

        for (let i = 0; i < codeNameHistorys.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            historyDivisionName: codeNameHistorys[i].historyDivisionName,
            unityCodeKoreanName: [
              {
                id: 0,
                type: codeNameHistorys[i].unityCode.dictionary.type.name,
                label: codeNameHistorys[i].unityCode.koreanName,
                color: codeNameHistorys[i].unityCode.dictionary.type.fontColor,
                bgColor:
                  codeNameHistorys[i].unityCode.dictionary.type.backgroundColor,
                size: 60,
              },
            ],

            unityCodeName: codeNameHistorys[i].unityCode.name,
            unityCodeTypeName: codeNameHistorys[i].unityCode.typeName,
            logicalDataType: codeNameHistorys[i].dataTypeInfo,
            unityCodeExplian: codeNameHistorys[i].unityCode.explain,
            managementDepartmentName:
              codeNameHistorys[i].managementDepartmentName,
            revisionInfo: `${codeNameHistorys[i].revisionDate}(${codeNameHistorys[i].revisionCycle})`,
            updater: codeNameHistorys[i].updater,
            updateDateTime: codeNameHistorys[i].updateDateTime,
          });
        }
        rowData.value = sampleData;
      };

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
        },
        {
          headerName: '구분',
          field: 'historyDivisionName',
          cellClass: 'ag-left-aligned-cell',
          width: 70,
        },
        {
          headerName: '통합코드한글명',
          field: 'unityCodeKoreanName',
          cellClass: 'grid-cell-centered',
          width: 200,
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
        },
        {
          headerName: '통합코드명',
          field: 'unityCodeName',
          cellClass: 'ag-left-aligned-cell',
        },
        {
          headerName: '코드유형',
          field: 'unityCodeTypeName',
          cellClass: 'ag-left-aligned-cell',
          width: 130,
        },
        {
          headerName: '데이터타입',
          field: 'logicalDataType',
          cellClass: 'grid-cell-centered',

          width: 150,
        },
        {
          headerName: '통합코드설명',
          field: 'unityCodeExplian',
          cellClass: 'grid-cell-centered',
          width: 250,
        },
        {
          headerName: '관리부서',
          field: 'managementDepartmentName',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',

          width: 230,
        },

        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const gridDialogState = reactive({
        view: false,
        title: '선택 Cell',
        message: '',
        type: 'alert',
        selectCell: false,
      });

      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 단어설명
        if (data.column.colId === 'wordExplan') {
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

      // 코드값변경이력 테스트 함수
      const testFetch = async () => {
        console.log('테스트 함수 시작 ');
        try {
          const response = await fetch(
            'src/sampledata/codeNameHistoryData.json'
          );
          const data = await response.json();
          console.log('data', data);
          const codeNameHistorys = data;

          const sampleData = [];
          for (let i = 0; i < codeNameHistorys.length; i++) {
            let revisionInfos = '';

            if (
              codeNameHistorys[i].revisionCycle === null ||
              codeNameHistorys[i].revisionCycle === ''
            ) {
              revisionInfos = `${codeNameHistorys[i].revisionDate}`;
            } else {
              revisionInfos = `${codeNameHistorys[i].revisionDate}(${codeNameHistorys[i].revisionCycle})`;
            }

            sampleData.push({
              id: i,
              no: i + 1,
              unityCodeKoreanName: [
                {
                  id: 0,
                  type: codeNameHistorys[i].unityCode.dictionary.type.name,
                  label: codeNameHistorys[i].unityCode.koreanName,
                  color:
                    codeNameHistorys[i].unityCode.dictionary.type.fontColor,
                  bgColor:
                    codeNameHistorys[i].unityCode.dictionary.type
                      .backgroundColor,
                  size: 60,
                },
              ],

              unityCodeName: codeNameHistorys[i].unityCode.name,

              historyDivisionName: codeNameHistorys[i].historyDivisionName,
              unityCodeTypeName: codeNameHistorys[i].unityCode.typeName,
              logicalDataType: codeNameHistorys[i].dataTypeInfo,
              unityCodeExplian: codeNameHistorys[i].unityCode.explain,
              managementDepartmentName:
                codeNameHistorys[i].managementDepartmentName,
              enactInfo: `${codeNameHistorys[i].enactDate}(${codeNameHistorys[i].enactCycle})`,
              revisionInfo: revisionInfos,
              updater: codeNameHistorys[i].updater,
              updateDateTime: codeNameHistorys[i].updateDateTime,
            });
          }
          console.log('sampleData ===', sampleData);
          rowData.value = sampleData;

          console.log('테스트 데이터', data);
        } catch (error) {
          console.error(error);
        }
      };

      //testFetch();

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
