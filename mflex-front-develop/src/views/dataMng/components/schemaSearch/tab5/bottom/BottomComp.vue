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
    import('@/views/dataMng/components/schemaSearch/tab5/bottom/BottomTab1.vue')
  );

  const tabList = reactive(['기본정보']);
  const activeTab = ref(1);

  const currentTab = shallowRef(BottomTab1);
  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = BottomTab1;
    }
  });
</script>
