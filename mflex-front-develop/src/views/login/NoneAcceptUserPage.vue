<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="form-box">
        <form
          @submit.prevent="submitForm"
          @keyup.enter="preventEnterOnAlert"
          class="form"
        >
          <div class="form-header">
            <span class="logo"></span>
            <div class="logo-text">
              반갑습니다.
              {{ userInfo.userNm }}님<br />
              메타관리시스템 <strong>Mflex</strong> 입니다.
            </div>
          </div>
        </form>
        <div class="approval-message">
          <p>
            승인 절차가 진행 중입니다. <br />관리자 승인 후 메타관리가
            가능합니다.
          </p>
        </div>
        <div class="pass-area">
          <!-- <span class="pass-text">비밀번호를 잊으셨나요?</span> -->
          <button class="btn-s" @click="onOpenChangePassword">
            비밀번호 재설정
          </button>
          <button class="btn-s" @click="goLogout">로그아웃</button>
        </div>
        <div class="login-copyright">
          Copyright© 2024 (주)데이콘인피니티. All Rights Reserved.
        </div>
      </div>
    </div>
    <AppWindow
      :view="changePasswordWindowView"
      @close="onClosePopWindow"
      width="500px"
      height="auto"
    >
      <ChangePasswordWindow
        :token="loginToken"
        @cofirm="onConfrimPopWindow"
        @close="onClosePopWindow"
      />
    </AppWindow>

    <AppWindow
      :view="signUpWindowView"
      @close="onCloseSignUpWindow"
      width="500px"
      height="auto"
    >
      <SignUpWindow @close="onCloseSignUpWindow"> </SignUpWindow>
    </AppWindow>

    <AppDialog
      v-model:view="dialogState.view"
      :title="dialogState.title"
      :message="dialogState.message"
      @confirm="onDialogClose"
      @close="onDialogClose"
    />
  </div>
</template>

<script setup>
  import { reactive, ref, watch, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveAuthToCookie,
    saveUserToStorage,
    saveIdToStorage,
    getIdFromStorage,
    deleteStorage,
    deleteCookie,
    saveTabNaviStorage,
    saveTabNaviIndexStorage,
    saveUserMenuToStorage,
    saveUserMetaMngInstListToStorage,
    saveUserDctnryListToStorage,
    saveUserSbjarListToStorage,
    saveUserInfoSysListToStorage,
    saveUserStngToStorage,
    saveUserMetaMngInstIdToStorage,
    saveGridInfoToStorage,
    saveUserStateStorage,
    getAuthFromCookie,
  } from '@/utils/cookies';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChangePasswordWindow from '@/components/popWindow/ChangePasswordWindow.vue';
  import SignUpWindow from '@/components/popWindow/SignUpWindow.vue';
  import { useAlert } from '@/composables/alert';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { storeToRefs } from 'pinia';
  import { $vxHttp } from '@/api';
  import {
    loginApi, // 로그인 관련 API
    schema,
    getUserMenuList, // 사용자별 메뉴 목록 조회 API
    getUserMetaMngInstList, // 사용자별 메타관리 기관 목록 조회 API
    getUserDictionaryList, // 사용자별 사전 목록 조회 API
    getUserSbjarList, // 사용자별 주제영역 조회 API
    getUserInfoSysList, // 사용자 설정 정보 조회 API
    getUserStngInfo, // 사용자 설정 정보 조회 API
    getUserProfile, // Header 사용자 상세 정보 조회 API
  } from '@/utils/mflexApi/loginApi'; // 로그인관련 API 모듈

  const tabNaviStore = useTabNaviStore();
  const { getTabData } = storeToRefs(tabNaviStore);
  const { setTabNaviData, resetTabNavi } = tabNaviStore;

  const router = useRouter();
  const store = useAuthStore();
  const {
    resetAuth,
    setUser,
    setToken,
    setUserMenuList,
    setUserMetaMngInstList,
    setUserDctnryList,
    setUserSbjarList,
    setUserInfoSysList,
    setUserStngInfo,
    userDctnryListInfo,
    setUserMetaMngInstId,
    setUserState,
  } = store;

  console.log('토큰 : ', getAuthFromCookie());

  const { userInfo, userStngInfo, userState } = storeToRefs(store);

  const { alertInfos, setAlertStatus } = useAlert();

  const dialogState = ref({
    view: false,
    title: '',
    message: '',
  });

  const onDialogConfirm = () => {
    dialogState.value.view = false;
  };

  const onDialogClose = () => {
    dialogState.value.view = false;
  };

  const signUpWindowView = ref(false);
  const onCloseSignUpWindow = () => {
    signUpWindowView.value = false;
  };

  const onOpenChangePassword = () => {
    changePasswordWindowView.value = true;
  };

  const changePasswordWindowView = ref(false);
  const onClosePopWindow = () => {
    changePasswordWindowView.value = false;
  };
  const onConfrimPopWindow = () => {
    changePasswordWindowView.value = false;
    dialogState.value = {
      view: true,
      title: '성공',
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  };

  const loginToken = ref(null);

  loginToken.value = `Bearer ${getAuthFromCookie()}`;

  const goLogout = async () => {
    try {
      //deleteAllCookies();

      await resetAuth();
      await resetTabNavi();
      store.$reset;
      // 쿠키 삭제
      deleteCookie('x_auth');

      // 로컬 스토리지 항목 삭제
      deleteStorage('x_user');
      deleteStorage('x_tabNavi');
      deleteStorage('mflex_grid_info');

      // 로컬 스토리지 완전 삭제
      localStorage.clear();

      // 세션 스토리지 삭제
      sessionStorage.clear();

      console.log('로그아웃 스토어 ', store);
      console.log('document.cookie : ', document.cookie);

      // 페이지 새로고침 (캐시 무시)
      window.location.replace(
        window.location.href + '?t=' + new Date().getTime()
      );

      console.log('로그아웃 쿠키 : ', document.cookie);

      console.log('로그아웃 완료 : ', store);
      router.replace('/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류 처리 (예: 사용자에게 알림)
    }
  };
</script>

<style>
  .approval-message {
    padding: 10px;
    background-color: #f0f8ff;
    border: 1px solid #b0e0e6;
    border-radius: 5px;
    text-align: center;
    font-size: 1.2em;
    font-weight: 700;
    line-height: 20px;
    color: #4682b4;
    margin-bottom: 30px;
  }
</style>
