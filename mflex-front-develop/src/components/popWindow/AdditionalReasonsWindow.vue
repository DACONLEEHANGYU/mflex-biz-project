<template>
  <div class="pop-window">
    <!-- <div class="window-header">비표준 기타 사유</div> -->

    <div class="window-content" style="padding: 60px 40px 40px 40px">
      <div>
        <span style="font-size: 18px"
          ><span style="color: #0c705c; font-weight: 600">비표준</span> 사유가
          <span style="font-weight: 600">'기타'</span>인 경우
          <span style="font-weight: 600">기타 사유</span>를 입력해
          주십시오.</span
        >
      </div>
      <div class="input-area">
        <div style="margin-right: 10px; font-weight: 600">기타사유:</div>
        <div class="input-div">
          <input
            v-model="additionalReasons"
            class="input-text"
            type="text"
            style="height: 40px; font-size: 16px"
            placeholder="ex) 비표준용어"
          />
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <button type="button" class="ui-button" @click="onConfirm">확인</button>
      <button type="button" class="ui-button" @click="onCancel">취소</button>
    </div>
    <!-- <div class="window-footer">
        <div class="inputs-btns">
          <div class="btns__r">
            <button class="btn-m confirm" @click="onConfirm">확인</button>
            <button class="btn-m close" @click="onCancel">취소</button>
          </div>
        </div>
      </div> -->
  </div>
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

  const emit = defineEmits(['confirm', 'close']);
  const additionalReasons = ref('');

  const onConfirm = () => {
    emit('confirm', additionalReasons.value);
  };

  const onCancel = () => {
    emit('close');
  };
</script>

<style scoped>
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
