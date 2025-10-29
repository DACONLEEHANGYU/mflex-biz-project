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
          :disablePrevBtn="true"
          @nextStep="onNextStep"
        /> -->
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box">
              <div class="non-tab__comtent pt10">
                <DragRow
                  width="100%"
                  height="100%"
                  :topPercent="43"
                  :sliderWidth="10"
                >
                  <template #top>
                    <TopComp />
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
  import { onActivated, onMounted, ref, watch } from 'vue';
  import { DragRow } from 'vue-resizer';
  import TopComp from '@/views/dictionaryMng/components/term/top/TopComp.vue';
  import BottomComp from '@/views/dictionaryMng/components/term/bottom/BottomComp.vue';
  import StepNext from '@/components/common/StepNext.vue';
  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';
  import { updateHeaderStyle } from '@/utils/mflexApi/common/commonApi';
  import {
    getSwipperStateStorage,
    saveStepStateStorage,
  } from '@/utils/cookies';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';

  defineOptions({ name: 'TermMngView' });

  const stepData = ref([
    { title: '용어등록', checked: true, current: true },
    { title: '단어등록', checked: false, current: false },
    { title: '도메인 관리', checked: false, current: false },
    { title: '코드 관리', checked: false, current: false },
  ]);

  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState } = tabNaviStore;
  const onNextStep = () => {
    router.replace('/dictionaryMng/word/list');
    setTabNaviData({
      title: '단어',
      path: '/dictionaryMng/word/list',
    });
  };

  onMounted(() => {
    console.log('TermView onMounted');
    // updateHeaderStyle(getSwipperStateStorage());
  });

  const swipperState = ref(getSwipperStateStorage());

  const { swipper } = storeToRefs(useSwipperStore());

  onActivated(() => {
    console.log('TermView onActivated');
    const header = document.querySelector('.header');
    // const contentWrap = document.querySelector('.contents-wrap');

    console.log('TermView swipperState', swipperState);
    console.log('TermView header', header);
    console.log('TermView contentWrap', header);

    // header.style.setProperty('height', '52px', 'important');
    // contentWrap.style.setProperty('padding-top', '53px', 'important');

    // console.log('TermView getSwipperStateStorage()', getSwipperStateStorage());

    // updateHeaderStyle(getSwipperStateStorage());
  });
  // updateHeaderStyle(getSwipperStateStorage());

  watch(swipper, (value) => {
    console.log('TermView swipperState watch', value);
    // updateHeaderStyle(value);
  });

  onActivated(() => {
    console.log('termView onActivated');
    setDictionaryMngState('term');
    saveStepStateStorage('term');
  });
</script>

<style lang="scss" scoped></style>
