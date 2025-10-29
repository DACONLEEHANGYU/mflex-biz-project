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
            <!-- <div class="bg-box">
              <div class="tabs">
                <div class="tabs-list"></div>
                <div class="tab-content"></div>
              </div>
              <div class="tab-comtent__row">
                <div class="inner-tab top-btns">
                  <button class="btn-s file-down">
                    <i class="icon"></i>테이블 목록 내려받기
                  </button>
                </div>
                <DragRow
                  width="100%"
                  height="100%"
                  :topPercent="50"
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
            </div> -->
            <div class="bg-box">
              <AppTab :tabList="tabList" v-model="activeTab" mode="if">
              </AppTab>
              <div class="tab-comtent__row">
                <keep-alive :key="cacheKey">
                  <component :is="currentTab" />
                </keep-alive>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import {
    ref,
    onActivated,
    defineAsyncComponent,
    watch,
    shallowRef,
  } from 'vue';

  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';

  defineOptions({ name: 'SchemaSearchView' });

  const { swipper } = storeToRefs(useSwipperStore());

  const Tab1View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/Tab1View.vue')
  );
  const Tab2View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab2/Tab2View.vue')
  );
  const Tab3View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab3/Tab3View.vue')
  );
  const Tab4View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab4/Tab4View.vue')
  );
  const Tab5View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab5/Tab5View.vue')
  );
  const Tab6View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab6/Tab6View.vue')
  );

  const tabList = [
    '테이블',
    '컬럼',
    '기본키(PK)',
    '외래키(FK)',
    '인덱스',
    '트리거',
  ];

  const activeTab = ref(1);

  const cacheKey = ref(0);
  function resetCache() {
    cacheKey.value = Math.random();
  }
  // onActivated(() => {
  //   // 초기화 시 activeTab을 1로 설정
  //   console.log('dictionary Search === onActivated');
  //   resetCache();
  //   // activeTab.value = 1;
  // });

  const currentTab = shallowRef(Tab1View);

  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = Tab1View;
    } else if (activeTab.value == 2) {
      currentTab.value = Tab2View;
    } else if (activeTab.value == 3) {
      currentTab.value = Tab3View;
    } else if (activeTab.value == 4) {
      currentTab.value = Tab4View;
    } else if (activeTab.value == 5) {
      currentTab.value = Tab5View;
    } else if (activeTab.value == 6) {
      currentTab.value = Tab6View;
    }
  });
</script>

<style lang="scss" scoped></style>
