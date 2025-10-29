<template>
  <header class="header" :class="{ addShadow: getHeaderShadow }">
    <div class="header-top">
      <div class="header-l">
        <transition name="fade" mode="out-in">
          <span
            class="btn-menu"
            @click="onSideNavi"
            v-if="getSideState === 'wide'"
            >메뉴</span
          >
          <div class="header-logo" @click="onMain" v-else></div>
        </transition>
        <OrganizationSystem
          v-if="!storageUserState.includes('SEED') && !isSuperAdmin"
          ref="organizationSystem"
          @btnClick="onSelectSystem"
          @confirmInst="onMdiResetInst"
        >
        </OrganizationSystem>
        <span
          :class="{
            'icon-bookmark-active': swipper,
            'icon-bookmark': !swipper,
          }"
          @click="onToggleSwipper"
          ref="iconBox"
          ><i class="icon"></i
        ></span>
      </div>
      <div class="header-r">
        <div class="utils">
          <div v-if="!isSystemMng && !isSuperAdmin" class="link-btns">
            <BtnDaconSystem
              v-if="!storageUserState.includes('SEED')"
              ref="daconSystem"
              @btnClick="onDaconSystem"
              @confirmInfoSys="onMdiResetInfoSys"
            ></BtnDaconSystem>
            <DisplayDictionary
              v-if="!storageUserState.includes('SEED')"
              ref="archiveDictionary"
              @btnClick="onArchiveDictionary"
              @confirmDctnry="onMdiResetDctnry"
            >
            </DisplayDictionary>
          </div>
          <div class="user-infos">
            <span class="icon"></span>
            <div class="infos">
              <div class="info-t">
                <span v-if="jbgdNm != 'ERROR'"
                  >{{ userNm }} ({{ userId }}) / {{ ogdpDeptNm }} ({{
                    jbgdNm
                  }}) </span
                ><span v-else> {{ userNm }} ({{ userId }})</span>
              </div>
            </div>
          </div>
          <button class="btn-logout" title="로그아웃" @click="onLogout">
            <i class="icon"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-show="swipper" class="header-bottom">
      <HeaderTab />
    </div>

    <AppDialog
      v-model:view="confirmState.view"
      :title="confirmState.title"
      :message="confirmState.message"
      @confirm="goLogout"
    />

    <AppDialog
      v-model:view="mdiInstForm.view"
      :title="mdiInstForm.title"
      :message="mdiInstForm.message"
      @confirm="onResetInst"
      @cancel="onDialogCancelInst"
    />

    <AppDialog
      v-model:view="mdiInfoSysForm.view"
      :title="mdiInfoSysForm.title"
      :message="mdiInfoSysForm.message"
      @confirm="onResetInfoSys"
      @cancel="onDialogCancelInfoSys"
    />

    <AppDialog
      v-model:view="mdiDctnryForm.view"
      :title="mdiDctnryForm.title"
      :message="mdiDctnryForm.message"
      @confirm="onResetDctnry"
      @cancel="onDialogCancelDctnry"
    />
  </header>
</template>

