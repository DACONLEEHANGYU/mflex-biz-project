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
  import('@/views/dataMng/components/schemaSearch/bottom/BottomTab1.vue'),
);
const BottomTab2 = defineAsyncComponent(() =>
  import('@/views/dataMng/components/schemaSearch/bottom/BottomTab2.vue'),
);
const BottomTab3 = defineAsyncComponent(() =>
  import('@/views/dataMng/components/schemaSearch/bottom/BottomTab3.vue'),
);
const BottomTab4 = defineAsyncComponent(() =>
  import('@/views/dataMng/components/schemaSearch/bottom/BottomTab4.vue'),
);
const BottomTab5 = defineAsyncComponent(() =>
  import('@/views/dataMng/components/schemaSearch/bottom/BottomTab5.vue'),
);
const BottomTab6 = defineAsyncComponent(() =>
  import('@/views/dataMng/components/schemaSearch/bottom/BottomTab6.vue'),
);

const tabList = reactive([
  '기본정보',
  '컬럼',
  'PK정보',
  'FK정보',
  '인덱스',
  '변경이력',
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
  } else {
    currentTab.value = BottomTab6;
  }
});
</script>
