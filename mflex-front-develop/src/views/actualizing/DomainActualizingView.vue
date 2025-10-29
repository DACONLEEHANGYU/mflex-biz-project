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
                    <TopComp />
                  </template>
                  <template #bottom>
                    <BottomComp @domain-work-apply="handleGridRefresh" />
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
  import TopComp from '@/views/actualizing/components/domainActualizing/top/TopComp.vue';
  import BottomComp from '@/views/actualizing/components/domainActualizing/bottom/BottomComp.vue';
  import { storeToRefs } from 'pinia';
  import { useSwipperStore } from '@/stores/swipper';
  import {
    getSwipperStateStorage,
    saveStepStateStorage,
  } from '@/utils/cookies';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';
  import { onActivated, ref } from 'vue';

  defineOptions({ name: 'ActualizingDomain' });

  const stepData = ref([
    { title: '용어등록', checked: true, current: false },
    { title: '단어등록', checked: true, current: false },
    { title: '도메인 관리', checked: true, current: true },
    { title: '코드 관리', checked: false, current: false },
  ]);

  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState } = tabNaviStore;

  const swipperState = ref(getSwipperStateStorage());

  const { swipper } = storeToRefs(useSwipperStore());

  const onPrevStep = () => {
    router.replace('/dictionaryMng/word/list');
    setTabNaviData({
      title: '단어',
      path: '/dictionaryMng/word/list',
    });
  };
  const onNextStep = () => {
    router.replace('/dictionaryMng/code/list');
    setTabNaviData({
      title: '코드',
      path: '/dictionaryMng/code/list',
    });
  };

  onActivated(() => {
    console.log('DomainView onActivated');
    setDictionaryMngState('domain');
    saveStepStateStorage('domain');
  });
</script>

<style lang="scss" scoped></style>
