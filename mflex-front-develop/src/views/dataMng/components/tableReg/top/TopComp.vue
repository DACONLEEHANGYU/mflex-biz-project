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

  const TopTab1 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/tableReg/top/TopTab1.vue')
  );
  const TopTab2 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/tableReg/top/TopTab2.vue')
  );
  const TopTab3 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/tableReg/top/TopTab3.vue')
  );
  const TopTab4 = defineAsyncComponent(() =>
    import('@/views/dataMng/components/tableReg/top/TopTab4.vue')
  );

  const tabList = reactive(['용어', '단어', '도메인', '통합코드']);
  const activeTab = ref(1);

  const currentTab = shallowRef(TopTab1);
  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = TopTab1;
    } else if (activeTab.value == 2) {
      currentTab.value = TopTab2;
    } else if (activeTab.value == 3) {
      currentTab.value = TopTab3;
    } else {
      currentTab.value = TopTab4;
    }
  });

  const chatbotWindowView = ref(false);
  const onOpenChatbotWindow = () => {
    chatbotWindowView.value = true;
  };
  const onCloseChatbotWindow = () => {
    chatbotWindowView.value = false;
  };
</script>
