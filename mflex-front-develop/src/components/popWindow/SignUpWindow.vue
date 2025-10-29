<template>
  <div class="pop-window">
    <div class="window-header">회원가입</div>
    <div class="signup-body" style="margin-bottom: 15px">
      <div class="window-content pt15">
        <div class="signup-form">
          <div class="form-group">
            <label for="username">사용자 이름</label>
            <input
              type="text"
              id="username"
              v-model="userInfo.username"
              placeholder="사용자 이름을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label for="id">아이디</label>
            <input
              type="id"
              id="id"
              v-model="userInfo.userId"
              placeholder="아이디를 입력하세요"
            />
          </div>
          <div class="form-group">
            <label for="userPassword">비밀번호</label>
            <input
              :type="passwordVisible ? 'text' : 'password'"
              id="userPassword"
              v-model="userInfo.userPassword"
              placeholder="비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자가 포함되어야 합니다."
            />
            <button
              class="check-password-btn"
              @click="togglePasswordVisibility"
            >
              {{ passwordVisible ? '🙈' : '👁️‍🗨️' }}
            </button>
          </div>
          <div class="form-group">
            <label for="confirm-password">비밀번호 확인</label>
            <input
              :type="confirmPasswordVisible ? 'text' : 'password'"
              id="confirm-password"
              v-model="userInfo.confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
            />
            <button
              class="confirm-password-btn"
              @click="toggleConfirmPasswordVisibility"
            >
              {{ confirmPasswordVisible ? '🙈' : '👁️‍🗨️' }}
            </button>
          </div>
          <div class="form-group">
            <label for="confirm-password">회사 전화번호</label>
            <input
              type="text"
              v-model="userInfo.officePhoneNumber"
              placeholder="'-'를 제외한 전화번호를 입력해주세요"
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">휴대폰번호</label>
            <input
              type="text"
              id="confirm-password"
              v-model="userInfo.personalPhoneNumber"
              placeholder="휴대폰번호를 입력해주세요"
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">이메일</label>
            <input
              type="text"
              id="confirm-password"
              v-model="userInfo.email"
              placeholder="이메일을 입력해주세요"
            />
          </div>
          <!-- <div class="form-group form-section child-section">
            <div class="label-section">
              <label class="child-label">사용자 타입</label>
            </div>
          
            <div class="select-container">
              <select name="" id="select-usertype">
                <option value="">기관선택</option>
                <option value="">데이콘인피니티</option>
                <option value="">데이콘랩</option>
              </select>
            </div>
          </div> -->
          <!-- <div
            style="border: 1px solid #ccc; border-radius: 10px; padding: 20px"
          >
            <div class="form-group form-group form-section child-section">
              <div class="label-section child-label">
                <label for="permission">기관</label>
              </div>
              <div class="select-container">
                <select name="" id="select-institute">
                  <option value="">기관선택</option>
                  <option value="">데이콘인피니티</option>
                  <option value="">데이콘랩</option>
                </select>
              </div>
            </div>
            <div style="display: flex; justify-content: space-around">
              <div class="form-group form-section child-section">
                <div class="label-section">
                  <label for="permission">부서</label>
                </div>
                <div class="select-container">
                  <select name="" id="select-department">
                    <option value="">권한</option>
                    <option value="">관리자</option>
                    <option value="">일반사용자</option>
                  </select>
                </div>
              </div>
              <div class="form-group form-section child-section">
                <div class="label-section child-label">
                  <label for="permission">직급</label>
                </div>
                <div class="select-container">
                  <select name="" id="select-position">
                    <option value="">권한</option>
                    <option value="">관리자</option>
                    <option value="">일반사용자</option>
                  </select>
                </div>
              </div>
            </div>
          </div> -->
          <div class="form-group"></div>
          <!-- <div class="error-message">
            비밀번호와 확인 비밀번호가 일치하지 않습니다.
          </div> -->
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onSignUp">회원가입</button>
          <button class="btn-m close" @click="onCancel">취소</button>
        </div>
      </div>
    </div>
  </div>
  <AppDialog
    v-model:view="dialogState.view"
    :title="dialogState.title"
    :message="dialogState.message"
    @confirm="onDialogClose"
    @close="onDialogClose"
  />

  <AppDialog
    v-model:view="errorState.view"
    :title="errorState.title"
    :message="errorState.message"
    @confirm="onCloseErrorState"
    @close="onCloseErrorState"
  >
  </AppDialog>
</template>

