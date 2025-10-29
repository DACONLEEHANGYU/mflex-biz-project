<template>
  <TermJobComp />
</template>
<script setup>
  import { watch, ref } from 'vue';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import TermJobComp from '@/views/actualizing/components/termActualizing/bottom/manage/TermJobComp.vue';

  import { storeToRefs } from 'pinia';

  const dictionaryMngStore = useDictionaryMngStore();
  const { isTermJobUpdate, termSourceCode } = storeToRefs(dictionaryMngStore);
  const jobUpdateYn = ref(false);

  // 컴포넌트 렌더링 수행을 위한 상태 감지
  watch(isTermJobUpdate, (newVal) => {
    console.log('jobUpdateYn : ', newVal);
    jobUpdateYn.value = newVal;
  });

  watch(termSourceCode, (newVal) => {
    console.log('termSourceCode : ', newVal);
  });
</script>
