<template>
  <WordJobComp></WordJobComp>
  <!-- <WordJobComp v-if="!jobUpdateYn"></WordJobComp> -->
  <!-- <WordJobUpdateComp v-else></WordJobUpdateComp> -->
</template>

<script setup>
  import { watch, ref } from 'vue';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import WordJobComp from '@/views/dictionaryMng/components/word/bottom/manage/WordJobComp.vue';
  import { storeToRefs } from 'pinia';

  const jobUpdateYn = ref(false);

  const dictionaryMngStore = useDictionaryMngStore();
  const { isWordJobUpdate } = storeToRefs(dictionaryMngStore);

  console.log('isWordJobUpdate : ', isWordJobUpdate);
  watch(isWordJobUpdate, (newVal) => {
    console.log('isWordJobUpdate : ', newVal);
    jobUpdateYn.value = newVal;
  });
</script>
