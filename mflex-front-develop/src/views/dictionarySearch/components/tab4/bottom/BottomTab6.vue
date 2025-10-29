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
  import { reactive, ref, watch, watchEffect, inject } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getCodeValueHistoryInfo } from '@/utils/mflexApi/dictionarySearchApi';

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
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const rowData = reactive({});

      const showAnimate = ref(false);

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
        },
        {
          headerName: '구분',
          field: 'historyDivisionName',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '통합코드값',
          field: 'unityCodeValue',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
        {
          headerName: '통합코드값명',
          field: 'unityCodeValueName',
          cellClass: 'grid-cell-centered',
          width: 150,
        },
        {
          headerName: '통합코드설명',
          field: 'unityCodeValueExplain',
          cellClass: 'grid-cell-centered',
          tooltipField: 'termInfo',
          width: 130,
        },
        {
          headerName: '상위코드',
          field: 'parentUnityCode',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 250,
        },
        {
          headerName: '참조코드',
          field: 'referenceCode',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 250,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 160,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const selectedTab6Data = inject('codeValueSelectData');

      watchEffect(async () => {
        console.log('selectedTab6Data.value ===', selectedTab6Data.value);

        if (selectedTab6Data.value === null) {
          rowData.value = [];
          return;
        }

        if (selectedTab6Data.value.data) {
          console.log('selectedTab5Data.value ===', selectedTab6Data.value);
          const valueHistoryQuery = {
            unityCodeDictionaryId:
              selectedTab6Data.value.data.unityDictionaryId,
            unityCodeName: selectedTab6Data.value.data.unityCodeName,
            unityCodeValue: selectedTab6Data.value.data.unityCodeValue,
          };
          const codeValueHistoryTemp = await getCodeValueHistoryInfo(
            valueHistoryQuery
          );
          fetchData(codeValueHistoryTemp);
        } else {
          console.log('selectedTab5Data.value ===', selectedTab6Data.value);
          const valueHistoryQuery = {
            unityCodeDictionaryId: selectedTab6Data.value.unityDictionaryId,
            unityCodeName: selectedTab6Data.value.unityCodeName,
            unityCodeValue: selectedTab6Data.value.unityCodeValue,
          };
          const codeValueHistoryTemp = await getCodeValueHistoryInfo(
            valueHistoryQuery
          );
          fetchData(codeValueHistoryTemp);
        }

        showAnimate.value = true;

        setTimeout(() => {
          showAnimate.value = false;
        }, 1000);
      });

      const fetchData = async (codeValueHistoryTemp) => {
        /* const { data } = await $vxHttp.get(
          './sampleData/codeValueHistoryData.json'
        ); */
        /* const codeValueHistoryData = codeValueHistoryData;
        console.log('codeValueHistoryData : ', codeValueHistoryData); */
        // rowData.value = data;
        console.log('codeValueHistoryTemp ===', codeValueHistoryTemp);
        const valueHistorys = codeValueHistoryTemp.data;

        const sampleData = [];
        for (let i = 0; i < valueHistorys.length; i++) {
          let revisionInfos = '';

          if (
            valueHistorys[i].revisionCycle === null ||
            valueHistorys[i].revisionCycle === ''
          ) {
            revisionInfos = `${valueHistorys[i].revisionDate}`;
          } else {
            revisionInfos = `${valueHistorys[i].revisionDate}(${valueHistorys[i].revisionCycle})`;
          }

          sampleData.push({
            id: i,
            no: i + 1,
            historyDivisionName: valueHistorys[i].historyDivisionName,
            unityCodeValue: valueHistorys[i].unityCode.value,
            unityCodeValueName: valueHistorys[i].unityCode.valueName,
            unityCodeValueExplain: valueHistorys[i].unityCode.valueExplain,
            parentUnityCode: [
              {
                id: 0,
                type: valueHistorys[i].parentUnityCode.dictionary.type.name,
                label: valueHistorys[i].parentUnityCode.info,
                bgColor:
                  valueHistorys[i].parentUnityCode.dictionary.type
                    .backgroundColor,
                color:
                  valueHistorys[i].parentUnityCode.dictionary.type.fontColor,
                size: 60,
              },
            ],
            referenceCode: [
              {
                id: 0,
                type: valueHistorys[i].referenceUnityCode.dictionary.type.name,
                label: valueHistorys[i].referenceUnityCode.info,
                bgColor:
                  valueHistorys[i].referenceUnityCode.dictionary.type
                    .backgroundColor,
                color:
                  valueHistorys[i].referenceUnityCode.dictionary.type.fontColor,
                size: 60,
              },
            ],
            revisionInfo: revisionInfos,
            updater: valueHistorys[i].updater,
            updateDateTime: valueHistorys[i].updateDateTime,
          });
        }
        console.log('sampleData ===', sampleData);
        rowData.value = sampleData;
      };

      //fetchData();

      const agGrid = ref(null);
      // const mountedActive = ref(false);
      // onMounted(() => {
      //   console.log('그리드 onMounted 실행?');
      //   mountedActive.value = true;
      //   setTimeout(() => {
      //     setGridApis2([agGrid.value.gridApi]);
      //   }, 200);
      // });
      // onActivated(() => {
      //   if (!mountedActive.value) {
      //     console.log('그리드 onActivated 실행?');
      //     setTimeout(() => {
      //       setGridApis2([agGrid.value.gridApi]);
      //     }, 200);
      //   }
      // });

      // onDeactivated(() => {
      //   console.log('그리드 onDeactivated 실행?');
      //   setGridApis2(null);
      //   mountedActive.value = false;
      // });
      // onUnmounted(() => {
      //   console.log('그리드 onUnmounted 실행?');
      //   setGridApis2(null);
      //   mountedActive.value = false;
      // });

      // 코드값변경이력 테스트
      const testFetch = async () => {
        console.log('테스트 함수 시작 ');
        try {
          const response = await fetch(
            'src/sampledata/codeValueHistoryData.json'
          );
          const data = await response.json();
          console.log('data', data);
          const valueHistorys = data;

          const sampleData = [];
          for (let i = 0; i < valueHistorys.length; i++) {
            sampleData.push({
              id: i,
              no: i + 1,
              historyDivisionName: valueHistorys[i].historyDivisonName,
              unityCodeValue: valueHistorys[i].unityCode.value,
              unityCodeValueName: valueHistorys[i].unityCode.valueName,
              unityCodeValueExplain: valueHistorys[i].unityCode.valueExplain,
              parentUnityCode: [
                {
                  id: 0,
                  type: valueHistorys[i].parentUnityCode.dictionary.type.name,
                  label: valueHistorys[i].parentUnityCode.info,
                  bgColor:
                    valueHistorys[i].parentUnityCode.dictionary.type
                      .backgroundColor,
                  color:
                    valueHistorys[i].parentUnityCode.dictionary.type.fontColor,
                  size: 60,
                },
              ],
              referenceCode: [
                {
                  id: 0,
                  type: valueHistorys[i].referenceUnityCode.dictionary.type
                    .name,
                  label: valueHistorys[i].referenceUnityCode.info,
                  bgColor:
                    valueHistorys[i].referenceUnityCode.dictionary.type
                      .backgroundColor,
                  color:
                    valueHistorys[i].referenceUnityCode.dictionary.type
                      .fontColor,
                  size: 60,
                },
              ],
              revisionInfo: `${valueHistorys[i].revisionDate}(${valueHistorys[i].revisionCycle})`,
              updater: valueHistorys[i].updater,
              updateDateTime: valueHistorys[i].updateDateTime,
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
        showAnimate,
      };
    },
  };
</script>
