<template>
  <div class="pop-window">
    <div class="window-header">용어 등록 오류메시지</div>

    <div class="window-content" style="padding: 10px 40px 15px 40px">
      <div>
        <div class="error-content">
          <img
            src="/public/images/icon_big_warnig.png"
            style="width: 70px; margin-right: 30px"
          />
          <div>
            <div style="margin-bottom: 10px">
              <span style="font-weight: 600"
                >용어 등록 중 <span style="color: red">오류</span>가
                발생했습니다.</span
              >
            </div>
            <div v-for="(message, index) in errorMessage" :key="index">
              - {{ message }}
            </div>
            <div class="ask-message-area">
              작업한 용어를 임시 저장하시겠습니까?
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <button type="button" class="ui-button" @click="onConfirm">예</button>
      <button type="button" class="ui-button" @click="onCancel">아니오</button>
    </div>
  </div>
</template>

<script setup>
  import { defineProps } from 'vue';

  const props = defineProps({
    errorMessage: {
      type: Object,
      default: () => {},
    },
  });

  console.log('errorMessage', props.errorMessage);

  const emit = defineEmits(['confirm', 'close']);

  const onConfirm = () => {
    emit('confirm');
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

  /* .ui-button:hover {
    background-color: #36c270;
    color: white;
  } */
</style>
