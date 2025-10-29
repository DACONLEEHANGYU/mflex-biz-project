<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          공식사전 목록
          <AppTooltip :htmlContent="getTooltipById('externalDictionaryList')">
          </AppTooltip>
        </div>
      </div>
      <div class="top-row"></div>
    </div>
    <div class="grid-wrap">
      <div class="grid-top"></div>
      <div class="grid-list database-grid">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
          :context="context"
          rowSelection="single"
          @rowClicked="onRowClicked"
          ref="agGrid"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import {
    ref,
    reactive,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeMount,
  } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUiStore } from '@/stores/ui';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useAuthStore } from '@/stores/auth';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import { getCommonDictionaryList } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  export default {
    components: {
      AppTooltip,
      TypeCellRenderer,
    },
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowClicked(value) {
        console.log('onRowClicked ', value);
        this.selectedRow = value;

        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
        clickedNode.classList.add('ag-row-selected');

        this.setSelectExternalDictionary(value);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props) {
      const authStore = useAuthStore();
      const { userMetaMngInstListInfo, userStngInfo, userMetaMngInstList } =
        storeToRefs(authStore);

      const {
        setSelectDatabaseInfo,
        setSaveDatabaseState,
        setDeleteDatabaseState,
        setSelectDatabaseInstituteId,
      } = useSystemMngStore();
      const { saveDatabaseState, newDatabaseId, deleteDatabaseState } =
        storeToRefs(useSystemMngStore());

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const metaMngInstList = userMetaMngInstList.value;

      const { setSelectExternalDictionary, setSaveState } =
        useExternalDictionaryStore();
      const { saveState, newDictionaryId } = storeToRefs(
        useExternalDictionaryStore()
      );

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const agGrid = ref(null);
      const gridApi = ref(null);

      const rowData = reactive({});

      onBeforeMount(async () => {});

      const columnDefs = ref([
        {
          headerName: '공식사전명',
          field: 'externalDictionaryName',
          width: 300,
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: '(params) => params.value',
          cellClassRules: {
            'discard-row': (params) =>
              params.data && params.data.discardYn === true,
          },
          dragStatus: false,
        },
        {
          headerName: '사전유형',
          field: 'dictionaryType',
          width: 190,
          cellClass: 'grid-cell-centered',
          cellStyle: (params) => {
            if (params.data && params.data.discardYn === true) {
              return {
                color: '#ff4040',
                textDecoration: 'line-through',
              };
            }
            return { textAlign: 'center' };
          },
          dragStatus: false,
        },
      ]);

      const firstRowSelectedEvent = () => {
        nextTick(() => {
          const collectionGrid = document.querySelector('.database-grid');

          if (!collectionGrid) {
            console.error('Collection grid not found!');
            return;
          }

          const nodesWithRowId0 = collectionGrid.querySelector('[row-id="0"]');
          console.log('nodeWithRowId0 ========', nodesWithRowId0);

          if (nodesWithRowId0) {
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          }
        });
      };

      const fetchData = async (newDictionaryId) => {
        // const databaseList = await getDatabaseList(selectInstitute.id);

        const commonDictionaryList = await getCommonDictionaryList();
        console.log('commonDictionaryList : ', commonDictionaryList);

        // const databaseList = [
        //   {
        //     externalDictionaryName: [
        //       {
        //         id: 0,
        //         type: '정부표준',
        //         label: '범정부 공통표준 사전',
        //         color: 'white',
        //         bgColor: '#28689c',
        //         size: 60,
        //       },
        //     ],
        //     dictionaryType: '정부표준',
        //     explain: '범정부 공통표준 사전',
        //   },
        //   {
        //     externalDictionaryName: [
        //       {
        //         id: 0,
        //         type: '재무회계',
        //         label: '재무회계 사전',
        //         color: 'white',
        //         bgColor: 'rgb(240, 130, 62)',
        //         size: 60,
        //       },
        //     ],
        //     dictionaryType: '재무회계',
        //     explain: '재무회계 사전',
        //   },
        //   {
        //     externalDictionaryName: [
        //       {
        //         id: 0,
        //         type: '정보통신',
        //         label: '정보통신 사전',
        //         color: 'white',
        //         bgColor: '#27ac6e',
        //         size: 60,
        //       },
        //     ],
        //     dictionaryType: '정보통신',
        //     explain: '정보통신 사전전',
        //   },
        // ];

        let tempData = [];

        for (let i = 0; i < commonDictionaryList.length; i++) {
          tempData.push({
            id: i,
            dictionaryId: commonDictionaryList[i].dictionaryId,
            externalDictionaryName: [
              {
                id: commonDictionaryList[i].dictionaryId,
                type: commonDictionaryList[i].dictionaryTypeName,
                label: commonDictionaryList[i].dictionaryName,
                color:
                  commonDictionaryList[i].dictionaryTypeForegroundColorName,
                bgColor:
                  commonDictionaryList[i].dictionaryTypeBackgroundColorName,
                size: 60,
              },
            ],
            dictionaryType: commonDictionaryList[i].dictionaryTypeName,
            dictionaryExplain: commonDictionaryList[i].dictionaryExplain,
            discardYn: commonDictionaryList[i].discardYn,
            order: commonDictionaryList[i].order,
            registerDateTime: commonDictionaryList[i].registerDateTime,
            registerId: commonDictionaryList[i].registerId,
            registerName: commonDictionaryList[i].registerName,
            updateDateTime: commonDictionaryList[i].updateDateTime,
            updateId: commonDictionaryList[i].updateId,
            updateName: commonDictionaryList[i].updateName,
          });
        }
        rowData.value = tempData;

        // setSelectDatabaseInfo(rowData.value[0]);

        console.log('newDictionaryId : ', newDictionaryId);

        // 신규등록 시
        if (newDictionaryId) {
          nextTick(() => {
            const selectedRow = rowData.value.find(
              (row) => row.dictionaryId === newDictionaryId.value
            );

            console.log('selectedRow : ', selectedRow);
            console.log('newDatabaseId : ', newDatabaseId);

            if (selectedRow) {
              // 변수명을 다르게 지정하여 충돌 방지
              const selectedElements = document.querySelectorAll(
                '[class~="ag-row-selected"]'
              );
              // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
              selectedElements.forEach((node) => {
                node.classList.remove('ag-row-selected');
              });

              console.log('selectedRow : ', selectedRow); // 원래의 selectedRow 객체 로깅
              const clickedNode = document.querySelector(
                `[row-id="${selectedRow.id}"]`
              );

              console.log('clickedNode : ', clickedNode);
              if (clickedNode) {
                // clickedNode가 null이 아닌지 확인
                clickedNode.classList.add('ag-row-selected');
                setSelectExternalDictionary(selectedRow);
              } else {
                console.warn(
                  `Element with row-id="${selectedRow.id}" not found`
                );
              }
            }
          });
        } else {
          setSelectExternalDictionary(rowData.value[0]);
          firstRowSelectedEvent(); // 첫 번째 행 선택 이벤트 호출
        }
      };

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      // 저장상태 변경 감지
      watch(
        () => saveDatabaseState.value,
        async (newValue) => {
          console.log('saveDatabaseState : ', newValue);
          if (newValue) {
            // await fetchData(newDatabaseId.value);
            // setSaveDatabaseState(false);
          }
        }
      );

      onBeforeMount(async () => {
        await fetchData();
        // setSelectDatabaseInstituteId(selectInstituted.value);
      });

      // watch(
      //   () => deleteDatabaseState.value,
      //   async (newValue) => {
      //     console.log('selectedRow : ', newValue);
      //     if (newValue) {
      //       await fetchData();
      //       setDeleteDatabaseState(false);
      //     }
      //   }
      // );

      watch(
        () => saveState.value,
        (newValue) => {
          console.log('saveState : ', newValue);
          if (newValue) {
            fetchData(newDictionaryId);
            setSaveState(false);
          }
        }
      );

      return {
        rowData,
        columnDefs,
        agGrid,
        gridApi,
        popInfo,
        fetchData,
        metaMngInstList,
        getTooltipById,
        setSelectExternalDictionary,
      };
    },
  };
</script>

<style scoped>
  /* 기존 스타일 유지 */

  .discard-row {
    text-decoration: line-through;
    text-decoration-color: #ff4040;
    color: #ff4040;
  }
  :deep(.discard-row) {
    text-decoration: line-through;
    text-decoration-color: #ff4040;
    color: #ff4040;
  }
  /* 삭제된 행에 대한 스타일 */
  :deep(.deleted-row) {
    background-color: #fff5f5;
  }

  :deep(.deleted-text) {
    color: #ff4040;
    text-decoration: line-through;
  }
</style>
