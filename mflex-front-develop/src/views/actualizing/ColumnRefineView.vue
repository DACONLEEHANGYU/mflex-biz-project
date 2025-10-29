<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box">
              <div class="non-tab__comtent">
                <div class="tab-inner pb0">
                  <DragCol
                    width="100%"
                    height="100%"
                    :leftPercent="40"
                    :sliderWidth="10"
                  >
                    <template #left>
                      <!-- 컬럼명 Comp -->
                      <ColumnListComp />
                    </template>
                    <template #right>
                      <div class="full-contents pl10">
                        <!-- 컬럼한글명 Comp-->
                        <ColumnKoreanNameComp />
                        <!-- <div class="db-connection-details"></div> -->
                      </div>
                    </template>
                  </DragCol>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { DragCol } from 'vue-resizer';
  import ColumnListComp from '@/views/actualizing/components/columnRefine/ColumnListComp.vue';
  import ColumnKoreanNameComp from '@/views/actualizing/components/columnRefine/ColumnKoreanNameComp.vue';

  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';
  import { ref, onActivated } from 'vue';

  defineOptions({ name: 'ActualizingColumn' });

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

  // onActivated(() => {
  //   console.log('wordView onActivated');
  //   setDictionaryMngState('word');
  //   saveStepStateStorage('');
  // });
</script>

<style lang="scss" scoped></style>
