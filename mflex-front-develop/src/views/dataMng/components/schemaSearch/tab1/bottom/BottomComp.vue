<template>
  <section class="row-wrap">
    <AppTab :tabList="tabList" v-model="activeTab" mode="if"> </AppTab>
    <div class="tab-comtent__row">
      <keep-alive>
        <component :is="currentTab" />
      </keep-alive>
    </div>
  </section>
</template>

<script setup>
  import { ref, reactive, defineAsyncComponent, shallowRef, watch } from 'vue';

  const BottomTab1 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/bottom/BottomTab1.vue')
  );
  const BottomTab2 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/bottom/BottomTab2.vue')
  );
  const BottomTab3 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/bottom/BottomTab3.vue')
  );
  const BottomTab4 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/bottom/BottomTab4.vue')
  );
  const BottomTab5 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/bottom/BottomTab5.vue')
  );
  const BottomTab6 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/bottom/BottomTab6.vue')
  );
  const BottomTab7 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab1/bottom/BottomTab7.vue')
  );

  const tabList = reactive([
    '기본정보',
    '컬럼',
    '기본키(PK)',
    '외래키(FK)_상위',
    '외래키(FK)_하위',
    '연관인덱스',
    '연관트리거',
  ]);
  const activeTab = ref(1);

  const currentTab = shallowRef(BottomTab1);
  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = BottomTab1;
    } else if (activeTab.value == 2) {
      currentTab.value = BottomTab2;
    } else if (activeTab.value == 3) {
      currentTab.value = BottomTab3;
    } else if (activeTab.value == 4) {
      currentTab.value = BottomTab4;
    } else if (activeTab.value == 5) {
      currentTab.value = BottomTab5;
    } else if (activeTab.value == 6) {
      currentTab.value = BottomTab6;
    } else {
      currentTab.value = BottomTab7;
    }
  });
</script>
