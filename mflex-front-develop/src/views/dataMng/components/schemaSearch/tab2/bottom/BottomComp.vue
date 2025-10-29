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
    import('@/views/dataMng/components/schemaSearch/tab2/bottom/BottomTab1.vue')
  );
  const BottomTab2 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab2/bottom/BottomTab2.vue')
  );
  const BottomTab3 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab2/bottom/BottomTab3.vue')
  );
  const BottomTab4 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab2/bottom/BottomTab4.vue')
  );
  const BottomTab5 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaSearch/tab2/bottom/BottomTab5.vue')
  );

  const tabList = reactive([
    '기본정보',
    '연관테이블',
    '연관기본키(PK)',
    '연관외래키(PK)',
    '연관인덱스',
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
    }
  });
</script>
