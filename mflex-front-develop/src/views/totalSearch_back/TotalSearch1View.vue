<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <Step v-model="stepData" @nextStep="onNextStep" />
        <div class="content-row">
          <DragRow
            width="100%"
            height="100%"
            :topPercent="50"
            :sliderWidth="10"
          >
            <template #top>
              <TopRow />
            </template>
            <template #bottom>
              <BottomRow />
            </template>
          </DragRow>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { DragRow } from 'vue-resizer';
  // import Step from '@/components/common/Step.vue';
  import { reactive, ref } from 'vue';
  import TopRow from '@/views/totalSearch/components/totalSearch1/topRow/TopRow.vue';
  import BottomRow from '@/views/totalSearch/components/totalSearch1/bottomRow/BottomRow.vue';
  import { useRouter } from 'vue-router';
  import { useTabNaviStore } from '@/stores/tabNavi';

  const stepData = ref([]);
  stepData.value = [
    { title: '용어등록', checked: true },
    { title: '단어등록', checked: false },
    { title: '유사어 관리', checked: false },
    { title: '도메인 관리', checked: false },
  ];

  console.log('AAA');

  //다음 단계로
  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData } = tabNaviStore;
  const onNextStep = () => {
    console.log('다음 단계로 이동');
    router.replace('/dataMng/data1/list');
    setTabNaviData({
      title: '데이터 구조관리 #1',
      path: '/dataMng/data1/list',
    });
  };

  // onActivated(() => {
  //   setSpinnerStatus(true);

  //   setTimeout(() => {
  //     //Loader Remove
  //     setSpinnerStatus(false);
  //   }, 500);
  // });
</script>

<style lang="scss" scoped></style>
