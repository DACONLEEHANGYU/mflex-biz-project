<template>
  <div class="tab-inner">
    <div class="grid-wrap">
      <div class="grid-top">
        <!-- <div class="title-s">
          사용자 현황
          <AppTooltip :htmlContent="getTooltipById('userStatus')"> </AppTooltip>
        </div> -->

        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              :disabled="!selectedApproval || selectedApproval.length === 0"
              class="btn-s"
              title="요청취소"
              @click="onOpenCancelRequest"
            >
              요청취소
            </button>
          </div>
          <div class="btns"></div>
        </div>

        <div class="top-row"></div>
      </div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="multiple"
          @gridApi="onGridReady"
          @rowDoubleClicked="onRowDoubleClicked"
          @selectionChanged="onSelectionChanged"
          :rowSelectDisabled="true"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
    </div>
  </div>

  <AppWindow width="1300px" height="700px" :view="userApprovalView">
    <ApprovalDetailsWindow
      :approvalType="'request'"
      :selectedApproval="selectApproval"
      @cancel="handleCancelRequest"
      @close="onCloseUserApproval"
    ></ApprovalDetailsWindow>
  </AppWindow>

  <AppDialog
    v-model:view="dialogState.view"
    :title="dialogState.title"
    :message="dialogState.message"
    @confirm="onDialogClose"
    @close="onDialogClose"
  />

  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="480px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onCancelRequest"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->

