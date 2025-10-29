<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <StepCheck v-model="stepData" @nextStep="onNextStep" />
        <div class="content-row">
          <div class="bg-box">테이블 등록</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import StepCheck from '@/components/common/StepCheck.vue';
  const stepData = ref([]);

  stepData.value = [
    { title: '엔터티관리', checked: true },
    { title: '단어등록', checked: true },
    { title: '유사어 관리', checked: false },
    { title: '도메인 관리', checked: false },
  ];

  //다음 단계로
  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData } = tabNaviStore;
  const onNextStep = () => {
    console.log('다음 단계로 이동');
    // router.replace('/dataMng/data1/list');
    // setTabNaviData({
    //   title: '데이터 구조관리 #1',
    //   path: '/dataMng/data1/list',
    // });
  };
</script>

<style lang="scss" scoped></style>
