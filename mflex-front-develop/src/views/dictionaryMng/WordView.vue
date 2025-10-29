<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <!-- <StepNext
          v-model="stepData"
          @prevStep="onPrevStep"
          @nextStep="onNextStep"
        /> -->
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box">
              <div class="non-tab__comtent pt10">
                <DragRow
                  width="100%"
                  height="100%"
                  :topPercent="46"
                  :sliderWidth="10"
                >
                  <template #top>
                    <TopComp ref="topCompRef" />
                  </template>
                  <template #bottom>
                    <BottomComp />
                  </template>
                </DragRow>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { DragRow } from 'vue-resizer';
  import TopComp from '@/views/dictionaryMng/components/word/top/TopComp.vue';
  import BottomComp from '@/views/dictionaryMng/components/word/bottom/BottomComp.vue';
  import StepNext from '@/components/common/StepNext.vue';

  import { saveStepStateStorage } from '@/utils/cookies';
  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';
  import { ref, onActivated } from 'vue';

  defineOptions({ name: 'WordMngView' });

  const stepData = ref([
    { title: '용어등록', checked: true, current: false },
    { title: '단어등록', checked: true, current: true },
    { title: '도메인 관리', checked: false, current: false },
    { title: '코드 관리', checked: false, current: false },
  ]);

  const topCompRef = ref(null);

  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState } = tabNaviStore;
  //이전 단계로
  const onPrevStep = () => {
    router.replace('/dictionaryMng/term/list');
    setTabNaviData({
      title: '용어',
      path: '/dictionaryMng/term/list',
    });
  };
  //다음단계로
  const onNextStep = () => {
    router.replace('/dictionaryMng/domain/list');
    setTabNaviData({
      title: '도메인',
      path: '/dictionaryMng/domain/list',
    });
  };

  const { swipper } = storeToRefs(useSwipperStore());

  onActivated(() => {
    console.log('wordView onActivated');
    setDictionaryMngState('word');
    saveStepStateStorage('word');
  });
</script>

<style lang="scss" scoped></style>