<script setup>
  import { ref, reactive, onBeforeMount } from 'vue';
  import {
    signUp, // 회원가입
  } from '@/utils/mflexApi/loginApi';
  import {
    getUserTypeList,
    getUserPositionList,
    getDepartmentByInstitute,
  } from '@/utils/mflexApi/userManagementApi';
  import AppDialog from '../ui/AppDialog.vue';

  const passwordVisible = ref(false);
  const confirmPasswordVisible = ref(false);

  const emits = defineEmits(['close', 'cofirm']);

  const dialogState = reactive({
    view: false,
    title: '',
    message: '',
  });

  const errorState = reactive({
    view: false,
    title: '회원가입 오류',
    message: '',
  });

  const userInfo = reactive({
    username: '',
    userId: '',
    userPassword: '',
    confirmPassword: '',
    officePhoneNumber: null,
    personalPhoneNumber: null,
    email: null,
  });

  const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value;
  };

  const toggleConfirmPasswordVisibility = () => {
    confirmPasswordVisible.value = !confirmPasswordVisible.value;
  };

  const errorMessage = ref('');

  const validateForm = () => {
    // 사용자 이름 검사
    if (!userInfo.username.trim()) {
      errorState.view = true;
      errorState.message = '사용자 이름을 입력해주세요.';
      // errorMessage.value = '사용자 이름을 입력해주세요.';
      return false;
    }

    // 아이디 검사 (최소 4자 이상)
    if (userInfo.userId.length < 5) {
      errorState.view = true;

      errorState.message = '아이디는 최소 5자 이상이어야 합니다.';
      // errorMessage.value = '아이디는 최소 4자 이상이어야 합니다.';
      return false;
    }

    // 비밀번호 검사
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    if (!passwordRegex.test(userInfo.userPassword)) {
      errorState.view = true;
      errorState.message =
        '비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.';
      // errorMessage.value =
      //   '비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.';
      return false;
    }

    // 비밀번호 확인
    if (userInfo.userPassword !== userInfo.confirmPassword) {
      errorState.view = true;
      errorState.message = '비밀번호와 확인 비밀번호가 일치하지 않습니다.';
      // errorMessage.value = '비밀번호와 확인 비밀번호가 일치하지 않습니다.';
      return false;
    }

    return true;
  };

  const onSignUp = async () => {
    const signUpInfo = {
      userId: userInfo.userId,
      userName: userInfo.username,
      userPassword: userInfo.userPassword,
      officePhoneNumber: userInfo.officePhoneNumber,
      personalPhoneNumber: userInfo.personalPhoneNumber,
      email: userInfo.email,
    };

    const response = await signUp(signUpInfo);

    console.log('response : ', response);
    if (response.status === 200) {
      dialogState.view = true;
      dialogState.title = '회원가입';
      dialogState.message = '회원가입이 완료되었습니다.';
    } else {
      // if (response.data.code === 1000) {
      //   errorState.view = true;
      //   errorState.message = response.data.message;
      // }

      errorState.view = true;
      errorState.message = response.data.message;
      return;
    }

    // validateForm();

    if (validateForm()) {
      dialogState.view = true;
      dialogState.title = '회원가입';
      dialogState.message = '회원가입이 완료되었습니다.';
    }

    errorMessage.value = ''; // 이전 오류 메시지 초기화
    // 회원가입 로직 구현
    // 유효성 검사 등을 수행한 후 서버에 요청을 보내는 코드를 여기에 작성합니다.

    // if (validateForm()) {
    //   const response = signUp(userInfo);

    //   if (response.response.data.status === 200) {
    //     dialogState.view = true;
    //     dialogState.title = '회원가입';
    //     dialogState.message = '회원가입이 완료되었습니다.';
    //   } else {
    //     dialogState.title = '회원가입';
    //     dialogState.message = '회원가입에 실패하였습니다.';
    //   }
    // }

    // API 호출
    // signUp(userInfo);
    // dialogState.view = true;
    // dialogState.title = '회원가입';
    // dialogState.message = '회원가입이 완료되었습니다.';
  };

  const onCancel = () => {
    // 취소 버튼 클릭 시 동작 구현
    emits('close');
  };

  const onCloseErrorState = () => {
    errorState.view = false;
  };

  const onDialogClose = () => {
    dialogState.view = false;
    emits('close');
  };

  // onBeforeMount(async () => {
  //   // 사용자 타입 목록 조회
  //   const userTypeList = await getUserTypeList();
  //   console.log('userTypeList : ', userTypeList);

  //   // 사용자 직급 목록 조회
  //   const userPositionList = await getUserPositionList();
  //   console.log('userPositionList : ', userPositionList);

  //   // 기관별 부서 목록 조회
  //   const departmentList = getDepartmentByInstitute(2);
  //   console.log('departmentList : ', departmentList);
  // });
</script>

<style>
  .form-section {
    display: flex;
    flex-direction: row;
    align-items: center; /* 레이블과 셀렉트 박스를 수직 가운데 정렬 */
  }

  .child-section {
    padding-left: 25px;
    padding-right: 25px;
    padding: 10px;
  }

  .child-label {
    font-weight: 400;
  }

  .label-section {
    font-weight: 600;
    margin-right: 15px; /* 레이블과 셀렉트 박스 간의 간격 조정 */
    flex: 0 0 auto;
  }

  .select-container {
    flex: 1 1 100%; /* 셀렉트 박스가 가로로 확장되도록 설정 */
  }

  .select-container select {
    width: 100%; /* 셀렉트 박스가 컨테이너 너비에 맞도록 설정 */
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  #select-position {
    width: 130px;
  }

  #select-department {
    width: 130px;
  }
</style>
