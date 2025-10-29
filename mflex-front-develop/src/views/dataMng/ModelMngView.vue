<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <StepNext v-model="stepData" :nextButtonUse="false" />
        <div class="content-row">
          <div class="bg-box">작업모델 관리</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { reactive, ref } from 'vue';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import StepNext from '@/components/common/StepNext.vue';
  const stepData = ref([]);

  stepData.value = [
    { title: '용어등록', checked: true, current: false },
    { title: '단어등록', checked: true, current: true },
    { title: '도메인 관리', checked: false, current: false },
    { title: '코드 관리', checked: false, current: false },
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
