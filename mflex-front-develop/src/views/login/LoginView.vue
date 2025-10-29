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
              반갑습니다.<br />
              메타데이터 관리시스템 <strong>Mflex</strong> 입니다.
            </div>
          </div>
          <div class="form-body">
            <div class="login-inputs">
              <div class="input-id" :class="{ error: validation.username }">
                <input
                  id="username"
                  name="id"
                  type="text"
                  class="id"
                  :class="{ error: validation.username }"
                  :placeholder="
                    validation.username ? '아이디를 입력해주세요.' : '아이디'
                  "
                  v-model="logInfo.username"
                  autocomplete="off"
                  @input="clearValidationError('username')"
                  @focus="clearValidationError('username')"
                />
                <span class="icon"></span>
              </div>
              <div
                class="input-password"
                :class="{ error: validation.password }"
              >
                <input
                  id="password"
                  name="password"
                  type="password"
                  class="password"
                  :class="{ error: validation.password }"
                  :placeholder="
                    validation.password
                      ? '비밀번호를 입력해주세요.'
                      : '비밀번호'
                  "
                  v-model="logInfo.password"
                  autocomplete="off"
                  @input="clearValidationError('password')"
                  @focus="clearValidationError('password')"
                />
                <span class="icon"></span>
              </div>
            </div>

            <div class="login-btns">
              <button
                type="submit"
                class="btn-login"
                ref="loginButton"
                @keyup.enter="preventEnterOnAlert"
              >
                로그인
              </button>
            </div>
          </div>
        </form>
        <div class="pass-area">
          <!-- <span class="pass-text">비밀번호를 잊으셨나요?</span> -->
          <button class="buttons" @click="resetPassWord">
            비밀번호 초기화 요청
          </button>
          <div class="divider-vertical"></div>
          <button class="buttons" @click="singUp">회원가입</button>
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
  import { reactive, ref, onMounted, onUnmounted } from 'vue';
  import { storeToRefs } from 'pinia';
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
    saveUserInfoSysListToStorage,
    saveUserStngToStorage,
    saveUserMetaMngInstIdToStorage,
    saveGridInfoToStorage,
    saveUserStateStorage,
    saveSwipperStateStorage,
    saveUserRoleToStorage,
    saveUserAdminInstIdToStorage,
    saveUserGroupToStorage,
    saveUserGroupIdToStorage,
  } from '@/utils/cookies';
  import { getInstituteAdminListByUser } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { updataUserSystem } from '@/utils/mflexApi/userSetApi';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChangePasswordWindow from '@/components/popWindow/ChangePasswordWindow.vue';
  import SignUpWindow from '@/components/popWindow/SignUpWindow.vue';
  import { useAlert } from '@/composables/alert';
  import { useTabNaviStore } from '@/stores/tabNavi';

  import {
    loginApi, // 로그인 관련 API
    getUserMenuList, // 사용자별 메뉴 목록 조회 API
    getUserInfoSysList, // 사용자 설정 정보 조회 API
    getUserProfile, // Header 사용자 상세 정보 조회 API
  } from '@/utils/mflexApi/loginApi'; // 로그인관련 API 모듈

  const tabNaviStore = useTabNaviStore();
  const { getTabData } = storeToRefs(tabNaviStore);
  const { setTabNaviData, resetTabNavi } = tabNaviStore;

  const router = useRouter();
  const store = useAuthStore();
  const {
    setUser,
    setToken,
    setUserMenuList,
    setUserAdminInstId,
    setUserMetaMngInstList,
    setUserDctnryList,
    setUserInfoSysList,
    setUserStngInfo,
    setUserMetaMngInstId,
    setUserGroupList,
    setUserGroupId,
  } = store;

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { useMetaMngInstId } = userStngInfo.value;

  const logInfo = reactive({
    username: '',
    password: '',
  });

  // 🔥 validation 상태 관리 추가
  const validation = reactive({
    username: false,
    password: false,
  });

  // 🔥 validation 에러 클리어 함수
  const clearValidationError = (field) => {
    validation[field] = false;
  };

  // 🔥 모든 validation 에러 클리어
  const clearAllValidationErrors = () => {
    validation.username = false;
    validation.password = false;
  };

  // 🔥 validation 체크 함수
  const validateInputs = () => {
    let isValid = true;

    // 기존 에러 클리어
    clearAllValidationErrors();

    // 아이디 검증
    if (logInfo.username.trim() === '') {
      validation.username = true;
      isValid = false;
    }

    // 비밀번호 검증
    if (logInfo.password.trim() === '') {
      validation.password = true;
      isValid = false;
    }

    return isValid;
  };

  // 회원가입
  const singUp = () => {
    console.log('회원가입 클릭');
    signUpWindowView.value = true;
  };

  // 비밀번호 초기화
  const resetPassWord = () => {
    setAlertStatus({
      view: true,
      message: '관리자에게 문의하세요.',
    });
  };

  const loginButton = ref(null);
  const checkSaveId = ref(false);

  const checkUserId = () => {
    const idStorage = getIdFromStorage();
    if (idStorage) {
      checkSaveId.value = true;
      logInfo.username = idStorage;
    }
  };
  checkUserId();

  const { alertInfos, setAlertStatus } = useAlert();

  const preventEnterOnAlert = (event) => {
    console.log('preventEnterOnAlert =============== ');
    if (alertInfos.value.view) {
      console.log('조건 통과 preventEnterOnAlert =============== ');
      event.preventDefault();
      //setAlertStatus({ view: false, message: '' });
    }
  };

  // JWT 토큰 디코딩 함수
  const decodeJWTToken = (token) => {
    try {
      // Bearer 제거
      const cleanToken = token.replace('Bearer ', '');

      // JWT는 '.'으로 구분된 3부분으로 구성됨
      const parts = cleanToken.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Header 디코딩
      const header = JSON.parse(atob(parts[0]));

      // Payload 디코딩
      const payload = JSON.parse(atob(parts[1]));

      // Signature는 검증을 위한 부분이므로 일반적으로 디코딩하지 않음

      return {
        header,
        payload,
        signature: parts[2],
      };
    } catch (error) {
      console.error('JWT 디코딩 실패:', error);
      return null;
    }
  };

  // 토큰 정보 확인 함수
  const analyzeToken = (token) => {
    const decoded = decodeJWTToken(token);

    if (!decoded) {
      console.error('토큰 디코딩 실패');
      return;
    }

    console.log('=== JWT 토큰 정보 ===');
    console.log('Header:', decoded.header);
    console.log('Payload:', decoded.payload);

    // 일반적인 JWT 클레임들 확인
    const { payload } = decoded;

    console.log('=== 토큰 상세 정보 ===');
    console.log(
      '사용자 ID:',
      payload.sub || payload.userId || payload.username
    );
    console.log('발급자:', payload.iss);
    console.log('대상:', payload.aud);
    console.log(
      '발급 시간:',
      payload.iat ? new Date(payload.iat * 1000) : 'N/A'
    );
    console.log(
      '만료 시간:',
      payload.exp ? new Date(payload.exp * 1000) : 'N/A'
    );
    console.log(
      '활성화 시간:',
      payload.nbf ? new Date(payload.nbf * 1000) : 'N/A'
    );

    // 토큰 만료 확인
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = now > payload.exp;
      console.log('토큰 만료 여부:', isExpired ? '만료됨' : '유효함');

      if (!isExpired) {
        const remainingTime = payload.exp - now;
        console.log('남은 시간(초):', remainingTime);
        console.log('남은 시간(분):', Math.floor(remainingTime / 60));
      }
    }

    // 사용자 권한 정보 (있는 경우)
    if (payload.roles || payload.authorities) {
      console.log('사용자 권한:', payload.roles || payload.authorities);
    }

    // 기타 사용자 정의 클레임들
    console.log('=== 기타 정보 ===');
    Object.keys(payload).forEach((key) => {
      if (
        ![
          'sub',
          'iss',
          'aud',
          'iat',
          'exp',
          'nbf',
          'roles',
          'authorities',
        ].includes(key)
      ) {
        console.log(`${key}:`, payload[key]);
      }
    });

    return decoded;
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && alertInfos.value.view) {
      alertInfos.value.view = false; // 직접 상태 변경
      alertInfos.value.message = ''; // 필요한 경우 메시지도 초기화
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);

    // deleteAllCookies();
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  function removeFocusFromElement(element) {
    if (element) {
      element.blur();
    } else {
      console.log('element is null');
    }
  }

  // 로그인, 비밀번호 input box 선택
  let usernameInput;
  let passwordInput;

  onMounted(() => {
    usernameInput = document.querySelector('#username');
    passwordInput = document.querySelector('#password');
  });

  const dialogState = ref({
    view: false,
    title: '',
    message: '',
  });

  const onDialogClose = () => {
    dialogState.value.view = false;
  };

  const signUpWindowView = ref(false);
  const onCloseSignUpWindow = () => {
    signUpWindowView.value = false;
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

  const submitForm = async (event) => {
    console.log('로그인 실행 ============');

    // deleteAllCookies();

    setToken(null);

    // 제출 시 포커싱 해제
    removeFocusFromElement(usernameInput);
    removeFocusFromElement(passwordInput);

    if (alertInfos.value.view) {
      return; // 팝업이 열려있으면 함수 실행 중단
    } else {
      try {
        console.log('logInfo ============', logInfo);

        // 🔥 로그인 validation - alert 대신 input 에러 표시
        if (!validateInputs()) {
          return;
        }

        // 로그인 API
        const response = await loginApi(logInfo);
        console.log('login_response ============', response);

        if (response.status === 401) {
          if (response.data.code === 1113) {
            setAlertStatus({
              view: true,
              message: '사용자 계정이 잠금 상태입니다. 관리자에게 문의하세요.',
            });
            deleteCookie('x_auth');
            return;
          } else if (response.data.code === 1111) {
            setAlertStatus({
              view: true,
              message: `비밀번호를 잘못 입력하셨습니다. <br>다시 확인 후 로그인 해주세요. <br><br>※ 비밀번호 5회 오류 시 로그인이 제한됩니다. [실패횟수 : ${response.data.additionalMessage}] <br> `,
            });
            deleteCookie('x_auth');
            return;
          } else if (response.data.code === 1114) {
            setAlertStatus({
              view: true,
              message: `로그인 시도가 5회 이상 실패하여 접속이 제한되었습니다. <br>관리자에게 문의해주세요. `,
            });
            deleteCookie('x_auth');
          }
          return;
        }

        // 🔥 로그인 성공 시 validation 에러 클리어
        clearAllValidationErrors();

        const userState = response.headers['user-state'];
        console.log('userState ==========================', userState);

        // 사용자 스토리지 상태 저장
        saveUserStateStorage(userState);
        loginToken.value = response.headers.get('Authorization');

        // 토큰 정보 분석
        const tokenInfo = analyzeToken(loginToken.value);

        console.log('토큰 정보 분석 결과:', tokenInfo);

        saveUserRoleToStorage(tokenInfo.payload.roles);
        console.log('loginToken.value : ', loginToken.value);

        // 최초 로그인 시 비밀번호 변경 페이지로 이동
        if (userState === 'SPROUT') {
          changePasswordWindowView.value = true;

          return;
        } else if (userState === 'WILT') {
          setAlertStatus({
            view: true,
            message:
              '사용자 계정이 비활성화 상태 입니다. <br>관리자에게 문의하세요.',
          });
          deleteCookie('x_auth');
          return;
        } else if (userState === 'SEED_ADMIN' || userState === 'SEED') {
          // setAlertStatus({
          //   view: true,
          //   message: '관리자 승인이 필요합니다',
          // });

          const authHeader = response.headers.get('Authorization');
          console.log('authHeader ==========================', authHeader);
          const token = authHeader.replace('Bearer ', '');
          console.log('token ==========================', token);
          //const token = response.headers.get('Authorization');

          //Token 정보
          //const sompleToken = token;
          saveAuthToCookie(token);
          setToken(token);

          //login 후 사용자 상세정보 조회 API
          const userInfo = await getUserProfile();
          console.log('userInfo ==========================', userInfo);
          // 사용자 정보 store save
          setUser(userInfo);
          saveUserToStorage(userInfo);

          // 사용자 메뉴 API
          const userMenuList = await getUserMenuList(userInfo.userId);
          // 사용자 메뉴 store, cookies save
          setUserMenuList(userMenuList);
          saveUserMenuToStorage(userMenuList);

          // 탭 초기화
          resetTabNavi();
          // GS 인증용
          setTabNaviData({ title: '대시보드', path: '/dashboard' });
          // setTabNaviData({
          //   title: '사전조회',
          //   path: '/dictionarySearch/view/list',
          // });
          // console.log('getTabDatas Json : ', JSON.stringify(getTabData.value));
          // saveTabNaviStorage(getTabData.value);
          // saveTabNaviIndexStorage(0);
          // const selectPath = getTabData.value[0].path;
          router.replace('/noneAcceptUserPage');

          return;
        }

        const authHeader = response.headers.get('Authorization');
        console.log('authHeader ==========================', authHeader);
        const token = authHeader.replace('Bearer ', '');
        console.log('token ==========================', token);
        //const token = response.headers.get('Authorization');

        //Token 정보
        //const sompleToken = token;
        saveAuthToCookie(token);
        setToken(token);

        //login 후 사용자 상세정보 조회 API
        const userInfo = await getUserProfile();
        console.log('userInfo ==========================', userInfo);
        // 사용자 정보 store save
        setUser(userInfo);
        saveUserToStorage(userInfo);

        // 사용자 메뉴 API
        const userMenuList = await getUserMenuList(userInfo.userId);
        // 사용자 메뉴 store, cookies save
        setUserMenuList(userMenuList);
        saveUserMenuToStorage(userMenuList);

        // admin으로 있는 기관 목록 조회 API
        const InstituteAdminListByUser = await getInstituteAdminListByUser();
        console.log(
          'InstituteAdminListByUser ==========================',
          InstituteAdminListByUser
        );
        // 기관 관리자 ID 목록 store, cookies save
        setUserAdminInstId(InstituteAdminListByUser);
        saveUserAdminInstIdToStorage(InstituteAdminListByUser);

        // // 사용자별 기관 조회 API
        // const userMetaMngInstList = await getUserMetaMngInstList();
        // console.log(
        //   'userMetaMngInstList ==========================',
        //   userMetaMngInstList
        // );

        const userMetaMngInstList = [
          {
            name: userInfo.ogdpInstNm,
            id: userInfo.ogdpInstId,
          },
        ];

        let initInstituteId;

        // if (userMetaMngInstList.length > 0) {
        //   let initInstitute = userMetaMngInstList.find(
        //     (item) => item.selected === true
        //   );
        //   initInstituteId = initInstitute.id;
        // } else {
        //   setAlertStatus({
        //     view: true,
        //     message:
        //       '사용자에게 할당된 기관 정보가 없습니다. 관리자에게 문의하세요.',
        //   });
        //   localStorage.clear();
        //   return;
        // }

        // const initInstituteId = initInstitute.id;
        console.log('userInfo.ogdpInstId : ', userInfo.ogdpInstId);

        console.log('initInstituteId ===================', initInstituteId);
        // 사용자별 기관 ID store, cookies save
        setUserMetaMngInstId(userInfo.ogdpInstId);
        saveUserMetaMngInstIdToStorage(userInfo.ogdpInstId);

        setUserMetaMngInstList(userMetaMngInstList);
        saveUserMetaMngInstListToStorage(userMetaMngInstList);

        console.log('useMetaMngInstId : ', useMetaMngInstId);

        // 사용자별 조직 조회
        // const userGroup = await getPrivateGroup(userInfo.ogdpInstId);

        // const userInfoGroupList = userGroup.map((item) => {
        //   return {
        //     id: item.id,
        //     name: item.name,
        //     selected: item.selected,
        //   };
        // });

        // let initGroup;

        // saveUserGroupToStorage(userInfoGroupList);
        // setUserGroupList(userInfoGroupList);

        // if (userInfoGroupList.length > 0) {
        //   initGroup = userInfoGroupList.find((item) => item.selected === true);
        //   if (!initGroup) {
        //     initGroup = userInfoGroupList[0];
        //   }
        //   setUserGroupId(initGroup.id);
        //   saveUserGroupIdToStorage(initGroup.id);
        // } else {
        //   setUserGroupId(null);
        //   saveUserGroupIdToStorage(null);
        // }

        // 사용자별 정보 시스템 조회 API
        let initInfoSystemId;

        const data = {
          userId: userInfo.userId,
          instituteId: userInfo.ogdpInstId,
        };

        // const userInfoSysList = await getUserInfoSysList(userInfo.ogdpInstId);
        const userInfoSysList = await getUserInfoSysList(data.instituteId);

        console.log('userInfoSysList =====================', userInfoSysList);

        const userInfoSystemList = userInfoSysList.map((item) => {
          return {
            id: item.systemId,
            name: item.systemName,
            selected: item.selected,
          };
        });
        console.log(
          'userInfoSystemList =====================',
          userInfoSystemList
        );
        setUserInfoSysList(userInfoSystemList);
        saveUserInfoSysListToStorage(userInfoSystemList);

        if (userInfoSystemList.length > 0) {
          let initInfoSystem = userInfoSystemList.find(
            (item) => item.selected === true
          );

          console.log('initInfoSystem =====================', initInfoSystem);

          // selected가 true인 항목이 없으면 첫 번째 항목을 선택
          if (!initInfoSystem) {
            console.log(
              'selected가 true인 항목이 없습니다. 첫 번째 항목을 선택합니다.'
            );
            console.log(
              'userInfoSystemList[0] =====================',
              userInfoSystemList[0]
            );
            initInfoSystem = userInfoSystemList[0];

            let paramSystemData = {
              systemId: userInfoSystemList[0].id,
              instituteId: userInfo.ogdpInstId,
            };

            await updataUserSystem(paramSystemData);

            const NewUserInfoSysList = await getUserInfoSysList(
              userInfo.ogdpInstId
            );

            console.log(
              'NewUserInfoSysList =====================',
              NewUserInfoSysList
            );

            const NewUserInfoSystemList = NewUserInfoSysList.map((item) => {
              return {
                id: item.systemId,
                name: item.systemName,
                selected: item.selected,
              };
            });

            setUserInfoSysList(NewUserInfoSystemList);
            saveUserInfoSysListToStorage(NewUserInfoSystemList);
          }

          initInfoSystemId = initInfoSystem.id;
        } else {
          // setAlertStatus({
          //   view: true,
          //   message:
          //     '사용자에게 할당된 정보시스템 정보가 없습니다. 관리자에게 문의하세요.',
          // });
          // initInfoSystemId = null;
          // localStorage.clear();
          // return;
        }

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

        // 사용자별 사전 조회 API
        let initDictionaryId;

        setUserDctnryList(userDctnryList);
        saveUserDctnryListToStorage(userDctnryList);

        if (userDctnryList.length > 0) {
          let initDictionary =
            userDctnryList.find((item) => item.selected === true) ||
            userDctnryList[0];
          initDictionaryId = initDictionary.id;
        }

        const systemDetailsParams = {
          instituteId: userInfo.ogdpInstId,
          systemId: initInfoSystemId,
        };

        console.log('systemDetailsParams : ', systemDetailsParams);

        // 사용자별 설정 영역 저장
        const userStngInfo = {
          useMetaMngInstId: userInfo.ogdpInstId,
          useInfoSysId: initInfoSystemId,
          useDctnryId: initDictionaryId,
          useSbjarId: '',
        };

        setUserStngInfo(userStngInfo);
        saveUserStngToStorage(userStngInfo);

        // 그리드 정보 스토어 저장
        const gridResponse = await fetch('/sampledata/gridDefaultData.json');

        const gridDefaultData = await gridResponse.json();

        saveGridInfoToStorage(gridDefaultData);
        // UserId Save
        if (checkSaveId.value) {
          saveIdToStorage(logInfo.username);
        } else {
          deleteStorage('x_id');
        }

        // 탭 초기화
        resetTabNavi();
        // GS 인증용
        setTabNaviData({ title: '대시보드', path: '/dashboard' });
        // setTabNaviData({
        //   title: '사전조회',
        //   path: '/dictionarySearch/view/list',
        // });
        console.log('getTabDatas Json : ', JSON.stringify(getTabData.value));
        saveTabNaviStorage(getTabData.value);
        saveTabNaviIndexStorage(0);
        const selectPath = getTabData.value[0].path;
        router.replace(selectPath);

        // 히스토리바 스와이퍼 상태저장
        saveSwipperStateStorage(true);
      } catch (error) {
        console.error(error);
        console.log('error.inner[0] ============', error.inner[0]);
        const result = error.inner[0];
        setAlertStatus({ view: true, message: result.message });
        console.log('alertInfos : ', alertInfos.value.view);
      }
    }
  };
</script>

<style lang="scss" scoped>
  /* 기존 스타일에 추가하거나 수정 */
  .login-wrap {
    /* 전체 화면을 차지하도록 설정 */
    min-height: 100vh;
    width: 100vw;

    /* Flexbox를 사용한 완벽한 중앙 정렬 */
    display: flex;
    align-items: center; /* 세로 중앙 정렬 */
    justify-content: center; /* 가로 중앙 정렬 */

    /* 배경 스타일 (필요시) */
    // background-color: #f5f5f5; /* 원하는 배경색으로 변경 */

    /* 스크롤이 생겨도 중앙 유지 */
    box-sizing: border-box;
    padding: 20px;
  }

  .login-box {
    /* 로그인 박스 크기 설정 */
    width: 100%;
    max-width: 400px; /* 최대 너비 제한 */
    min-width: 320px; /* 최소 너비 보장 */

    /* 박스 스타일 */
    // background: white;
    border-radius: 8px;
    // box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    /* 반응형 대응 */
    margin: 0 auto;

    /* 내부 여백 */
    padding: 40px 30px;

    /* 작은 화면에서의 조정 */
    @media (max-width: 480px) {
      max-width: 90%;
      padding: 30px 20px;
    }
  }

  .form-box {
    width: 100%;
  }

  /* 추가 반응형 스타일 */
  @media (max-height: 600px) {
    .login-wrap {
      /* 화면 높이가 작을 때는 상단에 여백 추가 */
      align-items: flex-start;
      padding-top: 50px;
    }
  }

  @media (min-height: 800px) {
    .login-wrap {
      /* 화면이 충분히 클 때는 완전 중앙 */
      align-items: center;
    }
  }

  /* 세로 모드 태블릿 대응 */
  @media (min-width: 768px) and (max-width: 1024px) {
    .login-box {
      max-width: 450px;
    }
  }

  /* 가로 모드 태블릿 및 데스크톱 대응 */
  @media (min-width: 1025px) {
    .login-box {
      max-width: 500px;
    }
  }

  /* 매우 큰 화면 대응 */
  @media (min-width: 1440px) {
    .login-box {
      max-width: 550px;
      padding: 50px 40px;
    }
  }

  /* 기존 스타일들 유지 */
  .divider-vertical {
    width: 2px;
    height: 17px;
    background-color: #bebebe;
    margin: 3px 3px 0px 3px;
  }

  .buttons {
    cursor: pointer;

    &:hover {
      font-weight: bold;
    }
  }

  /* 🔥 validation 에러 스타일 추가 */
  .input-id,
  .input-password {
    position: relative;
  }

  /* 🔥 에러 상태 input 스타일 */
  .input-id input.error,
  .input-password input.error {
    border: 2px solid #dc3545 !important;
    color: #dc3545 !important;
    background-color: rgba(220, 53, 69, 0.05) !important;
  }

  .input-id input.error:focus,
  .input-password input.error:focus {
    outline: none;
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
  }

  /* 🔥 에러 상태 placeholder 스타일 */
  .input-id input.error::placeholder,
  .input-password input.error::placeholder {
    color: #dc3545 !important;
    font-weight: 500;
  }

  /* 🔥 기본 input 스타일 */
  .input-id input,
  .input-password input {
    width: 100%;
    height: 50px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0 50px 0 15px;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .input-id input:focus,
  .input-password input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  /* 🔥 아이콘 스타일 */
  .input-id .icon,
  .input-password .icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    background-size: contain;
    background-repeat: no-repeat;
  }

  /* 기본 아이콘 이미지들 (필요에 따라 실제 아이콘 경로로 변경) */
  .input-id .icon {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>');
  }

  .input-password .icon {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/></svg>');
  }

  /* 🔥 에러 상태일 때 아이콘 색상 변경 */
  .input-id.error .icon,
  .input-password.error .icon {
    filter: hue-rotate(320deg) saturate(2) brightness(0.8);
  }

  /* 기타 기본 스타일들 */
  .login-inputs {
    margin-bottom: 20px;
  }

  .btn-login {
    width: 100%;
    height: 50px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .btn-login:hover {
    background: #0056b3;
  }

  .pass-area {
    display: flex;
    gap: 10px;
  }

  .login-copyright {
    text-align: center;
    margin-top: 20px;
    font-size: 12px;
    color: #666;
  }

  .form-header {
    text-align: center;
  }

  .logo {
    display: inline-block;
    width: 60px;
    height: 60px;
    background: url('/logo.png') no-repeat center;
    background-size: contain;
    margin-bottom: 15px;
  }

  .logo-text {
    font-size: 16px;
    color: #333;
    line-height: 1.4;
  }

  .logo-text strong {
    color: #007bff;
    font-weight: 700;
  }

  .login-wrap .login-btns .btn-login {
    margin-top: 0;
  }
</style>
