<template>
  <div class="pop-window">
    <div class="window-header">비밀번호 재설정</div>
    <div class="window-body" style="margin-bottom: 15px">
      <div class="window-content pt15">
        <div class="password-reset-form">
          <div class="form-group">
            <label for="current-password">기존 비밀번호</label>
            <input
              :type="currentPasswordVisible ? 'text' : 'password'"
              id="current-password"
              v-model="currentPassword"
              placeholder="기존 비밀번호를 입력하세요"
            />
            <button
              class="origin-password-btn"
              @click="toggleCurrentPasswordVisibility"
            >
              {{ currentPasswordVisible ? '🙈' : '👁️‍🗨️' }}
            </button>
          </div>
          <div class="form-group">
            <label for="new-password">새 비밀번호</label>
            <input
              :type="newPasswordVisible ? 'text' : 'password'"
              id="new-password"
              v-model="newPassword"
              placeholder="비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자가 포함되어야 합니다. "
            />
            <button
              class="check-password-btn"
              @click="toggleNewPasswordVisibility"
            >
              {{ newPasswordVisible ? '🙈' : '👁️‍🗨️' }}
            </button>
          </div>
          <div class="form-group">
            <label for="confirm-password">새 비밀번호 확인</label>
            <input
              :type="confirmPasswordVisible ? 'text' : 'password'"
              id="confirm-password"
              v-model="confirmPassword"
              placeholder="새 비밀번호를 다시 입력하세요"
            />
            <button
              class="confirm-password-btn"
              @click="toggleConfirmPasswordVisibility"
            >
              {{ confirmPasswordVisible ? '🙈' : '👁️‍🗨️' }}
            </button>
          </div>
          <!-- <div class="error-message">
            새 비밀번호와 확인 비밀번호가 일치하지 않습니다.
          </div> -->
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onResetPassword">변경</button>
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
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { changePassword } from '@/utils/mflexApi/loginApi';

  const currentPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');

  const currentPasswordVisible = ref(false);
  const newPasswordVisible = ref(false);
  const confirmPasswordVisible = ref(false);

  const props = defineProps(['token']);

  const emits = defineEmits(['close', 'cofirm']);

  const dialogState = ref({
    view: false,
    title: '',
    message: '',
  });

  const passwordMismatch = computed(
    () => newPassword.value !== confirmPassword.value
  );

  const toggleCurrentPasswordVisibility = () => {
    currentPasswordVisible.value = !currentPasswordVisible.value;
  };

  const toggleNewPasswordVisibility = () => {
    newPasswordVisible.value = !newPasswordVisible.value;
  };

  const toggleConfirmPasswordVisibility = () => {
    confirmPasswordVisible.value = !confirmPasswordVisible.value;
  };

  const onResetPassword = async () => {
    if (passwordMismatch.value) {
      dialogState.value = {
        view: true,
        title: '오류',
        message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
      };
      return;
    }

    const passWordInfo = {
      originPassword: currentPassword.value,
      newPassword: newPassword.value,
      token: props.token,
    };

    const response = await changePassword(passWordInfo);
    console.log('비밀번호 재설정 결과', response);
    // 성공적인 경우에 대한 처리 (예: 다이얼로그 표시)

    let errorMessage = '';

    if (response.status === 200) {
      emits('cofirm');
      return;
    }

    if (response.response.data.code === 1000) {
      errorMessage =
        '새 비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자가 포함되어야 합니다.';

      dialogState.value = {
        view: true,
        title: '성공',
        message:
          '새 비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자가 포함되어야 합니다.',
      };
    } else if (response.response.data.code === 1031) {
      // errorMessage =
      //   '새 비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자가 포함되어야 합니다.';
      errorMessage = '기존 비밀번호가 일치하지 않습니다.';
      dialogState.value = {
        view: true,
        title: '성공',
        message: '기존 비밀번호가 일치하지 않습니다.',
      };
    } else if (response.response.data.code === 1023) {
      errorMessage = '기존비밀번호와 새 비밀번호는 같을 수 없습니다.';
      dialogState.value = {
        view: true,
        title: '성공',
        message: '기존비밀번호와 새 비밀번호는 같을 수 없습니다.',
      };
    }
  };

  const onCancel = () => {
    emits('close');
  };

  const onDialogClose = () => {
    dialogState.value.view = false;
  };
</script>

<style scoped>
  .pop-window {
    /* 팝업 창 스타일 */
  }

  .window-header {
    /* 헤더 스타일 */
  }

  .window-body {
    /* 본문 스타일 */
  }

  .password-reset-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  label {
    margin-bottom: 5px;
  }

  input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .window-footer {
    /* 푸터 스타일 */
  }

  .btn-m {
    /* 버튼 스타일 */
    margin-left: 10px;
  }

  .origin-password-btn {
    position: absolute;
    right: 20px;
    top: 70%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
  .check-password-btn {
    position: absolute;
    right: 20px;
    /* top: 53.5%; */
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }

  .confirm-password-btn {
    position: absolute;
    right: 20px;
    /* top: 76.5%; */
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
</style>
