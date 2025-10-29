<template>
  <div class="pop-window">
    <div class="window-header">사용자 상세정보</div>

    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row">
          <div class="window-top">
            <button class="btn-s" @click="onOpenEditUserDetails">수정</button>
            <button class="btn-s" @click="onUserActiveConfirm">
              활성화/정지
            </button>
          </div>

          <section class="row-wrap">
            <AppTab :tabList="tabList" v-model="activeTab" mode="if"> </AppTab>
            <div class="tab-comtent__row">
              <keep-alive>
                <component :is="currentTab" />
              </keep-alive>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onResetPassWord">
            비밀번호 초기화
          </button>
          <!-- <button class="btn-m confirm" @click="onConfirm">확인</button> -->
          <button class="btn-m close" @click="onClose">닫기</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 잠금/잠금해제 확인 다이얼로그 -->
  <AppDialog
    v-model:view="userLockConfirmState.view"
    :title="userLockConfirmState.title"
    :message="userLockConfirmState.message"
    @confirm="onUserLock"
  />

  <!-- 활성화/비활성화 확인 다이얼로그 -->
  <AppDialog
    v-model:view="userActiveConfirmState.view"
    :title="userActiveConfirmState.title"
    :message="userActiveConfirmState.message"
    @confirm="onUserActivate"
  />

  <AppWindow :view="mngResetWindeView" @close="onCloseMngResetWindow">
    <ManagerResetPassWordWindow
      :userId="userDetail.userId"
      @change-password="onResetUserPassword"
      @close="onCloseMngResetWindow"
    >
    </ManagerResetPassWordWindow>
  </AppWindow>

  <AppWindow
    width="500px"
    :view="userApproValView"
    @close="onCloseUserApproval"
  >
    <UserApprovalWindow @close="onCloseUserApproval"> </UserApprovalWindow>
  </AppWindow>

  <AppWindow
    width="500px"
    :view="editUserDetailsState"
    @close="closeEditUserDetails"
  >
    <EditUserDetailsWindow
      :userDetails="userDetail"
      @edit-user-info="onEditUserDetails"
      @close="closeEditUserDetails"
    />
  </AppWindow>
