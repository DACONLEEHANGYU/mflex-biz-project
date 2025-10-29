<template>
  <div class="pop-window">
    <div class="window-header">승인 신청</div>
    <div class="window-body">
      <div class="window-title">
        <div class="title-text">미리보기</div>
      </div>
      <div class="window-content" style="height: 500px">
        <AppTab :tabList="tabList" v-model="activeTab" mode="if">
          <template v-slot:tabPanel-1>
            <WindowTab1View />
          </template>
          <template v-slot:tabPanel-2> 2 </template>
        </AppTab>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onClose">확인</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import WindowTab1View from './WindowTab1View.vue';

  const tabList = reactive(['승인 신청서', '상세요청내용']);
  const activeTab = ref(1);

  const emit = defineEmits(['close']);

  const onClose = () => {
    emit('close');
  };
</script>

<style lang="scss" scoped></style>
