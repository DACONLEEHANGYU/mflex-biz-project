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
  import {
    ref,
    reactive,
    defineAsyncComponent,
    shallowRef,
    watch,
    inject,
    computed,
  } from 'vue';

  const BottomTab1 = defineAsyncComponent(() =>
    import('@/views/dictionarySearch/components/tab4/bottom/BottomTab1.vue')
  );
  const BottomTab2 = defineAsyncComponent(() =>
    import('@/views/dictionarySearch/components/tab4/bottom/BottomTab2.vue')
  );
  const BottomTab3 = defineAsyncComponent(() =>
    import('@/views/dictionarySearch/components/tab4/bottom/BottomTab3.vue')
  );
  const BottomTab4 = defineAsyncComponent(() =>
    import('@/views/dictionarySearch/components/tab4/bottom/BottomTab4.vue')
  );
  const BottomTab5 = defineAsyncComponent(() =>
    import('@/views/dictionarySearch/components/tab4/bottom/BottomTab5.vue')
  );
  const BottomTab6 = defineAsyncComponent(() =>
    import('@/views/dictionarySearch/components/tab4/bottom/BottomTab6.vue')
  );

  const tabList = reactive([
    '기본정보',
    '연관용어',
    '계층코드값',
    '참조코드값',
    '코드명변경이력',
    '코드값변경이력',
  ]);

  /* const selectTab3ValueData = inject('codeValueSelectData');
  const firstRowTab3Data = inject('codeValueFirstData');
  console.log('firstRowTabe3Data : ', firstRowTab3Data); */

  /* const filteredTabList = computed(() => {
    if (
      firstRowTab3Data.value &&
      firstRowTab3Data.value.data.referenceCode[0].label
    ) {
      return tabList;
    } else {
      return tabList.filter((tab) => tab !== '참조코드값');
    }
  }); */

  const activeTab = ref(1);

  const currentTab = shallowRef(BottomTab1);
  /* watch(
    [selectTab3ValueData, firstRowTab3Data],
    ([newSelectTab3Value, newFirstRowTab3Data]) => {
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
    }
  ); */

  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = BottomTab1;
    } else if (activeTab.value == 2) {
      currentTab.value = BottomTab2;
    } else if (activeTab.value == 3) {
      currentTab.value = BottomTab3;
    } else if (activeTab.value == 4) {
      /*  if (filteredTabList.value.includes('참조코드값')) {
        currentTab.value = BottomTab4;
      } else {
        currentTab.value = BottomTab5;
      } */
      currentTab.value = BottomTab4;
    } else if (activeTab.value == 5) {
      /*  if (filteredTabList.value.includes('참조코드값')) {
        currentTab.value = BottomTab5;
      } else {
        currentTab.value = BottomTab6;
      } */
      currentTab.value = BottomTab5;
    } else {
      currentTab.value = BottomTab6;
    }
  });

  /* watch(selectTab3ValueData, (newValue) => {
    if (newValue && newValue.referenceCode) {
      filteredTabList.value = tabList;
    } else {
      filteredTabList.value = tabList.filter((tab) => tab !== '참조코드값');
    }
  }); */
</script>