</template>
<script setup>
  import {
    computed,
    defineAsyncComponent,
    shallowRef,
    onMounted,
    reactive,
    ref,
    provide,
    watch,
  } from 'vue';
  import { useAlert } from '@/composables/alert';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ManagerResetPassWordWindow from '@/components/popWindow/ManagerResetPassWordWindow.vue';
  import UserApprovalWindow from '@/components/popWindow/UserApprovalWindow.vue';
  import EditUserDetailsWindow from '@/components/popWindow/EditUserDetailsWindow.vue';
  import {
    activeUserByAdmin, // 사용자 활성화/비활성화
    lockUserByAdmin, // 사용자 잠금/해제
    getUserList, // 사용자 목록
  } from '@/utils/mflexApi/userManagementApi.js';

  const props = defineProps({
    userDetails: Object,
  });

  console.log('props.userDetails', props.userDetails);
  const userId = ref(props.userDetails.userId);

  provide('userDetails', props.userDetails);
  provide('userId', userId.value);

  const emit = defineEmits(['close']);

  const userDetail = ref({});

  onMounted(() => {
    userDetail.value = props.userDetails;
  });

  const { setAlertStatus } = useAlert();
  // 비밀번호 초기화 팝업 상태
  const mngResetWindeView = ref(false);

  // 비밀번호 초기화 팝업 출력
  const onResetPassWord = () => {
    mngResetWindeView.value = true;
  };

  const onClose = () => {
    emit('close');
  };

  const onCloseMngResetWindow = () => {
    mngResetWindeView.value = false;
    // emit('close');
  };

  const userApproValView = ref(false);

  // 사용자 승인 팝업 출력
  const onUserApproval = () => {
    userApproValView.value = true;
  };

  // 사용자 승인 팝업 닫기
  const onCloseUserApproval = () => {
    userApproValView.value = false;
  };

  // 사용자 활성화/정지
  const onUserActivate = async () => {
    console.log('onUserActivate');

    const activeInfo = {
      userId: userDetail.value.userId,
      state: userDetail.value.userState === 'WILT' ? 'active' : 'inactive',
    };

    const response = await activeUserByAdmin(activeInfo);
    console.log('response', response);

    if (response.status === 200 && userDetail.value.userState === 'WILT') {
      // alert('사용자가 활성화 되었습니다.')

      setAlertStatus({
        view: true,
        message: '사용자 계정이 활성화 되었습니다.',
      });

      emit('close');
      emit('change-user-state');

      return;
    } else {
      setAlertStatus({
        view: true,
        message: '사용자 계정이 비활성화 되었습니다.',
      });

      emit('close');
      emit('change-user-state');
    }
  };

  // 사용자상태
  const userState = computed(() => {
    const userStateIcon = ref('');

    if (
      userDetail.value.userState === 'SEED' ||
      userDetail.value.userState === 'SEED_ADMIN'
    ) {
      userStateIcon.value = '🌰';
      // return '🌰';
    } else if (userDetail.value.userState === 'SPROUT') {
      userStateIcon.value = '🌱';
      // return '🌱';
    } else if (userDetail.value.userState === 'TREE') {
      userStateIcon.value = '🌳';
      // return '🌳';
    } else if (userDetail.value.userState === 'WILT') {
      userStateIcon.value = '🍂';
      // return '🍂';
    }

    return userStateIcon.value;
  });

  const onConfrimUserLock = () => {};

  const onUserLock = async () => {
    console.log('onUserLock');

    const lockInfo = {
      userId: userDetail.value.userId,
      state: userDetail.value.locked === false ? 'lock' : 'unlock',
    };

    const response = await lockUserByAdmin(lockInfo);
    console.log('response', response);

    if (response.status === 200 && userDetail.value.locked === true) {
      setAlertStatus({
        view: true,
        message: '사용자 계정이 잠금 해제 되었습니다.',
      });

      emit('close');
      emit('change-user-state');

      // alert('사용자가 잠금 해제 되었습니다.');
      return;
    } else {
      setAlertStatus({
        view: true,
        message: '사용자 계정이 잠금 되었습니다.',
      });

      emit('close');
      emit('change-user-state');
      // alert('사용자가 잠금 되었습니다.');
    }
  };

  const UserBasicInfoTab = defineAsyncComponent(() =>
    import('@/components/popWindow/tab/UserBasicInfoTab.vue')
  );

  const UserResourceTab = defineAsyncComponent(() =>
    import('@/components/popWindow/tab/UserResourceTab.vue')
  );

  const currentTab = shallowRef(UserBasicInfoTab);
  const tabList = reactive(['기본정보']);
  const activeTab = ref(1);

  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = UserBasicInfoTab;
    } else if (activeTab.value == 2) {
      currentTab.value = UserResourceTab;
    }
  });

  const onUserLockConfirim = () => {
    userLockConfirmState.view = true;
  };

  const onUserActiveConfirm = () => {
    userActiveConfirmState.view = true;
  };

  const userLockConfirmState = reactive({
    view: false,
    title: '사용자 잠금/잠금해제',
    message: '사용자 계정을 잠금/잠금해제 하시겠습니까?',
  });

  const userActiveConfirmState = reactive({
    view: false,
    title: '사용자 활성화/비활성화',
    message: '사용자 계정을 활성화/비활성화 하시겠습니까?',
  });

  const onResetUserPassword = () => {
    onCloseMngResetWindow();

    emit('close');
    emit('change-user-password');

    setAlertStatus({
      view: true,
      message: '사용자 비밀번호가 변경되었습니다.',
    });
  };

  const onOpenEditUserDetails = () => {
    console.log('onOpenEditUserDetails');
    editUserDetailsState.value = true;
  };

  const editUserDetailsState = ref(false);

  const closeEditUserDetails = () => {
    editUserDetailsState.value = false;
  };

  // 사용자 정보수정 완료
  const onEditUserDetails = async () => {
    console.log('onEditUserDetails');
    editUserDetailsState.value = false;
    setAlertStatus({
      view: true,
      message: '사용자 정보 수정이 완료되었습니다.',
    });

    emit('close');
    emit('edit-user-info');
  };
</script>
