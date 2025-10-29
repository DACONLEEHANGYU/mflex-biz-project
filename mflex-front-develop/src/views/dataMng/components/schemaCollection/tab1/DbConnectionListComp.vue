<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-s">
        DB연결정보 목록
        <AppTooltip :htmlContent="getTooltipById('dbConnectionList')">
        </AppTooltip>
      </div>
    </div>
    <div class="grid-wrap">
      <div class="grid-top"></div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefsConnectionDB"
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
  import { reactive, computed, watch, nextTick } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';
  import { useAuthStore } from '@/stores/auth';

  import {
    getDbConnectionList, // DB 연결정보 목록 조회
    getDbConnectionDetails, // DB 연결정보 상세조회
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';

  import AppTooltip from '@/components/ui/AppTooltip.vue';

  export default {
    components: {
      AppTooltip,
    },
    emits: ['no-data'],
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      async onRowClicked(value) {
        // 조회 상태로 변경
        this.setSelectJobState(false);
        console.log('onRowClicked ', value);
        this.selectedRow = value;

        const data = {
          databaseLinkId: value.databaseLinkId,
          instituteId: value.instituteId,
        };

        const details = await getDbConnectionDetails(data);

        console.log('details-getDbConnectionDetails : ', details);
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

        this.setDbInfo(details);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props, { emit }) {
      const rowData = reactive({});

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      // DB연결정보 Info Details
      const schemaCollectionStore = useSchemaCollectionStore();
      const { saveState, saveDatabaseId } = storeToRefs(schemaCollectionStore);
      const {
        setDbInfo,
        setSaveState,
        setConnectionList,
        setOnlineYnState,
        setSelectJobState,
      } = schemaCollectionStore;

      const authStore = useAuthStore();
      const { userMetaMngInstListInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId } = userStngInfo.value;

      console.log('userMetaMngInstListInfo : ', userMetaMngInstListInfo.value);

      const selectInstituted = computed(() => {
        return userMetaMngInstListInfo.value.find(
          (item) => item.selected === true
        );
      });

      // DB연결 테스트 상태
      const { dbConnectionTestState } = storeToRefs(schemaCollectionStore);

      const columnDefsConnectionDB = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
        },
        {
          headerName: 'DB 연결정보명',
          field: 'databaseLinkName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          cellStyle: (params) => {
            // 조건에 따라 취소선 적용
            if (params.data.delYn) {
              return { textDecoration: 'line-through', color: 'red' };
            }
            return null;
          },
        },
        {
          headerName: 'DBMS',
          field: 'dbmsKindName',
          cellClass: 'grid-cell-centered',
          width: 180,
          cellStyle: (params) => {
            // 조건에 따라 취소선 적용
            if (params.data.delYn) {
              return { textDecoration: 'line-through', color: 'red' };
            }
            return null;
          },
        },
      ]);

      const fetchData = async (item) => {
        const tempData = [];

        // DB 연결정보 목록 조회
        const response = await getDbConnectionList(useMetaMngInstId);

        console.log('response-getDbConnectionList ', response);

        // delYn으로 정렬하여 false가 먼저 오도록 함
        const sortedResponse = [...response].sort((a, b) => {
          // delYn이 false인 항목이 먼저 오도록 정렬
          if (a.delYn === b.delYn) return 0;
          return a.delYn ? 1 : -1;
        });

        let index = 0;
        for (let i = 0; i < sortedResponse.length; i++) {
          tempData.push({
            id: index,
            no: index + 1,
            delYn: sortedResponse[i].delYn,
            databaseLinkId: sortedResponse[i].databaseLinkId,
            databaseLinkName: sortedResponse[i].databaseLinkName,
            dbmsKindName: sortedResponse[i].dbmsKindName,
            instituteId: sortedResponse[i].instituteId,
          });
          index++;
        }
        rowData.value = tempData;
        setConnectionList(rowData.value);

        console.log('list-fetchData-item :', item);

        console.log('columnDefsConnectionDB : ', columnDefsConnectionDB);

        const data = {
          databaseLinkId: rowData.value[0].databaseLinkId,
          instituteId: rowData.value[0].instituteId,
        };

        const details = await getDbConnectionDetails(data);

        if (item == null) {
          // store 저장
          setDbInfo(details);

          nextTick(() => {
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }
          });
        }
        if (item === 3) {
          return;
        }
      };

      fetchData();

      // 저장상태 변경 감지
      watch(saveState, async () => {
        if (saveState.value === 3) {
          console.log('삭제 및 복구 처리');
          setDbInfo(null);

          await fetchData(3);
        } else if (saveState.value === 1 || saveState.value === 2) {
          await fetchData(saveDatabaseId.value);

          // rowData에서 databaseLinkId가 일치하는 항목 찾기
          const foundItem = rowData.value.find(
            (item) => item.databaseLinkId === saveDatabaseId.value
          );

          console.log('foundItem : ', foundItem);

          // 찾은 항목이 있으면 setDbInfo로 할당
          if (foundItem) {
            setDbInfo(foundItem);
          }

          console.log('신규등록 : ', foundItem);
          console.log('foundItem.no : ', foundItem.no);

          const nodesWithRowId0 = document.querySelector(
            `[row-id="${foundItem.id}"]`
          );
          console.log('nodeWithRowId0 ========', nodesWithRowId0);

          if (nodesWithRowId0) {
            // .ag-row-selected 클래스를 추가합니다.

            const selectedRow = document.querySelectorAll(
              '[class~="ag-row-selected"]'
            );
            // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
            selectedRow.forEach((node) => {
              node.classList.remove('ag-row-selected');
            });

            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          }
          setSaveState(0);
        }
      });

      // DB연결정보 목록
      watch(rowData, (newValue) => {
        console.log('rowData watch : ', newValue);

        if (rowData.value.length === 0) {
          console.log('rowData length === 0 : ', rowData.value.length);
          emit('no-data', true);
        }
      });
      return {
        rowData,
        columnDefsConnectionDB,
        setDbInfo,
        dbConnectionTestState,
        setSelectJobState,
        getTooltipById,
      };
    },
  };
</script>
