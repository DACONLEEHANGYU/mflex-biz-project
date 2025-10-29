<template>
  <div class="pop-window">
    <div class="window-header">
      {{ popInfo.popTitle }}
    </div>

    <div class="window-content" style="padding: 10px 40px 15px 40px">
      <div>
        <div class="error-content">
          <img
            v-if="popInfo.state === 'confirm'"
            src="/public/images/icon_confirm.png"
            style="width: 60px; margin-right: 30px"
          />
          <img
            v-else-if="popInfo.state != 'redirect'"
            src="/public/images/icon_big_warnig.png"
            style="width: 70px; margin-right: 30px"
          />
          <img v-else-if="popInfo.state === 'redirect'" />
          <!-- v-html을 사용하여 HTML 코드 적용 -->
          <div v-html="popInfo.popMessages"></div>
        </div>
      </div>
    </div>
    <div v-if="popInfo.state === 'error'" class="dialog-footer">
      <button type="button" class="ui-button" @click="onCancel">
        {{ popInfo.cancelBtnText || '예' }}
      </button>
    </div>
    <div v-else class="dialog-footer">
      <button type="button" class="ui-button" @click="onConfirm">
        {{ popInfo.confirmBtnText || '예' }}
      </button>
      <button type="button" class="ui-button" @click="onCancel">
        {{ popInfo.cancelBtnText || '아니오' }}
      </button>
    </div>
  </div>
</template>

<script setup>
  import { defineProps } from 'vue';

  const props = defineProps({
    popInfo: {
      type: Object,
      default: () => ({
        popTitle: '',
        popMessages: '',
        state: '',
        confirmBtnText: '예', // 기본 확인 버튼 텍스트
        cancelBtnText: '아니오', // 기본 취소 버튼 텍스트
      }),
    },
  });

  console.log('errorMessage', props.popInfo);

  const emit = defineEmits(['confirm', 'close']);

  const onConfirm = () => {
    emit('confirm', props.popInfo);
  };

  const onCancel = () => {
    emit('close');
  };
</script>

<style scoped>
  .error-content {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }

  /* 메시지 내용에 스타일 추가 */
  .error-content div {
    line-height: 1.5;
    white-space: pre-line; /* 줄바꿈 유지 */
  }

  /* 나머지 스타일은 그대로 유지 */
  .ask-message-area {
    margin-top: 20px;
  }

  .input-area {
    display: flex;
    margin-top: 15px;
    align-items: center;
  }

  .input-div {
    width: 80%;
  }

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

  .dialog-footer {
    .ui-button:hover {
      background-color: #36c270;
      color: white;
    }
  }
</style>
