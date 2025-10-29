<template>
  <section class="row-wrap">
    <div class="bg-box">
      <AppTab :tabList="tabList" v-model="activeTab" mode="if">
        <template v-slot:tabPanel-1>
          <Tab1Comp @searchSetup="onOpenFilterWindow" />
        </template>
        <template v-slot:tabPanel-2>
          <Tab2Comp @searchSetup="onOpenFilterWindow" />
        </template>
        <template v-slot:tabPanel-3>
          <div>3</div>
        </template>
        <template v-slot:tabPanel-4>
          <div>4</div>
        </template>
      </AppTab>
    </div>
    <AppWindow
      :view="filterWindowView"
      @close="onCloseFilterWindow"
      width="1000px"
      height="auto"
    >
      <FilterSetWindow
        @confirm="onFilterConfirm"
        @close="onCloseFilterWindow"
      />
    </AppWindow>
  </section>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue';
  import Tab1Comp from '@/views/dashboard/components/dictionarySearch/topRow/Tab1Comp.vue';
  import Tab2Comp from '@/views/dashboard/components/dictionarySearch/topRow/Tab2Comp.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import FilterSetWindow from '@/components/popWindow/filterSet/FilterSetWindow.vue';

  const tabList = reactive(['용어', '단어', '도메인', '통합코드']);
  const activeTab = ref(1);

  const filterWindowView = ref(false);

  const onOpenFilterWindow = () => {
    filterWindowView.value = true;
  };

  const onCloseFilterWindow = () => {
    filterWindowView.value = false;
  };

  const onFilterConfirm = () => {
    console.log('맞춤 필터 설정 확인');
  };

  const emit = defineEmits(['changeTab']);

  watch(activeTab, () => {
    console.log('탭변경');
    emit('changeTab', activeTab.value);
  });
</script>