<script setup>
  import HeaderTab from '@/components/header/HeaderTab.vue';
  import BtnDaconSystem from '@/components/header/BtnDaconSystem.vue';
  import DisplayDictionary from '@/components/header//DisplayDictionary.vue';
  import OrganizationSystem from '@/components/header/OrganizationSystem.vue';
  import { updateHeaderStyle } from '@/utils/mflexApi/common/commonApi';
  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useSwipperStore } from '@/stores/swipper';
  import { useGridResize } from '@/composables/gridResize';
  import { useRouter } from 'vue-router';
  import {
    deleteStorage,
    deleteCookie,
    saveUserDctnryListToStorage,
    saveUserInfoSysListToStorage,
    saveUserStngToStorage,
    saveUserGroupToStorage,
    saveUserGroupIdToStorage,
    getUserMetaMngInstIdFromStorage,
    getUserStateStorage,
  } from '@/utils/cookies';
  import {
    getUserDictionaryList,
    getUserInfoSysList,
    getPrivateGroupSetting,
    getPrivateGroup,
  } from '@/utils/mflexApi/loginApi';
  import {
    updateUserDictionary,
    updataUserSystem,
  } from '@/utils/mflexApi/userSetApi';
  import { reactive, ref, watch, onMounted, computed } from 'vue';
  import {
    getSwipperStateStorage,
    saveSwipperStateStorage,
    getUserRoleFromStorage,
  } from '@/utils/cookies';
  // import { getSwipperStateStorage } from '@/utils/cookies';

  const uiStore = useUiStore();
  const { getSideState, getHeaderShadow } = storeToRefs(uiStore);

  const router = useRouter();

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId } = userStngInfo.value;
  console.log('userInfo : ', userInfo.value);
  const { userId, userNm, ogdpInstNm, ogdpDeptNm, jbgdNm } = userInfo.value;
  const {
    resetAuth,
    setUserDctnryList,
    setUserInfoSysList,
    setUserStngMetaMngInstId,
    setUserStngInfoSysId,
    setUserStngDctnryId,
    setUserGroupList,
    setUserGroupId,
  } = authStore;

  console.log('유저상태  : ', getUserStateStorage());

  const isSystemMng = computed(() =>
    router.currentRoute.value.meta.location === '시스템관리' ? true : false
  );

  const userRoles = getUserRoleFromStorage();

  console.log('userRoles : ', userRoles);

  const isSuperAdmin = computed(() => {
    // getUserMetaMngInstIdFromStorage의 결과를 숫자로 변환 후 검사
    const metaMngInstId = Number(getUserMetaMngInstIdFromStorage());

    // 숫자로 변환한 값이 0보다 크면 false 반환
    if (metaMngInstId > 0) {
      return false;
    }

    // 데이터가 없거나 0 이하일 때만 기존 로직 실행 (ROLE_SUPER 권한 확인)
    return userRoles.includes('ROLE_SUPER');
  });
  console.log('isSuperAdmin : ', isSuperAdmin.value);

  const isInstAdmin = computed(() =>
    userRoles && userRoles.some((role) => role.startsWith('ROLE_ADMIN'))
      ? true
      : false
  );

  const storageUserState = getUserStateStorage();
  const tabNaviStore = useTabNaviStore();
  const { resetTabNavi, setTabNaviData } = tabNaviStore;

  const { gridResizeCheck } = useGridResize();

  const { setSideState } = uiStore;

  const confirmState = reactive({
    view: false,
    message: '로그아웃 하시겠습니까?',
  });

  const mdiInstForm = reactive({
    view: false,
    message:
      '기관을 변경하시면<br> 저장하지 않은 작업 내용 및 열려 있던 메뉴가 <strong style="color:red">변경</strong> 됩니다.',
  });

  const mdiInfoSysForm = reactive({
    view: false,
    message:
      '정보시스템을 변경하시면<br> 저장하지 않은 작업 및 열려 있던 메뉴가 <strong style="color:red">변경</strong> 됩니다.',
  });

  const mdiDctnryForm = reactive({
    view: false,
    message:
      '사전을 변경하시면<br> 저장하지 않은 작업 및 열려 있던 메뉴가 <strong style="color:red">변경</strong> 됩니다.',
  });

  const onSideNavi = () => {
    getSideState.value === 'small'
      ? setSideState('wide')
      : setSideState('small');
    gridResizeCheck();
  };

  const onMain = async () => {
    await router.replace('/dashboard');
    await setTabNaviData({ title: '대시보드', path: '/dashboard' });
    await window.location.reload();
  };

  const onLogout = () => {
    confirmState.view = true;
  };

  const organizationSystem = ref(null);
  const daconSystem = ref(null);
  const archiveDictionary = ref(null);
  const onSelectSystem = () => {
    console.log('기관 설정 변경 팝업 조회');
    // archiveDictionary.value.close();
    daconSystem.value.onSysConfirmCancel(userOldSelectedInfoSysId.value);
    daconSystem.value.close();
  };
  const onDaconSystem = () => {
    // archiveDictionary.value.close();
    organizationSystem.value.onOrgConfirmCancel(userOldSelectedInstId);
    organizationSystem.value.close();
  };
  const onArchiveDictionary = () => {
    daconSystem.value.close();
    organizationSystem.value.close();
  };
  const userNewSelectedInstId = ref('');
  const userOldSelectedInstId = ref('');
  const userNewSelectedInfoSysId = ref('');
  const userOldSelectedInfoSysId = ref('');
  const userNewSelectedDctnryId = ref('');
  const userOldSelectedDctnryId = ref('');

  //기관 설정 변경 여부 확인 팝업 조회
  const onMdiResetInst = (setInstData) => {
    userOldSelectedInstId.value = setInstData.orgInstData;
    userNewSelectedInstId.value = setInstData.newInstData;
    mdiInstForm.view = true;
  };

  //기관 변경
  const onResetInst = async () => {
    //console.log('기관 정보 초기화');
    await getUserMflexStngInfo();
    resetTabNavi();
    await onMain();
    mdiInstForm.view = false;
  };

  //기관 변경시 하위 시스템, 주제영역, 사전 조회
  const getUserMflexStngInfo = async () => {
    let instituteId = userNewSelectedInstId.value;

    // let userDctnryList = await getUserDictionaryList(instituteId);
    const data = {
      groupId: userNewSelectedInstId.value,
      instituteId: useMetaMngInstId,
    };
    let userInfoSysList = await getUserInfoSysList(instituteId);
    let userInfoGroup = await getPrivateGroupSetting(data);

    const userGroupList = await getPrivateGroup(useMetaMngInstId);

    console.log('userGroupList : ', userGroupList);

    const userDctnryList = userInfoSysList.map((item) => {
      return {
        id: item.dictionaryId,
        name: item.dictionaryName,
        dictionaryTypeName: item.dictionaryTypeName,
        dictionaryTypeForegroundColorName:
          item.dictionaryTypeForegroundColorName,
        dictionaryTypeBackgroundColorName:
          item.dictionaryTypeBackgroundColorName,
        selected: item.selected,
      };
    });

    console.log('userInfoSysList : ', userInfoSysList);

    const userInfoSystemList = userInfoSysList.map((item) => {
      return {
        id: item.systemId,
        name: item.systemName,
        selected: item.selected,
      };
    });

    const useDctnryId = userDctnryList.find(
      (item) => item.selected == true
    )?.id;

    const useInfoSysId = userInfoSystemList.find(
      (item) => item.selected == true
    )?.id;

    const newUseStngInfo = {
      useDctnryId: useDctnryId,
      useInfoSysId: useInfoSysId,
      useMetaMngInstId: useMetaMngInstId,
      useGroupId: userNewSelectedInstId.value,
      useSbjarId: '',
    };

    try {
      if (userInfoSysList.length < 1 || userDctnryList.length < 1) {
        setUserDctnryList(userDctnryList);
        // setUserSbjarList(userSbjarList);
        setUserInfoSysList(userInfoSystemList);
        // setUserMetaMngInstList(userMetaMngInstList);

        saveUserDctnryListToStorage(userDctnryList);
        // saveUserSbjarListToStorage(userSbjarList);
        saveUserInfoSysListToStorage(userInfoSystemList);
        // saveUserMetaMngInstListToStorage(userMetaMngInstList);
        // setUserMetaMngInstId(userNewSelectedInstId.value);
        // saveUserMetaMngInstIdToStorage(userNewSelectedInstId.value);
        // 기관 변경 시 설정 정보 변경
        // setUserStngMetaMngInstId(userNewSelectedInstId.value);
        saveUserStngToStorage(newUseStngInfo);
        //authStore.setUserStngInfo(newUseStngInfo);

        setUserGroupId(userNewSelectedInstId.value);
        saveUserGroupIdToStorage(userNewSelectedInstId.value);

        setUserGroupList(userGroupList);
        saveUserGroupToStorage(userGroupList);

        setUserStngDctnryId(useDctnryId);
        setUserStngInfoSysId(useInfoSysId);
        setUserStngMetaMngInstId(instituteId);
        //location.reload();

        console.log('userStngInfo 1 ===============', userStngInfo);

        // alert('No Data');
        return false;
      } else {
        setUserDctnryList(userDctnryList);
        // setUserSbjarList(userSbjarList);
        setUserInfoSysList(userInfoSystemList);
        // setUserMetaMngInstList(userMetaMngInstList);

        saveUserDctnryListToStorage(userDctnryList);
        // saveUserSbjarListToStorage(userSbjarList);
        saveUserInfoSysListToStorage(userInfoSystemList);
        // saveUserMetaMngInstListToStorage(userMetaMngInstList);
        // 기관 변경 시 설정 정보 변경
        setUserStngMetaMngInstId(userNewSelectedInstId.value);
        // 기관 변경 시 저장
        saveUserStngToStorage(newUseStngInfo);

        setUserGroupId(userNewSelectedInstId.value);
        saveUserGroupIdToStorage(userNewSelectedInstId.value);

        setUserGroupList(userGroupList);
        saveUserGroupToStorage(userGroupList);

        setUserStngDctnryId(useDctnryId);
        setUserStngInfoSysId(useInfoSysId);
        setUserStngMetaMngInstId(instituteId);
        //location.reload();
        console.log('userStngInfo  2===============', userStngInfo);
      }
    } catch (error) {
      console.error('Error getUserMflexStngInfo info:', error);
    }

    // 기관 변경 시 설정 정보 변경
    // setUserStngMetaMngInstId(userNewSelectedInstId.value);
    // setUserMetaMngInstId(userNewSelectedInstId.value);
    // saveUserMetaMngInstIdToStorage(userNewSelectedInstId.value);

    setUserGroupId(userNewSelectedInstId.value);
    saveUserGroupIdToStorage(userNewSelectedInstId.value);
    setUserGroupList(userGroupList);
  };

  //기관 변경 취소
  const onDialogCancelInst = () => {
    console.log('기관 초기화 취소');
    organizationSystem.value.onOrgConfirmCancel(userOldSelectedInstId);

    mdiInstForm.view = false;
  };

  //정보 시스템 변경 여부 확인 팝업 조회
  const onMdiResetInfoSys = (setInfoSysData) => {
    console.log('정보 시스템 변경 팝업 조회 : ', setInfoSysData);
    userOldSelectedInfoSysId.value = setInfoSysData.orgInfoSysData;
    userNewSelectedInfoSysId.value = setInfoSysData.newInfoSysData;
    mdiInfoSysForm.view = true;
  };

  //정보 시스템 변경
  const onResetInfoSys = async () => {
    console.log('onResetInfoSys =============');

    let instituteId = useMetaMngInstId;
    let systemId = userNewSelectedInfoSysId.value;

    let paramSystemData = {
      systemId: systemId,
      instituteId: useMetaMngInstId,
    };

    console.log('isSuperAdmin.value : ', isSuperAdmin.value);
    console.log(
      `userRoles.includes('ROLE_SUPER') : `,
      userRoles.includes('ROLE_SUPER')
    );

    if (isInstAdmin.value || userRoles.includes('ROLE_SUPER')) {
      console.log('기관 관리자입니다.');

      // 기관 관리자일 경우, 기관 변경시 default 설정을 변경하지 않고 클라이언트에서만 변경
      let userInfoSystemList = await getUserInfoSysList(parseInt(instituteId));

      const userInfoSystem = userInfoSystemList.find(
        (item) => item.systemId === systemId
      );

      if (userInfoSystem) {
        userInfoSystem.selected = true;
      }

      const selectDictionaryId = userInfoSystem.dictionaryId;

      console.log('userInfoSystem : ', userInfoSystem);

      const userInfoSystemListUpdated = userInfoSystemList.map((item) => {
        return {
          id: item.systemId,
          name: item.systemName,
          selected: item.selected,
        };
      });

      setUserInfoSysList(userInfoSystemListUpdated);
      saveUserInfoSysListToStorage(userInfoSystemListUpdated);

      setUserStngInfoSysId(systemId);
      console.log('정보 시스템 변경 조회 :', userStngInfo);

      console.log('정보 시스템 변경 조회 :', userStngInfo);

      const userDctnryList = userInfoSystemList.map((item) => {
        return {
          id: item.dictionaryId,
          name: item.dictionaryName,
          dictionaryTypeName: item.dictionaryTypeName,
          dictionaryTypeForegroundColorName:
            item.dictionaryTypeForegroundColorName,
          dictionaryTypeBackgroundColorName:
            item.dictionaryTypeBackgroundColorName,
          selected: item.selected,
        };
      });

      console.log('userDctnryList : ', userDctnryList);

      setUserDctnryList(userDctnryList);
      saveUserDctnryListToStorage(userDctnryList);

      const newUserStangInfo = {
        useDctnryId: selectDictionaryId,
        useInfoSysId: systemId,
        useMetaMngInstId: userStngInfo.value.useMetaMngInstId,
        useGroupId: userStngInfo.value.useGroupId,
        useSbjarId: '',
      };
      saveUserStngToStorage(newUserStangInfo);
      daconSystem.value.onChgInfoSystemId(userNewSelectedInfoSysId.value);
      resetTabNavi();
      onMain();
      mdiInfoSysForm.view = false;
    } else {
      // 재조회 후 store & cookies 저장
      let response = await updataUserSystem(paramSystemData);
      let newSystemList = await getUserInfoSysList(parseInt(instituteId));

      const userInfoSystemList = newSystemList.map((item) => {
        return {
          id: item.systemId,
          name: item.systemName,
          selected: item.selected,
        };
      });

      setUserInfoSysList(userInfoSystemList);
      saveUserInfoSysListToStorage(userInfoSystemList);

      setUserStngInfoSysId(systemId);
      console.log('정보 시스템 변경 조회 :', userStngInfo);

      const userDctnryList = newSystemList.map((item) => {
        return {
          id: item.dictionaryId,
          name: item.dictionaryName,
          dictionaryTypeName: item.dictionaryTypeName,
          dictionaryTypeForegroundColorName:
            item.dictionaryTypeForegroundColorName,
          dictionaryTypeBackgroundColorName:
            item.dictionaryTypeBackgroundColorName,
          selected: item.selected,
        };
      });

      setUserDctnryList(userDctnryList);
      saveUserDctnryListToStorage(userDctnryList);

      const useDctnryId = userDctnryList.find(
        (item) => item.selected == true
      )?.id;

      const newUserStangInfo = {
        // useDctnryId: standardDictionaryId,
        useDctnryId: useDctnryId,
        useInfoSysId: systemId,
        useMetaMngInstId: userStngInfo.value.useMetaMngInstId,
        useGroupId: userStngInfo.value.useGroupId,
        useSbjarId: '',
      };
      saveUserStngToStorage(newUserStangInfo);
      daconSystem.value.onChgInfoSystemId(userNewSelectedInfoSysId.value);
      resetTabNavi();
      onMain();
      mdiInfoSysForm.view = false;
    }
  };

  //정보 시스템 변경 취소
  const onDialogCancelInfoSys = () => {
    //console.log('정보 시스템 초기화 취소');
    daconSystem.value.onSysConfirmCancel(userOldSelectedInfoSysId.value);
    mdiInfoSysForm.view = false;
  };

  //사전 설정 변경 여부 확인 팝업 조회
  const onMdiResetDctnry = (setDctnryData) => {
    userOldSelectedDctnryId.value = setDctnryData.orgDctnryData;
    userNewSelectedDctnryId.value = setDctnryData.newDctnryData;
    mdiDctnryForm.view = true;
  };

  //사전 변경
  const onResetDctnry = async () => {
    //console.log('사전 시스템 초기화');
    let instituteId = getUserMetaMngInstIdFromStorage();
    let dictionaryId = userNewSelectedDctnryId.value;
    console.log('dictionaryId ============== ', dictionaryId);
    let paramDictionaryData = {
      dictionaryId: dictionaryId,
      instituteId: instituteId,
    };

    let response = await updateUserDictionary(paramDictionaryData);

    // 재조회 후 store & cookies 저장
    let newDictionaryList = await getUserDictionaryList(parseInt(instituteId));
    setUserDctnryList(newDictionaryList);
    saveUserDctnryListToStorage(newDictionaryList);

    const newUserStangInfo = {
      useDctnryId: dictionaryId,
      useInfoSysId: userStngInfo.value.useInfoSysId,
      useMetaMngInstId: userStngInfo.value.useMetaMngInstId,
      useSbjarId: '',
    };

    saveUserStngToStorage(newUserStangInfo);
    setUserStngDctnryId(dictionaryId);
    console.log('사전 변경 후 재조회 : ', userStngInfo);
    archiveDictionary.value.onChgPrevDctnryId(userNewSelectedDctnryId.value);

    resetTabNavi();
    onMain();
    mdiInfoSysForm.view = false;
  };

  //사전 변경 취소
  const onDialogCancelDctnry = () => {
    //console.log('사전 시스템 초기화 취소');
    archiveDictionary.value.onDctnryConfirmCancel(userOldSelectedDctnryId);
    mdiInfoSysForm.view = false;
  };

  const goLogout = async () => {
    try {
      //deleteAllCookies();

      await resetAuth();
      await resetTabNavi();
      authStore.$reset;
      // 쿠키 삭제
      deleteCookie('x_auth');

      // 로컬 스토리지 항목 삭제
      deleteStorage('x_user');
      deleteStorage('x_tabNavi');
      deleteStorage('mflex_grid_info');
      deleteStorage('mflex_user_admininstid');

      // 로컬 스토리지 완전 삭제
      localStorage.clear();

      // 세션 스토리지 삭제
      sessionStorage.clear();

      console.log('document.cookie : ', document.cookie);
      console.log('로그아웃 스토어 ', authStore);

      // 페이지 새로고침 (캐시 무시)
      window.location.replace(
        window.location.href + '?t=' + new Date().getTime()
      );

      console.log('로그아웃 쿠키 : ', document.cookie);

      console.log('로그아웃 완료 : ', authStore);
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류 처리 (예: 사용자에게 알림)
    }
  };

  const { swipper } = storeToRefs(useSwipperStore());
  const { setSwipperStatus } = useSwipperStore();

  // 스토리지 초기 상태와 동기화
  const storageSwipperState = ref(getSwipperStateStorage());

  // Swipper 상태 토글
  const onToggleSwipper = () => {
    const newState = !swipper.value;
    saveSwipperStateStorage(newState); // 로컬 스토리지 업데이트
    setSwipperStatus(newState); // 스토어 상태 업데이트
  };

  // Swipper 상태 변화 감지 및 UI 갱신
  watch(swipper, (newValue) => {
    updateHeaderStyle(newValue); // UI 업데이트
  });

  // 초기 로드 시 상태 동기화
  onMounted(() => {
    console.log('header mounted ===');
    const initialState = storageSwipperState.value;
    console.log('initialState : ', initialState);
    setSwipperStatus(initialState); // 스토어 초기화
    updateHeaderStyle(initialState); // UI 초기화
  });
</script>
