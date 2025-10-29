<template>
  <div class="full-contents">
    <!-- 헤더 영역 -->
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          결재선 목록
          <AppTooltip :htmlContent="getTooltipById('approvalList')">
          </AppTooltip>
        </div>
        <button
          class="btn-s add-reg"
          title="추가"
          @click="onOpenApprovalAddWindow"
        >
          추가
        </button>
      </div>
    </div>

    <!-- 그리드 영역 -->
    <div class="grid-wrap">
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

    <!-- 결재선 추가 윈도우 -->
    <AppWindow
      :view="approvalAddWindowView"
      :title="'결재선 추가'"
      width="870px"
      height="auto"
    >
      <ApprovalAddWindow
        @close="onCloseApprovalAddWindow"
        @confirm="onSaveApprovalAddWindow"
      />
    </AppWindow>

    <!-- 삭제 확인창 -->
    <AppDialog
      v-model:view="removeConfirmState.view"
      :title="removeConfirmState.title"
      :message="removeConfirmState.message"
      @confirm="onDeleteApprovalLine"
    />
  </div>
</template>

<script>
  // === Import 구문 ===
  import { ref, reactive, watch, nextTick, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';

  // Stores
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';
  import { useApprovalStore } from '@/stores/approval';

  // API
  import {
    getApprovalLineList,
    deleteApprovalLine,
  } from '@/utils/mflexApi/approval/ApprovalApi.js';

  // Components
  import ApprovalAddWindow from '@/components/popWindow/approval/ApprovalAddWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import DeleteBtnCellRender from '@/utils/DeleteBtnCellRender';

  export default {
    name: 'ApprovalListComp',

    components: {
      AppTooltip,
      AppWindow,
      ApprovalAddWindow,
      DeleteBtnCellRender,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },

    methods: {
      // 그리드 행 클릭 이벤트 처리
      onRowClicked(value) {
        console.log('onRowClicked ', value);
        this.selectedRow = value;

        // 기존 선택된 행 스타일 제거
        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        // 클릭한 행에 선택 스타일 적용
        const clickNode = value.id;
        const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
        clickedNode.classList.add('ag-row-selected');

        // 스토어에 선택된 결재선 저장
        this.selectApprovalLine = value;
        this.setSelectApprovalLine(value);
      },
    },

    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      // === Pinia 스토어 초기화 ===
      const approvalStore = useApprovalStore();
      const { isUpdateApprovalLine } = storeToRefs(approvalStore);
      const { setSelectApprovalLine, setIsUpdateApprovalLine } = approvalStore;

      const authStore = useAuthStore();
      const { userStngInfo, userInstituteAdminList } = storeToRefs(authStore);

      const { useMetaMngInstId } = userStngInfo.value;
      const { getTooltipById } = useHelpToolTipStore();
      const metaMngInstList = userInstituteAdminList.value;

      // === 반응형 데이터 선언 ===
      const agGrid = ref(null);
      const gridApi = ref(null);
      const rowData = reactive({});

      const selectApprovalLine = ref({});

      // === 그리드 컬럼 정의 ===
      const columnDefs = ref([
        {
          headerName: '결재선명',
          field: 'approvalLineName',
          width: 300,
          cellClass: 'ag-left-aligned-cell',
          cellClassRules: {
            'deleted-row': (params) =>
              params.data && params.data.delYn === true,
          },
          cellRenderer: (params) => {
            if (params.data && params.data.delYn === true) {
              return `<span class="deleted-text">${params.value}</span>`;
            }
            return params.value;
          },
          dragStatus: false,
        },
        {
          headerName: '삭제',
          field: 'deleteBtn',
          width: 70,
          cellClass: 'grid-cell-centered',
          cellClassRules: {
            'deleted-row': (params) =>
              params.data && params.data.delYn === true,
          },
          cellRenderer: 'DeleteBtnCellRender',
          dragStatus: false,
        },
      ]);

      // === 삭제 확인창 상태 ===
      const removeConfirmState = reactive({
        view: false,
        message: '결재선을 삭제 하시겠습니까?',
      });

      // === 결재선 추가 윈도우 상태 ===
      const approvalAddWindowView = ref(false);
      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      // === 이벤트 핸들러 함수들 ===

      // 첫 번째 행 선택 이벤트
      const firstRowSelectedEvent = () => {
        nextTick(() => {
          const collectionGrid = document.querySelector('.database-grid');
          if (!collectionGrid) {
            console.error('Collection grid not found!');
            return;
          }

          const nodesWithRowId0 = collectionGrid.querySelector('[row-id="0"]');
          if (nodesWithRowId0) {
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          }
        });
      };

      // 특정 행 선택 이벤트
      const rowSelectEvent = (id) => {
        nextTick(() => {
          const collectionGrid = document.querySelector('.database-grid');
          if (!collectionGrid) {
            console.error('Collection grid not found!');
            return;
          }

          // ag-cell-focus 클래스 제거
          const focusedCells =
            collectionGrid.querySelectorAll('.ag-cell-focus');
          focusedCells.forEach((cell) => {
            cell.classList.remove('ag-cell-focus');
          });

          // 선택된 행에 스타일 적용
          const nodesWithRowId = collectionGrid.querySelector(
            `[row-id="${id}"]`
          );
          if (nodesWithRowId) {
            nodesWithRowId.classList.add('ag-row-selected');
            nodesWithRowId.classList.add('ag-row-focus');
            nodesWithRowId.setAttribute('aria-selected', true);
          }
        });
      };

      // === API 호출 함수들 ===

      // 결재선 목록 조회
      const fetchData = async (updateData) => {
        const approvalLineList = await getApprovalLineList(useMetaMngInstId);
        console.log('approvalLineList : ', approvalLineList);

        let tempData = [];
        for (let i = 0; i < approvalLineList.length; i++) {
          tempData.push({
            id: i,
            approvalLineId: approvalLineList[i].approvalLineId,
            approvalLineName: approvalLineList[i].approvalLineName,
            approvers: approvalLineList[i].approvers,
            createDateTime: approvalLineList[i].approvers,
            creatorId: approvalLineList[i].creatorId,
            creatorName: approvalLineList[i].creatorName,
            updateDateTime: approvalLineList[i].updateDateTime,
            updaterId: approvalLineList[i].updaterId,
            updaterName: approvalLineList[i].updaterName,
            useYn: approvalLineList[i].useYn,
          });
        }
        rowData.value = tempData;

        // 업데이트 데이터가 있으면 해당 행 선택, 없으면 첫 번째 행 선택
        if (updateData) {
          rowData.value.find((item) => {
            if (item.approvalLineId === updateData.approvalLineId) {
              selectApprovalLine.value = item;
              setSelectApprovalLine(item);
              rowSelectEvent(item.id);
            }
          });
        } else {
          setSelectApprovalLine(rowData.value[0]);
          firstRowSelectedEvent();
        }
      };

      // 결재선 삭제
      const onDeleteApprovalLine = async (params) => {
        console.log('onDeleteApprovalLine params : ', selectApprovalLine.value);

        const approvalLineId = selectApprovalLine.value.approvalLineId;

        const data = {
          instituteId: useMetaMngInstId,
          approvalLineId: approvalLineId,
        };

        const deleteRes = await deleteApprovalLine(data);
        console.log('deleteRes : ', deleteRes);

        fetchData();
      };

      // === 팝업 관련 핸들러들 ===

      // 삭제 확인창 열기
      const onRemoveConfirm = () => {
        removeConfirmState.view = true;
      };

      // 삭제 팝업 열기
      const onOpenDeleteApprovalLineWindow = (data) => {
        console.log('onOpenDeleteApprovalLineWindow called : ', data);
        removeConfirmState.view = true;
      };

      // 결재선 추가 윈도우 열기
      const onOpenApprovalAddWindow = () => {
        approvalAddWindowView.value = true;
      };

      // 결재선 추가 윈도우 닫기
      const onCloseApprovalAddWindow = () => {
        approvalAddWindowView.value = false;
      };

      // 결재선 추가 완료
      const onSaveApprovalAddWindow = (data) => {
        approvalAddWindowView.value = false;
        console.log('onSaveApprovalAddWindow called with data:', data);
        fetchData();
      };

      // === 라이프사이클 훅 ===
      onBeforeMount(async () => {
        await fetchData();
      });

      // === Watch 함수들 ===

      // 결재선 업데이트 감지
      watch(
        () => isUpdateApprovalLine.value,
        async (newValue) => {
          console.log('isUpdateApprovalLine : ', newValue);
          if (newValue.isUpdate) {
            await fetchData(newValue);

            const updateData = {
              isUpdate: false,
              approvalLineId: null,
            };
            setIsUpdateApprovalLine(updateData);
          }
        }
      );

      // === 반환 객체 ===
      return {
        // 데이터
        rowData,
        columnDefs,
        agGrid,
        gridApi,
        popInfo,
        metaMngInstList,
        selectApprovalLine,
        removeConfirmState,
        approvalAddWindowView,

        // 함수들
        fetchData,
        getTooltipById,
        onOpenApprovalAddWindow,
        onCloseApprovalAddWindow,
        onSaveApprovalAddWindow,
        onOpenDeleteApprovalLineWindow,
        onDeleteApprovalLine,
        onRemoveConfirm,
        setSelectApprovalLine,
        rowSelectEvent,
      };
    },
  };
</script>

<style scoped>
  /* 삭제된 행에 대한 스타일 */
  :deep(.deleted-row) {
    background-color: #fff5f5;
  }

  :deep(.deleted-text) {
    color: #ff4040;
    text-decoration: line-through;
  }
</style>
