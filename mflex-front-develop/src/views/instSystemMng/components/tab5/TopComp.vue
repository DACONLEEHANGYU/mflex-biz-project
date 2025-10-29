<template>
  <div class="tab-inner">
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="title-s">
          사용자 현황
          <AppTooltip :htmlContent="getTooltipById('userStatus')"> </AppTooltip>
        </div>

        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s add-reg"
              title="신규생성"
              @click="onCreateUser"
            >
              신규등록
            </button>
            <!-- <button class="btn-s change-reg" title="편집">변경등록</button>
            <button class="btn-s remove-reg" title="삭제">삭제등록</button> -->
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
          @rowDoubleClicked="onRowDoubleClicked"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
    </div>
  </div>

  <AppWindow
    v-if="showUserDetailsPopup"
    :view="showUserDetailsPopup"
    @close="closeUserDetailsPopup"
    width="700px"
    height="800px"
  >
    <InstAdminUserDetailsWindow
      :userDetails="selectedUserDetails"
      @close="closeUserDetailsPopup"
      @change-user-state="fetchData"
      @change-user-password="fetchData"
      @edit-user-info="fetchData"
    />
  </AppWindow>

  <AppWindow
    width="600px"
    height="auto"
    :view="userApproValView"
    @close="onCloseUserApproval"
  >
    <UserApprovalWindow
      :userId="selectUserId"
      :userDetails="selectedUserDetails"
      @confirm="fetchData"
      @user-approval="cofirmUserApproval"
      @close="onCloseUserApproval"
    >
    </UserApprovalWindow>
  </AppWindow>

  <AppWindow width="600px" :view="createUserView" @close="onClosedCreateUser">
    <CreateUserByInstAdminWindow
      @close="onClosedCreateUser"
      @confirm="fetchData"
    />
  </AppWindow>

  <!-- 사용자 잠금해제 -->
  <AppWindow
    :view="userUnlockWindowView"
    @close="onCloseUserUnlockWindow"
    width="400px"
    height="auto"
  >
    <UserUnlockWindow
      :userId="selectUserId"
      @user-unlock="onUserUnlock"
      @close="onCloseUserUnlockWindow"
    />
  </AppWindow>

  <AppDialog
    v-model:view="dialogState.view"
    :title="dialogState.title"
    :message="dialogState.message"
    @confirm="onDialogClose"
    @close="onDialogClose"
  />

  <AppDialog
    v-model:view="userLockConfirmState.view"
    :title="userLockConfirmState.title"
    :message="userLockConfirmState.message"
    @confirm="onUserLock"
  />
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUiStore } from '@/stores/ui';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useSystemMngStore } from '@/stores/systemMng';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import InstAdminUserDetailsWindow from '@/components/popWindow/InstAdminUserDetailsWindow.vue';
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
  import { useAuthStore } from '@/stores/auth';
  import UserApprovalWindow from '@/components/popWindow/UserApprovalWindow.vue';
  import CreateUserByAdminWindow from '@/components/popWindow/CreateUserByAdminWindow.vue';
  import CreateUserByInstAdminWindow from '@/components/popWindow/CreateUserByInstAdminWindow.vue';
  import UserUnlockWindow from '@/components/popWindow/UserUnlockWindow.vue';
  import {
    getInstUserList,
    lockUserByAdmin,
  } from '@/utils/mflexApi/userManagementApi.js';
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
      InstAdminUserDetailsWindow,
      UserStateCellrenderer,
      UserApprovalWindow,
      CreateUserByAdminWindow,
      UserUnlockWindow,
      LoginStateCellrenderer,
      CreateUserByInstAdminWindow,
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
      const rowData = reactive({});

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId } = userStngInfo.value;

      const { updateResource } = storeToRefs(useSystemMngStore());
      const { setUpdateResource } = useSystemMngStore();

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
        },
        {
          headerName: '상태',
          field: 'userState',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'UserStateCellrenderer',
          width: 100,
        },
        {
          headerName: '사용자ID',
          field: 'userId',
          cellClass: 'grid-cell-centered',
          width: 160,
        },
        {
          headerName: '사용자명',
          field: 'userName',
          cellClass: 'grid-cell-centered',
          width: 160,
        },
        {
          headerName: '기관명',
          field: 'instituteName',
          cellClass: 'grid-cell-centered',
          width: 160,
        },
        {
          headerName: '사용자유형',
          field: 'userTypeName',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
        {
          headerName: '승인상태',
          field: 'approvalStatus',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'ApprovalStatusCellrenderer',
          width: 120,
        },
        {
          headerName: '계정상태',
          field: 'locked',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'LockCellRenderer',
          valueFormatter: (params) => params.value,
          width: 120,
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

      const userLockConfirmState = reactive({
        view: false,
        title: '사용자 잠금',
        message: '사용자 계정을 잠금 하시겠습니까?',
      });

      // 🌰 (씨앗): 승인이 안 된 상태
      // 🌱 (새싹): 승인은 되었지만 비밀번호 초기화를 안 한 상태
      // 🌳 (나무): 승인되고, 비밀번호 초기화가 완료되고, 활성화된 상태 (서비스 이용 가능)
      // 🍂 [낙엽(시든 나무)]: 승인되고 비밀번호 초기화가 완료되었지만, 비활성화된 상태 (서비스 이용 불가)

      const getUserStatus = (approvalStatus, isPasswordReset, isActive) => {
        if (approvalStatus === '미승인') {
          return '<span style="font-size: 20px;">🌰</span>'; // seed
        } else if (!isPasswordReset) {
          return '<span style="font-size: 20px;">🌱</span>'; // sprout
        } else if (isActive) {
          return '<span style="font-size: 20px;">🌳</span>'; // tree
        } else {
          return '<span style="font-size: 20px;">🍂</span>'; // wilt
        }
      };

      const statuses = ['SPROT', 'TREE', 'WILT'];

      function setUserStatus(approvalStatus) {
        if (approvalStatus === '미승인') {
          return 'SEED';
        } else {
          const randomIndex = Math.floor(Math.random() * statuses.length);
          return statuses[randomIndex];
        }
      }

      const fetchData = async () => {
        const sampleData = [];

        console.log('sampleData', sampleData);
        const userList = await getInstUserList(useMetaMngInstId);

        console.log('userList', userList);

        const userData = [];

        for (let i = 0; i < userList.length; i++) {
          // const approvalStatus =
          //   Math.floor(Math.random() * 2) === 0 ? '미승인' : '승인';

          const userLockState =
            userList[i].locked || userList[i].credentialExpired ? true : false;

          const approvalStatus =
            userList[i].userState === 'SEED' ||
            userList[i].userState === 'SEED_ADMIN'
              ? '미승인'
              : '승인';
          userData.push({
            id: i,
            no: i + 1,
            departmentCode: userList[i].departmentCode,
            departmentName: userList[i].departmentName,
            instituteId: userList[i].instituteId,
            instituteName: userList[i].instituteName,
            locked: userLockState,
            positionCode: userList[i].positionCode,
            positionName: userList[i].positionName,
            registerDateTime: userList[i].registerDateTime,
            updateDateTime: userList[i].updateDateTime,
            userId: userList[i].userId,
            userName: userList[i].userName,
            loginStatus: userList[i].loginStatus,
            approvalStatus: approvalStatus,
            userState: userList[i].userState,
            userTypeCode: userList[i].userTypeCode,
            userTypeName: userList[i].userTypeName,
            activationStatus:
              Math.floor(Math.random() * 2) === 0 ? '활성화' : '',
            userDetails: '<button class="btn-s">상세보기</button>',
            officePhoneNumber: userList[i].officePhoneNumber,
            personalPhoneNumber: userList[i].personalPhoneNumber,
            email: userList[i].email,
          });
        }

        console.log('userData', userData);

        // 🌰, 🌱🌳🍂
        rowData.value = userData;
      };

      fetchData();

      const agGrid = ref(null);
      const showUserDetailsPopup = ref(false);
      const selectedUserDetails = ref(null);

      const openUserDetailsPopup = (userData) => {
        selectedUserDetails.value = userData;
        showUserDetailsPopup.value = true;
      };

      const closeUserDetailsPopup = () => {
        showUserDetailsPopup.value = false;
        selectedUserDetails.value = null;
      };

      const context = reactive({
        componentParent: {
          openUserDetailsPopup,
        },
      });

      const selectUserId = ref(null);

      const userApproValView = ref(false);

      // 사용자 승인 팝업 출력
      const onUserApproval = (userId, userDetails) => {
        console.log('onUserApproval', userId);
        selectedUserDetails.value = userDetails;
        selectUserId.value = userId;
        userApproValView.value = true;
      };

      const onUserLock = async () => {
        const lockInfo = {
          userId: selectUserId.value,
          state: 'lock',
        };

        console.log('onUserLock', lockInfo);
        await lockUserByAdmin(lockInfo);
        userLockConfirmState.view = false;

        fetchData();
      };

      const onOpenUserLock = (userId) => {
        selectUserId.value = userId;
        console.log('onOpenUserLock');
        userLockConfirmState.view = true;
      };

      // 사용자 승인 팝업 닫기
      const onCloseUserApproval = () => {
        userApproValView.value = false;
      };

      const createUserView = ref(false);

      // 관리자 유저 생성
      const onCreateUser = () => {
        console.log('onCreateUser');
        createUserView.value = true;
      };

      const onClosedCreateUser = () => {
        createUserView.value = false;
      };

      const userUnlockWindowView = ref(false);
      const onCloseUserUnlockWindow = () => {
        userUnlockWindowView.value = false;
      };

      const openUserUnlockWindow = (userId) => {
        console.log('openUserUnlockWindow', userId);
        selectUserId.value = userId;
        userUnlockWindowView.value = true;
      };

      const onUserUnlock = () => {
        console.log('onUserUnlock');
        onCloseUserUnlockWindow();

        dialogState.value = {
          view: true,
          title: '사용자 잠금해제',
          message: '사용자 계정 잠금이 해제되었습니다.',
        };

        fetchData();
      };

      // 사용자 승인 완료
      const cofirmUserApproval = () => {
        onCloseUserApproval();
        dialogState.value = {
          view: true,
          title: '사용자 승인완료',
          message: '사용자 계정이 승인되었습니다.',
        };
        fetchData();
      };

      watch(updateResource, (newValue) => {
        if (newValue) {
          console.log('updateResource changed, fetching data...');
          fetchData();
          setUpdateResource(false);
        }
      });

      return {
        showUserDetailsPopup,
        openUserDetailsPopup,
        closeUserDetailsPopup,
        context,
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        onUserApproval,
        onCloseUserApproval,
        userApproValView,
        onCreateUser,
        createUserView,
        onClosedCreateUser,
        selectUserId,
        fetchData,
        selectedUserDetails,
        onCloseUserUnlockWindow,
        userUnlockWindowView,
        openUserUnlockWindow,
        onUserUnlock,
        dialogState,
        cofirmUserApproval,
        getTooltipById,
        userLockConfirmState,
        onOpenUserLock,
        onUserLock,
      };
    },
  };
</script>
