<template>
  <div class="tab-inner">
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              style="background-color: #2b9966; color: white"
              class="btn-s"
              title="승인"
              @click="onOpenApprovalCommentWindowView('approve')"
              :disabled="!selectedApproval || selectedApproval.length === 0"
            >
              승인
              <i class="approval-icon"></i>
            </button>
            <button
              style="background-color: #d33434; color: white"
              class="btn-s"
              title="반려"
              @click="onOpenApprovalCommentWindowView('reject')"
              :disabled="!selectedApproval || selectedApproval.length === 0"
            >
              반려
              <i class="reject-icon"></i>
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
      :approvalType="'approval'"
      :selectedApproval="selectApproval"
      @approve="onApprove"
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
      @confirm="onConfirm"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>

  <AppWindow
    :view="approvalCommentWindowView"
    @close="onCloseApprovalCommentWindowView"
    width="600px"
  >
    <ApprovalCommentWindow
      :approvalType="selectState"
      @confirm="onApproval"
      @close="onCloseApprovalCommentWindowView"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->

<script>
  import { reactive, ref } from 'vue';
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
    getPendingApprovalRequests,
    getApprovalRequestDetails,
    approveRequest,
    rejectRequest,
  } from '@/utils/mflexApi/approval/ApprovalApi.js';
  import ApprovalCommentWindow from '@/components/popWindow/ApprovalCommentWindow.vue';

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
      ApprovalCommentWindow,
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
      const { setGridApis } = uiStore;

      const rowData = reactive({});

      const { getTooltipById } = useHelpToolTipStore();

      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);

      const { useDctnryId, useMetaMngInstId, useInfoSysId } =
        userStngInfo.value;

      const approvalStore = useApprovalStore();

      const { setIsUpdate } = approvalStore;

      const { isUpdate } = storeToRefs(approvalStore);

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
        {
          headerName: '요청구분',
          field: 'targetType',
          cellClass: 'grid-cell-centered',
          width: 250,
        },
        {
          headerName: '요청건수',
          field: 'totalTargets',
          cellClass: 'grid-cell-centered',
          width: 215,
        },
        {
          headerName: '요청자',
          field: 'issuerName',
          cellClass: 'grid-cell-centered',
          width: 210,
        },
        {
          headerName: '요청일시',
          field: 'requestDate',
          cellClass: 'grid-cell-centered',
          width: 205,
        },
        {
          headerName: '상태',
          field: 'status',
          cellClass: 'grid-cell-centered',
          width: 160,
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

        const sampleData = [];

        console.log('sampleData', sampleData);

        const list = await getPendingApprovalRequests(params);

        console.log('list', list);

        for (let i = 0; i < list.length; i++) {
          const item = list[i];
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

      const onCancelRequest = () => {
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

      const onOpenApprovalPopup = async () => {
        approvalEventState.value = 'approval';
        // Logic to open approval popup
        console.log('Opening approval popup');
        popInfo.value = {
          state: 'confirm',
          popTitle: '결재승인',
          popMessages: `결재요청을 승인하시겠습니까?`,
          confirmBtnText: '승인',
          cancelBtnText: '닫기',
        };
        confirmWindowView.value = true;
      };

      const onOpenRejectPopup = () => {
        approvalEventState.value = 'reject';
        // Logic to open reject popup
        console.log('Opening reject popup');
        popInfo.value = {
          state: 'confirm',
          popTitle: '결재반려',
          popMessages: `결재요청을 반려하시겠습니까?`,
          confirmBtnText: '반려',
          cancelBtnText: '닫기',
        };
        confirmWindowView.value = true;
      };

      const selectedApproval = ref(null);

      const onSelectionChanged = () => {
        const selectedNodes = gridApi.value.getSelectedNodes();

        console.log('onSelectionChanged', selectedNodes);

        selectedApproval.value = selectedNodes;
      };

      // gridApi 할당
      const onGridReady = (params) => {
        gridApi.value = params;
      };

      const approvalEventState = ref('approval');

      const selectState = ref('approve');

      const onConfirm = async (comment) => {
        if (selectState.value === 'approve') {
          // Logic for approval confirmation

          for (let i = 0; i < selectedApproval.value.length; i++) {
            const approvalRequestId = selectedApproval.value[i].data.id;

            const response = await getApprovalRequestDetails(approvalRequestId);

            console.log('response.approverSteps : ', response.approverSteps);

            const stepId = response.approverSteps.filter(
              (step) => step.approverId === authStore.userInfo.userId
            );

            const params = {
              approvalRequestId: approvalRequestId,
              stepId: stepId[0].id,
              comment: comment,
            };

            console.log('Approving request with params : ', params);

            await approveRequest(params);
            // 실제 API 호출
            // await cancelApprovalRequest(approval.data.id);
          }

          console.log('Confirming approval');

          setIsUpdate(true);
        } else if (selectState.value === 'reject') {
          // Logic for rejection confirmation
          console.log('Confirming rejection');

          for (let i = 0; i < selectedApproval.value.length; i++) {
            const approvalRequestId = selectedApproval.value[i].data.id;

            const response = await getApprovalRequestDetails(approvalRequestId);

            console.log('response.approverSteps : ', response.approverSteps);

            const stepId = response.approverSteps.filter(
              (step) => step.approverId === authStore.userInfo.userId
            );

            const params = {
              approvalRequestId: approvalRequestId,
              stepId: stepId[0].id,
              comment: comment,
            };

            console.log('Approving request with params : ', params);

            await rejectRequest(params);
            // 실제 API 호출
            // await cancelApprovalRequest(approval.data.id);
          }

          setIsUpdate(true);
        }
        confirmWindowView.value = false;

        fetchData();
      };

      const onApprove = () => {
        userApprovalView.value = false;
        fetchData();
      };

      const approvalCommentWindowView = ref(false);
      const onOpenApprovalCommentWindowView = (state) => {
        approvalCommentWindowView.value = true;
        selectState.value = state;
      };
      const onCloseApprovalCommentWindowView = () => {
        approvalCommentWindowView.value = false;
      };

      const onApproval = async (comment) => {
        console.log('Approval comment:', comment);
        console.log('Selected state:', selectState.value);

        approvalCommentWindowView.value = false;

        await onConfirm(comment);
      };

      const formatDateOnly = (dateTimeString) => {
        if (!dateTimeString) return '';

        // 공백을 기준으로 split하여 날짜 부분만 반환
        return dateTimeString.split(' ')[0];
      };

      return {
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
        onCancelRequest,
        popInfo,
        onCloseConfirmWindow,
        onOpenApprovalPopup,
        onOpenRejectPopup,
        selectedApproval,
        onSelectionChanged,
        onGridReady,
        approvalEventState,
        showUserDetailsPopup,
        openUserDetailsPopup,
        closeUserDetailsPopup,
        onConfirm,
        onApprove,
        approvalCommentWindowView,
        onOpenApprovalCommentWindowView,
        onCloseApprovalCommentWindowView,
        selectState,
        onApproval,
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

  .approval-icon {
    width: 17px;
    height: 18px;
    background-image: url(/src/assets/images/icon_approval_checkmark.png);
    background-size: cover;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -1px;
    margin-left: 4px;
  }

  .reject-icon {
    width: 17px;
    height: 18px;
    background-image: url(/src/assets/images/icon_reject.png);
    background-size: cover;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -1px;
    margin-left: 4px;
    filter: brightness(0) invert(1);
  }
</style>