<script>
  import { reactive, ref, watch } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import UserDetailsWindow from '@/components/popWindow/UserDetailsWindow.vue';
  import EmailSendCellRenderer from '@/utils/EmailSendCellRenderer.js';
  import ApprovalStatusCellrenderer from '@/utils/ApprovalStatusCellrenderer';
  import ActiveStatusCellrenderer from '@/utils/ActiveStatusCellrenderer';
  import UserDetailsCellrenderer from '@/utils/UserDetailsCellrenderer';
  import UserStateCellrenderer from '@/utils/UserStateCellrenderer';
  import LoginStateCellrenderer from '@/utils/LoginStateCellrenderer';
  import StopCellRenderer from '@/utils/StopCellRenderer.js';
  import LockCellRenderer from '@/utils/LockCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import UserApprovalWindow from '@/components/popWindow/UserApprovalWindow.vue';
  import CreateUserByAdminWindow from '@/components/popWindow/CreateUserByAdminWindow.vue';
  import CreateUserByInstAdminWindow from '@/components/popWindow/CreateUserByInstAdminWindow.vue';
  import UserUnlockWindow from '@/components/popWindow/UserUnlockWindow.vue';
  import ApprovalDetailsWindow from '@/components/popWindow/ApprovalDetailsWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import { useApprovalStore } from '@/stores/approval';
  import {
    getApprovalRequestList,
    cancelApprovalRequest,
  } from '@/utils/mflexApi/approval/ApprovalApi.js';

  export default {
    components: {
      EmailSendCellRenderer,
      StopCellRenderer,
      LockCellRenderer,
      GridSearch,
      AppTooltip,
      ApprovalStatusCellrenderer,
      ActiveStatusCellrenderer,
      UserDetailsCellrenderer,
      AppWindow,
      UserDetailsWindow,
      UserStateCellrenderer,
      UserApprovalWindow,
      CreateUserByAdminWindow,
      LoginStateCellrenderer,
      UserUnlockWindow,
      CreateUserByInstAdminWindow,
      ApprovalDetailsWindow,
      ConfirmWindow,
    },

    data() {
      return {
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
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const uiStore = useUiStore();
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const { setGridApis } = uiStore;

      const rowData = reactive({});

      const { getTooltipById } = useHelpToolTipStore();

      const { useDctnryId, useMetaMngInstId, useInfoSysId } =
        userStngInfo.value;

      const approvalStore = useApprovalStore();

      const { isUpdate } = storeToRefs(approvalStore);

      const { setIsUpdate } = approvalStore;

      const userLockConfirmState = reactive({
        view: false,
        title: '사용자 잠금',
        message: '사용자 계정을 잠금 하시겠습니까?',
      });

      const columnDefs = reactive([
        {
          headerName: '',
          field: 'selected',
          cellClass: 'grid-cell-centered',
          width: 30,
          headerCheckboxSelection: true,
          checkboxSelection: true,
        },
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
        },
        // {
        //   headerName: '결재번호',
        //   field: 'ApprovalNo',
        //   cellClass: 'grid-cell-centered',
        //   // cellRenderer: 'UserStateCellrenderer',
        //   width: 130,
        // },
        {
          headerName: '요청구분',
          field: 'targetType',
          cellClass: 'grid-cell-centered',
          width: 260,
        },
        {
          headerName: '요청건수',
          field: 'totalTargets',
          cellClass: 'grid-cell-centered',
          width: 240,
        },
        {
          headerName: '요청일시',
          field: 'requestDate',
          cellClass: 'grid-cell-centered',
          width: 260,
        },
        {
          headerName: '상태',
          field: 'status',
          cellClass: 'grid-cell-centered',
          width: 270,
        },
        {
          headerName: '상세보기',
          field: 'userDetails',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'UserDetailsCellrenderer',
          width: 150,
        },
      ]);

      const dialogState = ref({
        view: false,
        title: '',
        message: '',
      });

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const dummyData = [
        {
          no: 1,
          approvalLineId: '4',
          ApprovalNo: 'APR-001',
          requestType: '용어',
          requestCount: 5,
          requestDate: '2023-10-01 12:00',
          status: '결재중',
          requester: '홍길동',
          userDetails: '자세히 보기',
        },
        {
          no: 2,
          approvalLineId: '37',
          ApprovalNo: 'APR-002',
          requestType: '단어',
          requestCount: 5,
          requestDate: '2023-10-01 12:00',
          status: '결재중',
          requester: '홍길동',
          userDetails: '자세히 보기',
        },
        {
          no: 3,
          approvalLineId: '34',
          ApprovalNo: 'APR-003',
          requestType: '도메인',
          requestCount: 10,
          requestDate: '2023-10-01 12:00',
          status: '결재중',
          requester: '홍길동',
          userDetails: '자세히 보기',
        },
      ];

      // 요청 구분 파서
      const targetTypeParser = (type) => {
        switch (type) {
          case 'TRM':
            return '용어';
          case 'WRD':
            return '단어';
          case 'DMN':
            return '도메인';
          default:
            return type;
        }
      };

      // 상태 파서
      const stateParser = (state) => {
        switch (state) {
          case 'PENDING':
            return '결재전';
          case 'IN_PROGRESS':
            return '결재중';
          case 'APPROVED':
            return '승인';
          case 'REJECTED':
            return '반려';
          case 'CANCELED':
            return '요청취소';
          default:
            return state;
        }
      };

      const fetchData = async () => {
        const params = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
        };

        const requestList = await getApprovalRequestList(params);

        console.log('requestList : ', requestList);

        const sampleData = [];

        console.log('sampleData', sampleData);

        for (let i = 0; i < requestList.length; i++) {
          const item = requestList[i];
          sampleData.push({
            no: i + 1,
            id: item.id,
            instituteId: item.instituteId,
            dictionaryId: item.dictionaryId,
            issuerName: item.issuerName,
            approvalLineId: item.approvalLineId,
            createDateTime: item.createDateTime,
            targetType: targetTypeParser(item.targetType),
            currentOrder: item.currentOrder,
            requestDate: formatDateOnly(item.createDateTime),
            totalApprovers: item.totalApprovers,
            totalTargets: item.totalTargets,
            status: stateParser(item.status),
          });
        }

        console.log('sampleData', sampleData);

        // 🌰, 🌱🌳🍂
        rowData.value = sampleData;
      };

      fetchData();

      const agGrid = ref(null);
      const gridApi = ref(null);

      const showUserDetailsPopup = ref(false);
      const selectedUserDetails = ref(null);

      const selectApproval = ref(null);
      const openUserDetailsPopup = (userData) => {
        selectApproval.value = userData;
        // selectedUserDetails.value = userData;
        userApprovalView.value = true;
      };

      const closeUserDetailsPopup = () => {
        userApprovalView.value = false;
        selectedUserDetails.value = null;
      };

      const context = reactive({
        componentParent: {
          openUserDetailsPopup,
        },
      });

      const selectUserId = ref(null);

      const userApprovalView = ref(false);
      const openUserApprovalPopup = () => {
        userApprovalView.value = true;
      };
      const onCloseUserApproval = () => {
        userApprovalView.value = false;
      };

      const confirmWindowView = ref(false);

      const onOpenCancelRequest = () => {
        confirmWindowView.value = true;
      };

      const popInfo = ref({
        state: 'confirm',
        popTitle: '결재요청 취소',
        popMessages: `결재요청을 취소하시겠습니까?`,
        confirmBtnText: '결재요청취소',
        cancelBtnText: '닫기',
      });

      const onCloseConfirmWindow = () => {
        console.log('onCloseConfirmWindow');
        confirmWindowView.value = false;
      };

      const selectedApproval = ref(null);

      const onSelectionChanged = () => {
        const selectedNodes = gridApi.value.getSelectedNodes();

        console.log('onSelectionChanged', selectedNodes);

        const filteredNodes = selectedNodes.filter((node) => {
          return node.data.status !== '결재중';
        });

        selectedApproval.value = filteredNodes;
      };

      // gridApi 할당
      const onGridReady = (params) => {
        gridApi.value = params;
      };

      const onCancelRequest = async () => {
        console.log('selectedApproval : ', selectedApproval.value);

        for (let i = 0; i < selectedApproval.value.length; i++) {
          const approvalRequestId = selectedApproval.value[i].data.id;

          const response = await cancelApprovalRequest(approvalRequestId);
          // 실제 API 호출
          // await cancelApprovalRequest(approval.data.id);
        }

        fetchData(); // 데이터 새로고침
        confirmWindowView.value = false; // 팝업 닫기
        setIsUpdate(true);
      };

      const handleCancelRequest = () => {
        userApprovalView.value = false; // 팝업 닫기
        fetchData(); // 데이터 새로고침
        setIsUpdate(true);
      };

      // 결재요청 취소
      // watch(isUpdate,(newValue) => {
      //   if (newValue) {
      //     fetchData();
      //     setIsUpdate(false);
      //   }
      // });

      // 🔥 날짜 포맷팅 함수 추가
      const formatDateOnly = (dateTimeString) => {
        if (!dateTimeString) return '';

        // 공백을 기준으로 split하여 날짜 부분만 반환
        return dateTimeString.split(' ')[0];
      };

      return {
        showUserDetailsPopup,
        openUserDetailsPopup,
        closeUserDetailsPopup,
        context,
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        selectUserId,
        fetchData,
        selectedUserDetails,
        dialogState,
        selectApproval,
        getTooltipById,
        userLockConfirmState,
        userApprovalView,
        openUserApprovalPopup,
        onCloseUserApproval,
        confirmWindowView,
        onOpenCancelRequest,
        popInfo,
        onCloseConfirmWindow,
        onSelectionChanged,
        onGridReady,
        selectedApproval,
        onCancelRequest,
        handleCancelRequest,
        formatDateOnly,
      };
    },
  };
</script>

<style scoped>
  .tab-inner {
    width: 100%;
    padding: 0;
  }
  .title-btns__row_btween {
    justify-content: flex-end;
  }
</style>
